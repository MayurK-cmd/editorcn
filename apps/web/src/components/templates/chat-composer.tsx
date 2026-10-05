"use client";

import { RichTextEditor } from "@editorcn/editor";
import { StaticRenderer } from "@editorcn/static-renderer";
import { generateText } from "@tiptap/core";
import type { JSONContent } from "@tiptap/core";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { useEditor, useEditorState } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import {
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Square,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import "@editorcn/editor/style.css";
import "@editorcn/static-renderer/style.css";

export interface ChatAttachment {
  file?: File;
  id: string;
  name: string;
  type: string;
  url: string;
}

export type ChatContent = JSONContent | string;

export interface ChatMessage {
  attachments?: ChatAttachment[];
  content: ChatContent;
  id: string;
  role: "user" | "assistant";
  status?: "streaming" | "error";
}

export interface ChatModel {
  icon?: React.ReactNode;
  label: string;
  value: string;
}

export interface ChatSendOptions {
  files: File[];
  model?: string;
  signal: AbortSignal;
}

export interface ChatComposerProps {
  accept?: string;
  attachments?: boolean;
  className?: string;
  defaultModel?: string;
  disclaimer?: string;
  initialMessages?: ChatMessage[];
  maxFiles?: number;
  models?: ChatModel[];
  onModelChange?: (model: string) => void;
  onSend?: (content: ChatContent, options: ChatSendOptions) => unknown;
  placeholder?: string;
  suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  "Summarize this thread",
  "Draft a release note",
  "Explain this error",
];

const SCROLLBAR =
  "[scrollbar-color:var(--border)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/40 [&::-webkit-scrollbar-track]:bg-transparent";

const ACTIVE_ITEM =
  "rounded-md py-1 pl-2 text-[13px] data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground [&>span:first-child]:hidden [&_svg:not([class*='size-'])]:size-3.5";

const isAsyncIterable = (value: unknown): value is AsyncIterable<string> =>
  typeof value === "object" && value !== null && Symbol.asyncIterator in value;

const matchesAccept = (file: File, accept: string) =>
  accept.split(",").some((raw) => {
    const token = raw.trim().toLowerCase();
    if (token.startsWith(".")) {
      return file.name.toLowerCase().endsWith(token);
    }
    if (token.endsWith("/*")) {
      return file.type.startsWith(token.slice(0, -1));
    }
    return file.type === token;
  });

const isImage = (attachment: ChatAttachment) =>
  attachment.type.startsWith("image/");

const MESSAGE_EXTENSIONS = [
  StarterKit.configure({
    blockquote: false,
    bulletList: false,
    codeBlock: false,
    heading: false,
    horizontalRule: false,
    listItem: false,
    listKeymap: false,
    orderedList: false,
  }),
  TextStyle,
  Color,
  Highlight.configure({ multicolor: true }),
];

const toText = (content: ChatContent) =>
  typeof content === "string"
    ? content
    : generateText(content, MESSAGE_EXTENSIONS);

const isJSONContent = (value: unknown): value is JSONContent =>
  typeof value === "object" && value !== null && "type" in value;

const MessageBody = ({
  className,
  content,
}: {
  className: string;
  content: ChatContent;
}) =>
  typeof content === "string" ? (
    <div className={cn(className, "whitespace-pre-wrap")}>{content}</div>
  ) : (
    <StaticRenderer
      className={className}
      content={content}
      extensions={MESSAGE_EXTENSIONS}
    />
  );

const AttachmentList = ({
  attachments,
  className,
  onRemove,
  size,
}: {
  attachments: ChatAttachment[];
  className?: string;
  onRemove?: (id: string) => void;
  size: "sm" | "lg";
}) => (
  <div className={cn("flex flex-wrap gap-1.5", className)}>
    {attachments.map((attachment) => (
      <div key={attachment.id} className="group/file relative">
        {isImage(attachment) ? (
          <img
            alt={attachment.name}
            className={cn(
              "bg-muted rounded-xl border object-cover",
              size === "sm" ? "size-14" : "size-28"
            )}
            src={attachment.url}
          />
        ) : (
          <div
            className={cn(
              "bg-muted flex items-center gap-2 rounded-xl border px-3 text-sm",
              size === "sm" ? "h-14 max-w-48" : "h-12 max-w-60"
            )}
          >
            <FileText className="text-muted-foreground size-4 shrink-0" />
            <span className="truncate">{attachment.name}</span>
          </div>
        )}
        {onRemove && (
          <button
            aria-label={`Remove ${attachment.name}`}
            className="bg-foreground text-background absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full shadow-sm transition-transform active:scale-90"
            onClick={() => onRemove(attachment.id)}
            type="button"
          >
            <X className="size-3" />
          </button>
        )}
      </div>
    ))}
  </div>
);

const EditBox = ({
  busy,
  canBeEmpty,
  content,
  onCancel,
  onSubmit,
}: {
  busy: boolean;
  canBeEmpty: boolean;
  content: ChatContent;
  onCancel: () => void;
  onSubmit: (content: ChatContent) => void;
}) => {
  const handlers = useRef<{ cancel: () => void; submit: () => void } | null>(
    null
  );

  const editor = useEditor({
    autofocus: "end",
    content,
    editorProps: {
      handleKeyDown: (_view, event) => {
        if (event.key === "Escape") {
          handlers.current?.cancel();
          return true;
        }
        if (
          event.key !== "Enter" ||
          event.shiftKey ||
          event.isComposing ||
          matchMedia("(pointer: coarse)").matches
        ) {
          return false;
        }
        event.preventDefault();
        handlers.current?.submit();
        return true;
      },
    },
    extensions: MESSAGE_EXTENSIONS,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });

  const isEmpty =
    useEditorState({
      editor,
      selector: ({ editor: e }) => !e || e.isEmpty,
    }) ?? true;

  const submit = useCallback(() => {
    if (!editor || busy || (editor.isEmpty && !canBeEmpty)) {
      return;
    }
    onSubmit(editor.isEmpty ? "" : editor.getJSON());
  }, [busy, canBeEmpty, editor, onSubmit]);

  useEffect(() => {
    handlers.current = { cancel: onCancel, submit };
  }, [onCancel, submit]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 flex w-full flex-col items-end gap-2 duration-200">
      <RichTextEditor
        editor={editor}
        variant="compact"
        className="bg-muted! w-md max-w-full rounded-[18px]! border-0!"
      >
        <RichTextEditor.BubbleMenu editor={editor} />
        <RichTextEditor.Content
          className={`max-h-60 overflow-y-auto ${SCROLLBAR} [&_.ProseMirror]:min-h-16! [&_.ProseMirror]:px-3.5! [&_.ProseMirror]:py-2.5! [&_.ProseMirror]:text-[15px] [&_p]:leading-6!`}
        />
      </RichTextEditor>
      <div className="flex gap-1.5">
        <Button
          className="rounded-full transition-transform active:scale-95"
          onClick={onCancel}
          size="sm"
          variant="secondary"
        >
          Cancel
        </Button>
        <Button
          className="rounded-full transition-transform active:scale-95"
          disabled={(isEmpty && !canBeEmpty) || busy}
          onClick={submit}
          size="sm"
        >
          Send
        </Button>
      </div>
    </div>
  );
};

const ActionButton = ({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <Button
    aria-label={label}
    className="text-muted-foreground size-7 rounded-lg transition-transform active:scale-95"
    onClick={onClick}
    size="icon-sm"
    title={label}
    variant="ghost"
  >
    {children}
  </Button>
);

const MessageActions = ({
  busy,
  message,
  onEdit,
  onRegenerate,
}: {
  busy: boolean;
  message: ChatMessage;
  onEdit: () => void;
  onRegenerate: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  const mine = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100",
        mine ? "-mr-1.5" : "-ml-1.5"
      )}
    >
      {message.content && (
        <ActionButton
          label={copied ? "Copied" : "Copy"}
          onClick={() => {
            navigator.clipboard.writeText(toText(message.content));
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check /> : <Copy />}
        </ActionButton>
      )}
      {!busy &&
        (mine ? (
          <ActionButton label="Edit" onClick={onEdit}>
            <Pencil />
          </ActionButton>
        ) : (
          <ActionButton label="Regenerate" onClick={onRegenerate}>
            <RefreshCw />
          </ActionButton>
        ))}
    </div>
  );
};

const MessageRow = ({
  busy,
  editing,
  message,
  onCancelEdit,
  onEdit,
  onRegenerate,
  onRetry,
  onSubmitEdit,
}: {
  busy: boolean;
  editing: boolean;
  message: ChatMessage;
  onCancelEdit: () => void;
  onEdit: () => void;
  onRegenerate: () => void;
  onRetry: () => void;
  onSubmitEdit: (content: ChatContent) => void;
}) => {
  const mine = message.role === "user";
  const files = message.attachments ?? [];

  if (message.status === "streaming" && !message.content) {
    return (
      <p className="text-muted-foreground animate-pulse text-[15px]">
        Thinking…
      </p>
    );
  }

  return (
    <div
      className={cn(
        "group animate-in fade-in slide-in-from-bottom-1 flex flex-col gap-1.5 duration-200",
        mine ? "items-end pt-3" : "items-start"
      )}
    >
      {files.length > 0 && (
        <AttachmentList
          attachments={files}
          className={mine ? "justify-end" : undefined}
          size="lg"
        />
      )}
      {editing && (
        <EditBox
          busy={busy}
          canBeEmpty={files.length > 0}
          content={message.content}
          onCancel={onCancelEdit}
          onSubmit={onSubmitEdit}
        />
      )}
      {!editing && message.content && (
        <MessageBody
          className={cn(
            "text-[15px] leading-6 [&_p]:my-0! [&_p+p]:mt-3!",
            mine
              ? "bg-muted max-w-[80%] rounded-[18px] px-3.5 py-2 [&_code]:bg-background!"
              : "w-full"
          )}
          content={message.content}
        />
      )}
      {message.status === "error" && (
        <button
          className="text-destructive flex items-center gap-1 text-xs hover:underline"
          onClick={onRetry}
          type="button"
        >
          <RotateCcw className="size-3" />
          Not sent. Retry
        </button>
      )}
      {!editing && !message.status && (
        <MessageActions
          busy={busy}
          message={message}
          onEdit={onEdit}
          onRegenerate={onRegenerate}
        />
      )}
    </div>
  );
};

const ModelMenu = ({
  model,
  models,
  onChange,
}: {
  model?: string;
  models: ChatModel[];
  onChange: (model: string) => void;
}) => {
  const active = models.find((m) => m.value === model) ?? models[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="text-muted-foreground h-8 shrink-0 gap-1.5 rounded-full px-3 text-[13px] font-medium"
          size="sm"
          variant="ghost"
        >
          {active.icon}
          {active.label}
          <ChevronDown className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-40 rounded-lg p-1"
        side="top"
        sideOffset={10}
      >
        <DropdownMenuLabel className="text-muted-foreground px-2 py-1 text-[11px] font-normal">
          Model
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          className="flex flex-col gap-0.5"
          onValueChange={onChange}
          value={active.value}
        >
          {models.map((m) => (
            <DropdownMenuRadioItem
              key={m.value}
              className={ACTIVE_ITEM}
              value={m.value}
            >
              {m.icon}
              {m.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const EmptyState = ({
  onPick,
  suggestions,
}: {
  onPick: (suggestion: string) => void;
  suggestions: string[];
}) => (
  <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
    <div className="bg-muted flex size-10 items-center justify-center rounded-full">
      <Sparkles className="text-muted-foreground size-5" />
    </div>
    <p className="text-xl font-medium tracking-tight">How can I help today?</p>
    <div className="flex flex-wrap justify-center gap-2">
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion}
          className="rounded-full"
          onClick={() => onPick(suggestion)}
          size="sm"
          variant="outline"
        >
          {suggestion}
        </Button>
      ))}
    </div>
  </div>
);

const AttachButton = ({
  accept,
  disabled,
  multiple,
  onFiles,
}: {
  accept: string;
  disabled: boolean;
  multiple: boolean;
  onFiles: (files: File[]) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button
        aria-label="Add files"
        className="shrink-0 rounded-full transition-transform active:scale-95"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        size="icon-sm"
        variant="ghost"
      >
        <Plus />
      </Button>
      <input
        ref={inputRef}
        accept={accept}
        className="hidden"
        multiple={multiple}
        onChange={(e) => {
          onFiles([...(e.target.files ?? [])]);
          e.target.value = "";
        }}
        type="file"
      />
    </>
  );
};

const SendButton = ({
  busy,
  disabled,
  onSend,
  onStop,
}: {
  busy: boolean;
  disabled: boolean;
  onSend: () => void;
  onStop: () => void;
}) =>
  busy ? (
    <Button
      aria-label="Stop generating"
      className="shrink-0 rounded-full transition-transform active:scale-95"
      onClick={onStop}
      size="icon-sm"
    >
      <Square className="fill-current size-3" />
    </Button>
  ) : (
    <Button
      aria-label="Send message"
      className="shrink-0 rounded-full transition-transform active:scale-95"
      disabled={disabled}
      onClick={onSend}
      size="icon-sm"
    >
      <ArrowUp />
    </Button>
  );

const JumpButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    className="animate-in fade-in zoom-in-95 absolute bottom-28 left-1/2 h-7 -translate-x-1/2 rounded-full px-3 text-xs shadow-md"
    onClick={onClick}
    size="sm"
    variant="outline"
  >
    <ChevronDown />
    Jump to latest
  </Button>
);

const useObjectUrls = (inUse: ChatAttachment[]) => {
  const owned = useRef(new Set<string>());

  useEffect(() => {
    const live = new Set(inUse.map((a) => a.url));
    for (const url of owned.current) {
      if (!live.has(url)) {
        URL.revokeObjectURL(url);
        owned.current.delete(url);
      }
    }
  }, [inUse]);

  useEffect(() => {
    const urls = owned.current;
    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  return useCallback((file: File): ChatAttachment => {
    const url = URL.createObjectURL(file);
    owned.current.add(url);
    return {
      file,
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      url,
    };
  }, []);
};

export const ChatComposer = ({
  accept = "image/*",
  attachments = false,
  className,
  defaultModel,
  disclaimer = "AI can make mistakes. Check important info.",
  initialMessages = [],
  maxFiles = 4,
  models,
  onModelChange,
  onSend,
  placeholder = "Ask anything",
  suggestions = DEFAULT_SUGGESTIONS,
}: ChatComposerProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [pending, setPending] = useState<ChatAttachment[]>([]);
  const [model, setModel] = useState(defaultModel);
  const [atBottom, setAtBottom] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const actionsRef = useRef<{
    addFiles: (files: File[]) => boolean;
    send: () => void;
  } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const busy = messages.some((m) => m.status === "streaming");

  const inUse = useMemo(
    () => [...pending, ...messages.flatMap((m) => m.attachments ?? [])],
    [messages, pending]
  );
  const toAttachment = useObjectUrls(inUse);

  const editor = useEditor({
    content: "",
    editorProps: {
      handleDrop: (_view, event) =>
        actionsRef.current?.addFiles([...(event.dataTransfer?.files ?? [])]) ??
        false,
      handleKeyDown: (_view, event) => {
        if (
          event.key !== "Enter" ||
          event.shiftKey ||
          event.isComposing ||
          matchMedia("(pointer: coarse)").matches
        ) {
          return false;
        }
        event.preventDefault();
        actionsRef.current?.send();
        return true;
      },
      handlePaste: (_view, event) =>
        actionsRef.current?.addFiles([...(event.clipboardData?.files ?? [])]) ??
        false,
    },
    extensions: [...MESSAGE_EXTENSIONS, Placeholder.configure({ placeholder })],
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });

  const isEmpty =
    useEditorState({
      editor,
      selector: ({ editor: e }) => !e || e.isEmpty,
    }) ?? true;

  const addFiles = useCallback(
    (files: File[]) => {
      const accepted = files.filter((file) => matchesAccept(file, accept));
      if (!attachments || accepted.length === 0) {
        return false;
      }
      setPending((prev) => [
        ...prev,
        ...accepted.slice(0, maxFiles - prev.length).map(toAttachment),
      ]);
      return true;
    },
    [accept, attachments, maxFiles, toAttachment]
  );

  const respond = useCallback(
    async (question: ChatMessage) => {
      const replyId = crypto.randomUUID();
      const controller = new AbortController();
      abortRef.current = controller;
      const patchReply = (patch: Partial<ChatMessage>) =>
        setMessages((prev) =>
          prev.map((m) => (m.id === replyId ? { ...m, ...patch } : m))
        );
      const settle = () =>
        setMessages((prev) =>
          prev.flatMap((m) => {
            if (m.id !== replyId) {
              return [m];
            }
            return m.content ? [{ ...m, status: undefined }] : [];
          })
        );

      setMessages((prev) => [
        ...prev.map((m) =>
          m.id === question.id ? { ...m, status: undefined } : m
        ),
        { content: "", id: replyId, role: "assistant", status: "streaming" },
      ]);

      try {
        const reply = await onSend?.(question.content, {
          files: (question.attachments ?? []).flatMap((a) =>
            a.file ? [a.file] : []
          ),
          model: model ?? models?.[0]?.value,
          signal: controller.signal,
        });
        if (isAsyncIterable(reply)) {
          let text = "";
          for await (const chunk of reply) {
            if (controller.signal.aborted) {
              break;
            }
            text += chunk;
            patchReply({ content: text });
          }
        } else if (typeof reply === "string" || isJSONContent(reply)) {
          patchReply({ content: reply });
        }
        settle();
      } catch {
        if (controller.signal.aborted) {
          settle();
          return;
        }
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== replyId)
            .map((m) => (m.id === question.id ? { ...m, status: "error" } : m))
        );
      }
    },
    [model, models, onSend]
  );

  const send = useCallback(() => {
    if (
      !editor ||
      editor.isDestroyed ||
      busy ||
      (editor.isEmpty && pending.length === 0)
    ) {
      return;
    }
    const question: ChatMessage = {
      attachments: pending,
      content: editor.isEmpty ? "" : editor.getJSON(),
      id: crypto.randomUUID(),
      role: "user",
    };
    stickRef.current = true;
    setMessages((prev) => [...prev, question]);
    setPending([]);
    editor.commands.clearContent();
    respond(question);
  }, [busy, editor, pending, respond]);

  const resend = (index: number, content: ChatContent) => {
    const question = { ...messages[index], content, status: undefined };
    setEditingId(null);
    stickRef.current = true;
    setMessages((prev) => [...prev.slice(0, index), question]);
    respond(question);
  };

  const regenerate = (index: number) => {
    const question = messages[index - 1];
    if (!question) {
      return;
    }
    setMessages((prev) => prev.slice(0, index));
    respond(question);
  };

  useEffect(() => {
    actionsRef.current = { addFiles, send };
  }, [addFiles, send]);

  useEffect(() => {
    if (stickRef.current) {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    }
  }, [messages]);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) {
      return;
    }
    const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    stickRef.current = bottom;
    setAtBottom(bottom);
  };

  return (
    <div
      className={cn(
        "bg-background relative flex h-[34rem] flex-col overflow-hidden rounded-2xl border",
        className
      )}
    >
      <div
        ref={listRef}
        aria-busy={busy}
        aria-label="Messages"
        aria-live="polite"
        className={`flex-1 overflow-y-auto ${SCROLLBAR}`}
        onScroll={onScroll}
        role="log"
      >
        {messages.length === 0 ? (
          <EmptyState
            onPick={(suggestion) =>
              editor?.chain().setContent(suggestion).focus("end").run()
            }
            suggestions={suggestions}
          />
        ) : (
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pt-8 pb-4">
            {messages.map((message, index) => (
              <MessageRow
                key={message.id}
                busy={busy}
                editing={editingId === message.id}
                message={message}
                onCancelEdit={() => setEditingId(null)}
                onEdit={() => setEditingId(message.id)}
                onRegenerate={() => regenerate(index)}
                onRetry={() => respond(message)}
                onSubmitEdit={(content) => resend(index, content)}
              />
            ))}
          </div>
        )}
      </div>

      {!atBottom && (
        <JumpButton
          onClick={() =>
            listRef.current?.scrollTo({
              behavior: "smooth",
              top: listRef.current.scrollHeight,
            })
          }
        />
      )}

      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-2 px-4 pt-2 pb-3">
        <RichTextEditor
          editor={editor}
          variant="compact"
          className="bg-background focus-within:border-ring/60 flex w-full flex-col gap-1.5 rounded-[22px]! border p-1.5 shadow-xs transition-colors"
        >
          <RichTextEditor.BubbleMenu editor={editor} />
          {pending.length > 0 && (
            <AttachmentList
              attachments={pending}
              className="px-1.5 pt-1.5"
              onRemove={(id) =>
                setPending((prev) => prev.filter((a) => a.id !== id))
              }
              size="sm"
            />
          )}
          <div className="flex items-end gap-1">
            {attachments && (
              <AttachButton
                accept={accept}
                disabled={pending.length >= maxFiles}
                multiple={maxFiles > 1}
                onFiles={addFiles}
              />
            )}
            <div className="min-w-0 flex-1">
              <RichTextEditor.Content
                className={cn(
                  "max-h-48 overflow-y-auto [&_.ProseMirror]:min-h-0! [&_.ProseMirror]:py-1! [&_.ProseMirror]:text-[15px] [&_p]:leading-6!",
                  SCROLLBAR,
                  attachments
                    ? "[&_.ProseMirror]:px-1!"
                    : "[&_.ProseMirror]:px-2.5!"
                )}
              />
            </div>
            {models && (
              <ModelMenu
                model={model}
                models={models}
                onChange={(next) => {
                  setModel(next);
                  onModelChange?.(next);
                }}
              />
            )}
            <SendButton
              busy={busy}
              disabled={isEmpty && pending.length === 0}
              onSend={send}
              onStop={() => abortRef.current?.abort()}
            />
          </div>
        </RichTextEditor>
        {disclaimer && (
          <p className="text-muted-foreground text-xs">{disclaimer}</p>
        )}
      </div>
    </div>
  );
};

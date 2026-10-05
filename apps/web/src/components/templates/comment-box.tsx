"use client";

import { RichTextEditor } from "@editorcn/editor";
import { StaticRenderer } from "@editorcn/static-renderer";
import { generateText } from "@tiptap/core";
import type { JSONContent } from "@tiptap/core";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useEditor, useEditorState } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Copy, MoreHorizontal, SmilePlus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import "@editorcn/editor/style.css";
import "@editorcn/static-renderer/style.css";

export interface CommentAuthor {
  avatar?: string;
  id: string;
  name: string;
}

export interface CommentReaction {
  count: number;
  emoji: string;
  reacted?: boolean;
}

export interface CommentItem {
  author: CommentAuthor;
  createdAt: string;
  content: JSONContent;
  id: string;
  reactions?: CommentReaction[];
}

export interface CommentBoxProps {
  className?: string;
  currentUser?: CommentAuthor;
  initialComments?: CommentItem[];
  onDelete?: (id: string) => void;
  onPost?: (content: JSONContent) => void;
  onReact?: (id: string, emoji: string) => void;
  placeholder?: string;
  title?: string;
}

const EMOJIS = ["👍", "❤️", "🎉", "😄", "👀", "🚀"];

const ITEM =
  "rounded-md py-1 text-[13px] [&_svg:not([class*='size-'])]:size-3.5";

const EXTENSIONS = [
  StarterKit.configure({
    blockquote: false,
    codeBlock: false,
    heading: false,
    horizontalRule: false,
  }),
];

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3600],
  ["minute", 60],
];

const timeAgo = (iso: string) => {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const format = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const match = UNITS.find(([, size]) => Math.abs(seconds) >= size);
  return match
    ? format.format(Math.round(seconds / match[1]), match[0])
    : "just now";
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const UserAvatar = ({ author }: { author: CommentAuthor }) => (
  <Avatar className="size-8">
    {author.avatar && <AvatarImage alt={author.name} src={author.avatar} />}
    <AvatarFallback className="text-xs font-medium">
      {initials(author.name)}
    </AvatarFallback>
  </Avatar>
);

const toggleReaction = (
  reactions: CommentReaction[],
  emoji: string
): CommentReaction[] => {
  const existing = reactions.find((r) => r.emoji === emoji);
  if (!existing) {
    return [...reactions, { count: 1, emoji, reacted: true }];
  }
  return reactions
    .map((r) =>
      r.emoji === emoji
        ? { ...r, count: r.count + (r.reacted ? -1 : 1), reacted: !r.reacted }
        : r
    )
    .filter((r) => r.count > 0);
};

const EmojiPicker = ({ onPick }: { onPick: (emoji: string) => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label="Add reaction"
          className="text-muted-foreground size-7 rounded-full"
          size="icon-sm"
          variant="ghost"
        >
          <SmilePlus className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="flex w-auto gap-0.5 rounded-full p-1"
      >
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            aria-label={`React with ${emoji}`}
            className="hover:bg-accent flex size-8 items-center justify-center rounded-full text-base transition-transform active:scale-90"
            onClick={() => {
              onPick(emoji);
              setOpen(false);
            }}
            type="button"
          >
            {emoji}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};

const CommentMenu = ({
  canDelete,
  onCopy,
  onDelete,
}: {
  canDelete: boolean;
  onCopy: () => void;
  onDelete: () => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        aria-label="Comment options"
        className="text-muted-foreground size-7 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 [@media(hover:none)]:opacity-100"
        size="icon-sm"
        variant="ghost"
      >
        <MoreHorizontal className="size-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="min-w-36 p-1">
      <DropdownMenuItem className={ITEM} onSelect={onCopy}>
        <Copy />
        Copy text
      </DropdownMenuItem>
      {canDelete && (
        <DropdownMenuItem
          className={ITEM}
          onSelect={onDelete}
          variant="destructive"
        >
          <Trash2 />
          Delete
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);

const CommentRow = ({
  comment,
  mine,
  onDelete,
  onReact,
}: {
  comment: CommentItem;
  mine: boolean;
  onDelete: () => void;
  onReact: (emoji: string) => void;
}) => {
  const reactions = comment.reactions ?? [];

  return (
    <li className="group hover:bg-muted/40 animate-in fade-in flex gap-3 px-4 py-3 transition-colors duration-200">
      <UserAvatar author={comment.author} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">
            {comment.author.name}
          </span>
          <time
            className="text-muted-foreground shrink-0 text-xs"
            dateTime={comment.createdAt}
            suppressHydrationWarning
            title={new Date(comment.createdAt).toLocaleString()}
          >
            {timeAgo(comment.createdAt)}
          </time>
          <div className="ml-auto">
            <CommentMenu
              canDelete={mine}
              onCopy={() =>
                navigator.clipboard.writeText(
                  generateText(comment.content, EXTENSIONS)
                )
              }
              onDelete={onDelete}
            />
          </div>
        </div>
        <StaticRenderer
          className="text-foreground/90 -mt-1 text-sm [&_code]:text-[0.85em]"
          content={comment.content}
          extensions={EXTENSIONS}
        />
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {reactions.map((reaction) => (
            <button
              key={reaction.emoji}
              aria-pressed={reaction.reacted ?? false}
              className={cn(
                "flex h-7 items-center gap-1 rounded-full border px-2 text-xs tabular-nums transition-colors active:scale-95",
                reaction.reacted
                  ? "border-primary/30 bg-primary/10 text-foreground"
                  : "hover:bg-accent text-muted-foreground"
              )}
              onClick={() => onReact(reaction.emoji)}
              type="button"
            >
              <span className="text-sm">{reaction.emoji}</span>
              {reaction.count}
            </button>
          ))}
          <EmojiPicker onPick={onReact} />
        </div>
      </div>
    </li>
  );
};

const Composer = ({
  author,
  onPost,
  placeholder,
}: {
  author: CommentAuthor;
  onPost: (content: JSONContent) => void;
  placeholder: string;
}) => {
  const postRef = useRef<(() => void) | null>(null);

  const editor = useEditor({
    content: "",
    editorProps: {
      handleKeyDown: (_view, event) => {
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          postRef.current?.();
          return true;
        }
        return false;
      },
    },
    extensions: [...EXTENSIONS, Placeholder.configure({ placeholder })],
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });

  const isEmpty =
    useEditorState({
      editor,
      selector: ({ editor: e }) => !e || e.isEmpty,
    }) ?? true;

  const post = useCallback(() => {
    if (!editor || editor.isDestroyed || editor.isEmpty) {
      return;
    }
    onPost(editor.getJSON());
    editor.commands.clearContent();
  }, [editor, onPost]);

  useEffect(() => {
    postRef.current = post;
  }, [post]);

  const mod = /Mac|iPhone|iPad/.test(globalThis.navigator?.userAgent ?? "")
    ? "⌘"
    : "Ctrl";

  return (
    <div className="flex gap-3 border-t px-4 py-4">
      <UserAvatar author={author} />
      <RichTextEditor
        editor={editor}
        variant="compact"
        className="bg-background focus-within:border-ring focus-within:ring-ring/20 min-w-0 flex-1 rounded-xl! border shadow-xs transition-shadow focus-within:ring-3"
      >
        <RichTextEditor.Content className="[&_.ProseMirror]:min-h-16! [&_.ProseMirror]:px-3! [&_.ProseMirror]:py-2.5! [&_.ProseMirror]:text-sm" />
        <div className="flex items-center gap-2 px-1.5 pb-1.5">
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.Code />
            <RichTextEditor.BulletList />
          </RichTextEditor.ControlsGroup>
          <KbdGroup className="text-muted-foreground ml-auto hidden sm:inline-flex">
            <Kbd suppressHydrationWarning>{mod}</Kbd>
            <Kbd>Enter</Kbd>
          </KbdGroup>
          <Button
            className="rounded-lg"
            disabled={isEmpty}
            onClick={post}
            size="sm"
          >
            Comment
          </Button>
        </div>
      </RichTextEditor>
    </div>
  );
};

export const CommentBox = ({
  className,
  currentUser = { id: "you", name: "You" },
  initialComments = [],
  onDelete,
  onPost,
  onReact,
  placeholder = "Add a comment…",
  title = "Comments",
}: CommentBoxProps) => {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);

  const post = (content: JSONContent) => {
    onPost?.(content);
    setComments((prev) => [
      ...prev,
      {
        author: currentUser,
        content,
        createdAt: new Date().toISOString(),
        id: crypto.randomUUID(),
      },
    ]);
  };

  const react = (id: string, emoji: string) => {
    onReact?.(id, emoji);
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, reactions: toggleReaction(c.reactions ?? [], emoji) }
          : c
      )
    );
  };

  const remove = (id: string) => {
    onDelete?.(id);
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <section
      className={cn(
        "bg-background flex flex-col overflow-hidden rounded-2xl border",
        className
      )}
    >
      <header className="flex items-center gap-2 border-b px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs tabular-nums">
          {comments.length}
        </span>
      </header>
      {comments.length > 0 ? (
        <ul className="flex flex-col py-1">
          {comments.map((comment) => (
            <CommentRow
              key={comment.id}
              comment={comment}
              mine={comment.author.id === currentUser.id}
              onDelete={() => remove(comment.id)}
              onReact={(emoji) => react(comment.id, emoji)}
            />
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground px-4 py-8 text-center text-sm">
          No comments yet. Start the conversation.
        </p>
      )}
      <Composer author={currentUser} onPost={post} placeholder={placeholder} />
    </section>
  );
};

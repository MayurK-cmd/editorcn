"use client";

import { Link, RichTextEditor } from "@editorcn/editor";
import type { Content, JSONContent } from "@tiptap/core";
import { CharacterCount } from "@tiptap/extension-character-count";
import { Highlight } from "@tiptap/extension-highlight";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import type { Editor } from "@tiptap/react";
import { useEditor, useEditorState } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ChevronDown,
  Copy,
  IndentIncrease,
  Keyboard,
  ListTodo,
  MoreHorizontal,
  Printer,
} from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import "@editorcn/editor/style.css";

export interface DocumentCollaborator {
  name: string;
  src?: string;
}

export interface DocumentEditorProps {
  className?: string;
  collaborators?: DocumentCollaborator[];
  initialContent?: Content;
  initialTitle?: string;
  meta?: string[];
  onChange?: (content: JSONContent) => void;
  onTitleChange?: (title: string) => void;
}

const SAMPLE_CONTENT = `
<h2>Launch Checklist</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><p>Final copy for the in-app announcement</p></li>
  <li data-type="taskItem" data-checked="true"><p>Search latency dashboard shared with the on-call rotation</p></li>
  <li data-type="taskItem" data-checked="false"><p>Help center article for scheduled replies, owned by <strong>Daniel</strong></p></li>
  <li data-type="taskItem" data-checked="false"><p>Support macros updated for the new search operators</p></li>
</ul>
<p>Pricing does not change in 4.2. <mark>Leave the Q1 pricing review out of every piece of launch copy.</mark></p>
<h3>Search Operators</h3>
<p>Search now reads <code>from:</code>, <code>status:</code> and quoted phrases. Paste this into the macro as the example:</p>
<pre><code>from:maya status:open "refund request"</code></pre>
<p>Questions go to Maya in #launch-loomwell.</p>
`;

const SAMPLE_COLLABORATORS: DocumentCollaborator[] = [
  { name: "Maya Chen" },
  { name: "Daniel Ortiz" },
  { name: "Priya Raman" },
];

const TEXT_STYLES = [
  { className: "", label: "Paragraph", value: "0" },
  { className: "font-bold", label: "Heading 1", value: "1" },
  { className: "font-semibold", label: "Heading 2", value: "2" },
  { className: "font-medium", label: "Heading 3", value: "3" },
] as const;

const ALIGNMENTS = [
  { Icon: AlignLeft, label: "Left", value: "left" },
  { Icon: AlignCenter, label: "Center", value: "center" },
  { Icon: AlignRight, label: "Right", value: "right" },
  { Icon: AlignJustify, label: "Justify", value: "justify" },
] as const;

const SHORTCUTS = [
  {
    items: [
      ["Bold", "Mod+B"],
      ["Italic", "Mod+I"],
      ["Underline", "Mod+U"],
      ["Strikethrough", "Mod+Shift+S"],
      ["Inline code", "Mod+E"],
      ["Highlight", "Mod+Shift+H"],
      ["Link", "Mod+K"],
      ["Heading 1 to 3", "Mod+Alt+1"],
      ["Task list", "Mod+Shift+9"],
      ["Indent", "Tab"],
    ],
    title: "Formatting",
  },
  {
    items: [
      ["Heading", "#"],
      ["Bullet list", "-"],
      ["Numbered list", "1."],
      ["Task list", "[ ]"],
      ["Quote", ">"],
      ["Code block", "```"],
      ["Divider", "---"],
    ],
    title: "Markdown",
  },
] as const;

const CONTENT_CLASSES = cn(
  "max-h-[32rem] overflow-y-auto",
  "[&_.ProseMirror]:mx-auto [&_.ProseMirror]:max-w-2xl [&_.ProseMirror]:px-6! [&_.ProseMirror]:py-10!",
  "[&_ul[data-type=taskList]]:list-none! [&_ul[data-type=taskList]]:pl-0!",
  "[&_li[data-type=taskItem]]:flex [&_li[data-type=taskItem]]:items-start [&_li[data-type=taskItem]]:gap-2.5",
  "[&_li[data-type=taskItem]>label]:mt-1.5 [&_li[data-type=taskItem]>div]:flex-1",
  "[&_input[type=checkbox]]:size-4 [&_input[type=checkbox]]:cursor-pointer [&_input[type=checkbox]]:accent-primary",
  "[&_li[data-checked=true]>div]:text-muted-foreground [&_li[data-checked=true]>div]:line-through",
  "[&_mark]:rounded-sm [&_mark]:bg-yellow-400/40 [&_mark]:px-0.5 [&_mark]:text-inherit dark:[&_mark]:bg-yellow-500/30"
);

const ACTIVE_ITEM =
  "rounded-md py-1 pl-2 text-[13px] data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground [&>span:first-child]:hidden [&_svg:not([class*='size-'])]:size-3.5";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Dot = () => (
  <span aria-hidden className="bg-muted-foreground/40 size-1 rounded-full" />
);

const Collaborators = ({ people }: { people: DocumentCollaborator[] }) => (
  <div className="flex -space-x-2">
    {people.map((person) => (
      <Tooltip key={person.name}>
        <TooltipTrigger asChild>
          <Avatar className="ring-card size-7 ring-2">
            {person.src && <AvatarImage alt={person.name} src={person.src} />}
            <AvatarFallback className="text-[0.65rem] font-medium">
              {initials(person.name)}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>{person.name}</TooltipContent>
      </Tooltip>
    ))}
  </div>
);

const MoreMenu = ({ editor }: { editor: Editor | null }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button aria-label="More options" size="icon-sm" variant="ghost">
        <MoreHorizontal />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem
        onSelect={() => navigator.clipboard.writeText(editor?.getHTML() ?? "")}
      >
        <Copy />
        Copy as HTML
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => window.print()}>
        <Printer />
        Print
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const TextStyleMenu = ({
  editor,
  value,
}: {
  editor: Editor | null;
  value: string;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button className="w-28 justify-between" size="sm" variant="ghost">
        {TEXT_STYLES.find((s) => s.value === value)?.label}
        <ChevronDown className="text-muted-foreground" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" className="min-w-32 p-1">
      <DropdownMenuRadioGroup
        className="flex flex-col gap-0.5"
        value={value}
        onValueChange={(next) => {
          const level = Number(next) as 0 | 1 | 2 | 3;
          const chain = editor?.chain().focus();
          (level ? chain?.setHeading({ level }) : chain?.setParagraph())?.run();
        }}
      >
        {TEXT_STYLES.map((style) => (
          <DropdownMenuRadioItem
            key={style.value}
            className={cn(ACTIVE_ITEM, style.className)}
            value={style.value}
          >
            {style.label}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
);

const AlignMenu = ({
  editor,
  value,
}: {
  editor: Editor | null;
  value: string;
}) => {
  const Icon = ALIGNMENTS.find((a) => a.value === value)?.Icon ?? AlignLeft;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Text alignment"
          className="text-muted-foreground gap-0.5 px-1.5"
          size="sm"
          variant="ghost"
        >
          <Icon />
          <ChevronDown className="size-3!" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-28 p-1">
        <DropdownMenuRadioGroup
          className="flex flex-col gap-0.5"
          value={value}
          onValueChange={(next) =>
            editor?.chain().focus().setTextAlign(next).run()
          }
        >
          {ALIGNMENTS.map(({ Icon: ItemIcon, label, value: v }) => (
            <DropdownMenuRadioItem key={v} className={ACTIVE_ITEM} value={v}>
              <ItemIcon />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ShortcutsPopover = () => {
  const mod = /Mac|iPhone|iPad/.test(globalThis.navigator?.userAgent ?? "")
    ? "⌘"
    : "Ctrl";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="text-muted-foreground ml-auto h-7 text-xs"
          size="sm"
          variant="ghost"
        >
          <Keyboard />
          Shortcuts
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="max-h-80 w-72 overflow-y-auto p-3"
        side="top"
      >
        <p className="mb-2 text-sm font-medium">Keyboard shortcuts</p>
        {SHORTCUTS.map((section) => (
          <div key={section.title} className="mb-3 last:mb-0">
            <p className="text-muted-foreground mb-1 text-xs">
              {section.title}
            </p>
            {section.items.map(([label, keys]) => (
              <div
                key={label}
                className="flex items-center justify-between py-1 text-sm"
              >
                {label}
                <KbdGroup>
                  {keys.split("+").map((key) => (
                    <Kbd key={key}>{key === "Mod" ? mod : key}</Kbd>
                  ))}
                </KbdGroup>
              </div>
            ))}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export const DocumentEditor = ({
  className,
  collaborators = SAMPLE_COLLABORATORS,
  initialContent = SAMPLE_CONTENT,
  initialTitle = "Loomwell 4.2",
  meta = ["Launch brief", "Edited just now", "Saved"],
  onChange,
  onTitleChange,
}: DocumentEditorProps) => {
  const [title, setTitle] = useState(initialTitle);

  const editor = useEditor({
    content: initialContent,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: false }),
      Link,
      Highlight,
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CharacterCount,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    immediatelyRender: false,
    onUpdate: ({ editor: updated }) => onChange?.(updated.getJSON()),
    shouldRerenderOnTransaction: false,
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e || e.isDestroyed) {
        return null;
      }
      const level = [1, 2, 3].find((l) => e.isActive("heading", { level: l }));
      return {
        align:
          ALIGNMENTS.find((a) => e.isActive({ textAlign: a.value }))?.value ??
          "left",
        canIndent:
          e.can().sinkListItem("listItem") || e.can().sinkListItem("taskItem"),
        characters: e.storage.characterCount.characters() as number,
        heading: String(level ?? 0),
        taskList: e.isActive("taskList"),
        words: e.storage.characterCount.words() as number,
      };
    },
  });

  const words = state?.words ?? 0;

  return (
    <div
      className={cn(
        "bg-muted/40 text-card-foreground flex flex-col overflow-hidden rounded-2xl border shadow-sm",
        className
      )}
    >
      <header className="flex items-center gap-3 px-4 pt-3 pb-2.5">
        <div className="min-w-0 flex-1">
          <input
            aria-label="Document title"
            className="w-full truncate bg-transparent text-sm font-semibold outline-none"
            onChange={(e) => {
              setTitle(e.target.value);
              onTitleChange?.(e.target.value);
            }}
            placeholder="Untitled"
            value={title}
          />
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
            {meta.map((item, i) => (
              <span key={item} className="flex items-center gap-1.5">
                {i > 0 && <Dot />}
                {item}
              </span>
            ))}
          </p>
        </div>
        <Collaborators people={collaborators} />
        <MoreMenu editor={editor} />
      </header>

      <RichTextEditor
        editor={editor}
        variant="subtle"
        className="bg-background mx-1.5 rounded-xl! border-border! shadow-xs!"
      >
        <RichTextEditor.Toolbar className="bg-transparent! px-2! py-1.5!">
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <TextStyleMenu editor={editor} value={state?.heading ?? "0"} />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.Code />
            <RichTextEditor.Highlight />
            <RichTextEditor.Link />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
            <RichTextEditor.Control
              active={state?.taskList}
              aria-label="Task list"
              title="Task list"
              onClick={() => editor?.chain().focus().toggleTaskList().run()}
            >
              <ListTodo className="size-4" />
            </RichTextEditor.Control>
            <RichTextEditor.Control
              aria-label="Indent"
              disabled={!state?.canIndent}
              title="Indent"
              onClick={() => {
                const chain = editor?.chain().focus();
                (editor?.can().sinkListItem("listItem")
                  ? chain?.sinkListItem("listItem")
                  : chain?.sinkListItem("taskItem")
                )?.run();
              }}
            >
              <IndentIncrease className="size-4" />
            </RichTextEditor.Control>
            <RichTextEditor.CodeBlock />
            <RichTextEditor.Hr />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <AlignMenu editor={editor} value={state?.align ?? "left"} />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content className={CONTENT_CLASSES} />
      </RichTextEditor>

      <footer className="text-muted-foreground flex items-center gap-1.5 px-4 py-2 text-xs">
        <span>
          <strong className="text-foreground font-medium tabular-nums">
            {words.toLocaleString()}
          </strong>{" "}
          words
        </span>
        <Dot />
        <span>
          <strong className="text-foreground font-medium tabular-nums">
            {(state?.characters ?? 0).toLocaleString()}
          </strong>{" "}
          characters
        </span>
        <Dot />
        <span>{Math.max(1, Math.ceil(words / 200))} min read</span>
        <ShortcutsPopover />
      </footer>
    </div>
  );
};

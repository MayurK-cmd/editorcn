"use client";

import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ClaudeIcon } from "@/components/icons";
import { ChatComposer } from "@/components/templates/chat-composer";
import { CommentBox } from "@/components/templates/comment-box";
import { DocumentEditor } from "@/components/templates/document-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const DEMO_REPLY =
  "This reply is streamed word by word from a demo handler. Pass onSend and return a string or an async iterable of text chunks to stream your own model's answer.\n\nSelect text in the input to format it with the bubble menu.";

const wait = (ms: number) =>
  // eslint-disable-next-line promise/avoid-new
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const demoReply = async function* demoReply(
  _content: unknown,
  { signal }: { signal: AbortSignal }
) {
  await wait(600);
  for (const word of DEMO_REPLY.split(" ")) {
    if (signal.aborted) {
      return;
    }
    await wait(35);
    yield `${word} `;
  }
};

const DEMO_MODELS = ["Opus", "Sonnet", "Haiku"].map((name) => ({
  icon: <ClaudeIcon className="text-[#D97757]" />,
  label: `Claude ${name}`,
  value: `claude-${name.toLowerCase()}`,
}));

const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=96&h=96&fit=crop&crop=faces&auto=format&q=80`;

const ago = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

const text = (value: string, mark?: string) => ({
  marks: mark ? [{ type: mark }] : undefined,
  text: value,
  type: "text",
});

const doc = (...content: ReturnType<typeof text>[]) => ({
  content: [{ content, type: "paragraph" }],
  type: "doc",
});

const DEMO_COMMENTS = [
  {
    author: {
      avatar: photo("1494790108377-be9c29b29330"),
      id: "maya",
      name: "Maya Chen",
    },
    content: doc(
      text("The new toolbar feels much lighter. Can we get a "),
      text("table shortcut", "bold"),
      text(" in the next release?")
    ),
    createdAt: ago(180),
    id: "c1",
    reactions: [
      { count: 3, emoji: "👍" },
      { count: 1, emoji: "🎉", reacted: true },
    ],
  },
  {
    author: {
      avatar: photo("1507003211169-0a1dd7228f2d"),
      id: "daniel",
      name: "Daniel Ortiz",
    },
    content: doc(
      text("Agreed. I'd also love "),
      text("Mod+Shift+T", "code"),
      text(" to insert a 3×3 table so we skip the dialog.")
    ),
    createdAt: ago(95),
    id: "c2",
    reactions: [{ count: 2, emoji: "👀" }],
  },
  {
    author: {
      avatar: photo("1438761681033-6461ffad8d80"),
      id: "priya",
      name: "Priya Raman",
    },
    content: doc(
      text("Added it to the roadmap. I'll share a draft by "),
      text("Friday", "italic"),
      text(".")
    ),
    createdAt: ago(12),
    id: "c3",
  },
];

const DEMOS = {
  "chat-composer": (
    <ChatComposer attachments models={DEMO_MODELS} onSend={demoReply} />
  ),
  "comment-box": (
    <CommentBox
      currentUser={{
        avatar: photo("1534528741775-53994a69daeb"),
        id: "you",
        name: "Sofia Martins",
      }}
      initialComments={DEMO_COMMENTS}
    />
  ),
  "document-editor": <DocumentEditor />,
};

export type TemplateName = keyof typeof DEMOS;

export const TemplateDemo = ({ name }: { name: string }) =>
  Object.hasOwn(DEMOS, name) ? DEMOS[name as TemplateName] : notFound();

export const TemplateTabs = ({
  code,
  name,
}: {
  code: React.ReactNode;
  name: TemplateName;
}) => (
  <Tabs defaultValue="preview" className="mt-6">
    <div className="flex items-center justify-between gap-2">
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <Button asChild size="sm" variant="ghost">
        <Link href={`/preview/${name}`} target="_blank">
          <ExternalLinkIcon />
          Open in new tab
        </Link>
      </Button>
    </div>
    <TabsContent value="preview" className="pt-4">
      <div className="bg-muted/30 rounded-xl border p-4 sm:p-8">
        {DEMOS[name]}
      </div>
    </TabsContent>
    <TabsContent value="code" className="pt-4">
      {code}
    </TabsContent>
  </Tabs>
);

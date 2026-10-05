import { ComponentCode } from "@/components/component-code";
import { TemplateTabs } from "@/components/template-demo";
import type { TemplateName } from "@/components/template-demo";
import { highlightCode } from "@/lib/highlight-code";

import chatComposerItem from "../../public/r/chat-composer.json";
import commentBoxItem from "../../public/r/comment-box.json";
import documentEditorItem from "../../public/r/document-editor.json";

const ITEMS = {
  "chat-composer": chatComposerItem,
  "comment-box": commentBoxItem,
  "document-editor": documentEditorItem,
} satisfies Record<TemplateName, unknown>;

export const TemplateShowcase = async ({ name }: { name: TemplateName }) => {
  const [file] = ITEMS[name].files;
  const highlighted = await highlightCode(file.content, "tsx");

  return (
    <TemplateTabs
      code={
        <ComponentCode
          className="[&>pre]:max-h-[32rem]"
          code={file.content}
          highlightedCode={highlighted}
          language="tsx"
          title={file.path}
        />
      }
      name={name}
    />
  );
};

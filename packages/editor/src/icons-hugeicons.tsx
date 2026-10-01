import {
  BoldIcon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  Heading04Icon,
  Heading05Icon,
  Heading06Icon,
  HighlighterIcon,
  ItalicIcon,
  LeftToRightBlockQuoteIcon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  Link01Icon,
  MinusSignIcon,
  RedoIcon,
  SourceCodeIcon,
  SourceCodeSquareIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  TextAlignCenterIcon,
  TextAlignJustifyCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextClearIcon,
  UnderlineIcon,
  UndoIcon,
  UnlinkIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import type { RichTextEditorIcons } from "./icon-types";
import { DEFAULT_LANGUAGE_ICONS } from "./language-icons";

const iconProps = {
  className: "rte-editor-icon",
  strokeWidth: 2,
} as const;

const H = ({ icon }: { icon: typeof BoldIcon }) => (
  <HugeiconsIcon icon={icon} {...iconProps} />
);

// HugeIcons Icons preset ("iconLibrary": "hugeicons", @hugeicons/react + @hugeicons/core-free-icons).
export const DEFAULT_ICONS: RichTextEditorIcons = {
  alignCenterControlIcon: <H icon={TextAlignCenterIcon} />,
  alignJustifyControlIcon: <H icon={TextAlignJustifyCenterIcon} />,
  alignLeftControlIcon: <H icon={TextAlignLeftIcon} />,
  alignRightControlIcon: <H icon={TextAlignRightIcon} />,
  blockquoteControlIcon: <H icon={LeftToRightBlockQuoteIcon} />,
  boldControlIcon: <H icon={BoldIcon} />,
  bulletListControlIcon: <H icon={LeftToRightListBulletIcon} />,
  clearFormattingControlIcon: <H icon={TextClearIcon} />,
  codeBlockControlIcon: <H icon={SourceCodeSquareIcon} />,
  codeControlIcon: <H icon={SourceCodeIcon} />,
  h1ControlIcon: <H icon={Heading01Icon} />,
  h2ControlIcon: <H icon={Heading02Icon} />,
  h3ControlIcon: <H icon={Heading03Icon} />,
  h4ControlIcon: <H icon={Heading04Icon} />,
  h5ControlIcon: <H icon={Heading05Icon} />,
  h6ControlIcon: <H icon={Heading06Icon} />,
  highlightControlIcon: <H icon={HighlighterIcon} />,
  hrControlIcon: <H icon={MinusSignIcon} />,
  italicControlIcon: <H icon={ItalicIcon} />,
  languageIcons: DEFAULT_LANGUAGE_ICONS,
  linkControlIcon: <H icon={Link01Icon} />,
  orderedListControlIcon: <H icon={LeftToRightListNumberIcon} />,
  redoControlIcon: <H icon={RedoIcon} />,
  strikeControlIcon: <H icon={StrikethroughIcon} />,
  subscriptControlIcon: <H icon={SubscriptIcon} />,
  superscriptControlIcon: <H icon={SuperscriptIcon} />,
  underlineControlIcon: <H icon={UnderlineIcon} />,
  undoControlIcon: <H icon={UndoIcon} />,
  unlinkControlIcon: <H icon={UnlinkIcon} />,
};

// ---------------------------------------------------------------------------
// Embed toolbar icons (used by ResizableNodeView / EmbedToolbar)
// ---------------------------------------------------------------------------

type AlignDir = "left" | "center" | "right";

export const ALIGN_PATHS: Record<AlignDir, React.ReactNode> = {
  center: (
    <>
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="17" y1="12" x2="7" y2="12" />
      <line x1="19" y1="18" x2="5" y2="18" />
    </>
  ),
  left: (
    <>
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="15" y1="12" x2="3" y2="12" />
      <line x1="17" y1="18" x2="3" y2="18" />
    </>
  ),
  right: (
    <>
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="12" x2="9" y2="12" />
      <line x1="21" y1="18" x2="7" y2="18" />
    </>
  ),
};

export type { AlignDir };

export const AlignIcon = ({ dir }: { dir: AlignDir }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="rte-editor-icon"
  >
    {ALIGN_PATHS[dir]}
  </svg>
);

export const EditUrlIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="rte-editor-icon"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

export const OpenInYouTubeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="rte-editor-icon"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export const DeleteEmbedIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="rte-editor-icon"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

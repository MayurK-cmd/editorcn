import {
  RiAlignCenter,
  RiAlignJustify,
  RiAlignLeft,
  RiAlignRight,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiBold,
  RiCodeBoxLine,
  RiCodeLine,
  RiFormatClear,
  RiH1,
  RiH2,
  RiH3,
  RiH4,
  RiH5,
  RiH6,
  RiItalic,
  RiLink,
  RiLinkUnlink,
  RiListOrdered,
  RiListUnordered,
  RiMarkPenLine,
  RiQuoteText,
  RiSeparator,
  RiStrikethrough,
  RiSubscript,
  RiSuperscript,
  RiUnderline,
} from "@remixicon/react";

import type { RichTextEditorIcons } from "./icon-types";
import { DEFAULT_LANGUAGE_ICONS } from "./language-icons";

const iconProps = { className: "rte-editor-icon" };

// Remix Icons preset ("iconLibrary": "remixicon", @remixicon/react).
export const DEFAULT_ICONS: RichTextEditorIcons = {
  alignCenterControlIcon: <RiAlignCenter {...iconProps} />,
  alignJustifyControlIcon: <RiAlignJustify {...iconProps} />,
  alignLeftControlIcon: <RiAlignLeft {...iconProps} />,
  alignRightControlIcon: <RiAlignRight {...iconProps} />,
  blockquoteControlIcon: <RiQuoteText {...iconProps} />,
  boldControlIcon: <RiBold {...iconProps} />,
  bulletListControlIcon: <RiListUnordered {...iconProps} />,
  clearFormattingControlIcon: <RiFormatClear {...iconProps} />,
  codeBlockControlIcon: <RiCodeBoxLine {...iconProps} />,
  codeControlIcon: <RiCodeLine {...iconProps} />,
  h1ControlIcon: <RiH1 {...iconProps} />,
  h2ControlIcon: <RiH2 {...iconProps} />,
  h3ControlIcon: <RiH3 {...iconProps} />,
  h4ControlIcon: <RiH4 {...iconProps} />,
  h5ControlIcon: <RiH5 {...iconProps} />,
  h6ControlIcon: <RiH6 {...iconProps} />,
  highlightControlIcon: <RiMarkPenLine {...iconProps} />,
  hrControlIcon: <RiSeparator {...iconProps} />,
  italicControlIcon: <RiItalic {...iconProps} />,
  languageIcons: DEFAULT_LANGUAGE_ICONS,
  linkControlIcon: <RiLink {...iconProps} />,
  orderedListControlIcon: <RiListOrdered {...iconProps} />,
  redoControlIcon: <RiArrowGoForwardLine {...iconProps} />,
  strikeControlIcon: <RiStrikethrough {...iconProps} />,
  subscriptControlIcon: <RiSubscript {...iconProps} />,
  superscriptControlIcon: <RiSuperscript {...iconProps} />,
  underlineControlIcon: <RiUnderline {...iconProps} />,
  undoControlIcon: <RiArrowGoBackLine {...iconProps} />,
  unlinkControlIcon: <RiLinkUnlink {...iconProps} />,
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

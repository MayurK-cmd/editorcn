import {
  RiAlignCenter,
  RiAlignLeft,
  RiAlignRight,
  RiArrowDownSLine,
  RiBold,
  RiBracesLine,
  RiCheckLine,
  RiCodeBoxLine,
  RiCodeLine,
  RiDeleteBinLine,
  RiDraggable,
  RiFileCopyLine,
  RiFileTextLine,
  RiH1,
  RiH2,
  RiH3,
  RiHeading,
  RiImageLine,
  RiItalic,
  RiLink,
  RiLinkUnlink,
  RiListCheck,
  RiListOrdered,
  RiListUnordered,
  RiQuoteText,
  RiSearchLine,
  RiSeparator,
  RiStrikethrough,
  RiTableLine,
  RiText,
  RiUnderline,
} from "@remixicon/react";
import React from "react";

import type { BlockEditorIcons } from "./icon-types";
import { DEFAULT_LANGUAGE_ICONS } from "./language-icons";

const headingIcons: Record<number, React.ComponentType> = {
  1: RiH1,
  2: RiH2,
  3: RiH3,
};

export const HeadingIcon = ({ level }: { level: number }) => {
  const Icon = headingIcons[level] ?? RiHeading;
  return <Icon />;
};

// Remix Icons preset ("iconLibrary": "remixicon", @remixicon/react).
export const DEFAULT_ICONS: BlockEditorIcons = {
  alignCenterIcon: <RiAlignCenter />,
  alignLeftIcon: <RiAlignLeft />,
  alignRightIcon: <RiAlignRight />,
  boldIcon: <RiBold />,
  checkIcon: <RiCheckLine />,
  codeBlockLanguageIcon: <RiBracesLine />,
  codeIcon: <RiCodeLine />,
  copyIcon: <RiFileCopyLine />,
  deleteIcon: <RiDeleteBinLine />,
  dragHandleIcon: <RiDraggable className="block-editor-drag-handle-icon" />,
  dropdownArrowIcon: <RiArrowDownSLine size={12} />,
  fallbackIcon: <RiFileTextLine />,
  italicIcon: <RiItalic />,
  languageIcons: DEFAULT_LANGUAGE_ICONS,
  linkIcon: <RiLink />,
  searchIcon: <RiSearchLine size={14} />,
  slashBlockquoteIcon: <RiQuoteText />,
  slashBulletListIcon: <RiListUnordered />,
  slashCodeBlockIcon: <RiCodeBoxLine />,
  slashDividerIcon: <RiSeparator />,
  slashHeadingIcon: <RiHeading />,
  slashImageIcon: <RiImageLine />,
  slashOrderedListIcon: <RiListOrdered />,
  slashTableIcon: <RiTableLine />,
  slashTaskListIcon: <RiListCheck />,
  slashTextIcon: <RiText />,
  strikethroughIcon: <RiStrikethrough />,
  underlineIcon: <RiUnderline />,
  unlinkIcon: <RiLinkUnlink />,
};

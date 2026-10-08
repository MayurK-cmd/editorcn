import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconBold,
  IconBraces,
  IconCheck,
  IconChecklist,
  IconChevronDown,
  IconCode,
  IconCopy,
  IconFileText,
  IconGripVertical,
  IconH1,
  IconH2,
  IconH3,
  IconHeading,
  IconItalic,
  IconLink,
  IconList,
  IconListNumbers,
  IconMinus,
  IconPhoto,
  IconQuote,
  IconSearch,
  IconSourceCode,
  IconStrikethrough,
  IconTable,
  IconTrash,
  IconTypography,
  IconUnderline,
  IconUnlink,
} from "@tabler/icons-react";
import React from "react";

import type { BlockEditorIcons } from "./icon-types";
import { DEFAULT_LANGUAGE_ICONS } from "./language-icons";

const headingIcons: Record<number, React.ComponentType> = {
  1: IconH1,
  2: IconH2,
  3: IconH3,
};

export const HeadingIcon = ({ level }: { level: number }) => {
  const Icon = headingIcons[level] ?? IconHeading;
  return <Icon />;
};

// Tabler Icons preset for BlockEditor ("iconLibrary": "tabler", @tabler/icons-react).
export const DEFAULT_ICONS: BlockEditorIcons = {
  alignCenterIcon: <IconAlignCenter />,
  alignLeftIcon: <IconAlignLeft />,
  alignRightIcon: <IconAlignRight />,
  boldIcon: <IconBold />,
  checkIcon: <IconCheck />,
  codeBlockLanguageIcon: <IconBraces />,
  codeIcon: <IconCode />,
  copyIcon: <IconCopy />,
  deleteIcon: <IconTrash />,
  dragHandleIcon: (
    <IconGripVertical className="block-editor-drag-handle-icon" />
  ),
  dropdownArrowIcon: <IconChevronDown size={12} />,
  fallbackIcon: <IconFileText />,
  italicIcon: <IconItalic />,
  languageIcons: DEFAULT_LANGUAGE_ICONS,
  linkIcon: <IconLink />,
  searchIcon: <IconSearch size={14} />,
  slashBlockquoteIcon: <IconQuote />,
  slashBulletListIcon: <IconList />,
  slashCodeBlockIcon: <IconSourceCode />,
  slashDividerIcon: <IconMinus />,
  slashHeadingIcon: <IconHeading />,
  slashImageIcon: <IconPhoto />,
  slashOrderedListIcon: <IconListNumbers />,
  slashTableIcon: <IconTable />,
  slashTaskListIcon: <IconChecklist />,
  slashTextIcon: <IconTypography />,
  strikethroughIcon: <IconStrikethrough />,
  underlineIcon: <IconUnderline />,
  unlinkIcon: <IconUnlink />,
};

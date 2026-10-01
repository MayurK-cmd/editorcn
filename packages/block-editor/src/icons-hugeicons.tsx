import {
  BoldIcon,
  BracesIcon,
  ChevronDownIcon,
  CopyIcon,
  Delete02Icon,
  Drag01Icon,
  FileTextIcon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  Image01Icon,
  ItalicIcon,
  LeftToRightBlockQuoteIcon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  Link01Icon,
  MinusSignIcon,
  Search01Icon,
  SourceCodeIcon,
  SourceCodeSquareIcon,
  StrikethroughIcon,
  Table01Icon,
  Task01Icon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextIcon,
  Tick01Icon,
  UnderlineIcon,
  UnlinkIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import type { BlockEditorIcons } from "./icon-types";
import { DEFAULT_LANGUAGE_ICONS } from "./language-icons";

const H = ({ icon }: { icon: typeof BoldIcon }) => (
  <HugeiconsIcon icon={icon} strokeWidth={2} />
);

const headingIcons: Record<number, typeof BoldIcon> = {
  1: Heading01Icon,
  2: Heading02Icon,
  3: Heading03Icon,
};

export const HeadingIcon = ({ level }: { level: number }) => {
  const icon = headingIcons[level] ?? Heading01Icon;
  return <H icon={icon} />;
};

// HugeIcons Icons preset ("iconLibrary": "hugeicons", @hugeicons/react + @hugeicons/core-free-icons).
export const DEFAULT_ICONS: BlockEditorIcons = {
  alignCenterIcon: <H icon={TextAlignCenterIcon} />,
  alignLeftIcon: <H icon={TextAlignLeftIcon} />,
  alignRightIcon: <H icon={TextAlignRightIcon} />,
  boldIcon: <H icon={BoldIcon} />,
  checkIcon: <H icon={Tick01Icon} />,
  codeBlockLanguageIcon: <H icon={BracesIcon} />,
  codeIcon: <H icon={SourceCodeIcon} />,
  copyIcon: <H icon={CopyIcon} />,
  deleteIcon: <H icon={Delete02Icon} />,
  dragHandleIcon: (
    <HugeiconsIcon
      className="block-editor-drag-handle-icon"
      icon={Drag01Icon}
      strokeWidth={2}
    />
  ),
  dropdownArrowIcon: <HugeiconsIcon icon={ChevronDownIcon} size={12} />,
  fallbackIcon: <H icon={FileTextIcon} />,
  italicIcon: <H icon={ItalicIcon} />,
  languageIcons: DEFAULT_LANGUAGE_ICONS,
  linkIcon: <H icon={Link01Icon} />,
  searchIcon: <HugeiconsIcon icon={Search01Icon} size={14} />,
  slashBlockquoteIcon: <H icon={LeftToRightBlockQuoteIcon} />,
  slashBulletListIcon: <H icon={LeftToRightListBulletIcon} />,
  slashCodeBlockIcon: <H icon={SourceCodeSquareIcon} />,
  slashDividerIcon: <H icon={MinusSignIcon} />,
  slashHeadingIcon: <H icon={Heading01Icon} />,
  slashImageIcon: <H icon={Image01Icon} />,
  slashOrderedListIcon: <H icon={LeftToRightListNumberIcon} />,
  slashTableIcon: <H icon={Table01Icon} />,
  slashTaskListIcon: <H icon={Task01Icon} />,
  slashTextIcon: <H icon={TextIcon} />,
  strikethroughIcon: <H icon={StrikethroughIcon} />,
  underlineIcon: <H icon={UnderlineIcon} />,
  unlinkIcon: <H icon={UnlinkIcon} />,
};

// UI Components - Base UI
// This is the central export point for all UI primitives

// ============================================================================
// Design Tokens
// ============================================================================
export * from "./tokens";

// ============================================================================
// Typography
// ============================================================================
export { default as Text } from "./text/Text";
export type {
  TextVariant,
  TextColor,
  TextWeight,
  TextAlign,
} from "./text/Text";

export { default as Heading } from "./heading/Heading";
export type {
  HeadingLevel,
  HeadingSize,
  HeadingColor,
  HeadingWeight,
  HeadingAlign,
} from "./heading/Heading";

// ============================================================================
// Buttons
// ============================================================================
export { default as Button } from "./button/Button";
export type { ButtonVariant, ButtonSize } from "./button/Button";

export { default as IconButton } from "./icon-button/IconButton";
export type { IconButtonVariant, IconButtonSize } from "./icon-button/IconButton";

export { default as ButtonGroup } from "./button-group/ButtonGroup";
export type { ButtonGroupOrientation, ButtonGroupSize } from "./button-group/ButtonGroup";

// Legacy button (for backward compatibility)
export { default as ButtonWithLoading } from "./button-with-loading/ButtonWithLoading";

// ============================================================================
// Form Components
// ============================================================================
export { default as Input } from "./input/Input";
export type { InputSize, InputVariant } from "./input/Input";

export { default as TextArea } from "./textarea/TextArea";
export type { TextAreaSize, TextAreaVariant } from "./textarea/TextArea";

export { default as Select } from "./select/Select";
export type { SelectSize, SelectOption } from "./select/Select";

export { default as Checkbox } from "./checkbox/Checkbox";
export type { CheckboxSize } from "./checkbox/Checkbox";

export { default as Radio } from "./radio/Radio";
export type { RadioSize } from "./radio/Radio";

export { default as RadioGroup } from "./radio-group/RadioGroup";
export type { RadioOption, RadioGroupOrientation } from "./radio-group/RadioGroup";

export { default as Switch } from "./switch/Switch";
export type { SwitchSize } from "./switch/Switch";

export { default as Slider } from "./slider/Slider";
export type { SliderSize } from "./slider/Slider";

export { default as FileInput } from "./file-input/FileInput";
export type { FileInputSize, FileInputVariant } from "./file-input/FileInput";

export { default as FormField } from "./form-field/FormField";
export { default as Form } from "./form/Form";

// ============================================================================
// Layout Components
// ============================================================================
export { default as PageShell } from "./page-shell/PageShell";
export { Container, Stack, Grid, Flex, Divider, Spacer, Box } from "./layout";

export type {
  ContainerSize,
  StackDirection,
  StackAlign,
  StackJustify,
  StackGap,
  GridCols,
  GridGap,
  FlexDirection,
  FlexAlign,
  FlexJustify,
  FlexWrap,
  DividerOrientation,
  DividerVariant,
} from "./layout";

// ============================================================================
// Card Components
// ============================================================================
export { default as Card } from "./card/Card";
export type { CardVariant, CardPadding } from "./card/Card";

// ============================================================================
// Modal Components
// ============================================================================
export { default as Modal } from "./modal/Modal";
export type { ModalSize } from "./modal/Modal";

export { default as Dialog } from "./dialog/Dialog";
export type { DialogVariant } from "./dialog/Dialog";

export { default as Drawer } from "./drawer/Drawer";
export type { DrawerPlacement, DrawerSize } from "./drawer/Drawer";

export { useModal } from "./use-modal/useModal";
export type { ModalState } from "./use-modal/useModal";

// ============================================================================
// Feedback Components
// ============================================================================
export { default as Spinner } from "./spinner/Spinner";
export type { SpinnerSize, SpinnerVariant } from "./spinner/Spinner";

export { default as Progress } from "./progress/Progress";
export type { ProgressSize, ProgressVariant } from "./progress/Progress";

export { default as Skeleton } from "./skeleton/Skeleton";
export type { SkeletonVariant } from "./skeleton/Skeleton";

export { default as Alert } from "./alert/Alert";
export type { AlertVariant } from "./alert/Alert";

export { default as Badge } from "./badge/Badge";
export type { BadgeVariant, BadgeSize } from "./badge/Badge";

export { default as Kbd } from "./kbd/Kbd";
export type { KbdProps } from "./kbd/Kbd";

export { default as Tooltip } from "./tooltip/Tooltip";
export type { TooltipPlacement } from "./tooltip/Tooltip";

// Legacy feedback components
export { default as EmptyState } from "./empty-state/EmptyState";
export { default as DataStateWrapper } from "./data-state-wrapper/DataStateWrapper";
export { default as Toast } from "./toast/Toast";
export { default as ToastContainer } from "./toast-container/ToastContainer";

export { default as ConfirmationModal } from "./confirmation-modal/ConfirmationModal";
export {
  default as ContextMenu,
  ContextMenuItem,
  ContextMenuDivider,
} from "./context-menu/ContextMenu";

// ============================================================================
// Data Display Components
// ============================================================================
export { default as Avatar } from "./avatar/Avatar";
export type { AvatarSize, AvatarStatus } from "./avatar/Avatar";

export { default as Image } from "./image/Image";
export type { ImageFit } from "./image/Image";

export { default as SmartImage } from "./smart-image/SmartImage";
export type { EntityType, AspectRatio } from "./smart-image/SmartImage";

export { default as List } from "./list/List";
export type { ListVariant, ListSpacing } from "./list/List";

export { default as ListItem } from "./list-item/ListItem";
export type { ListItemPadding } from "./list-item/ListItem";

export { default as Table } from "./table/Table";
export type { TableSize, SortDirection } from "./table/Table";

// ============================================================================
// Navigation Components
// ============================================================================
export { default as Tabs } from "./tabs/Tabs";
export type { TabsVariant, TabsSize } from "./tabs/Tabs";

export { default as Breadcrumb } from "./breadcrumb/Breadcrumb";
export type { BreadcrumbItem } from "./breadcrumb/Breadcrumb";

export { default as Pagination } from "./pagination/Pagination";
export type { PaginationSize } from "./pagination/Pagination";

export { default as Link } from "./link/Link";
export type { LinkVariant, LinkSize } from "./link/Link";

export { default as Menu, MenuItem, MenuDivider, MenuLabel } from "./menu/Menu";
export type { MenuPlacement } from "./menu/Menu";

// ============================================================================
// Skeleton Components (existing)
// ============================================================================
export { default as SongCardSkeleton } from "./song-card-skeleton/SongCardSkeleton";
export { default as TrendingSongSkeleton } from "./trending-song-skeleton/TrendingSongSkeleton";
export { default as TableRowSkeleton } from "./table-row-skeleton/TableRowSkeleton";
export { default as CommentSkeleton } from "./comment-skeleton/CommentSkeleton";
export * from "./carousel/Carousel";

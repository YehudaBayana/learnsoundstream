// UI Components - Base UI
// This is the central export point for all UI primitives

// ============================================================================
// Design Tokens
// ============================================================================
export * from './tokens';

// ============================================================================
// Typography
// ============================================================================
export { default as Text } from './Text';
export type { TextVariant, TextColor, TextWeight, TextAlign } from './Text';

export { default as Heading } from './Heading';
export type { HeadingLevel, HeadingSize, HeadingColor, HeadingWeight, HeadingAlign } from './Heading';

// ============================================================================
// Buttons
// ============================================================================
export { default as Button } from './Button';
export type { ButtonVariant, ButtonSize } from './Button';

export { default as IconButton } from './IconButton';
export type { IconButtonVariant, IconButtonSize } from './IconButton';

export { default as ButtonGroup } from './ButtonGroup';
export type { ButtonGroupOrientation, ButtonGroupSize } from './ButtonGroup';

// Legacy button (for backward compatibility)
export { default as ButtonWithLoading } from './ButtonWithLoading';

// ============================================================================
// Form Components
// ============================================================================
export { default as Input } from './Input';
export type { InputSize, InputVariant } from './Input';

export { default as TextArea } from './TextArea';
export type { TextAreaSize, TextAreaVariant } from './TextArea';

export { default as Select } from './Select';
export type { SelectSize, SelectOption } from './Select';

export { default as Checkbox } from './Checkbox';
export type { CheckboxSize } from './Checkbox';

export { default as Radio } from './Radio';
export type { RadioSize } from './Radio';

export { default as RadioGroup } from './RadioGroup';
export type { RadioOption, RadioGroupOrientation } from './RadioGroup';

export { default as Switch } from './Switch';
export type { SwitchSize } from './Switch';

export { default as Slider } from './Slider';
export type { SliderSize } from './Slider';

export { default as FileInput } from './FileInput';
export type { FileInputSize, FileInputVariant } from './FileInput';

export { default as FormField } from './FormField';
export { default as Form } from './Form';

// ============================================================================
// Layout Components
// ============================================================================
export { default as PageShell } from './PageShell';
export {
  Container,
  Stack,
  Grid,
  Flex,
  Divider,
  Spacer,
  Box,
} from './layout';

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
} from './layout';

// ============================================================================
// Card Components
// ============================================================================
export { default as Card } from './Card';
export type { CardVariant, CardPadding } from './Card';

// ============================================================================
// Modal Components
// ============================================================================
export { default as Modal } from './Modal';
export type { ModalSize } from './Modal';

export { default as Dialog } from './Dialog';
export type { DialogVariant } from './Dialog';

export { default as Drawer } from './Drawer';
export type { DrawerPlacement, DrawerSize } from './Drawer';

export { useModal } from './useModal';
export type { ModalState } from './useModal';

// ============================================================================
// Feedback Components
// ============================================================================
export { default as Spinner } from './Spinner';
export type { SpinnerSize, SpinnerVariant } from './Spinner';

export { default as Progress } from './Progress';
export type { ProgressSize, ProgressVariant } from './Progress';

export { default as Skeleton } from './Skeleton';
export type { SkeletonVariant } from './Skeleton';

export { default as Alert } from './Alert';
export type { AlertVariant } from './Alert';

export { default as Badge } from './Badge';
export type { BadgeVariant, BadgeSize } from './Badge';

export { default as Kbd } from './Kbd';
export type { KbdProps } from './Kbd';

export { default as Tooltip } from './Tooltip';
export type { TooltipPlacement } from './Tooltip';

// Legacy feedback components
export { default as EmptyState } from './EmptyState';
export { default as DataStateWrapper } from './DataStateWrapper';
export { default as Toast } from './Toast';
export { default as ToastContainer } from './ToastContainer';

export { default as ConfirmationModal } from './ConfirmationModal';
export { default as ContextMenu, ContextMenuItem, ContextMenuDivider } from './ContextMenu';

// ============================================================================
// Data Display Components
// ============================================================================
export { default as Avatar } from './Avatar';
export type { AvatarSize, AvatarStatus } from './Avatar';

export { default as Image } from './Image';
export type { ImageFit } from './Image';

export { default as SmartImage } from './SmartImage';
export type { EntityType, AspectRatio } from './SmartImage';

export { default as List } from './List';
export type { ListVariant, ListSpacing } from './List';

export { default as ListItem } from './ListItem';
export type { ListItemPadding } from './ListItem';

export { default as Table } from './Table';
export type { TableSize, SortDirection } from './Table';

// ============================================================================
// Navigation Components
// ============================================================================
export { default as Tabs } from './Tabs';
export type { TabsVariant, TabsSize } from './Tabs';

export { default as Breadcrumb } from './Breadcrumb';
export type { BreadcrumbItem } from './Breadcrumb';

export { default as Pagination } from './Pagination';
export type { PaginationSize } from './Pagination';

export { default as Link } from './Link';
export type { LinkVariant, LinkSize } from './Link';

export { default as Menu, MenuItem, MenuDivider, MenuLabel } from './Menu';
export type { MenuPlacement } from './Menu';

// ============================================================================
// Skeleton Components (existing)
// ============================================================================
export { default as SongCardSkeleton } from './SongCardSkeleton';
export { default as TrendingSongSkeleton } from './TrendingSongSkeleton';
export { default as TableRowSkeleton } from './TableRowSkeleton';
export { default as CommentSkeleton } from './CommentSkeleton';
export * from './Carousel';

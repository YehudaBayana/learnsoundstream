import React from 'react';

/**
 * List variant options.
 */
export type ListVariant = 'default' | 'divided' | 'bordered' | 'card';

/**
 * List spacing options.
 */
export type ListSpacing = 'none' | 'sm' | 'md' | 'lg';

interface ListProps {
  /** List content (typically ListItem components) */
  children: React.ReactNode;
  /** List style variant */
  variant?: ListVariant;
  /** Spacing between items */
  spacing?: ListSpacing;
  /** Ordered list (numbered) */
  ordered?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get variant classes.
 */
const getVariantClasses = (variant: ListVariant): string => {
  switch (variant) {
    case 'default':
      return '';
    case 'divided':
      return '[&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-gray-100 dark:[&>*:not(:last-child)]:border-slate-800';
    case 'bordered':
      return 'border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden [&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-gray-200 dark:[&>*:not(:last-child)]:border-slate-700';
    case 'card':
      return 'bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden [&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-gray-100 dark:[&>*:not(:last-child)]:border-slate-700';
  }
};

/**
 * Get spacing classes.
 */
const getSpacingClasses = (spacing: ListSpacing): string => {
  switch (spacing) {
    case 'none':
      return '';
    case 'sm':
      return 'space-y-1';
    case 'md':
      return 'space-y-2';
    case 'lg':
      return 'space-y-4';
  }
};

/**
 * List - Styled list component.
 *
 * A flexible list container for organizing list items.
 *
 * Features:
 * - Multiple variants (default, divided, bordered, card)
 * - Configurable spacing
 * - Ordered or unordered
 * - Works with ListItem component
 * - Dark mode support
 *
 * Usage:
 *   // Basic list
 *   <List>
 *     <ListItem>Item 1</ListItem>
 *     <ListItem>Item 2</ListItem>
 *   </List>
 *
 *   // Divided list
 *   <List variant="divided">
 *     <ListItem>Item 1</ListItem>
 *     <ListItem>Item 2</ListItem>
 *   </List>
 *
 *   // Card style list
 *   <List variant="card">
 *     <ListItem>Item 1</ListItem>
 *     <ListItem>Item 2</ListItem>
 *   </List>
 */
const List: React.FC<ListProps> = ({
  children,
  variant = 'default',
  spacing = 'none',
  ordered = false,
  className = '',
}) => {
  const Element = ordered ? 'ol' : 'ul';

  const classes = [
    getVariantClasses(variant),
    variant === 'default' ? getSpacingClasses(spacing) : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <Element className={classes}>{children}</Element>;
};

export default List;

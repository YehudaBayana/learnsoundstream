import React from 'react';
import { Link } from 'react-router-dom';

/**
 * ListItem padding options.
 */
export type ListItemPadding = 'none' | 'sm' | 'md' | 'lg';

interface ListItemProps extends React.HTMLAttributes<HTMLElement> {
  /** List item content */
  children: React.ReactNode;
  /** Element to show before content (icon, avatar, etc.) */
  leading?: React.ReactNode;
  /** Element to show after content (action, badge, etc.) */
  trailing?: React.ReactNode;
  /** Secondary text below main content */
  secondaryText?: React.ReactNode;
  /** Item padding */
  padding?: ListItemPadding;
  /** Clickable/interactive item */
  interactive?: boolean;
  /** Selected state */
  selected?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Link path if it should be a link */
  to?: string;
  /** Custom component to render as (defaults to button if clickable, li otherwise) */
  as?: React.ElementType;
  /** Additional CSS classes */
  className?: string;
  dataHook?: string;
}

/**
 * Get padding classes.
 */
const getPaddingClasses = (padding: ListItemPadding): string => {
  switch (padding) {
    case 'none':
      return '';
    case 'sm':
      return 'px-3 py-2';
    case 'md':
      return 'px-4 py-3';
    case 'lg':
      return 'px-6 py-4';
  }
};

/**
 * ListItem - Individual list item component.
 *
 * A flexible list item with support for leading/trailing elements.
 *
 * Features:
 * - Leading element (icon, avatar, checkbox)
 * - Trailing element (action, badge, arrow)
 * - Secondary text support
 * - Interactive/clickable state
 * - Selected state
 * - Disabled state
 * - Link support (via 'to' prop)
 * - Custom component support (via 'as' prop)
 * - Dark mode support
 *
 * Usage:
 *   // Basic item
 *   <ListItem>Simple item</ListItem>
 *
 *   // With leading and trailing
 *   <ListItem
 *     leading={<Avatar name="John" size="sm" />}
 *     trailing={<Badge>New</Badge>}
 *   >
 *     John Doe
 *   </ListItem>
 *
 *   // As a link
 *   <ListItem to="/profile/johndoe" leading={<FaUser />}>
 *     View Profile
 *   </ListItem>
 *
 *   // With secondary text
 *   <ListItem secondaryText="johndoe@email.com">
 *     John Doe
 *   </ListItem>
 *
 *   // Interactive
 *   <ListItem interactive onClick={handleClick}>
 *     Clickable item
 *   </ListItem>
 *
 *   // Selected
 *   <ListItem selected>Selected item</ListItem>
 */
const ListItem: React.FC<ListItemProps> = ({
  children,
  leading,
  trailing,
  secondaryText,
  padding = 'md',
  interactive = false,
  selected = false,
  disabled = false,
  onClick,
  to,
  as,
  className = '',
  dataHook,
  ...props
}) => {
  const isClickable = interactive || !!onClick || !!to;

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (onClick || to) && (e.key === 'Enter' || e.key === ' ')) {
      if (!to) e.preventDefault();
      if (onClick) onClick();
    }
  };

  const baseClasses = `
    flex items-center gap-3
    ${getPaddingClasses(padding)}
    ${selected ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}
    ${isClickable && !disabled ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    transition-colors
  `;

  const Element = as || (to ? Link : (isClickable ? 'button' : 'li'));

  return (
    <Element
      className={`${baseClasses} ${className} ${isClickable ? 'w-full text-left' : ''}`}
      data-hook={dataHook}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      disabled={disabled && (Element === 'button' || Element === 'input')}
      to={to}
      type={Element === 'button' ? 'button' : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable && !disabled ? 0 : undefined}
      {...props}
    >
      {leading && <div className="flex-shrink-0">{leading}</div>}

      <div className="flex-1 min-w-0">
        <div className="text-gray-900 dark:text-white truncate font-medium">{children}</div>
        {secondaryText && (
          <div className="text-sm text-gray-500 dark:text-slate-400 truncate">
            {secondaryText}
          </div>
        )}
      </div>

      {trailing && <div className="flex-shrink-0">{trailing}</div>}
    </Element>
  );
};

export default ListItem;

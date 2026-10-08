import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

/**
 * Menu placement options.
 */
export type MenuPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

// Context for menu state
interface MenuContextValue {
  isOpen: boolean;
  close: () => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

const useMenuContext = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('Menu components must be used within Menu');
  }
  return context;
};

// ----------------------------------------------------------------------------
// Menu Item
// ----------------------------------------------------------------------------

interface MenuItemProps {
  /** Item content */
  children: React.ReactNode;
  /** Icon to display before text */
  icon?: React.ReactNode;
  /** Item click handler */
  onClick?: () => void;
  /** Destructive/danger action */
  danger?: boolean;
  /** Disabled state */
  disabled?: boolean;
  className?: string;
  dataHook?: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  children,
  icon,
  onClick,
  danger = false,
  disabled = false,
  className = '',
  dataHook,
}) => {
  const { close } = useMenuContext();

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
      close();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      data-hook={dataHook}
      className={`
        w-full
        flex items-center gap-3
        px-4 py-2
        text-sm text-left
        ${danger
          ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20'
          : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        transition-colors
        focus:outline-none focus:bg-gray-100 dark:focus:bg-slate-800
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0 w-4 h-4">{icon}</span>}
      <span className="flex-1">{children}</span>
    </button>
  );
};

// ----------------------------------------------------------------------------
// Menu Divider
// ----------------------------------------------------------------------------

export const MenuDivider: React.FC<{ className?: string; dataHook?: string }> = ({ className = '', dataHook }) => (
  <div
    role="separator"
    data-hook={dataHook}
    className={`my-1 border-t border-gray-100 dark:border-slate-700 ${className}`}
  />
);

// ----------------------------------------------------------------------------
// Menu Label
// ----------------------------------------------------------------------------

interface MenuLabelProps {
  children: React.ReactNode;
  className?: string;
  dataHook?: string;
}

export const MenuLabel: React.FC<MenuLabelProps> = ({ children, className = '', dataHook }) => (
  <div
    data-hook={dataHook}
    className={`
      px-4 py-2
      text-xs font-semibold uppercase tracking-wider
      text-gray-500 dark:text-slate-500
      ${className}
    `}
  >
    {children}
  </div>
);

// ----------------------------------------------------------------------------
// Menu
// ----------------------------------------------------------------------------

interface MenuProps {
  /** Menu trigger button */
  trigger: React.ReactElement<{
    onClick?: (e: React.MouseEvent) => void;
    'aria-haspopup'?: string;
    'aria-expanded'?: boolean;
    'data-hook'?: string;
  }>;
  /** Menu content (MenuItems) */
  children: React.ReactNode;
  /** Menu placement relative to trigger */
  placement?: MenuPlacement;
  /** Close menu on outside click */
  closeOnOutsideClick?: boolean;
  /** Close menu on Escape key */
  closeOnEscape?: boolean;
  /** Additional CSS classes for menu dropdown */
  className?: string;
  dataHook?: string;
}

/**
 * Menu - Dropdown menu component.
 *
 * A dropdown menu that appears on trigger click.
 *
 * Features:
 * - Multiple placements
 * - Keyboard navigation
 * - Click outside to close
 * - Escape to close
 * - Icon support
 * - Danger items
 * - Dividers and labels
 * - Dark mode support
 *
 * Usage:
 *   <Menu
 *     trigger={<IconButton icon={<DotsIcon />} aria-label="Options" />}
 *   >
 *     <MenuItem icon={<EditIcon />} onClick={handleEdit}>
 *       Edit
 *     </MenuItem>
 *     <MenuItem icon={<CopyIcon />} onClick={handleCopy}>
 *       Duplicate
 *     </MenuItem>
 *     <MenuDivider />
 *     <MenuItem icon={<TrashIcon />} onClick={handleDelete} danger>
 *       Delete
 *     </MenuItem>
 *   </Menu>
 */
const Menu: React.FC<MenuProps> & {
  Item: typeof MenuItem;
  Divider: typeof MenuDivider;
  Label: typeof MenuLabel;
} = ({
  trigger,
  children,
  placement = 'bottom-end',
  closeOnOutsideClick = true,
  closeOnEscape = true,
  className = '',
  dataHook,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  // Calculate position
  useEffect(() => {
    if (isOpen && triggerRef.current && menuRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      let top = 0;
      let left = 0;

      switch (placement) {
        case 'bottom-start':
          top = triggerRect.bottom + scrollY + 4;
          left = triggerRect.left + scrollX;
          break;
        case 'bottom-end':
          top = triggerRect.bottom + scrollY + 4;
          left = triggerRect.right + scrollX - menuRect.width;
          break;
        case 'top-start':
          top = triggerRect.top + scrollY - menuRect.height - 4;
          left = triggerRect.left + scrollX;
          break;
        case 'top-end':
          top = triggerRect.top + scrollY - menuRect.height - 4;
          left = triggerRect.right + scrollX - menuRect.width;
          break;
      }

      // Schedule update asynchronously to avoid setState in effect warning
      setTimeout(() => {
        setPosition({ top, left });
      }, 0);
    }
  }, [isOpen, placement]);

  // Handle outside click
  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeOnOutsideClick]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape]);

  // Clone trigger to add click handler
  const triggerElement = React.cloneElement(trigger, {
    onClick: (e: React.MouseEvent) => {
      toggle();
      trigger.props.onClick?.(e);
    },
    'aria-haspopup': 'menu',
    'aria-expanded': isOpen,
    'data-hook': dataHook ? `${dataHook}-trigger` : undefined,
  });

  const menu = isOpen
    ? createPortal(
        <div
          ref={menuRef}
          role="menu"
          data-hook={dataHook ? `${dataHook}-menu` : undefined}
          className={`
            fixed z-[1500]
            min-w-[180px]
            py-1
            bg-white dark:bg-slate-900
            border border-gray-200 dark:border-slate-700
            rounded-xl
            shadow-lg
            animate-in fade-in zoom-in-95 duration-150
            origin-top-right
            ${className}
          `}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <MenuContext.Provider value={{ isOpen, close }}>
            {children}
          </MenuContext.Provider>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div ref={triggerRef} className="inline-block" data-hook={dataHook}>
        {triggerElement}
      </div>
      {menu}
    </>
  );
};

// Attach subcomponents
Menu.Item = MenuItem;
Menu.Divider = MenuDivider;
Menu.Label = MenuLabel;

export default Menu;

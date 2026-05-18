import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ContextMenuContext, useContextMenuContext } from './ContextMenuContext';

// ----------------------------------------------------------------------------
// Context Menu Item
// ----------------------------------------------------------------------------

interface ContextMenuItemProps {
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
}

export const ContextMenuItem: React.FC<ContextMenuItemProps> = ({
  children,
  icon,
  onClick,
  danger = false,
  disabled = false,
  className = '',
}) => {
  const { close } = useContextMenuContext();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering other clicks
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
// Context Menu Divider
// ----------------------------------------------------------------------------

export const ContextMenuDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    role="separator"
    className={`my-1 border-t border-gray-100 dark:border-slate-700 ${className}`}
  />
);

// ----------------------------------------------------------------------------
// Context Menu
// ----------------------------------------------------------------------------

interface ContextMenuProps {
  /** The element that triggers the context menu on right-click */
  children: React.ReactNode;
  /** The content of the menu (ContextMenuItems) */
  content: React.ReactNode;
  /** Additional CSS classes for the menu dropdown */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * ContextMenu - A right-click menu component.
 *
 * Wraps children with a right-click listener and displays a menu at the cursor position.
 *
 * Usage:
 *   <ContextMenu
 *     content={
 *       <>
 *         <ContextMenu.Item onClick={handlePlay}>Play</ContextMenu.Item>
 *         <ContextMenu.Divider />
 *         <ContextMenu.Item onClick={handleDelete} danger>Delete</ContextMenu.Item>
 *       </>
 *     }
 *   >
 *     <div className="h-20 bg-gray-100">Right click me</div>
 *   </ContextMenu>
 */
const ContextMenu: React.FC<ContextMenuProps> & {
  Item: typeof ContextMenuItem;
  Divider: typeof ContextMenuDivider;
} = ({
  children,
  content,
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);



  const close = () => {
    setIsOpen(false);
  };

  // Handle outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        close();
      }
    };

    const handleScroll = () => {
      close();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { capture: true }); // Close on scroll
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Adjust position if menu goes off screen
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let { x, y } = position;

      // Adjust horizontal position
      if (x + rect.width > viewportWidth + window.scrollX) {
        x -= rect.width;
      }

      // Adjust vertical position
      if (y + rect.height > viewportHeight + window.scrollY) {
        y -= rect.height;
      }

      // If we adjusted, update state (safely)
      if (x !== position.x || y !== position.y) {
         // We won't update state here to avoid flicker/loop, relying on CSS max-width/height if needed 
         // or accept slight inaccuracy. For a simple implementation, standard context menus open 
         // towards bottom-right unless near edge.
         // A more robust solution would measure before showing.
         // For now, let's keep it simple.
      }
    }
  }, [isOpen, position]);

  const menu = isOpen
    ? createPortal(
        <div
          ref={menuRef}
          role="menu"
          className={`
            fixed z-[1600]
            min-w-[180px]
            py-1
            bg-white dark:bg-slate-900
            border border-gray-200 dark:border-slate-700
            rounded-xl
            shadow-xl
            animate-in fade-in zoom-in-95 duration-100
            origin-top-left
            ${className}
          `}
          style={{
            top: `${position.y}px`,
            left: `${position.x}px`,
          }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside menu (handled by items)
        >
          <ContextMenuContext.Provider value={{ close }}>
            {content}
          </ContextMenuContext.Provider>
        </div>,
        document.body
      )
    : null;

  const triggerRef = useRef<HTMLDivElement>(null);

  // Use native event listener with capture phase to intercept context menu
  useEffect(() => {
    if (disabled) return;

    const handleNativeContextMenu = (e: MouseEvent) => {
      const target = e.target as Node;
      // Check if the event target is within our wrapper
      if (triggerRef.current && triggerRef.current.contains(target)) {
        e.preventDefault();
        e.stopPropagation();

        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        setPosition({ 
          x: e.clientX + scrollX, 
          y: e.clientY + scrollY 
        });
        setIsOpen(true);
      }
    };

    // Use capture phase to intercept before any other handlers
    document.addEventListener('contextmenu', handleNativeContextMenu, true);
    
    return () => {
      document.removeEventListener('contextmenu', handleNativeContextMenu, true);
    };
  }, [disabled]);

  return (
    <>
      <div ref={triggerRef}>
        {children}
      </div>
      {menu}
    </>
  );
};

// Attach subcomponents
ContextMenu.Item = ContextMenuItem;
ContextMenu.Divider = ContextMenuDivider;

export default ContextMenu;

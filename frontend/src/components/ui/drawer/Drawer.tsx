import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

/**
 * Drawer placement options.
 */
export type DrawerPlacement = "left" | "right" | "top" | "bottom";

/**
 * Drawer size options.
 */
export type DrawerSize = "sm" | "md" | "lg" | "xl" | "full";

// ----------------------------------------------------------------------------
// Drawer Header
// ----------------------------------------------------------------------------

interface DrawerHeaderProps {
  /** Header content */
  children: React.ReactNode;
  /** Show close button */
  showCloseButton?: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Drawer.Header - Header section with title and close button.
 */
const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  children,
  showCloseButton = true,
  onClose,
  className = "",
}) => {
  return (
    <div
      className={`
        flex items-center justify-between
        px-4 py-4 sm:px-6
        border-b border-gray-200 dark:border-slate-700
        ${className}
      `}
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{children}</h2>
      {showCloseButton && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="
            p-1 rounded-lg
            text-gray-400 hover:text-gray-600
            dark:text-slate-500 dark:hover:text-slate-300
            hover:bg-gray-100 dark:hover:bg-slate-800
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-emerald-500
          "
          aria-label="Close drawer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------------
// Drawer Body
// ----------------------------------------------------------------------------

interface DrawerBodyProps {
  /** Body content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Drawer.Body - Main scrollable content area.
 */
const DrawerBody: React.FC<DrawerBodyProps> = ({ children, className = "" }) => {
  return <div className={`flex-1 overflow-y-auto px-4 py-4 sm:px-6 ${className}`}>{children}</div>;
};

// ----------------------------------------------------------------------------
// Drawer Footer
// ----------------------------------------------------------------------------

interface DrawerFooterProps {
  /** Footer content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Drawer.Footer - Footer section for actions.
 */
const DrawerFooter: React.FC<DrawerFooterProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`
        flex items-center gap-3 justify-end
        px-4 py-4 sm:px-6
        border-t border-gray-200 dark:border-slate-700
        bg-gray-50 dark:bg-slate-800/50
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// ----------------------------------------------------------------------------
// Drawer
// ----------------------------------------------------------------------------

interface DrawerProps {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Called when drawer should close */
  onClose: () => void;
  /** Drawer content */
  children: React.ReactNode;
  /** Placement (which side of screen) */
  placement?: DrawerPlacement;
  /** Drawer size */
  size?: DrawerSize;
  /** Close when backdrop is clicked */
  closeOnBackdrop?: boolean;
  /** Close when Escape key is pressed */
  closeOnEscape?: boolean;
  /** Prevent body scroll when open */
  preventScroll?: boolean;
  /** Additional CSS classes for the drawer panel */
  className?: string;
  /** Test data hook selector */
  dataHook?: string;
}

/**
 * Get size classes based on placement.
 */
const getSizeClasses = (size: DrawerSize, placement: DrawerPlacement): string => {
  const isHorizontal = placement === "left" || placement === "right";

  if (isHorizontal) {
    switch (size) {
      case "sm":
        return "w-72"; // 288px
      case "md":
        return "w-80"; // 320px
      case "lg":
        return "w-96"; // 384px
      case "xl":
        return "w-[28rem]"; // 448px
      case "full":
        return "w-full";
    }
  } else {
    switch (size) {
      case "sm":
        return "h-48"; // 192px
      case "md":
        return "h-64"; // 256px
      case "lg":
        return "h-80"; // 320px
      case "xl":
        return "h-96"; // 384px
      case "full":
        return "h-full";
    }
  }
};

/**
 * Get placement classes.
 */
const getPlacementClasses = (placement: DrawerPlacement): string => {
  switch (placement) {
    case "left":
      return "inset-y-0 left-0";
    case "right":
      return "inset-y-0 right-0";
    case "top":
      return "inset-x-0 top-0";
    case "bottom":
      return "inset-x-0 bottom-0";
  }
};

/**
 * Get animation classes.
 */
const getAnimationClasses = (placement: DrawerPlacement): string => {
  switch (placement) {
    case "left":
      return "animate-in slide-in-from-left duration-300";
    case "right":
      return "animate-in slide-in-from-right duration-300";
    case "top":
      return "animate-in slide-in-from-top duration-300";
    case "bottom":
      return "animate-in slide-in-from-bottom duration-300";
  }
};

/**
 * Drawer - Side panel overlay component.
 *
 * A compound component with Drawer.Header, Drawer.Body, and Drawer.Footer
 * for building side panels and navigation drawers.
 *
 * Features:
 * - Multiple placements (left, right, top, bottom)
 * - Multiple sizes (sm, md, lg, xl, full)
 * - Backdrop click to close
 * - Escape key to close
 * - Slide animation based on placement
 * - Body scroll lock
 * - Dark mode support
 *
 * Usage:
 *   const drawer = useModal();
 *
 *   <Button onClick={drawer.open}>Open Drawer</Button>
 *
 *   <Drawer
 *     isOpen={drawer.isOpen}
 *     onClose={drawer.close}
 *     placement="right"
 *   >
 *     <Drawer.Header onClose={drawer.close}>
 *       Menu
 *     </Drawer.Header>
 *     <Drawer.Body>
 *       Navigation items here
 *     </Drawer.Body>
 *     <Drawer.Footer>
 *       Footer actions
 *     </Drawer.Footer>
 *   </Drawer>
 */
const Drawer: React.FC<DrawerProps> & {
  Header: typeof DrawerHeader;
  Body: typeof DrawerBody;
  Footer: typeof DrawerFooter;
} = ({
  isOpen,
  onClose,
  children,
  placement = "right",
  size = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
  preventScroll = true,
  className = "",
  dataHook,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Handle Escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    },
    [closeOnEscape, onClose],
  );

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Manage body scroll and focus
  useEffect(() => {
    if (isOpen) {
      // Save current active element
      previousActiveElement.current = document.activeElement;

      // Prevent body scroll
      if (preventScroll) {
        document.body.style.overflow = "hidden";
      }

      // Add escape key listener
      document.addEventListener("keydown", handleKeyDown);

      // Focus the drawer
      setTimeout(() => {
        drawerRef.current?.focus();
      }, 0);

      return () => {
        // Restore body scroll
        if (preventScroll) {
          document.body.style.overflow = "";
        }

        // Remove escape key listener
        document.removeEventListener("keydown", handleKeyDown);

        // Restore focus
        if (previousActiveElement.current instanceof HTMLElement) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, preventScroll, handleKeyDown]);

  // Don't render if not open
  if (!isOpen) return null;

  // Clone children to pass onClose to Header
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement<DrawerHeaderProps>(child) && child.type === DrawerHeader) {
      return React.cloneElement(child, {
        onClose: child.props.onClose || onClose,
      });
    }
    return child;
  });

  const drawer = (
    <div
      className="fixed inset-0 z-[1400] overflow-hidden"
      role="dialog"
      aria-modal="true"
      data-hook={dataHook}
    >
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0
          bg-black/50 dark:bg-black/70
          backdrop-blur-sm
          animate-in fade-in duration-200
        `}
        aria-hidden="true"
        onClick={handleBackdropClick}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        className={`
          fixed ${getPlacementClasses(placement)}
          ${getSizeClasses(size, placement)}
          flex flex-col
          bg-white dark:bg-slate-900
          shadow-2xl
          ${getAnimationClasses(placement)}
          focus:outline-none
          ${className}
        `}
      >
        {enhancedChildren}
      </div>
    </div>
  );

  // Render via portal to document.body
  return createPortal(drawer, document.body);
};

// Attach subcomponents
Drawer.Header = DrawerHeader;
Drawer.Body = DrawerBody;
Drawer.Footer = DrawerFooter;

export default Drawer;

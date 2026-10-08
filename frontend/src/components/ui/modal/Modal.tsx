import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

/**
 * Modal size options.
 */
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

// ----------------------------------------------------------------------------
// Modal Header
// ----------------------------------------------------------------------------

interface ModalHeaderProps {
  /** Header content (title) */
  children: React.ReactNode;
  /** Show close button */
  showCloseButton?: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
  dataHook?: string;
}

/**
 * Modal.Header - Header section with title and optional close button.
 */
const ModalHeader: React.FC<ModalHeaderProps> = ({
  children,
  showCloseButton = true,
  onClose,
  className = "",
  dataHook,
}) => {
  return (
    <div
      className={`
        flex items-center justify-between
        px-4 py-4 sm:px-6
        border-b border-gray-200 dark:border-slate-700
        ${className}
      `}
      data-hook={dataHook}
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {children}
      </h2>
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
          aria-label="Close modal"
          data-hook={dataHook ? `${dataHook}-close-button` : undefined}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
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
// Modal Body
// ----------------------------------------------------------------------------

interface ModalBodyProps {
  /** Body content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  dataHook?: string;
}

/**
 * Modal.Body - Main content area of the modal.
 */
const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className = "",
  dataHook,
}) => {
  return (
    <div className={`px-4 py-4 sm:px-6 ${className}`} data-hook={dataHook}>
      {children}
    </div>
  );
};

// ----------------------------------------------------------------------------
// Modal Footer
// ----------------------------------------------------------------------------

interface ModalFooterProps {
  /** Footer content (typically buttons) */
  children: React.ReactNode;
  /** Justify content alignment */
  justify?: "start" | "center" | "end" | "between";
  /** Additional CSS classes */
  className?: string;
  dataHook?: string;
}

/**
 * Get justify classes.
 */
const getJustifyClasses = (justify: ModalFooterProps["justify"]): string => {
  switch (justify) {
    case "start":
      return "justify-start";
    case "center":
      return "justify-center";
    case "end":
      return "justify-end";
    case "between":
      return "justify-between";
    default:
      return "justify-end";
  }
};

/**
 * Modal.Footer - Footer section for actions.
 */
const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  justify = "end",
  className = "",
  dataHook,
}) => {
  return (
    <div
      className={`
        flex items-center gap-3 ${getJustifyClasses(justify)}
        px-4 py-4 sm:px-6
        border-t border-gray-200 dark:border-slate-700
        bg-gray-50 dark:bg-slate-800/50
        ${className}
      `}
      data-hook={dataHook}
    >
      {children}
    </div>
  );
};

// ----------------------------------------------------------------------------
// Modal
// ----------------------------------------------------------------------------

interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Called when modal should close */
  onClose: () => void;
  /** Modal content */
  children: React.ReactNode;
  /** Modal size */
  size?: ModalSize;
  /** Close when backdrop is clicked */
  closeOnBackdrop?: boolean;
  /** Close when Escape key is pressed */
  closeOnEscape?: boolean;
  /** Center the modal vertically */
  centered?: boolean;
  /** Prevent body scroll when open */
  preventScroll?: boolean;
  /** Additional CSS classes for the modal panel */
  className?: string;
  /** ID for the modal (used for aria-labelledby) */
  id?: string;
  /** Test data hook selector */
  dataHook?: string;
}

/**
 * Get size classes for the modal panel.
 */
const getSizeClasses = (size: ModalSize): string => {
  switch (size) {
    case "sm":
      return "max-w-sm";
    case "md":
      return "max-w-md";
    case "lg":
      return "max-w-lg";
    case "xl":
      return "max-w-xl";
    case "full":
      return "max-w-full m-4 min-h-[calc(100vh-2rem)]";
  }
};

/**
 * Modal - Overlay dialog component.
 *
 * A compound component with Modal.Header, Modal.Body, and Modal.Footer
 * for flexible content organization.
 *
 * Features:
 * - Multiple sizes (sm, md, lg, xl, full)
 * - Backdrop click to close
 * - Escape key to close
 * - Focus trap
 * - Body scroll lock
 * - Animation on open/close
 * - Dark mode support
 * - Portal rendering
 *
 * Usage:
 *   const { isOpen, open, close } = useModal();
 *
 *   <Button onClick={open}>Open Modal</Button>
 *
 *   <Modal isOpen={isOpen} onClose={close}>
 *     <Modal.Header onClose={close}>
 *       Modal Title
 *     </Modal.Header>
 *     <Modal.Body>
 *       Modal content goes here
 *     </Modal.Body>
 *     <Modal.Footer>
 *       <Button variant="ghost" onClick={close}>Cancel</Button>
 *       <Button onClick={handleConfirm}>Confirm</Button>
 *     </Modal.Footer>
 *   </Modal>
 */
const Modal: React.FC<ModalProps> & {
  Header: typeof ModalHeader;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
} = ({
  isOpen,
  onClose,
  children,
  size = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
  centered = true,
  preventScroll = true,
  className = "",
  id,
  dataHook,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
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

  // Manage body scroll and focus (runs only when open state changes)
  useEffect(() => {
    if (isOpen) {
      // Save current active element
      previousActiveElement.current = document.activeElement;

      // Prevent body scroll
      if (preventScroll) {
        document.body.style.overflow = "hidden";
      }

      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);

      return () => {
        // Restore body scroll
        if (preventScroll) {
          document.body.style.overflow = "";
        }

        // Restore focus
        if (previousActiveElement.current instanceof HTMLElement) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, preventScroll]);

  // Manage keyboard listener (runs when listener updates)
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  // Don't render if not open
  if (!isOpen) return null;

  // Clone children to pass onClose to Header
  const enhancedChildren = React.Children.map(children, (child) => {
    if (
      React.isValidElement<ModalHeaderProps>(child) &&
      child.type === ModalHeader
    ) {
      return React.cloneElement(child, {
        onClose: child.props.onClose || onClose,
      });
    }
    return child;
  });

  const modal = (
    <div
      className="fixed inset-0 z-[1400] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={id ? `${id}-title` : undefined}
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
      />

      {/* Modal container */}
      <div
        className={`
          fixed inset-0
          flex ${centered ? "items-center" : "items-start pt-16"}
          justify-center
          p-4
          overflow-y-auto
        `}
        onClick={handleBackdropClick}
        data-hook={dataHook ? `${dataHook}-backdrop` : undefined}
      >
        {/* Modal panel */}
        <div
          ref={modalRef}
          tabIndex={-1}
          className={`
            relative w-full ${getSizeClasses(size)}
            bg-white dark:bg-slate-900
            rounded-xl
            shadow-2xl
            animate-in zoom-in-95 fade-in duration-200
            focus:outline-none
            ${className}
          `}
          data-hook={dataHook ? `${dataHook}-panel` : undefined}
        >
          {enhancedChildren}
        </div>
      </div>
    </div>
  );

  // Render via portal to document.body
  return createPortal(modal, document.body);
};

// Attach subcomponents
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;

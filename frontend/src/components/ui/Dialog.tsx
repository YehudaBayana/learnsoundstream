import React from 'react';
import Modal from './Modal';
import Button from './Button';

/**
 * Dialog variant types.
 */
export type DialogVariant = 'info' | 'success' | 'warning' | 'danger' | 'primary';

/**
 * Icon component for dialog variants.
 */
const DialogIcon: React.FC<{ variant: DialogVariant }> = ({ variant }) => {
  const iconClasses = 'w-6 h-6';

  switch (variant) {
    case 'info':
    case 'primary':
      return (
        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50">
          <svg className={`${iconClasses} text-blue-600 dark:text-blue-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case 'success':
      return (
        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
          <svg className={`${iconClasses} text-emerald-600 dark:text-emerald-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    case 'warning':
      return (
        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50">
          <svg className={`${iconClasses} text-amber-600 dark:text-amber-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      );
    case 'danger':
      return (
        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/50">
          <svg className={`${iconClasses} text-rose-600 dark:text-rose-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      );
  }
};

interface DialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Called when dialog should close */
  onClose: () => void;
  /** Dialog title */
  title: string;
  /** Dialog description/message */
  description?: React.ReactNode;
  /** Dialog variant (affects icon and button color) */
  variant?: DialogVariant;
  /** Show icon */
  showIcon?: boolean;
  /** Primary action button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Called when confirm is clicked */
  onConfirm?: () => void;
  /** Loading state for confirm button */
  loading?: boolean;
  /** Text to show while loading */
  loadingText?: string;
  /** Hide cancel button (alert mode) */
  hideCancel?: boolean;
  /** Additional content between description and buttons */
  children?: React.ReactNode;
  /** ID for the dialog */
  id?: string;
  /** Test data hook selector */
  dataHook?: string;
}

/**
 * Get button variant based on dialog variant.
 */
const getConfirmButtonVariant = (variant: DialogVariant) => {
  switch (variant) {
    case 'danger':
      return 'danger';
    default:
      return 'primary';
  }
};

/**
 * Dialog - Simplified modal for alerts and confirmations.
 *
 * A wrapper around Modal that provides a consistent pattern
 * for alert dialogs and confirmation dialogs.
 *
 * Features:
 * - Multiple variants (info, success, warning, danger)
 * - Optional icon display
 * - Built-in confirm/cancel buttons
 * - Loading state for async operations
 * - Alert mode (no cancel button)
 *
 * Usage:
 *   // Confirmation dialog
 *   <Dialog
 *     isOpen={isOpen}
 *     onClose={close}
 *     title="Delete Item?"
 *     description="This action cannot be undone."
 *     variant="danger"
 *     confirmText="Delete"
 *     onConfirm={handleDelete}
 *   />
 *
 *   // Alert dialog (no cancel)
 *   <Dialog
 *     isOpen={isOpen}
 *     onClose={close}
 *     title="Success!"
 *     description="Your changes have been saved."
 *     variant="success"
 *     confirmText="OK"
 *     hideCancel
 *   />
 *
 *   // With custom content
 *   <Dialog
 *     isOpen={isOpen}
 *     onClose={close}
 *     title="Confirm Action"
 *     onConfirm={handleConfirm}
 *   >
 *     <p>Custom content here</p>
 *   </Dialog>
 */
const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  variant = 'info',
  showIcon = true,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  loading = false,
  loadingText,
  hideCancel = false,
  children,
  id,
  dataHook,
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
      id={id}
      dataHook={dataHook}
    >
      <div className="relative p-6">
        {/* Close button */}
        {!hideCancel && !loading && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
            data-hook={dataHook ? `${dataHook}-close-btn` : 'dialog-close-btn'}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="flex gap-4">
          {showIcon && <DialogIcon variant={variant} />}
          <div className="flex-1 min-w-0">
            <h3
              className="text-lg font-semibold text-gray-900 dark:text-white"
              id={id ? `${id}-title` : undefined}
              data-hook={dataHook ? `${dataHook}-title` : 'dialog-title'}
            >
              {title}
            </h3>
            {description && (
              <div
                className="mt-2 text-sm text-gray-500 dark:text-slate-400"
                data-hook={dataHook ? `${dataHook}-description` : 'dialog-description'}
              >
                {description}
              </div>
            )}
            {children && <div className="mt-4">{children}</div>}
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          {!hideCancel && (
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              dataHook={dataHook ? `${dataHook}-cancel-btn` : 'dialog-cancel-btn'}
            >
              {cancelText}
            </Button>
          )}
          <Button
            variant={getConfirmButtonVariant(variant)}
            onClick={handleConfirm}
            loading={loading}
            loadingText={loadingText}
            dataHook={dataHook ? `${dataHook}-confirm-btn` : 'dialog-confirm-btn'}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default Dialog;

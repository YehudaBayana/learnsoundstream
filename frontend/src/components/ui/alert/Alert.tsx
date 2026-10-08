import React from "react";

/**
 * Alert variant options.
 */
export type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Alert content */
  children: React.ReactNode;
  /** Alert variant/type */
  variant?: AlertVariant;
  /** Alert title (optional) */
  title?: string;
  /** Show icon */
  showIcon?: boolean;
  /** Dismissible alert */
  dismissible?: boolean;
  /** Called when alert is dismissed */
  onDismiss?: () => void;
  /** Additional CSS classes */
  className?: string;
  dataHook?: string;
}

/**
 * Get variant classes.
 */
const getVariantClasses = (variant: AlertVariant): string => {
  switch (variant) {
    case "info":
      return "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200";
    case "success":
      return "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200";
    case "warning":
      return "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200";
    case "error":
      return "bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200";
  }
};

/**
 * Get icon for variant.
 */
const AlertIcon: React.FC<{ variant: AlertVariant }> = ({ variant }) => {
  const iconClasses = "w-5 h-5 flex-shrink-0";

  switch (variant) {
    case "info":
      return (
        <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "success":
      return (
        <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "warning":
      return (
        <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "error":
      return (
        <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
};

/**
 * Alert - Inline notification component.
 *
 * Displays contextual feedback messages to users.
 *
 * Features:
 * - Multiple variants (info, success, warning, error)
 * - Optional title
 * - Optional icon
 * - Dismissible with close button
 * - Dark mode support
 *
 * Usage:
 *   // Basic alert
 *   <Alert variant="info">This is an informational message.</Alert>
 *
 *   // With title
 *   <Alert variant="success" title="Success!">
 *     Your changes have been saved.
 *   </Alert>
 *
 *   // Dismissible
 *   <Alert
 *     variant="warning"
 *     dismissible
 *     onDismiss={() => setShowAlert(false)}
 *   >
 *     Please review before continuing.
 *   </Alert>
 *
 *   // Without icon
 *   <Alert variant="error" showIcon={false}>
 *     Something went wrong.
 *   </Alert>
 */
const Alert: React.FC<AlertProps> = ({
  children,
  variant = "info",
  title,
  showIcon = true,
  dismissible = false,
  onDismiss,
  className = "",
  dataHook,
  ...props
}) => {
  return (
    <div
      role="alert"
      data-hook={dataHook}
      className={`
        flex gap-3 p-4
        border rounded-xl
        ${getVariantClasses(variant)}
        ${className}
      `}
      {...props}
    >
      {showIcon && <AlertIcon variant={variant} />}

      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>

      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="
            flex-shrink-0
            p-1 -m-1
            rounded-lg
            hover:bg-black/5 dark:hover:bg-white/5
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-current focus:ring-opacity-50
          "
          aria-label="Dismiss"
          data-hook={dataHook ? `${dataHook}-dismiss` : undefined}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Alert;

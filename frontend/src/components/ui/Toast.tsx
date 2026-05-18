import React, { useEffect, useState } from 'react';
import {
  HiCheckCircle,
  HiExclamationCircle,
  HiExclamationTriangle,
  HiInformationCircle,
  HiXMark,
} from 'react-icons/hi2';
import type { Toast as ToastType, ToastVariant } from '../../store/useToastStore';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

/**
 * Get the icon component for each toast variant.
 */
const getIcon = (variant: ToastVariant) => {
  switch (variant) {
    case 'success':
      return <HiCheckCircle className="w-5 h-5 text-emerald-500" />;
    case 'error':
      return <HiExclamationCircle className="w-5 h-5 text-rose-500" />;
    case 'warning':
      return <HiExclamationTriangle className="w-5 h-5 text-amber-500" />;
    case 'info':
      return <HiInformationCircle className="w-5 h-5 text-blue-500" />;
  }
};

/**
 * Get the variant-specific styles for the toast border and background.
 */
const getVariantStyles = (variant: ToastVariant): string => {
  switch (variant) {
    case 'success':
      return 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
    case 'error':
      return 'border-l-rose-500 bg-rose-50 dark:bg-rose-900/20';
    case 'warning':
      return 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/20';
    case 'info':
      return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
  }
};

/**
 * Toast - A single toast notification component.
 *
 * Features:
 * - Icon based on variant type
 * - Dismiss button
 * - Optional action button
 * - Fade-in/out animations
 * - Dark mode support
 * - Accessible (role="alert", aria-live)
 */
const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Animate in on mount
  useEffect(() => {
    // Small delay for animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsLeaving(true);
    // Wait for animation to complete before removing
    setTimeout(() => onDismiss(toast.id), 200);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        w-full max-w-sm bg-white dark:bg-slate-800 rounded-lg shadow-lg
        border-l-4 ${getVariantStyles(toast.variant)}
        transform transition-all duration-200 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
      `}
    >
      <div className="p-4 flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">{getIcon(toast.variant)}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800 dark:text-slate-200">{toast.message}</p>

          {/* Action button (if provided) */}
          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick();
                handleDismiss();
              }}
              className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400
                         hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-full text-gray-400 dark:text-slate-500
                     hover:text-gray-600 dark:hover:text-slate-300
                     hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Dismiss notification"
        >
          <HiXMark className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;

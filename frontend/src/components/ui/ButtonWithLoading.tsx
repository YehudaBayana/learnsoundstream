import React from 'react';

/**
 * Button variant styles for different use cases.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

/**
 * Button size options.
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonWithLoadingProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Text to show while loading (optional, defaults to spinner only) */
  loadingText?: string;
  /** Button style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Icon to display before the text */
  leftIcon?: React.ReactNode;
  /** Icon to display after the text */
  rightIcon?: React.ReactNode;
  /** Full width button */
  fullWidth?: boolean;
}

/**
 * Get variant-specific Tailwind classes.
 */
const getVariantClasses = (variant: ButtonVariant): string => {
  switch (variant) {
    case 'primary':
      return `
        bg-gradient-to-r from-emerald-600 to-teal-600
        hover:from-emerald-500 hover:to-teal-500
        text-white font-medium
        shadow-lg shadow-emerald-500/25
        hover:shadow-xl hover:shadow-emerald-500/30
      `;
    case 'secondary':
      return `
        bg-gray-200 dark:bg-slate-700
        text-gray-700 dark:text-slate-300
        hover:bg-gray-300 dark:hover:bg-slate-600
      `;
    case 'danger':
      return `
        bg-rose-600
        hover:bg-rose-500
        text-white font-medium
        shadow-lg shadow-rose-500/25
      `;
    case 'ghost':
      return `
        bg-transparent
        text-gray-600 dark:text-slate-400
        hover:bg-gray-100 dark:hover:bg-slate-800
        hover:text-gray-900 dark:hover:text-white
      `;
  }
};

/**
 * Get size-specific Tailwind classes.
 */
const getSizeClasses = (size: ButtonSize): string => {
  switch (size) {
    case 'sm':
      return 'px-3 py-1.5 text-sm rounded-lg';
    case 'md':
      return 'px-4 py-2 text-base rounded-xl';
    case 'lg':
      return 'px-6 py-3 text-lg rounded-xl';
  }
};

/**
 * Get spinner size based on button size.
 */
const getSpinnerSize = (size: ButtonSize): string => {
  switch (size) {
    case 'sm':
      return 'w-3.5 h-3.5';
    case 'md':
      return 'w-4 h-4';
    case 'lg':
      return 'w-5 h-5';
  }
};

/**
 * Loading spinner component.
 */
const Spinner: React.FC<{ size: ButtonSize }> = ({ size }) => (
  <div
    className={`${getSpinnerSize(size)} border-2 border-current border-t-transparent rounded-full animate-spin`}
    role="status"
    aria-label="Loading"
  />
);

/**
 * ButtonWithLoading - A reusable button component with loading state support.
 *
 * Features:
 * - Multiple variants (primary, secondary, danger, ghost)
 * - Multiple sizes (sm, md, lg)
 * - Loading state with spinner
 * - Optional loading text
 * - Left/right icon support
 * - Full width option
 * - Disabled state handling
 * - Dark mode support
 *
 * Usage:
 *   <ButtonWithLoading
 *     loading={isSubmitting}
 *     loadingText="Saving..."
 *     variant="primary"
 *     onClick={handleSubmit}
 *   >
 *     Save Changes
 *   </ButtonWithLoading>
 */
const ButtonWithLoading: React.FC<ButtonWithLoadingProps> = ({
  children,
  loading = false,
  loadingText,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        transition-all duration-200
        ${getVariantClasses(variant)}
        ${getSizeClasses(size)}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size={size} />
          {loadingText && <span>{loadingText}</span>}
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default ButtonWithLoading;

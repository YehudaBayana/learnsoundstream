import React from 'react';

/**
 * Button variant styles for different use cases.
 *
 * - primary: Main action buttons (emerald gradient)
 * - secondary: Secondary actions (gray/slate)
 * - danger: Destructive actions (rose)
 * - ghost: Transparent buttons for less emphasis
 * - link: Text-only buttons that look like links
 * - outline: Bordered buttons with transparent background
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link' | 'outline';

/**
 * Button size options.
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Text to show while loading (optional, defaults to spinner only) */
  loadingText?: string;
  /** Icon to display before the text */
  leftIcon?: React.ReactNode;
  /** Icon to display after the text */
  rightIcon?: React.ReactNode;
  /** Full width button */
  fullWidth?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Button content */
  children: React.ReactNode;
  /** Custom component to render as */
  as?: React.ElementType;
  /** Link path if rendering as a link */
  to?: string;
  /** Test data hook selector */
  dataHook?: string;
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
        active:from-emerald-700 active:to-teal-700
        text-white font-medium
        shadow-lg shadow-emerald-500/25
        hover:shadow-xl hover:shadow-emerald-500/30
        border-transparent
      `;
    case 'secondary':
      return `
        bg-gray-200 dark:bg-slate-700
        text-gray-700 dark:text-slate-300
        hover:bg-gray-300 dark:hover:bg-slate-600
        active:bg-gray-400 dark:active:bg-slate-500
        border-transparent
      `;
    case 'danger':
      return `
        bg-rose-600
        hover:bg-rose-500
        active:bg-rose-700
        text-white font-medium
        shadow-lg shadow-rose-500/25
        border-transparent
      `;
    case 'ghost':
      return `
        bg-transparent
        text-gray-600 dark:text-slate-400
        hover:bg-gray-100 dark:hover:bg-slate-800
        hover:text-gray-900 dark:hover:text-white
        active:bg-gray-200 dark:active:bg-slate-700
        border-transparent
      `;
    case 'link':
      return `
        bg-transparent
        text-emerald-600 dark:text-emerald-400
        hover:text-emerald-700 dark:hover:text-emerald-300
        hover:underline
        border-transparent
        p-0
      `;
    case 'outline':
      return `
        bg-transparent
        border-gray-300 dark:border-slate-600
        text-gray-700 dark:text-slate-300
        hover:bg-gray-50 dark:hover:bg-slate-800
        active:bg-gray-100 dark:active:bg-slate-700
      `;
  }
};

/**
 * Get size-specific Tailwind classes.
 */
const getSizeClasses = (size: ButtonSize, variant: ButtonVariant): string => {
  // Link variant has no padding
  if (variant === 'link') {
    switch (size) {
      case 'xs':
        return 'text-xs';
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
    }
  }

  switch (size) {
    case 'xs':
      return 'px-2 py-1 text-xs rounded-md gap-1';
    case 'sm':
      return 'px-3 py-1.5 text-sm rounded-lg gap-1.5';
    case 'md':
      return 'px-4 py-2 text-base rounded-xl gap-2';
    case 'lg':
      return 'px-6 py-3 text-lg rounded-xl gap-2';
    case 'xl':
      return 'px-8 py-4 text-xl rounded-2xl gap-3';
  }
};

/**
 * Get spinner size based on button size.
 */
const getSpinnerSize = (size: ButtonSize): string => {
  switch (size) {
    case 'xs':
      return 'w-3 h-3';
    case 'sm':
      return 'w-3.5 h-3.5';
    case 'md':
      return 'w-4 h-4';
    case 'lg':
      return 'w-5 h-5';
    case 'xl':
      return 'w-6 h-6';
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
 * Button - Primary interactive button component.
 *
 * Features:
 * - Multiple variants (primary, secondary, danger, ghost, link, outline)
 * - Multiple sizes (xs, sm, md, lg, xl)
 * - Loading state with spinner
 * - Optional loading text
 * - Left/right icon support
 * - Full width option
 * - Disabled state handling
 * - Dark mode support
 *
 * Usage:
 *   <Button>Click me</Button>
 *   <Button variant="danger" size="sm">Delete</Button>
 *   <Button loading loadingText="Saving...">Save</Button>
 *   <Button leftIcon={<Icon />}>With Icon</Button>
 *   <Button fullWidth>Full Width</Button>
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  type = 'button',
  as,
  to,
  dataHook,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const classes = [
    'inline-flex items-center justify-center',
    'transition-all duration-200',
    'border',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500',
    'dark:focus:ring-offset-slate-900',
    getVariantClasses(variant),
    getSizeClasses(size, variant),
    fullWidth ? 'w-full' : '',
    isDisabled ? 'opacity-50 cursor-not-allowed' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const Element = as || 'button';

  return (
    <Element 
      disabled={isDisabled} 
      type={Element === 'button' ? type : undefined} 
      className={classes} 
      to={to}
      data-hook={dataHook}
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
    </Element>
  );
};

export default Button;

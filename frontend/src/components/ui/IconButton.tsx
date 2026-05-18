import React from 'react';

/**
 * IconButton variant styles.
 */
export type IconButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

/**
 * IconButton size options.
 */
export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The icon to display */
  icon?: React.ReactNode;
  /** Button style variant */
  variant?: IconButtonVariant;
  /** Button size */
  size?: IconButtonSize;
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Accessible label for the button (required for icon-only buttons) */
  'aria-label': string;
  /** Whether the button is round (circular) */
  rounded?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Alternative icon as child */
  children?: React.ReactNode;
}

/**
 * Get variant-specific Tailwind classes.
 */
const getVariantClasses = (variant: IconButtonVariant): string => {
  switch (variant) {
    case 'primary':
      return `
        bg-gradient-to-r from-emerald-600 to-teal-600
        hover:from-emerald-500 hover:to-teal-500
        active:from-emerald-700 active:to-teal-700
        text-white
        shadow-md shadow-emerald-500/20
        hover:shadow-xl hover:shadow-emerald-500/25
      `;
    case 'secondary':
      return `
        bg-gray-200 dark:bg-slate-700
        text-gray-700 dark:text-slate-300
        hover:bg-gray-300 dark:hover:bg-slate-600
        active:bg-gray-400 dark:active:bg-slate-500
      `;
    case 'danger':
      return `
        bg-rose-600
        hover:bg-rose-500
        active:bg-rose-700
        text-white
        shadow-md shadow-rose-500/20
      `;
    case 'ghost':
      return `
        bg-transparent
        text-gray-600 dark:text-slate-400
        hover:bg-gray-100 dark:hover:bg-slate-800
        hover:text-gray-900 dark:hover:text-white
        active:bg-gray-200 dark:active:bg-slate-700
      `;
  }
};

/**
 * Get size-specific Tailwind classes for icon buttons.
 * Icon buttons are square, with consistent padding.
 */
const getSizeClasses = (size: IconButtonSize, rounded: boolean): string => {
  switch (size) {
    case 'xs':
      return `w-6 h-6 text-sm ${rounded ? 'rounded-full' : 'rounded'}`;
    case 'sm':
      return `w-8 h-8 text-base ${rounded ? 'rounded-full' : 'rounded-md'}`;
    case 'md':
      return `w-10 h-10 text-lg ${rounded ? 'rounded-full' : 'rounded-lg'}`;
    case 'lg':
      return `w-12 h-12 text-xl ${rounded ? 'rounded-full' : 'rounded-xl'}`;
    case 'xl':
      return `w-14 h-14 text-2xl ${rounded ? 'rounded-full' : 'rounded-xl'}`;
  }
};

/**
 * Get spinner size based on button size.
 */
const getSpinnerSize = (size: IconButtonSize): string => {
  switch (size) {
    case 'xs':
      return 'w-3 h-3';
    case 'sm':
      return 'w-4 h-4';
    case 'md':
      return 'w-5 h-5';
    case 'lg':
      return 'w-6 h-6';
    case 'xl':
      return 'w-7 h-7';
  }
};

/**
 * Loading spinner component.
 */
const Spinner: React.FC<{ size: IconButtonSize }> = ({ size }) => (
  <div
    className={`${getSpinnerSize(size)} border-2 border-current border-t-transparent rounded-full animate-spin`}
    role="status"
    aria-label="Loading"
  />
);

/**
 * IconButton - Button component for icon-only buttons.
 *
 * Use this component when you need a button that contains only an icon
 * (no text). Requires an aria-label for accessibility.
 *
 * Features:
 * - Square aspect ratio
 * - Multiple variants (primary, secondary, danger, ghost)
 * - Multiple sizes (xs, sm, md, lg, xl)
 * - Optional round/circular shape
 * - Loading state with spinner
 * - Disabled state handling
 * - Dark mode support
 *
 * Usage:
 *   <IconButton icon={<PlayIcon />} aria-label="Play" />
 *   <IconButton icon={<TrashIcon />} variant="danger" aria-label="Delete" />
 *   <IconButton icon={<HeartIcon />} variant="ghost" rounded aria-label="Like" />
 */
const IconButton: React.FC<IconButtonProps> = ({
  icon,
  children,
  variant = 'ghost',
  size = 'md',
  loading = false,
  rounded = false,
  disabled,
  className = '',
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || loading;

  const classes = [
    'inline-flex items-center justify-center p-0',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500',
    'dark:focus:ring-offset-slate-900',
    getVariantClasses(variant),
    getSizeClasses(size, rounded),
    isDisabled ? 'opacity-50 cursor-not-allowed' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button disabled={isDisabled} type={type} className={classes} {...props}>
      {loading ? <Spinner size={size} /> : (icon || children)}
    </button>
  );
};

export default IconButton;

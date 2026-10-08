import React from 'react';

/**
 * Spinner size options.
 */
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Spinner variant options.
 */
export type SpinnerVariant = 'default' | 'primary' | 'white';

interface SpinnerProps {
  /** Spinner size */
  size?: SpinnerSize;
  /** Spinner color variant */
  variant?: SpinnerVariant;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label for screen readers */
  label?: string;
  dataHook?: string;
}

/**
 * Get size classes.
 */
const getSizeClasses = (size: SpinnerSize): string => {
  switch (size) {
    case 'xs':
      return 'w-3 h-3 border';
    case 'sm':
      return 'w-4 h-4 border-2';
    case 'md':
      return 'w-6 h-6 border-2';
    case 'lg':
      return 'w-8 h-8 border-2';
    case 'xl':
      return 'w-12 h-12 border-[3px]';
  }
};

/**
 * Get variant classes.
 */
const getVariantClasses = (variant: SpinnerVariant): string => {
  switch (variant) {
    case 'default':
      return 'border-gray-300 dark:border-slate-600 border-t-gray-600 dark:border-t-slate-300';
    case 'primary':
      return 'border-emerald-200 dark:border-emerald-900 border-t-emerald-600 dark:border-t-emerald-400';
    case 'white':
      return 'border-white/30 border-t-white';
  }
};

/**
 * Spinner - Loading indicator component.
 *
 * A simple, accessible spinning loader for indicating loading states.
 *
 * Features:
 * - Multiple sizes (xs, sm, md, lg, xl)
 * - Multiple variants (default, primary, white)
 * - Screen reader accessible
 * - Dark mode support
 *
 * Usage:
 *   // Default spinner
 *   <Spinner />
 *
 *   // Large primary spinner
 *   <Spinner size="lg" variant="primary" />
 *
 *   // With custom label
 *   <Spinner label="Loading songs..." />
 *
 *   // White spinner on dark background
 *   <div className="bg-gray-900 p-4">
 *     <Spinner variant="white" />
 *   </div>
 */
const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className = '',
  label = 'Loading',
  dataHook,
}) => {
  return (
    <div
      role="status"
      data-hook={dataHook}
      aria-label={label}
      className={`
        inline-block
        rounded-full
        animate-spin
        ${getSizeClasses(size)}
        ${getVariantClasses(variant)}
        ${className}
      `}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default Spinner;

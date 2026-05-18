import React, { forwardRef, useId } from 'react';

/**
 * Checkbox size options.
 */
export type CheckboxSize = 'sm' | 'md' | 'lg';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Checkbox size */
  size?: CheckboxSize;
  /** Label text */
  label?: string;
  /** Description text (shown below label) */
  description?: string;
  /** Whether the checkbox has an error */
  error?: boolean;
  /** Additional CSS classes for the wrapper */
  className?: string;
}

/**
 * Get size-specific Tailwind classes for the checkbox.
 */
const getSizeClasses = (size: CheckboxSize): string => {
  switch (size) {
    case 'sm':
      return 'w-4 h-4';
    case 'md':
      return 'w-5 h-5';
    case 'lg':
      return 'w-6 h-6';
  }
};

/**
 * Get label size classes.
 */
const getLabelSizeClasses = (size: CheckboxSize): string => {
  switch (size) {
    case 'sm':
      return 'text-sm';
    case 'md':
      return 'text-base';
    case 'lg':
      return 'text-lg';
  }
};

/**
 * Checkbox - Checkbox input component with label support.
 *
 * Features:
 * - Multiple sizes (sm, md, lg)
 * - Optional label and description
 * - Error state styling
 * - Custom styled checkbox with checkmark
 * - Disabled state handling
 * - Dark mode support
 * - Forwarded ref for form libraries
 *
 * Usage:
 *   <Checkbox label="Accept terms" />
 *   <Checkbox label="Newsletter" description="Receive weekly updates" />
 *   <Checkbox size="lg" checked />
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      size = 'md',
      label,
      description,
      error = false,
      disabled,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const defaultId = useId();
    const checkboxId = id || `checkbox-${defaultId}`;

    const checkboxClasses = [
      getSizeClasses(size),
      'rounded',
      'border-2',
      error
        ? 'border-rose-500 text-rose-600 focus:ring-rose-500'
        : 'border-gray-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500',
      'bg-white dark:bg-slate-800',
      'transition-colors duration-200',
      'cursor-pointer',
      'focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={`flex items-start gap-3 ${className}`}>
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          className={checkboxClasses}
          {...props}
        />
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={checkboxId}
                className={`
                  ${getLabelSizeClasses(size)}
                  text-gray-900 dark:text-white
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {label}
              </label>
            )}
            {description && (
              <span className="text-sm text-gray-500 dark:text-slate-400">{description}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;

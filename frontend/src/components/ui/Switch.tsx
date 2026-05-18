import React, { forwardRef, useId } from 'react';

/**
 * Switch size options.
 */
export type SwitchSize = 'sm' | 'md' | 'lg';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Switch size */
  size?: SwitchSize;
  /** Label text */
  label?: string;
  /** Description text (shown below label) */
  description?: string;
  /** Whether the switch has an error */
  error?: boolean;
  /** Label position relative to switch */
  labelPosition?: 'left' | 'right';
  /** Additional CSS classes for the wrapper */
  className?: string;
}

/**
 * Get size-specific Tailwind classes for the switch track.
 */
const getTrackSizeClasses = (size: SwitchSize): string => {
  switch (size) {
    case 'sm':
      return 'w-8 h-5';
    case 'md':
      return 'w-11 h-6';
    case 'lg':
      return 'w-14 h-8';
  }
};

/**
 * Get size-specific Tailwind classes for the switch thumb.
 */
const getThumbSizeClasses = (size: SwitchSize): string => {
  switch (size) {
    case 'sm':
      return 'w-3.5 h-3.5';
    case 'md':
      return 'w-4 h-4';
    case 'lg':
      return 'w-6 h-6';
  }
};

/**
 * Get thumb translation distance when checked.
 */
const getThumbTranslate = (size: SwitchSize): string => {
  switch (size) {
    case 'sm':
      return 'translate-x-3.5';
    case 'md':
      return 'translate-x-5';
    case 'lg':
      return 'translate-x-6';
  }
};

/**
 * Get label size classes.
 */
const getLabelSizeClasses = (size: SwitchSize): string => {
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
 * Switch - Toggle switch component.
 *
 * Features:
 * - Multiple sizes (sm, md, lg)
 * - Optional label and description
 * - Label position (left or right)
 * - Error state styling
 * - Smooth transition animation
 * - Disabled state handling
 * - Dark mode support
 * - Forwarded ref for form libraries
 *
 * Usage:
 *   <Switch label="Enable notifications" />
 *   <Switch label="Dark mode" labelPosition="left" />
 *   <Switch size="lg" checked />
 */
const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      size = 'md',
      label,
      description,
      error = false,
      labelPosition = 'right',
      disabled,
      className = '',
      id,
      checked,
      ...props
    },
    ref
  ) => {
    const defaultId = useId();
    const switchId = id || `switch-${defaultId}`;

    const trackClasses = [
      'relative inline-flex flex-shrink-0',
      getTrackSizeClasses(size),
      'rounded-full',
      'transition-colors duration-200 ease-in-out',
      'cursor-pointer',
      'focus-within:ring-2 focus-within:ring-offset-2',
      error
        ? 'focus-within:ring-rose-500'
        : 'focus-within:ring-emerald-500',
      'dark:focus-within:ring-offset-slate-900',
      checked
        ? error
          ? 'bg-rose-600'
          : 'bg-emerald-600'
        : 'bg-gray-200 dark:bg-slate-600',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const thumbClasses = [
      'absolute left-1 top-1/2 -translate-y-1/2',
      getThumbSizeClasses(size),
      'rounded-full',
      'bg-white',
      'shadow-sm',
      'transition-transform duration-200 ease-in-out',
      checked ? getThumbTranslate(size) : 'translate-x-0',
    ]
      .filter(Boolean)
      .join(' ');

    const labelContent = (label || description) && (
      <div className="flex flex-col">
        {label && (
          <label
            htmlFor={switchId}
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
    );

    return (
      <div
        className={`flex items-start gap-3 ${labelPosition === 'left' ? 'flex-row-reverse' : ''} ${className}`}
      >
        <span className={trackClasses}>
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            id={switchId}
            disabled={disabled}
            checked={checked}
            className="sr-only"
            aria-checked={checked}
            aria-invalid={error ? "true" : "false"}
            {...props}
          />
          <span className={thumbClasses} aria-hidden="true" />
        </span>
        {labelContent}
      </div>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;

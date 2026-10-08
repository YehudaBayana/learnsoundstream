import React, { forwardRef, useId } from "react";

/**
 * Radio size options.
 */
export type RadioSize = "sm" | "md" | "lg";

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /** Radio size */
  size?: RadioSize;
  /** Label text */
  label?: string;
  /** Description text (shown below label) */
  description?: string;
  /** Whether the radio has an error */
  error?: boolean;
  /** Additional CSS classes for the wrapper */
  className?: string;
  dataHook?: string;
}

/**
 * Get size-specific Tailwind classes for the radio.
 */
const getSizeClasses = (size: RadioSize): string => {
  switch (size) {
    case "sm":
      return "w-4 h-4";
    case "md":
      return "w-5 h-5";
    case "lg":
      return "w-6 h-6";
  }
};

/**
 * Get label size classes.
 */
const getLabelSizeClasses = (size: RadioSize): string => {
  switch (size) {
    case "sm":
      return "text-sm";
    case "md":
      return "text-base";
    case "lg":
      return "text-lg";
  }
};

/**
 * Radio - Radio button component with label support.
 *
 * Features:
 * - Multiple sizes (sm, md, lg)
 * - Optional label and description
 * - Error state styling
 * - Custom styled radio with indicator
 * - Disabled state handling
 * - Dark mode support
 * - Forwarded ref for form libraries
 *
 * Usage:
 *   <Radio name="option" value="1" label="Option 1" />
 *   <Radio name="option" value="2" label="Option 2" description="More details" />
 */
const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      size = "md",
      label,
      description,
      error = false,
      disabled,
      className = "",
      id,
      dataHook,
      ...props
    },
    ref,
  ) => {
    const defaultId = useId();
    const radioId = id || `radio-${defaultId}`;

    const radioClasses = [
      getSizeClasses(size),
      "rounded-full",
      "border-2",
      error
        ? "border-rose-500 text-rose-600 focus:ring-rose-500"
        : "border-gray-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500",
      "bg-white dark:bg-slate-800",
      "transition-colors duration-200",
      "cursor-pointer",
      "focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
      disabled ? "opacity-50 cursor-not-allowed" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={`flex items-start gap-3 ${className}`} data-hook={dataHook}>
        <input
          ref={ref}
          type="radio"
          data-hook={dataHook ? `${dataHook}-input` : undefined}
          id={radioId}
          disabled={disabled}
          className={radioClasses}
          {...props}
        />
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={radioId}
                className={`
                  ${getLabelSizeClasses(size)}
                  text-gray-900 dark:text-white
                  ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
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
  },
);

Radio.displayName = "Radio";

export default Radio;

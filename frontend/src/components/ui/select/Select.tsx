import React, { forwardRef } from "react";

/**
 * Select size options.
 */
export type SelectSize = "sm" | "md" | "lg";

/**
 * Select option type.
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  /** Select size */
  size?: SelectSize;
  /** Whether the select has an error */
  error?: boolean;
  /** Placeholder text (shown as first disabled option) */
  placeholder?: string;
  /** Select options */
  options?: SelectOption[];
  /** Additional CSS classes */
  className?: string;
  /** Children (alternative to options prop) */
  children?: React.ReactNode;
  dataHook?: string;
}

/**
 * Get size-specific Tailwind classes.
 */
const getSizeClasses = (size: SelectSize): string => {
  switch (size) {
    case "sm":
      return "h-8 text-sm px-3 pr-8";
    case "md":
      return "h-10 text-base px-4 pr-10";
    case "lg":
      return "h-12 text-lg px-5 pr-12";
  }
};

/**
 * Get error state classes.
 */
const getStateClasses = (error: boolean): string => {
  const focusRing = error
    ? "focus:ring-rose-500 focus:border-rose-500"
    : "focus:ring-emerald-500 focus:border-emerald-500";

  return `
    bg-white dark:bg-slate-800
    border ${error ? "border-rose-500" : "border-gray-300 dark:border-slate-600"}
    rounded-lg
    ${focusRing}
    focus:ring-2 focus:ring-offset-0
  `;
};

/**
 * Select - Dropdown select component.
 *
 * Features:
 * - Multiple sizes (sm, md, lg)
 * - Error state styling
 * - Placeholder support
 * - Options via prop or children
 * - Custom chevron icon
 * - Disabled state handling
 * - Dark mode support
 * - Forwarded ref for form libraries
 *
 * Usage:
 *   <Select options={[{ value: '1', label: 'Option 1' }]} />
 *   <Select placeholder="Select an option...">
 *     <option value="1">Option 1</option>
 *     <option value="2">Option 2</option>
 *   </Select>
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      size = "md",
      error = false,
      placeholder,
      options,
      disabled,
      className = "",
      children,
      dataHook,
      ...props
    },
    ref,
  ) => {
    const classes = [
      "w-full",
      "appearance-none",
      "transition-colors duration-200",
      "text-gray-900 dark:text-white",
      "cursor-pointer",
      getSizeClasses(size),
      getStateClasses(error),
      disabled ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-slate-900" : "",
      "focus:outline-none",
      "bg-no-repeat",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // Custom dropdown arrow using SVG as background
    const arrowStyle: React.CSSProperties = {
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
      backgroundPosition: `right ${size === "sm" ? "0.5rem" : size === "md" ? "0.75rem" : "1rem"} center`,
      backgroundSize: "1.25em 1.25em",
    };

    return (
      <select
        ref={ref}
        disabled={disabled}
        data-hook={dataHook}
        aria-invalid={error ? "true" : "false"}
        className={classes}
        style={arrowStyle}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options
          ? options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))
          : children}
      </select>
    );
  },
);

Select.displayName = "Select";

export default Select;

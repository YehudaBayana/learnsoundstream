import React, { forwardRef } from "react";

/**
 * Input size options.
 */
export type InputSize = "sm" | "md" | "lg";

/**
 * Input variant options.
 */
export type InputVariant = "outline" | "filled" | "flushed";

interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  /** Input size */
  size?: InputSize;
  /** Input style variant */
  variant?: InputVariant;
  /** Whether the input has an error */
  error?: boolean;
  /** Whether the input should take full width */
  fullWidth?: boolean;
  /** Icon to display at the start of the input */
  leftIcon?: React.ReactNode;
  /** Icon or element to display at the end of the input */
  rightIcon?: React.ReactNode;
  /** Additional CSS classes for the wrapper */
  wrapperClassName?: string;
  /** Additional CSS classes for the input */
  className?: string;
  /** Identifier for data-hook based tests and automation */
  dataHook?: string;
}

/**
 * Get size-specific Tailwind classes.
 */
const getSizeClasses = (size: InputSize): string => {
  switch (size) {
    case "sm":
      return "h-8 text-sm px-3";
    case "md":
      return "h-10 text-base px-4";
    case "lg":
      return "h-12 text-lg px-5";
  }
};

/**
 * Get variant-specific Tailwind classes.
 */
const getVariantClasses = (variant: InputVariant, error: boolean): string => {
  const focusRing = error
    ? "focus:ring-rose-500 focus:border-rose-500"
    : "focus:ring-emerald-500 focus:border-emerald-500";

  switch (variant) {
    case "outline":
      return `
        bg-white dark:bg-slate-800
        border ${error ? "border-rose-500" : "border-gray-300 dark:border-slate-600"}
        rounded-lg
        ${focusRing}
        focus:ring-2 focus:ring-offset-0
      `;
    case "filled":
      return `
        bg-gray-100 dark:bg-slate-700
        border border-transparent
        rounded-lg
        hover:bg-gray-200 dark:hover:bg-slate-600
        ${focusRing}
        focus:ring-2 focus:ring-offset-0
        focus:bg-white dark:focus:bg-slate-800
        ${error ? "ring-2 ring-rose-500" : ""}
      `;
    case "flushed":
      return `
        bg-transparent
        border-0 border-b-2 ${error ? "border-rose-500" : "border-gray-300 dark:border-slate-600"}
        rounded-none
        ${focusRing}
        focus:ring-0
        px-0
      `;
  }
};

/**
 * Get icon container size classes.
 */
const getIconSizeClasses = (size: InputSize): string => {
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
 * Input - Text input component with variants and icon support.
 *
 * Features:
 * - Multiple sizes (sm, md, lg)
 * - Multiple variants (outline, filled, flushed)
 * - Error state styling
 * - Left/right icon support
 * - Disabled state handling
 * - Dark mode support
 * - Forwarded ref for form libraries
 *
 * Usage:
 *   <Input placeholder="Enter your name" />
 *   <Input type="email" size="lg" />
 *   <Input error placeholder="Invalid email" />
 *   <Input leftIcon={<SearchIcon />} placeholder="Search..." />
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = "md",
      variant = "outline",
      error = false,
      fullWidth = true,
      leftIcon,
      rightIcon,
      disabled,
      wrapperClassName = "",
      className = "",
      dataHook,
      ...props
    },
    ref,
  ) => {
    const hasLeftIcon = Boolean(leftIcon);
    const hasRightIcon = Boolean(rightIcon);

    // Calculate padding adjustments for icons
    const getIconPadding = (): string => {
      if (hasLeftIcon && hasRightIcon) {
        return size === "sm"
          ? "pl-9 pr-9"
          : size === "md"
            ? "pl-10 pr-10"
            : "pl-12 pr-12";
      }
      if (hasLeftIcon) {
        return size === "sm" ? "pl-9" : size === "md" ? "pl-10" : "pl-12";
      }
      if (hasRightIcon) {
        return size === "sm" ? "pr-9" : size === "md" ? "pr-10" : "pr-12";
      }
      return "";
    };

    const inputClasses = [
      fullWidth ? "w-full" : "",
      "transition-colors duration-200",
      "text-gray-900 dark:text-white",
      "placeholder-gray-400 dark:placeholder-slate-500",
      getSizeClasses(size),
      getVariantClasses(variant, error),
      getIconPadding(),
      disabled
        ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-slate-900"
        : "",
      "focus:outline-none",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const iconBaseClasses = `absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 ${getIconSizeClasses(size)}`;

    return (
      <div className={`relative ${wrapperClassName}`} data-hook={dataHook}>
        {hasLeftIcon && (
          <span className={`${iconBaseClasses} left-3`}>{leftIcon}</span>
        )}
        <input
          ref={ref}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          data-hook={dataHook ? `${dataHook}-input` : undefined}
          className={inputClasses}
          {...props}
        />
        {hasRightIcon && (
          <span className={`${iconBaseClasses} right-3`}>{rightIcon}</span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;

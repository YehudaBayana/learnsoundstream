import React, { forwardRef } from "react";

/**
 * TextArea size options.
 */
export type TextAreaSize = "sm" | "md" | "lg";

/**
 * TextArea variant options.
 */
export type TextAreaVariant = "outline" | "filled";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** TextArea size */
  size?: TextAreaSize;
  /** TextArea style variant */
  variant?: TextAreaVariant;
  /** Whether the textarea has an error */
  error?: boolean;
  /** Whether to allow resizing */
  resize?: "none" | "vertical" | "horizontal" | "both";
  /** Additional CSS classes */
  className?: string;
  dataHook?: string;
}

/**
 * Get size-specific Tailwind classes.
 */
const getSizeClasses = (size: TextAreaSize): string => {
  switch (size) {
    case "sm":
      return "text-sm px-3 py-2 min-h-[80px]";
    case "md":
      return "text-base px-4 py-3 min-h-[120px]";
    case "lg":
      return "text-lg px-5 py-4 min-h-[160px]";
  }
};

/**
 * Get variant-specific Tailwind classes.
 */
const getVariantClasses = (variant: TextAreaVariant, error: boolean): string => {
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
  }
};

/**
 * Get resize classes.
 */
const getResizeClasses = (resize: TextAreaProps["resize"]): string => {
  switch (resize) {
    case "none":
      return "resize-none";
    case "vertical":
      return "resize-y";
    case "horizontal":
      return "resize-x";
    case "both":
      return "resize";
    default:
      return "resize-y";
  }
};

/**
 * TextArea - Multi-line text input component.
 *
 * Features:
 * - Multiple sizes (sm, md, lg)
 * - Multiple variants (outline, filled)
 * - Error state styling
 * - Configurable resize behavior
 * - Disabled state handling
 * - Dark mode support
 * - Forwarded ref for form libraries
 *
 * Usage:
 *   <TextArea placeholder="Enter description..." />
 *   <TextArea size="lg" rows={5} />
 *   <TextArea error resize="none" />
 */
const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      size = "md",
      variant = "outline",
      error = false,
      resize = "vertical",
      disabled,
      className = "",
      dataHook,
      ...props
    },
    ref,
  ) => {
    const classes = [
      "w-full",
      "transition-colors duration-200",
      "text-gray-900 dark:text-white",
      "placeholder-gray-400 dark:placeholder-slate-500",
      getSizeClasses(size),
      getVariantClasses(variant, error),
      getResizeClasses(resize),
      disabled ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-slate-900" : "",
      "focus:outline-none",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <textarea
        ref={ref}
        disabled={disabled}
        aria-invalid={error ? "true" : "false"}
        data-hook={dataHook}
        className={classes}
        {...props}
      />
    );
  },
);

TextArea.displayName = "TextArea";

export default TextArea;

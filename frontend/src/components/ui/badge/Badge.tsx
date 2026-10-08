import React from "react";

/**
 * Badge variant options.
 */
export type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "info";

/**
 * Badge size options.
 */
export type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  /** Badge content */
  children: React.ReactNode;
  /** Badge variant/color */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Outlined style (no background) */
  outlined?: boolean;
  /** Pill shape (fully rounded) */
  pill?: boolean;
  /** Dot indicator (no text) */
  dot?: boolean;
  /** Icon to display before text */
  icon?: React.ReactNode;
  /** Make badge removable */
  removable?: boolean;
  /** Called when remove button is clicked */
  onRemove?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Test data hook selector */
  dataHook?: string;
}

/**
 * Get variant classes for filled style.
 */
const getVariantClasses = (variant: BadgeVariant, outlined: boolean): string => {
  if (outlined) {
    switch (variant) {
      case "default":
        return "border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-400";
      case "primary":
        return "border-emerald-500 text-emerald-600 dark:text-emerald-400";
      case "success":
        return "border-green-500 text-green-600 dark:text-green-400";
      case "warning":
        return "border-amber-500 text-amber-600 dark:text-amber-400";
      case "danger":
        return "border-rose-500 text-rose-600 dark:text-rose-400";
      case "info":
        return "border-blue-500 text-blue-600 dark:text-blue-400";
    }
  }

  switch (variant) {
    case "default":
      return "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300";
    case "primary":
      return "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300";
    case "success":
      return "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300";
    case "warning":
      return "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300";
    case "danger":
      return "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300";
    case "info":
      return "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300";
  }
};

/**
 * Get size classes.
 */
const getSizeClasses = (size: BadgeSize): string => {
  switch (size) {
    case "sm":
      return "px-1.5 py-0.5 text-xs";
    case "md":
      return "px-2 py-0.5 text-xs";
    case "lg":
      return "px-2.5 py-1 text-sm";
  }
};

/**
 * Get dot size classes.
 */
const getDotSizeClasses = (size: BadgeSize): string => {
  switch (size) {
    case "sm":
      return "w-1.5 h-1.5";
    case "md":
      return "w-2 h-2";
    case "lg":
      return "w-2.5 h-2.5";
  }
};

/**
 * Get dot color classes.
 */
const getDotColorClasses = (variant: BadgeVariant): string => {
  switch (variant) {
    case "default":
      return "bg-gray-500";
    case "primary":
      return "bg-emerald-500";
    case "success":
      return "bg-green-500";
    case "warning":
      return "bg-amber-500";
    case "danger":
      return "bg-rose-500";
    case "info":
      return "bg-blue-500";
  }
};

/**
 * Badge - Status indicator component.
 *
 * Small labels for categorization, status, or counts.
 *
 * Features:
 * - Multiple variants (default, primary, success, warning, danger, info)
 * - Multiple sizes (sm, md, lg)
 * - Outlined style option
 * - Pill (fully rounded) shape
 * - Dot indicator mode
 * - Optional icon
 * - Removable with close button
 * - Dark mode support
 *
 * Usage:
 *   // Basic badge
 *   <Badge>New</Badge>
 *
 *   // Status badges
 *   <Badge variant="success">Active</Badge>
 *   <Badge variant="danger">Offline</Badge>
 *
 *   // Outlined style
 *   <Badge variant="primary" outlined>Featured</Badge>
 *
 *   // With icon
 *   <Badge icon={<Icon />}>With Icon</Badge>
 *
 *   // Dot indicator
 *   <Badge variant="success" dot>Online</Badge>
 *
 *   // Removable
 *   <Badge removable onRemove={() => handleRemove()}>Tag</Badge>
 */
const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  outlined = false,
  pill = false,
  dot = false,
  icon,
  removable = false,
  onRemove,
  className = "",
  dataHook,
}) => {
  const classes = [
    "inline-flex items-center gap-1 font-medium",
    pill ? "rounded-full" : "rounded-md",
    outlined ? "border bg-transparent" : "",
    getVariantClasses(variant, outlined),
    getSizeClasses(size),
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} data-hook={dataHook}>
      {dot && (
        <span
          className={`${getDotSizeClasses(size)} ${getDotColorClasses(variant)} rounded-full`}
        />
      )}
      {icon && !dot && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="
            flex-shrink-0
            ml-0.5 -mr-0.5
            hover:bg-black/10 dark:hover:bg-white/10
            rounded
            transition-colors
          "
          aria-label="Remove"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Badge;

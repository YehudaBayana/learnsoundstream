import React from "react";
import { Link as RouterLink, type LinkProps as RouterLinkProps } from "react-router-dom";

/**
 * Link variant options.
 */
export type LinkVariant = "default" | "primary" | "muted" | "inherit";

/**
 * Link size options.
 */
export type LinkSize = "sm" | "md" | "lg";

interface LinkProps extends Omit<RouterLinkProps, "className"> {
  /** Link content */
  children: React.ReactNode;
  /** Link style variant */
  variant?: LinkVariant;
  /** Link size */
  size?: LinkSize;
  /** External link (uses <a> instead of React Router) */
  external?: boolean;
  /** Show underline */
  underline?: "always" | "hover" | "none";
  /** Icon to display before text */
  leftIcon?: React.ReactNode;
  /** Icon to display after text */
  rightIcon?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  dataHook?: string;
}

/**
 * Get variant classes.
 */
const getVariantClasses = (variant: LinkVariant): string => {
  switch (variant) {
    case "default":
      return "text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white";
    case "primary":
      return "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300";
    case "muted":
      return "text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300";
    case "inherit":
      return "text-inherit hover:opacity-80";
  }
};

/**
 * Get size classes.
 */
const getSizeClasses = (size: LinkSize): string => {
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
 * Get underline classes.
 */
const getUnderlineClasses = (underline: LinkProps["underline"]): string => {
  switch (underline) {
    case "always":
      return "underline underline-offset-2";
    case "hover":
      return "hover:underline underline-offset-2";
    case "none":
      return "no-underline";
    default:
      return "hover:underline underline-offset-2";
  }
};

/**
 * Link - Styled link component.
 *
 * A styled link component that integrates with React Router.
 *
 * Features:
 * - Multiple variants (default, primary, muted, inherit)
 * - Multiple sizes
 * - External link support
 * - Underline control
 * - Icon support
 * - React Router integration
 * - Dark mode support
 *
 * Usage:
 *   // Internal link
 *   <Link to="/library">Library</Link>
 *
 *   // Primary variant
 *   <Link to="/settings" variant="primary">Settings</Link>
 *
 *   // External link
 *   <Link to="https://example.com" external>External</Link>
 *
 *   // With icons
 *   <Link to="/back" leftIcon={<ArrowIcon />}>Back</Link>
 */
const Link: React.FC<LinkProps> = ({
  children,
  to,
  variant = "default",
  size = "md",
  external = false,
  underline = "hover",
  leftIcon,
  rightIcon,
  className = "",
  dataHook,
  ...props
}) => {
  const classes = [
    "inline-flex items-center gap-1",
    "transition-colors",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
    "dark:focus-visible:ring-offset-slate-900",
    getVariantClasses(variant),
    getSizeClasses(size),
    getUnderlineClasses(underline),
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </>
  );

  if (external) {
    return (
      <a
        href={to as string}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        data-hook={dataHook}
      >
        {content}
      </a>
    );
  }

  return (
    <RouterLink to={to} className={classes} data-hook={dataHook} {...props}>
      {content}
    </RouterLink>
  );
};

export default Link;

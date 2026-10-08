import React from "react";

/**
 * Divider orientation options.
 */
export type DividerOrientation = "horizontal" | "vertical";

/**
 * Divider variant options.
 */
export type DividerVariant = "solid" | "dashed" | "dotted";

interface DividerProps {
  /** Divider orientation */
  orientation?: DividerOrientation;
  /** Divider line style */
  variant?: DividerVariant;
  /** Text or content to display in the center */
  children?: React.ReactNode;
  /** Spacing around the divider */
  spacing?: 0 | 2 | 4 | 6 | 8;
  /** Custom color class */
  color?: string;
  /** Additional CSS classes */
  className?: string;
  dataHook?: string;
}

/**
 * Get variant classes.
 */
const getVariantClasses = (variant: DividerVariant): string => {
  switch (variant) {
    case "solid":
      return "border-solid";
    case "dashed":
      return "border-dashed";
    case "dotted":
      return "border-dotted";
  }
};

/**
 * Divider - Visual separator for content sections.
 *
 * Features:
 * - Horizontal and vertical orientations
 * - Solid, dashed, and dotted variants
 * - Optional centered text/content
 * - Configurable spacing
 * - Custom color support
 *
 * Usage:
 *   <Divider />
 *   <Divider orientation="vertical" />
 *   <Divider variant="dashed">OR</Divider>
 */
const Divider: React.FC<DividerProps> = ({
  orientation = "horizontal",
  variant = "solid",
  children,
  spacing = 4,
  color = "border-gray-200 dark:border-slate-700",
  className = "",
  dataHook,
}) => {
  const hasContent = Boolean(children);

  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        data-hook={dataHook}
        aria-orientation="vertical"
        className={`
          inline-block h-full min-h-[1em]
          border-l ${getVariantClasses(variant)} ${color}
          ${spacing > 0 ? `mx-${spacing}` : ""}
          ${className}
        `}
      />
    );
  }

  // Horizontal with content
  if (hasContent) {
    return (
      <div
        role="separator"
        data-hook={dataHook}
        className={`
          flex items-center
          ${spacing > 0 ? `my-${spacing}` : ""}
          ${className}
        `}
      >
        <div
          className={`flex-1 border-t ${getVariantClasses(variant)} ${color}`}
        />
        <span className="px-4 text-sm text-gray-500 dark:text-slate-400">
          {children}
        </span>
        <div
          className={`flex-1 border-t ${getVariantClasses(variant)} ${color}`}
        />
      </div>
    );
  }

  // Simple horizontal
  return (
    <hr
      role="separator"
      data-hook={dataHook}
      className={`
        border-0 border-t ${getVariantClasses(variant)} ${color}
        ${spacing > 0 ? `my-${spacing}` : ""}
        ${className}
      `}
    />
  );
};

export default Divider;

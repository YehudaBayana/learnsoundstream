import React from "react";

/**
 * Progress size options.
 */
export type ProgressSize = "xs" | "sm" | "md" | "lg";

/**
 * Progress variant options.
 */
export type ProgressVariant = "default" | "success" | "warning" | "danger";

interface ProgressProps {
  /** Current progress value (0-100) */
  value: number;
  /** Maximum value (default 100) */
  max?: number;
  /** Progress bar size */
  size?: ProgressSize;
  /** Progress bar variant/color */
  variant?: ProgressVariant;
  /** Show percentage label */
  showLabel?: boolean;
  /** Custom label format function */
  formatLabel?: (value: number, max: number) => string;
  /** Animate the progress bar */
  animated?: boolean;
  /** Additional CSS classes */
  className?: string;
  dataHook?: string;
}

/**
 * Get size classes.
 */
const getSizeClasses = (size: ProgressSize): string => {
  switch (size) {
    case "xs":
      return "h-1";
    case "sm":
      return "h-2";
    case "md":
      return "h-3";
    case "lg":
      return "h-4";
  }
};

/**
 * Get variant classes for the progress bar fill.
 */
const getVariantClasses = (variant: ProgressVariant): string => {
  switch (variant) {
    case "default":
      return "bg-gradient-to-r from-emerald-500 to-teal-500";
    case "success":
      return "bg-green-500";
    case "warning":
      return "bg-amber-500";
    case "danger":
      return "bg-rose-500";
  }
};

/**
 * Progress - Progress bar component.
 *
 * A customizable progress bar for showing completion status.
 *
 * Features:
 * - Multiple sizes (xs, sm, md, lg)
 * - Multiple variants (default, success, warning, danger)
 * - Optional percentage label
 * - Custom label formatting
 * - Smooth animation
 * - Dark mode support
 *
 * Usage:
 *   // Basic progress
 *   <Progress value={50} />
 *
 *   // With label
 *   <Progress value={75} showLabel />
 *
 *   // Custom variant and size
 *   <Progress value={90} variant="success" size="lg" />
 *
 *   // Custom label format
 *   <Progress
 *     value={5}
 *     max={10}
 *     showLabel
 *     formatLabel={(val, max) => `${val}/${max} completed`}
 *   />
 */
const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = "md",
  variant = "default",
  showLabel = false,
  formatLabel,
  animated = true,
  className = "",
  dataHook,
}) => {
  // Clamp value between 0 and max
  const clampedValue = Math.min(Math.max(0, value), max);
  const percentage = (clampedValue / max) * 100;

  const defaultFormat = (val: number, maxVal: number) => `${Math.round((val / maxVal) * 100)}%`;
  const label = formatLabel ? formatLabel(clampedValue, max) : defaultFormat(clampedValue, max);

  return (
    <div className={className} data-hook={dataHook}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600 dark:text-slate-400">Progress</span>
          <span
            className="text-sm font-medium text-gray-900 dark:text-white"
            data-hook={dataHook ? `${dataHook}-label` : undefined}
          >
            {label}
          </span>
        </div>
      )}
      <div
        role="progressbar"
        data-hook={dataHook ? `${dataHook}-bar` : undefined}
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`Progress: ${label}`}
        className={`
          w-full
          bg-gray-200 dark:bg-slate-700
          rounded-full
          overflow-hidden
          ${getSizeClasses(size)}
        `}
      >
        <div
          className={`
            h-full
            rounded-full
            ${getVariantClasses(variant)}
            ${animated ? "transition-all duration-300 ease-out" : ""}
          `}
          data-hook={dataHook ? `${dataHook}-fill` : undefined}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default Progress;

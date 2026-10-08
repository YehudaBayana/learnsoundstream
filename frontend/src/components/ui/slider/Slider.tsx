import React, { forwardRef } from "react";

/**
 * Slider size options.
 */
export type SliderSize = "sm" | "md" | "lg";

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /** Slider size */
  size?: SliderSize;
  /** Show current value indicator */
  showValue?: boolean;
  /** Format function for displayed value */
  formatValue?: (value: number) => string;
  /** Slider color theme */
  color?: "primary" | "secondary";
  /** Additional CSS classes */
  className?: string;
  dataHook?: string;
}

/**
 * Get size-specific Tailwind classes.
 */
const getSizeClasses = (size: SliderSize): string => {
  switch (size) {
    case "sm":
      return "h-1";
    case "md":
      return "h-2";
    case "lg":
      return "h-3";
  }
};

/**
 * Get thumb size classes.
 */
const getThumbSize = (size: SliderSize): string => {
  switch (size) {
    case "sm":
      return "12px";
    case "md":
      return "16px";
    case "lg":
      return "20px";
  }
};

/**
 * Get color-specific classes.
 */
const getColorClasses = (color: "primary" | "secondary"): { track: string; thumb: string } => {
  switch (color) {
    case "primary":
      return {
        track: "#10b981", // emerald-500
        thumb: "#059669", // emerald-600
      };
    case "secondary":
      return {
        track: "#14b8a6", // teal-500
        thumb: "#0d9488", // teal-600
      };
  }
};

/**
 * Slider - Range slider component for numeric input.
 *
 * Features:
 * - Multiple sizes (sm, md, lg)
 * - Color variants (primary, secondary)
 * - Optional value display
 * - Custom value formatting
 * - Smooth styling with custom thumb
 * - Disabled state handling
 * - Dark mode support
 * - Forwarded ref for form libraries
 *
 * Usage:
 *   <Slider min={0} max={100} value={50} onChange={handleChange} />
 *   <Slider showValue formatValue={(v) => `${v}%`} />
 *   <Slider size="lg" color="secondary" />
 */
const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      size = "md",
      showValue = false,
      formatValue = (v) => String(v),
      color = "primary",
      disabled,
      className = "",
      value,
      min = 0,
      max = 100,
      dataHook,
      ...props
    },
    ref,
  ) => {
    const colors = getColorClasses(color);
    const thumbSize = getThumbSize(size);
    const heightClass = getSizeClasses(size);
    const currentValue = typeof value === "number" ? value : Number(value) || 0;
    const percentage = ((currentValue - Number(min)) / (Number(max) - Number(min))) * 100;

    // Generate unique ID for the style
    const uniqueId = React.useId();

    // Custom styles for the range input
    const customStyles = `
      .slider-${uniqueId}::-webkit-slider-thumb {
        appearance: none;
        width: ${thumbSize};
        height: ${thumbSize};
        border-radius: 50%;
        background: ${colors.thumb};
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: transform 0.15s ease;
      }
      .slider-${uniqueId}::-webkit-slider-thumb:hover {
        transform: scale(1.1);
      }
      .slider-${uniqueId}::-moz-range-thumb {
        width: ${thumbSize};
        height: ${thumbSize};
        border-radius: 50%;
        background: ${colors.thumb};
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      .slider-${uniqueId}:disabled::-webkit-slider-thumb {
        cursor: not-allowed;
      }
    `;

    const sliderClasses = [
      `slider-${uniqueId}`,
      "w-full",
      heightClass,
      "rounded-full",
      "appearance-none",
      "cursor-pointer",
      "transition-opacity duration-200",
      disabled ? "opacity-50 cursor-not-allowed" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // Track background with filled portion
    const trackStyle: React.CSSProperties = {
      background: `linear-gradient(to right, ${colors.track} 0%, ${colors.track} ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
    };

    return (
      <div className="flex items-center gap-3" data-hook={dataHook}>
        <style>{customStyles}</style>
        <input
          ref={ref}
          type="range"
          data-hook={dataHook ? `${dataHook}-slider` : undefined}
          disabled={disabled}
          className={sliderClasses}
          style={trackStyle}
          value={value}
          min={min}
          max={max}
          {...props}
        />
        {showValue && (
          <span
            className="text-sm font-medium text-gray-700 dark:text-slate-300 min-w-[3ch] text-right"
            data-hook={dataHook ? `${dataHook}-value` : undefined}
          >
            {formatValue(currentValue)}
          </span>
        )}
      </div>
    );
  },
);

Slider.displayName = "Slider";

export default Slider;

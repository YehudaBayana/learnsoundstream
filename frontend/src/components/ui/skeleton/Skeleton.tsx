import React from 'react';

/**
 * Skeleton variant options.
 */
export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

interface SkeletonProps {
  /** Skeleton shape variant */
  variant?: SkeletonVariant;
  /** Width (CSS value or number for pixels) */
  width?: string | number;
  /** Height (CSS value or number for pixels) */
  height?: string | number;
  /** Number of lines for text variant */
  lines?: number;
  /** Enable animation */
  animate?: boolean;
  /** Additional CSS classes */
  className?: string;
  dataHook?: string;
}

/**
 * Get variant classes.
 */
const getVariantClasses = (variant: SkeletonVariant): string => {
  switch (variant) {
    case 'text':
      return 'rounded h-4';
    case 'circular':
      return 'rounded-full';
    case 'rectangular':
      return '';
    case 'rounded':
      return 'rounded-xl';
  }
};

/**
 * Convert dimension to CSS value.
 */
const toCssValue = (value: string | number | undefined): string | undefined => {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
};

/**
 * Skeleton - Placeholder loading component.
 *
 * A customizable skeleton for building loading states.
 *
 * Features:
 * - Multiple variants (text, circular, rectangular, rounded)
 * - Custom dimensions
 * - Multi-line text skeletons
 * - Pulse animation
 * - Dark mode support
 *
 * Usage:
 *   // Text skeleton
 *   <Skeleton variant="text" width="200px" />
 *
 *   // Circular avatar skeleton
 *   <Skeleton variant="circular" width={48} height={48} />
 *
 *   // Multi-line text
 *   <Skeleton variant="text" lines={3} />
 *
 *   // Card image skeleton
 *   <Skeleton variant="rounded" width="100%" height={200} />
 *
 *   // Without animation
 *   <Skeleton variant="rectangular" animate={false} />
 */
const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  animate = true,
  className = '',
  dataHook,
}) => {
  const baseClasses = `
    bg-gray-200 dark:bg-slate-700
    ${animate ? 'animate-pulse' : ''}
    ${getVariantClasses(variant)}
    ${className}
  `;

  const style: React.CSSProperties = {
    width: toCssValue(width),
    height: toCssValue(height),
  };

  // For text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2" data-hook={dataHook}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            data-hook={dataHook ? `${dataHook}-line-${index}` : undefined}
            className={baseClasses}
            style={{
              ...style,
              // Last line is shorter for natural text appearance
              width: index === lines - 1 ? '75%' : style.width,
            }}
          />
        ))}
      </div>
    );
  }

  // For circular variant, ensure equal width/height
  if (variant === 'circular') {
    const size = width || height || 40;
    return (
      <div
        data-hook={dataHook}
        className={baseClasses}
        style={{
          width: toCssValue(size),
          height: toCssValue(size),
        }}
      />
    );
  }

  return <div className={baseClasses} style={style} data-hook={dataHook} />;
};

export default Skeleton;

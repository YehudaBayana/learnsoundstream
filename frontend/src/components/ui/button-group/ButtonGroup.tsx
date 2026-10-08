import React from 'react';

/**
 * ButtonGroup orientation options.
 */
export type ButtonGroupOrientation = 'horizontal' | 'vertical';

/**
 * ButtonGroup size options (applied to all children).
 */
export type ButtonGroupSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonGroupProps {
  /** Button elements to group together */
  children: React.ReactNode;
  /** Group orientation */
  orientation?: ButtonGroupOrientation;
  /** Whether buttons are attached (no gap between them) */
  attached?: boolean;
  /** Gap size when not attached (uses Tailwind gap classes) */
  gap?: 0 | 1 | 2 | 3 | 4;
  /** Full width container */
  fullWidth?: boolean;
  /** Additional CSS classes */
  className?: string;
  dataHook?: string;
}

/**
 * Get gap classes based on gap size.
 */
const getGapClasses = (gap: number): string => {
  if (gap === 0) return '';
  return `gap-${gap}`;
};

/**
 * Get attached button classes.
 * When buttons are attached, we remove border-radius from inner edges.
 */
const getAttachedClasses = (orientation: ButtonGroupOrientation): string => {
  if (orientation === 'horizontal') {
    return `
      [&>*:not(:first-child):not(:last-child)]:rounded-none
      [&>*:first-child]:rounded-r-none
      [&>*:last-child]:rounded-l-none
      [&>*:not(:first-child)]:-ml-px
    `;
  } else {
    return `
      [&>*:not(:first-child):not(:last-child)]:rounded-none
      [&>*:first-child]:rounded-b-none
      [&>*:last-child]:rounded-t-none
      [&>*:not(:first-child)]:-mt-px
    `;
  }
};

/**
 * ButtonGroup - Container for grouping related buttons.
 *
 * Use this component to visually group related action buttons together.
 * Supports both horizontal and vertical orientations, and can render
 * buttons either attached (touching) or with gaps between them.
 *
 * Features:
 * - Horizontal and vertical orientations
 * - Attached mode (buttons touch with shared borders)
 * - Configurable gap between buttons
 * - Proper border-radius handling for attached mode
 * - Full width support
 *
 * Usage:
 *   <ButtonGroup>
 *     <Button>One</Button>
 *     <Button>Two</Button>
 *     <Button>Three</Button>
 *   </ButtonGroup>
 *
 *   <ButtonGroup attached>
 *     <Button variant="outline">Left</Button>
 *     <Button variant="outline">Center</Button>
 *     <Button variant="outline">Right</Button>
 *   </ButtonGroup>
 *
 *   <ButtonGroup orientation="vertical" gap={2}>
 *     <Button>Top</Button>
 *     <Button>Bottom</Button>
 *   </ButtonGroup>
 */
const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  attached = false,
  gap = 2,
  fullWidth = false,
  className = '',
  dataHook,
}) => {
  const baseClasses = [
    fullWidth ? 'flex' : 'inline-flex',
    orientation === 'horizontal' ? 'flex-row' : 'flex-col',
    attached ? getAttachedClasses(orientation) : getGapClasses(gap),
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={baseClasses} role="group" data-hook={dataHook}>
      {children}
    </div>
  );
};

export default ButtonGroup;

import React from 'react';

/**
 * Stack direction options.
 */
export type StackDirection = 'horizontal' | 'vertical';

/**
 * Stack alignment options.
 */
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

/**
 * Stack justify options.
 */
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

/**
 * Stack gap options.
 */
export type StackGap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;

interface StackProps {
  /** Stack content */
  children: React.ReactNode;
  /** Stack direction */
  direction?: StackDirection;
  /** Gap between items */
  gap?: StackGap;
  /** Cross-axis alignment */
  align?: StackAlign;
  /** Main-axis alignment */
  justify?: StackJustify;
  /** Allow items to wrap */
  wrap?: boolean;
  /** HTML element to render */
  as?: 'div' | 'section' | 'nav' | 'ul' | 'ol';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get alignment classes.
 */
const getAlignClasses = (align: StackAlign): string => {
  switch (align) {
    case 'start':
      return 'items-start';
    case 'center':
      return 'items-center';
    case 'end':
      return 'items-end';
    case 'stretch':
      return 'items-stretch';
    case 'baseline':
      return 'items-baseline';
  }
};

/**
 * Get justify classes.
 */
const getJustifyClasses = (justify: StackJustify): string => {
  switch (justify) {
    case 'start':
      return 'justify-start';
    case 'center':
      return 'justify-center';
    case 'end':
      return 'justify-end';
    case 'between':
      return 'justify-between';
    case 'around':
      return 'justify-around';
    case 'evenly':
      return 'justify-evenly';
  }
};

/**
 * Stack - Flexbox layout component for stacking items.
 */
const Stack: React.FC<StackProps> = ({
  children,
  direction = 'vertical',
  gap = 4,
  align = 'stretch',
  justify = 'start',
  wrap = false,
  as: Element = 'div',
  className = '',
}) => {
  const classes = [
    'flex',
    direction === 'horizontal' ? 'flex-row' : 'flex-col',
    `gap-${gap}`,
    getAlignClasses(align),
    getJustifyClasses(justify),
    wrap ? 'flex-wrap' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <Element className={classes}>{children}</Element>;
};

export default Stack;
import React from 'react';

/**
 * Heading levels corresponding to h1-h6 HTML elements.
 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Heading size variants.
 * Can be different from the semantic level.
 * For example: <Heading level={1} size="2xl"> renders an h1 with 2xl styling.
 */
export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

/**
 * Available heading colors.
 */
export type HeadingColor =
  | 'default' // Gray-900 in light, white in dark
  | 'muted' // Gray-600/slate-300
  | 'primary' // Brand green
  | 'secondary' // Teal
  | 'inherit'; // Inherit from parent

/**
 * Font weight options for headings.
 */
export type HeadingWeight = 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';

/**
 * Text alignment options.
 */
export type HeadingAlign = 'left' | 'center' | 'right';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading content */
  children: React.ReactNode;
  /** Semantic heading level (h1-h6) - determines HTML element */
  level?: HeadingLevel;
  /** Visual size - defaults to matching the level */
  size?: HeadingSize;
  /** Heading color */
  color?: HeadingColor;
  /** Font weight - defaults based on size */
  weight?: HeadingWeight;
  /** Text alignment */
  align?: HeadingAlign;
  /** Truncate text with ellipsis */
  truncate?: boolean;
}

/**
 * Get default size based on heading level.
 */
const getDefaultSize = (level: HeadingLevel): HeadingSize => {
  switch (level) {
    case 1:
      return '4xl';
    case 2:
      return '3xl';
    case 3:
      return '2xl';
    case 4:
      return 'xl';
    case 5:
      return 'lg';
    case 6:
      return 'md';
  }
};

/**
 * Get Tailwind classes for heading size.
 */
const getSizeClasses = (size: HeadingSize): string => {
  switch (size) {
    case '5xl':
      return 'text-5xl leading-tight tracking-tight';
    case '4xl':
      return 'text-4xl leading-tight tracking-tight';
    case '3xl':
      return 'text-3xl leading-snug';
    case '2xl':
      return 'text-2xl leading-snug';
    case 'xl':
      return 'text-xl leading-normal';
    case 'lg':
      return 'text-lg leading-normal';
    case 'md':
      return 'text-base leading-normal';
    case 'sm':
      return 'text-sm leading-normal';
    case 'xs':
      return 'text-xs leading-normal uppercase tracking-wide';
  }
};

/**
 * Get default weight based on size.
 */
const getDefaultWeight = (size: HeadingSize): HeadingWeight => {
  switch (size) {
    case '5xl':
    case '4xl':
      return 'extrabold';
    case '3xl':
    case '2xl':
    case 'xl':
      return 'bold';
    case 'lg':
    case 'md':
      return 'semibold';
    case 'sm':
    case 'xs':
      return 'medium';
  }
};

/**
 * Get Tailwind classes for heading color.
 */
const getColorClasses = (color: HeadingColor): string => {
  switch (color) {
    case 'default':
      return 'text-gray-900 dark:text-white';
    case 'muted':
      return 'text-gray-600 dark:text-slate-300';
    case 'primary':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'secondary':
      return 'text-teal-600 dark:text-teal-400';
    case 'inherit':
      return '';
  }
};

/**
 * Get Tailwind classes for font weight.
 */
const getWeightClasses = (weight: HeadingWeight): string => {
  switch (weight) {
    case 'normal':
      return 'font-normal';
    case 'medium':
      return 'font-medium';
    case 'semibold':
      return 'font-semibold';
    case 'bold':
      return 'font-bold';
    case 'extrabold':
      return 'font-extrabold';
  }
};

/**
 * Get Tailwind classes for text alignment.
 */
const getAlignClasses = (align?: HeadingAlign): string => {
  if (!align) return '';

  switch (align) {
    case 'left':
      return 'text-left';
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
  }
};

/**
 * Heading - Semantic heading component for h1-h6 elements.
 *
 * Separates semantic level from visual size, allowing for
 * accessible heading hierarchy with flexible styling.
 *
 * Usage:
 *   <Heading level={1}>Page Title</Heading>
 *   <Heading level={2} size="xl">Section Title</Heading>
 *   <Heading level={3} color="primary">Subsection</Heading>
 *   <Heading level={1} size="xs">Small Overline</Heading>
 */
const Heading: React.FC<HeadingProps> = ({
  children,
  level = 2,
  size,
  color = 'default',
  weight,
  align,
  truncate = false,
  className = '',
  id,
  ...props
}) => {
  const Element = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const actualSize = size || getDefaultSize(level);
  const actualWeight = weight || getDefaultWeight(actualSize);

  const classes = [
    getSizeClasses(actualSize),
    getColorClasses(color),
    getWeightClasses(actualWeight),
    getAlignClasses(align),
    truncate ? 'truncate' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return React.createElement(Element, { className: classes, id, ...props }, children);
};

export default Heading;

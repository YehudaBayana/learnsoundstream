import React from 'react';

/**
 * Text variant types defining different typographic styles.
 */
export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'body-sm' | 'small' | 'caption' | 'label' | 'lead';

/**
 * Available text colors.
 */
export type TextColor =
  | 'default' // Gray-900 in light, white in dark
  | 'muted' // Gray-500/slate-400
  | 'primary' // Brand green
  | 'secondary' // Teal
  | 'danger' // Red
  | 'warning' // Amber
  | 'success' // Green
  | 'info' // Blue
  | 'inherit'; // Inherit from parent

/**
 * Font weight options.
 */
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';

/**
 * Text alignment options.
 */
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * Allowed HTML elements for Text component.
 */
type TextElement = 'p' | 'span' | 'div' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /** Text content */
  children: React.ReactNode;
  /** Text variant/style - determines size and line height */
  variant?: TextVariant;
  /** Text color */
  color?: TextColor;
  /** Font weight override */
  weight?: TextWeight;
  /** Text alignment */
  align?: TextAlign;
  /** Truncate text with ellipsis */
  truncate?: boolean;
  /** HTML element to render */
  as?: TextElement;
  /** Additional CSS classes */
  className?: string;
  /** htmlFor attribute for label elements */
  htmlFor?: string;
}

/**
 * Get Tailwind classes for text variant.
 */
const getVariantClasses = (variant: TextVariant): string => {
  switch (variant) {
    case 'h1':
      return 'text-4xl font-bold leading-tight';
    case 'h2':
      return 'text-3xl font-bold leading-tight';
    case 'h3':
      return 'text-2xl font-bold leading-tight';
    case 'h4':
      return 'text-xl font-bold leading-tight';
    case 'lead':
      return 'text-lg leading-relaxed';
    case 'body':
      return 'text-base leading-normal';
    case 'body-sm':
      return 'text-sm leading-normal';
    case 'small':
      return 'text-xs leading-normal';
    case 'caption':
      return 'text-xs leading-normal';
    case 'label':
      return 'text-sm leading-normal font-medium';
  }
};

/**
 * Get Tailwind classes for text color.
 */
const getColorClasses = (color: TextColor, variant: TextVariant): string => {
  // Caption variant defaults to muted color
  if (variant === 'caption' && color === 'default') {
    return 'text-gray-500 dark:text-slate-400';
  }

  switch (color) {
    case 'default':
      return 'text-gray-900 dark:text-white';
    case 'muted':
      return 'text-gray-500 dark:text-slate-400';
    case 'primary':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'secondary':
      return 'text-teal-600 dark:text-teal-400';
    case 'danger':
      return 'text-rose-600 dark:text-rose-400';
    case 'warning':
      return 'text-amber-600 dark:text-amber-400';
    case 'success':
      return 'text-green-600 dark:text-green-400';
    case 'info':
      return 'text-blue-600 dark:text-blue-400';
    case 'inherit':
      return '';
  }
};

/**
 * Get Tailwind classes for font weight.
 */
const getWeightClasses = (weight?: TextWeight): string => {
  if (!weight) return '';

  switch (weight) {
    case 'normal':
      return 'font-normal';
    case 'medium':
      return 'font-medium';
    case 'semibold':
      return 'font-semibold';
    case 'bold':
      return 'font-bold';
  }
};

/**
 * Get Tailwind classes for text alignment.
 */
const getAlignClasses = (align?: TextAlign): string => {
  if (!align) return '';

  switch (align) {
    case 'left':
      return 'text-left';
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    case 'justify':
      return 'text-justify';
  }
};

/**
 * Get default element based on variant.
 */
const getDefaultElement = (variant: TextVariant): TextElement => {
  switch (variant) {
    case 'h1':
      return 'h1';
    case 'h2':
      return 'h2';
    case 'h3':
      return 'h3';
    case 'h4':
      return 'h4';
    case 'body':
    case 'body-sm':
    case 'lead':
      return 'p';
    case 'label':
      return 'label';
    default:
      return 'span';
  }
};

/**
 * Text - Base typography component for body text, captions, and labels.
 *
 * Use this component for all non-heading text content.
 *
 * Usage:
 *   <Text>Default body text</Text>
 *   <Text variant="caption" color="muted">Photo credit</Text>
 *   <Text variant="label" htmlFor="email">Email address</Text>
 *   <Text truncate>Very long text that will be truncated...</Text>
 */
const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color = 'default',
  weight,
  align,
  truncate = false,
  as,
  className = '',
  htmlFor,
  ...props
}) => {
  const classes = [
    getVariantClasses(variant),
    getColorClasses(color, variant),
    getWeightClasses(weight),
    getAlignClasses(align),
    truncate ? 'truncate' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const element = as || getDefaultElement(variant);
  const elementProps: Record<string, unknown> = { 
    ...props,
    className: classes 
  };
  
  if (element === 'label') {
    elementProps.htmlFor = htmlFor;
  }

  return React.createElement(element, elementProps, children);
};

export default Text;

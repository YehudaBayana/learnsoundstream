import React, { forwardRef } from 'react';

/**
 * Allowed HTML elements for Box component.
 */
type BoxElement = 'div' | 'span' | 'section' | 'article' | 'aside' | 'main' | 'header' | 'footer' | 'nav';

interface BoxProps extends React.HTMLAttributes<HTMLElement> {
  /** Box content */
  children?: React.ReactNode;
  /** HTML element to render */
  as?: BoxElement;
  /** Padding (all sides) */
  p?: number;
  /** Horizontal padding */
  px?: number;
  /** Vertical padding */
  py?: number;
  /** Padding top */
  pt?: number;
  /** Padding right */
  pr?: number;
  /** Padding bottom */
  pb?: number;
  /** Padding left */
  pl?: number;
  /** Margin (all sides) */
  m?: number;
  /** Horizontal margin */
  mx?: number;
  /** Vertical margin */
  my?: number;
  /** Margin top */
  mt?: number;
  /** Margin right */
  mr?: number;
  /** Margin bottom */
  mb?: number;
  /** Margin left */
  ml?: number;
  /** Border radius */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Background color class */
  bg?: string;
  /** Width */
  w?: 'full' | 'auto' | 'screen' | 'fit';
  /** Height */
  h?: 'full' | 'auto' | 'screen' | 'fit';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Build spacing classes from props.
 */
const buildSpacingClasses = (props: BoxProps): string => {
  const classes: string[] = [];

  // Padding
  if (props.p !== undefined) classes.push(`p-${props.p}`);
  if (props.px !== undefined) classes.push(`px-${props.px}`);
  if (props.py !== undefined) classes.push(`py-${props.py}`);
  if (props.pt !== undefined) classes.push(`pt-${props.pt}`);
  if (props.pr !== undefined) classes.push(`pr-${props.pr}`);
  if (props.pb !== undefined) classes.push(`pb-${props.pb}`);
  if (props.pl !== undefined) classes.push(`pl-${props.pl}`);

  // Margin
  if (props.m !== undefined) classes.push(`m-${props.m}`);
  if (props.mx !== undefined) classes.push(`mx-${props.mx}`);
  if (props.my !== undefined) classes.push(`my-${props.my}`);
  if (props.mt !== undefined) classes.push(`mt-${props.mt}`);
  if (props.mr !== undefined) classes.push(`mr-${props.mr}`);
  if (props.mb !== undefined) classes.push(`mb-${props.mb}`);
  if (props.ml !== undefined) classes.push(`ml-${props.ml}`);

  return classes.join(' ');
};

/**
 * Get rounded classes.
 */
const getRoundedClasses = (rounded?: BoxProps['rounded']): string => {
  if (!rounded) return '';
  if (rounded === 'none') return 'rounded-none';
  return `rounded-${rounded}`;
};

/**
 * Get dimension classes.
 */
const getDimensionClasses = (w?: BoxProps['w'], h?: BoxProps['h']): string => {
  const classes: string[] = [];

  if (w === 'full') classes.push('w-full');
  else if (w === 'auto') classes.push('w-auto');
  else if (w === 'screen') classes.push('w-screen');
  else if (w === 'fit') classes.push('w-fit');

  if (h === 'full') classes.push('h-full');
  else if (h === 'auto') classes.push('h-auto');
  else if (h === 'screen') classes.push('h-screen');
  else if (h === 'fit') classes.push('h-fit');

  return classes.join(' ');
};

/**
 * Box - Generic container component with common layout props.
 */
const Box = forwardRef<HTMLElement, BoxProps>(
  (
    {
      children,
      as: Element = 'div',
      p,
      px,
      py,
      pt,
      pr,
      pb,
      pl,
      m,
      mx,
      my,
      mt,
      mr,
      mb,
      ml,
      rounded,
      bg,
      w,
      h,
      className = '',
      ...props
    },
    ref
  ) => {
    const spacingClasses = buildSpacingClasses({
      p, px, py, pt, pr, pb, pl,
      m, mx, my, mt, mr, mb, ml,
      children: null,
    });

    const classes = [
      spacingClasses,
      getRoundedClasses(rounded),
      getDimensionClasses(w, h),
      bg || '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return React.createElement(
      Element,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { ...props, className: classes, ref } as any,
      children
    );
  }
);

Box.displayName = 'Box';

export default Box;
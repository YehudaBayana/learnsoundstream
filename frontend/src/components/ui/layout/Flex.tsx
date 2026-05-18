import React from 'react';

/**
 * Flex direction options.
 */
export type FlexDirection = 'row' | 'row-reverse' | 'col' | 'col-reverse';

/**
 * Flex alignment options.
 */
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

/**
 * Flex justify options.
 */
export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

/**
 * Flex wrap options.
 */
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

/**
 * Allowed HTML elements for Flex component.
 */
type FlexElement = 'div' | 'span' | 'section' | 'article' | 'aside' | 'main' | 'header' | 'footer' | 'nav' | 'ul' | 'ol' | 'li';

interface FlexProps {
  /** Flex content */
  children: React.ReactNode;
  /** Flex direction */
  direction?: FlexDirection;
  /** Cross-axis alignment */
  align?: FlexAlign;
  /** Main-axis alignment */
  justify?: FlexJustify;
  /** Wrap behavior */
  wrap?: FlexWrap;
  /** Gap between items */
  gap?: number;
  /** Flex grow */
  grow?: boolean;
  /** Flex shrink */
  shrink?: boolean;
  /** Inline flex */
  inline?: boolean;
  /** HTML element to render */
  as?: FlexElement;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get direction classes.
 */
const getDirectionClasses = (direction: FlexDirection): string => {
  switch (direction) {
    case 'row':
      return 'flex-row';
    case 'row-reverse':
      return 'flex-row-reverse';
    case 'col':
      return 'flex-col';
    case 'col-reverse':
      return 'flex-col-reverse';
  }
};

/**
 * Get alignment classes.
 */
const getAlignClasses = (align: FlexAlign): string => {
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
const getJustifyClasses = (justify: FlexJustify): string => {
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
 * Get wrap classes.
 */
const getWrapClasses = (wrap: FlexWrap): string => {
  switch (wrap) {
    case 'nowrap':
      return 'flex-nowrap';
    case 'wrap':
      return 'flex-wrap';
    case 'wrap-reverse':
      return 'flex-wrap-reverse';
  }
};

/**
 * Flex - Low-level flexbox layout component.
 */
const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'row',
  align = 'stretch',
  justify = 'start',
  wrap = 'nowrap',
  gap,
  grow,
  shrink,
  inline = false,
  as = 'div',
  className = '',
}) => {
  const Element = as;

  const classes = [
    inline ? 'inline-flex' : 'flex',
    getDirectionClasses(direction),
    getAlignClasses(align),
    getJustifyClasses(justify),
    getWrapClasses(wrap),
    gap !== undefined ? `gap-${gap}` : '',
    grow ? 'flex-grow' : '',
    shrink === false ? 'flex-shrink-0' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <Element className={classes}>{children}</Element>;
};

export default Flex;
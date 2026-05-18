import React from 'react';

/**
 * Grid column options.
 */
export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'none';

/**
 * Grid gap options.
 */
export type GridGap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;

interface GridProps {
  /** Grid content */
  children: React.ReactNode;
  /** Number of columns (desktop) */
  cols?: GridCols;
  /** Number of columns (mobile) */
  colsMobile?: GridCols;
  /** Number of columns (tablet) */
  colsTablet?: GridCols;
  /** Gap between items */
  gap?: GridGap;
  /** Row gap (overrides gap for rows) */
  rowGap?: GridGap;
  /** Column gap (overrides gap for columns) */
  colGap?: GridGap;
  /** HTML element to render */
  as?: 'div' | 'section' | 'ul';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get column classes.
 */
const getColsClasses = (
  cols: GridCols,
  colsMobile?: GridCols,
  colsTablet?: GridCols
): string => {
  const classes: string[] = [];

  // Mobile first
  if (colsMobile !== undefined) {
    classes.push(colsMobile === 'none' ? 'grid-cols-none' : `grid-cols-${colsMobile}`);
  } else {
    classes.push(cols === 'none' ? 'grid-cols-none' : `grid-cols-${cols}`);
  }

  // Tablet
  if (colsTablet !== undefined) {
    classes.push(colsTablet === 'none' ? 'md:grid-cols-none' : `md:grid-cols-${colsTablet}`);
  }

  // Desktop (lg and up)
  if (colsMobile !== undefined || colsTablet !== undefined) {
    classes.push(cols === 'none' ? 'lg:grid-cols-none' : `lg:grid-cols-${cols}`);
  }

  return classes.join(' ');
};

/**
 * Grid - CSS Grid layout component.
 *
 * Features:
 * - Responsive column counts
 * - Configurable gaps
 * - Separate row and column gaps
 * - Semantic element support
 *
 * Usage:
 *   <Grid cols={3} gap={4}>
 *     <Card>1</Card>
 *     <Card>2</Card>
 *     <Card>3</Card>
 *   </Grid>
 *
 *   <Grid cols={4} colsMobile={1} colsTablet={2} gap={6}>
 *     {items.map(item => <Card key={item.id} />)}
 *   </Grid>
 */
const Grid: React.FC<GridProps> = ({
  children,
  cols = 1,
  colsMobile,
  colsTablet,
  gap = 4,
  rowGap,
  colGap,
  as: Element = 'div',
  className = '',
}) => {
  const hasCustomGaps = rowGap !== undefined || colGap !== undefined;

  const classes = [
    'grid',
    getColsClasses(cols, colsMobile, colsTablet),
    hasCustomGaps ? '' : `gap-${gap}`,
    rowGap !== undefined ? `gap-y-${rowGap}` : '',
    colGap !== undefined ? `gap-x-${colGap}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <Element className={classes}>{children}</Element>;
};

export default Grid;

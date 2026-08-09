import React from 'react';

export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'none';
export type GridGap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;

interface GridProps {
  children: React.ReactNode;
  cols?: GridCols;
  colsMobile?: GridCols;
  colsTablet?: GridCols;
  gap?: GridGap;
  rowGap?: GridGap;
  colGap?: GridGap;
  as?: 'div' | 'section' | 'ul';
  className?: string;
}

// Maps for full un-interpolated class names so Tailwind scanner can detect them
const mobileColsMap: Record<GridCols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
  none: 'grid-cols-none',
};

const tabletColsMap: Record<GridCols, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
  12: 'md:grid-cols-12',
  none: 'md:grid-cols-none',
};

const desktopColsMap: Record<GridCols, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
  12: 'lg:grid-cols-12',
  none: 'lg:grid-cols-none',
};

const gapMap: Record<GridGap, string> = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12',
};

const rowGapMap: Record<GridGap, string> = {
  0: 'gap-y-0',
  1: 'gap-y-1',
  2: 'gap-y-2',
  3: 'gap-y-3',
  4: 'gap-y-4',
  5: 'gap-y-5',
  6: 'gap-y-6',
  8: 'gap-y-8',
  10: 'gap-y-10',
  12: 'gap-y-12',
};

const colGapMap: Record<GridGap, string> = {
  0: 'gap-x-0',
  1: 'gap-x-1',
  2: 'gap-x-2',
  3: 'gap-x-3',
  4: 'gap-x-4',
  5: 'gap-x-5',
  6: 'gap-x-6',
  8: 'gap-x-8',
  10: 'gap-x-10',
  12: 'gap-x-12',
};

const getColsClasses = (
  cols: GridCols,
  colsMobile?: GridCols,
  colsTablet?: GridCols
): string => {
  const classes: string[] = [];

  // Mobile first
  const mobileValue = colsMobile !== undefined ? colsMobile : cols;
  classes.push(mobileColsMap[mobileValue]);

  // Tablet
  if (colsTablet !== undefined) {
    classes.push(tabletColsMap[colsTablet]);
  }

  // Desktop (lg and up)
  if (colsMobile !== undefined || colsTablet !== undefined) {
    classes.push(desktopColsMap[cols]);
  }

  return classes.join(' ');
};

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
    hasCustomGaps ? '' : gapMap[gap],
    rowGap !== undefined ? rowGapMap[rowGap] : '',
    colGap !== undefined ? colGapMap[colGap] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <Element className={classes}>{children}</Element>;
};

export default Grid;
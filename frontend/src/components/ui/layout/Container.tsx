import React from 'react';

/**
 * Container max-width options.
 */
export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

interface ContainerProps {
  /** Container content */
  children: React.ReactNode;
  /** Max-width size */
  size?: ContainerSize;
  /** Horizontal padding */
  padding?: boolean;
  /** Center the container */
  centered?: boolean;
  /** HTML element to render */
  as?: 'div' | 'section' | 'article' | 'main';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get max-width classes based on size.
 */
const getSizeClasses = (size: ContainerSize): string => {
  switch (size) {
    case 'sm':
      return 'max-w-screen-sm'; // 640px
    case 'md':
      return 'max-w-screen-md'; // 768px
    case 'lg':
      return 'max-w-screen-lg'; // 1024px
    case 'xl':
      return 'max-w-screen-xl'; // 1280px
    case '2xl':
      return 'max-w-screen-2xl'; // 1536px
    case 'full':
      return 'max-w-full';
  }
};

/**
 * Container - Max-width container component for page layouts.
 *
 * Features:
 * - Multiple max-width sizes
 * - Optional horizontal padding
 * - Auto-centering
 * - Semantic element support
 *
 * Usage:
 *   <Container>Page content</Container>
 *   <Container size="md" as="main">Main content</Container>
 *   <Container size="lg" padding={false}>Full-bleed content</Container>
 */
const Container: React.FC<ContainerProps> = ({
  children,
  size = 'xl',
  padding = true,
  centered = true,
  as: Element = 'div',
  className = '',
}) => {
  const classes = [
    'w-full',
    getSizeClasses(size),
    centered ? 'mx-auto' : '',
    padding ? 'px-4 sm:px-6 lg:px-8' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <Element className={classes}>{children}</Element>;
};

export default Container;

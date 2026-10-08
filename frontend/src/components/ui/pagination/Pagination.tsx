import React from 'react';

/**
 * Pagination size options.
 */
export type PaginationSize = 'sm' | 'md' | 'lg';

interface PaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Called when page changes */
  onPageChange: (page: number) => void;
  /** Number of pages to show around current page */
  siblingCount?: number;
  /** Show first/last page buttons */
  showBoundaryPages?: boolean;
  /** Pagination size */
  size?: PaginationSize;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  dataHook?: string;
}

/**
 * Generate page numbers to display.
 */
const getPageNumbers = (
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | 'ellipsis')[] => {
  const totalNumbers = siblingCount * 2 + 3; // siblings + current + 2 boundary
  const totalBlocks = totalNumbers + 2; // + 2 for ellipsis

  if (totalPages <= totalBlocks) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = Array.from({ length: 3 + siblingCount * 2 }, (_, i) => i + 1);
    return [...leftRange, 'ellipsis', totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = Array.from(
      { length: 3 + siblingCount * 2 },
      (_, i) => totalPages - (3 + siblingCount * 2) + i + 1
    );
    return [1, 'ellipsis', ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  );
  return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages];
};

/**
 * Get size classes.
 */
const getSizeClasses = (size: PaginationSize): string => {
  switch (size) {
    case 'sm':
      return 'h-8 min-w-8 text-sm';
    case 'md':
      return 'h-10 min-w-10 text-sm';
    case 'lg':
      return 'h-12 min-w-12 text-base';
  }
};

/**
 * Pagination - Page navigation component.
 *
 * Navigate through paginated content.
 *
 * Features:
 * - Configurable sibling count
 * - Ellipsis for large page counts
 * - First/last page buttons
 * - Multiple sizes
 * - Keyboard accessible
 * - Dark mode support
 *
 * Usage:
 *   <Pagination
 *     currentPage={1}
 *     totalPages={10}
 *     onPageChange={setPage}
 *   />
 *
 *   // With more siblings
 *   <Pagination
 *     currentPage={5}
 *     totalPages={20}
 *     onPageChange={setPage}
 *     siblingCount={2}
 *   />
 */
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showBoundaryPages = true,
  size = 'md',
  disabled = false,
  className = '',
  dataHook,
}) => {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages, siblingCount);
  const sizeClasses = getSizeClasses(size);

  const buttonClasses = `
    inline-flex items-center justify-center
    ${sizeClasses}
    px-3
    rounded-lg
    font-medium
    transition-colors
    focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
  `;

  const activeClasses = 'bg-emerald-500 text-white';
  const inactiveClasses = 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800';
  const disabledClasses = 'opacity-50 cursor-not-allowed';

  const handlePageChange = (page: number) => {
    if (!disabled && page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <nav
      aria-label="Pagination"
      data-hook={dataHook}
      className={`flex items-center gap-1 ${className}`}
    >
      {/* Previous button */}
      {showBoundaryPages && (
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className={`
            ${buttonClasses}
            ${currentPage === 1 || disabled ? disabledClasses : inactiveClasses}
          `}
          aria-label="Previous page"
          data-hook={dataHook ? `${dataHook}-previous` : undefined}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}

      {/* Page numbers */}
      {pages.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className={`${sizeClasses} px-2 text-gray-400 dark:text-slate-500`}
            >
              ...
            </span>
          );
        }

        const isActive = page === currentPage;

        return (
          <button
            key={page}
            type="button"
            onClick={() => handlePageChange(page)}
            disabled={disabled}
            className={`
              ${buttonClasses}
              ${isActive ? activeClasses : inactiveClasses}
              ${disabled ? disabledClasses : ''}
            `}
            aria-current={isActive ? 'page' : undefined}
            aria-label={`Page ${page}`}
            data-hook={dataHook ? `${dataHook}-page-${page}` : undefined}
          >
            {page}
          </button>
        );
      })}

      {/* Next button */}
      {showBoundaryPages && (
        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          className={`
            ${buttonClasses}
            ${currentPage === totalPages || disabled ? disabledClasses : inactiveClasses}
          `}
          aria-label="Next page"
          data-hook={dataHook ? `${dataHook}-next` : undefined}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </nav>
  );
};

export default Pagination;

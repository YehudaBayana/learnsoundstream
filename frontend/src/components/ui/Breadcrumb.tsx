import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Breadcrumb item data.
 */
export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Link URL (optional, last item typically has no link) */
  href?: string;
  /** Icon to display before label */
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[];
  /** Custom separator (default is chevron) */
  separator?: React.ReactNode;
  /** Show home icon for first item */
  showHome?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Default chevron separator.
 */
const ChevronSeparator = () => (
  <svg
    className="w-4 h-4 text-gray-400 dark:text-slate-500"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Home icon.
 */
const HomeIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

/**
 * Breadcrumb - Navigation breadcrumb component.
 *
 * Shows the current location in a site's navigational hierarchy.
 *
 * Features:
 * - Custom separator support
 * - Icon support per item
 * - Home icon option
 * - React Router integration
 * - Accessible navigation
 * - Dark mode support
 *
 * Usage:
 *   <Breadcrumb
 *     items={[
 *       { label: 'Home', href: '/' },
 *       { label: 'Library', href: '/library' },
 *       { label: 'Playlists' },
 *     ]}
 *   />
 *
 *   // With home icon
 *   <Breadcrumb
 *     items={[...]}
 *     showHome
 *   />
 *
 *   // Custom separator
 *   <Breadcrumb
 *     items={[...]}
 *     separator={<span>/</span>}
 *   />
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator,
  showHome = false,
  className = '',
}) => {
  const Separator = separator || <ChevronSeparator />;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && (
                <span className="flex-shrink-0" aria-hidden="true">
                  {Separator}
                </span>
              )}

              {item.href && !isLast ? (
                <RouterLink
                  to={item.href}
                  className="
                    inline-flex items-center gap-1
                    text-gray-500 dark:text-slate-400
                    hover:text-gray-700 dark:hover:text-slate-200
                    transition-colors
                  "
                >
                  {isFirst && showHome ? (
                    <HomeIcon />
                  ) : (
                    item.icon && <span className="flex-shrink-0">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                </RouterLink>
              ) : (
                <span
                  className={`
                    inline-flex items-center gap-1
                    ${isLast
                      ? 'text-gray-900 dark:text-white font-medium'
                      : 'text-gray-500 dark:text-slate-400'
                    }
                  `}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {isFirst && showHome ? (
                    <HomeIcon />
                  ) : (
                    item.icon && <span className="flex-shrink-0">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

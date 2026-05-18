import React from 'react';

/**
 * Table size options.
 */
export type TableSize = 'sm' | 'md' | 'lg';

/**
 * Sort direction.
 */
export type SortDirection = 'asc' | 'desc' | null;

// ----------------------------------------------------------------------------
// Table Head
// ----------------------------------------------------------------------------

interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

const TableHead: React.FC<TableHeadProps> = ({ children, className = '', ...props }) => (
  <thead
    className={`
      bg-gray-50 dark:bg-slate-800
      border-b border-gray-200 dark:border-slate-700
      ${className}
    `}
    {...props}
  >
    {children}
  </thead>
);

// ----------------------------------------------------------------------------
// Table Body
// ----------------------------------------------------------------------------

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

const TableBody: React.FC<TableBodyProps> = ({ children, className = '', ...props }) => (
  <tbody
    className={`
      divide-y divide-gray-100 dark:divide-slate-800
      ${className}
    `}
    {...props}
  >
    {children}
  </tbody>
);

// ----------------------------------------------------------------------------
// Table Row
// ----------------------------------------------------------------------------

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children?: React.ReactNode;
  selected?: boolean;
  hoverable?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(({
  children,
  selected = false,
  hoverable = true,
  onClick,
  className = '',
  ...props
}, ref) => (
  <tr
    ref={ref}
    onClick={onClick}
    className={`
      ${selected ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-white dark:bg-slate-900'}
      ${hoverable ? 'hover:bg-gray-50 dark:hover:bg-slate-800/50' : ''}
      ${onClick ? 'cursor-pointer' : ''}
      transition-colors
      ${className}
    `}
    {...props}
  >
    {children}
  </tr>
));

TableRow.displayName = 'Table.Row';

// ----------------------------------------------------------------------------
// Table Header Cell
// ----------------------------------------------------------------------------

interface TableThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  /** Column is sortable */
  sortable?: boolean;
  /** Current sort direction */
  sortDirection?: SortDirection;
  /** Called when header is clicked for sorting */
  onSort?: () => void;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Column width */
  width?: string | number;
}

const TableTh: React.FC<TableThProps> = ({
  children,
  sortable = false,
  sortDirection = null,
  onSort,
  align = 'left',
  width,
  className = '',
  ...props
}) => {
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  const style: React.CSSProperties = {
    ...props.style,
    width: typeof width === 'number' ? `${width}px` : width,
  };

  return (
    <th
      scope="col"
      onClick={sortable ? onSort : undefined}
      style={style}
      className={`
        px-4 py-3
        text-xs font-semibold uppercase tracking-wider
        text-gray-500 dark:text-slate-400
        ${alignClass}
        ${sortable ? 'cursor-pointer hover:text-gray-700 dark:hover:text-slate-200 select-none' : ''}
        ${className}
      `}
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && (
          <span className="inline-flex flex-col">
            <svg
              className={`w-3 h-3 -mb-1 ${sortDirection === 'asc' ? 'text-emerald-500' : 'text-gray-300 dark:text-slate-600'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5 12l5-5 5 5H5z" />
            </svg>
            <svg
              className={`w-3 h-3 -mt-1 ${sortDirection === 'desc' ? 'text-emerald-500' : 'text-gray-300 dark:text-slate-600'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M15 8l-5 5-5-5h10z" />
            </svg>
          </span>
        )}
      </span>
    </th>
  );
};

// ----------------------------------------------------------------------------
// Table Data Cell
// ----------------------------------------------------------------------------

interface TableTdProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
}

const TableTd: React.FC<TableTdProps> = ({
  children,
  align = 'left',
  className = '',
  ...props
}) => {
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return (
    <td
      className={`
        px-4 py-3
        text-sm text-gray-700 dark:text-slate-300
        ${alignClass}
        ${className}
      `}
      {...props}
    >
      {children}
    </td>
  );
};

// ----------------------------------------------------------------------------
// Table
// ----------------------------------------------------------------------------

interface TableProps {
  /** Table content */
  children: React.ReactNode;
  /** Table size (affects padding) */
  size?: TableSize;
  /** Fixed table layout */
  fixed?: boolean;
  /** Add border around table */
  bordered?: boolean;
  /** Striped rows */
  striped?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get size classes.
 */
const getSizeClasses = (size: TableSize): string => {
  switch (size) {
    case 'sm':
      return '[&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-2 [&_td]:text-xs';
    case 'md':
      return '';
    case 'lg':
      return '[&_th]:px-6 [&_th]:py-4 [&_td]:px-6 [&_td]:py-4';
  }
};

interface TableComponent extends React.FC<TableProps> {
  Head: typeof TableHead;
  Body: typeof TableBody;
  Row: typeof TableRow;
  Th: typeof TableTh;
  Td: typeof TableTd;
}

/**
 * Table - Data table component.
 *
 * A compound table component for displaying tabular data.
 *
 * Features:
 * - Compound component pattern (Table.Head, Table.Body, Table.Row, etc.)
 * - Sortable columns
 * - Multiple sizes
 * - Striped rows option
 * - Bordered option
 * - Row selection styling
 * - Dark mode support
 *
 * Usage:
 *   <Table>
 *     <Table.Head>
 *       <Table.Row>
 *         <Table.Th sortable sortDirection="asc" onSort={handleSort}>
 *           Name
 *         </Table.Th>
 *         <Table.Th>Email</Table.Th>
 *       </Table.Row>
 *     </Table.Head>
 *     <Table.Body>
 *       <Table.Row>
 *         <Table.Td>John Doe</Table.Td>
 *         <Table.Td>john@example.com</Table.Td>
 *       </Table.Row>
 *     </Table.Body>
 *   </Table>
 */
const Table: TableComponent = ({
  children,
  size = 'md',
  fixed = false,
  bordered = false,
  striped = false,
  className = '',
}) => {
  const classes = [
    'w-full',
    fixed ? 'table-fixed' : 'table-auto',
    bordered ? 'border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden' : '',
    striped ? '[&_tbody_tr:nth-child(even)]:bg-gray-50 dark:[&_tbody_tr:nth-child(even)]:bg-slate-800/30' : '',
    getSizeClasses(size),
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="overflow-x-auto">
      <table className={classes}>{children}</table>
    </div>
  );
};

// Attach subcomponents
Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Th = TableTh;
Table.Td = TableTd;

export default Table;

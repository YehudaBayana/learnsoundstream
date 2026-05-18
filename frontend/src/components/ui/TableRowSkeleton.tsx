import React from 'react';
import Skeleton from './Skeleton';
import { Stack } from './layout';

interface TableRowSkeletonProps {
  count?: number;
}

const TableRowSkeleton: React.FC<TableRowSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <tr
          key={index}
          data-testid="table-row-skeleton"
        >
          {/* Row number */}
          <td className="px-6 py-4 whitespace-nowrap">
            <Skeleton variant="text" width={16} height={16} />
          </td>
          {/* Title */}
          <td className="px-6 py-4 whitespace-nowrap">
            <Skeleton variant="text" width={128} height={16} />
          </td>
          {/* Artist */}
          <td className="px-6 py-4 whitespace-nowrap">
            <Skeleton variant="text" width={96} height={16} />
          </td>
          {/* Date */}
          <td className="px-6 py-4 whitespace-nowrap">
            <Skeleton variant="text" width={80} height={16} />
          </td>
          {/* Duration */}
          <td className="px-6 py-4 whitespace-nowrap text-right">
            <Skeleton variant="text" width={48} height={16} className="ml-auto" />
          </td>
          {/* Actions */}
          <td className="px-6 py-4 whitespace-nowrap text-right">
            <Stack direction="horizontal" align="center" justify="end" gap={2}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="circular" width={40} height={40} />
            </Stack>
          </td>
        </tr>
      ))}
    </>
  );
};

export default TableRowSkeleton;

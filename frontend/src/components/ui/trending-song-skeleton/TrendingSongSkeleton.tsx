import React from 'react';
import Skeleton from '../Skeleton';
import Card from '../Card';
import { Stack, Box } from '../layout';

interface TrendingSongSkeletonProps {
  count?: number;
  dataHook?: string;
}

const TrendingSongSkeleton: React.FC<TrendingSongSkeletonProps> = ({ count = 1, dataHook }) => {
  return (
    <div data-hook={dataHook}>
    <Stack direction="vertical" gap={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          dataHook={dataHook ? `${dataHook}-item-${index}` : undefined}
          padding="md"
          className="flex items-center justify-between"
        >
          {/* Rank number placeholder */}
          <Box className="w-10 flex-shrink-0 flex justify-center">
            <Skeleton variant="rectangular" width={32} height={32} className="rounded" />
          </Box>

          {/* Song info placeholders */}
          <Box className="min-w-0 flex-1 mx-4">
            <Stack direction="vertical" gap={2}>
              {/* Title */}
              <Skeleton variant="text" width="66%" height={20} />
              {/* Artist */}
              <Skeleton variant="text" width="33%" height={16} />
              {/* Metadata row */}
              <Stack direction="horizontal" align="center" gap={3} className="mt-1">
                <Skeleton variant="text" width={64} height={12} />
                <Skeleton variant="text" width={32} height={12} />
                <Skeleton variant="text" width={48} height={12} />
              </Stack>
            </Stack>
          </Box>

          {/* Play button placeholder */}
          <Skeleton variant="circular" width={48} height={48} className="flex-shrink-0" />
        </Card>
      ))}
    </Stack>
    </div>
  );
};

export default TrendingSongSkeleton;

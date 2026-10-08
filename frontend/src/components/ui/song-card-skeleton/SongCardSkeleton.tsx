import React from "react";
import Skeleton from "../Skeleton";
import Card from "../Card";
import { Stack, Box } from "../layout";

interface SongCardSkeletonProps {
  count?: number;
  dataHook?: string;
}

const SongCardSkeleton: React.FC<SongCardSkeletonProps> = ({ count = 1, dataHook }) => {
  return (
    <div data-hook={dataHook}>
      <Stack direction="vertical" gap={4}>
        {Array.from({ length: count }).map((_, index) => (
          <Card
            key={index}
            dataHook={dataHook ? `${dataHook}-item-${index}` : undefined}
            padding="md"
            className="flex items-center justify-between"
          >
            {/* Left side: Song info placeholders */}
            <Box className="flex-1 mr-3">
              <Stack direction="vertical" gap={2}>
                {/* Title placeholder */}
                <Skeleton variant="text" width="75%" height={20} />
                {/* Artist placeholder */}
                <Skeleton variant="text" width="50%" height={16} />

                {/* Metadata row */}
                <Stack direction="horizontal" align="center" gap={3} className="mt-1">
                  <Skeleton variant="text" width={64} height={12} />
                  <Skeleton variant="text" width={32} height={12} />
                  <Skeleton variant="text" width={32} height={12} />
                </Stack>

                {/* Genre tags placeholder */}
                <Stack direction="horizontal" gap={1} className="mt-2">
                  <Skeleton variant="rounded" width={48} height={20} className="rounded-full" />
                  <Skeleton variant="rounded" width={64} height={20} className="rounded-full" />
                </Stack>
              </Stack>
            </Box>

            {/* Right side: Menu and play button placeholders */}
            <Stack direction="horizontal" align="center" gap={2}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="circular" width={48} height={48} />
            </Stack>
          </Card>
        ))}
      </Stack>
    </div>
  );
};

export default SongCardSkeleton;

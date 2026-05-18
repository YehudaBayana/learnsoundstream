import React from 'react';
import Skeleton from './Skeleton';
import { Stack, Box } from './layout';

interface CommentSkeletonProps {
  count?: number;
}

const CommentSkeleton: React.FC<CommentSkeletonProps> = ({ count = 3 }) => {
  return (
    <Stack direction="vertical" gap={4}>
      {Array.from({ length: count }).map((_, index) => (
        <Stack
          key={index}
          data-testid="comment-skeleton"
          direction="horizontal"
          gap={3}
        >
          {/* Avatar placeholder */}
          <Skeleton variant="circular" width={32} height={32} />

          {/* Comment content */}
          <Box className="flex-1 min-w-0">
            <Stack direction="vertical" gap={2}>
              {/* Username and timestamp row */}
              <Stack direction="horizontal" align="center" gap={2}>
                {/* Username */}
                <Skeleton variant="text" width={80} height={16} />
                {/* Timestamp */}
                <Skeleton variant="text" width={48} height={12} className="opacity-50" />
              </Stack>

              {/* Comment text */}
              <Stack direction="vertical" gap={2}>
                <Skeleton
                  variant="text"
                  width={`${70 + (index % 3) * 10}%`}
                  height={14}
                />
                {/* Second line only for some comments */}
                {index % 2 === 0 && (
                  <Skeleton
                    variant="text"
                    width={`${40 + (index % 4) * 10}%`}
                    height={14}
                  />
                )}
              </Stack>
            </Stack>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
};

export default CommentSkeleton;

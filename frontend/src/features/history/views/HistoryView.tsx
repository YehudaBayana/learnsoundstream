"use client";

import { useEffect, useRef } from "react";
import { useHistory } from "../query/useHistory";
import TrackItem from "@/features/player/components/TrackItem";
import { Box } from "@/components/ui/layout";
import Text from "@/components/ui/Text";

interface HistoryViewProps {
  dataHook?: string;
}

export default function HistoryView({ dataHook = "history-view-container" }: HistoryViewProps) {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useHistory();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const tracks = data?.pages.flat() ?? [];

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !hasNextPage || isError) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isError, isFetchingNextPage]);

  return (
    <Box className="p-10 flex flex-col gap-4" dataHook={dataHook}>
      <Text variant="h1" dataHook="history-view-heading">
        History
      </Text>
      {isPending && (
        <Text role="status" dataHook="history-loading-text">
          Loading history...
        </Text>
      )}
      {isError && tracks.length === 0 && (
        <Box className="flex items-center gap-3" dataHook="history-error-container">
          <Text role="alert" dataHook="history-error-text">
            {error?.message || "Could not load history."}
          </Text>
          <button type="button" onClick={() => void refetch()} data-hook="history-retry-button">
            Try again
          </button>
        </Box>
      )}
      {!isPending && !isError && tracks.length === 0 && (
        <Text dataHook="history-empty-text">No listening history yet.</Text>
      )}
      {tracks.map((track, index) => (
        <TrackItem track={track} index={index} key={`${track.id}-${index}`} showCover />
      ))}
      {tracks.length > 0 && hasNextPage && (
        <div
          ref={loadMoreRef}
          className="min-h-8"
          aria-hidden="true"
          data-hook="history-loadmore-trigger"
        />
      )}
      {isFetchingNextPage && (
        <Text role="status" dataHook="history-fetching-more-text">
          Loading more history...
        </Text>
      )}
      {isError && tracks.length > 0 && (
        <Box className="flex items-center gap-3" dataHook="history-loadmore-error-container">
          <Text role="alert" dataHook="history-loadmore-error-text">
            Could not load more history.
          </Text>
          <button
            type="button"
            onClick={() => void fetchNextPage()}
            data-hook="history-loadmore-retry-button"
          >
            Retry
          </button>
        </Box>
      )}
    </Box>
  );
}

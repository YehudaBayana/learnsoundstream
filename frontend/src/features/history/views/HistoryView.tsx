"use client";

import { useEffect, useRef } from "react";
import { useHistory } from "../query/useHistory";
import TrackItem from "@/features/player/components/TrackItem";
import { Box } from "@/components/ui/layout";
import Text from "@/components/ui/Text";

export default function HistoryView() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useHistory("1");
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
    <Box className="p-10 flex flex-col gap-4">
      <Text variant="h1">History</Text>
      {isPending && <Text role="status">Loading history...</Text>}
      {isError && tracks.length === 0 && (
        <Box className="flex items-center gap-3">
          <Text role="alert">{error.message || "Could not load history."}</Text>
          <button type="button" onClick={() => void refetch()}>
            Try again
          </button>
        </Box>
      )}
      {!isPending && !isError && tracks.length === 0 && (
        <Text>No listening history yet.</Text>
      )}
      {tracks.map((track, index) => (
        <TrackItem
          track={track}
          index={index}
          key={`${track.id}-${index}`}
          showCover
        />
      ))}
      {tracks.length > 0 && hasNextPage && (
        <div ref={loadMoreRef} className="min-h-8" aria-hidden="true" />
      )}
      {isFetchingNextPage && <Text role="status">Loading more history...</Text>}
      {isError && tracks.length > 0 && (
        <Box className="flex items-center gap-3">
          <Text role="alert">Could not load more history.</Text>
          <button type="button" onClick={() => void fetchNextPage()}>
            Retry
          </button>
        </Box>
      )}
    </Box>
  );
}

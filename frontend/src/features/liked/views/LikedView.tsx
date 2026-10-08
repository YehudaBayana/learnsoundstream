"use client";

import TrackItem from "@/features/player/components/TrackItem";
import { Box } from "@/components/ui/layout";
import Text from "@/components/ui/Text";
import { useLikedStore } from "../store/useLikedStore";

export default function LikedView() {
  const refetch = useLikedStore((state) => state.refetch);
  const isPending = useLikedStore((state) => state.isPending);
  const isError = useLikedStore((state) => state.isError);
  const tracks = useLikedStore((state) => state.likedTracks);
  return (
    <Box className="p-10 flex flex-col gap-4" dataHook="liked-view-container">
      <Text variant="h1" dataHook="liked-view-heading">Liked</Text>
      {isPending && <Text role="status" dataHook="liked-loading-text">Loading liked tracks...</Text>}
      {isError && tracks.length === 0 && (
        <Box className="flex items-center gap-3" dataHook="liked-error-container">
          <Text role="alert" dataHook="liked-error-text">{"Could not load liked tracks."}</Text>
          <button type="button" onClick={() => refetch && void refetch()} data-hook="liked-retry-button">
            Try again
          </button>
        </Box>
      )}
      {!isPending && !isError && tracks.length === 0 && (
        <Text dataHook="liked-empty-text">No listening liked tracks yet.</Text>
      )}
      {tracks.map((track, index) => (
        <TrackItem
          track={track}
          index={index}
          key={`${track.id}-${index}`}
          showCover
        />
      ))}
      {isError && tracks.length > 0 && (
        <Box className="flex items-center gap-3" dataHook="liked-loadmore-error-container">
          <Text role="alert" dataHook="liked-loadmore-error-text">Could not load more liked tracks.</Text>
          <button type="button" onClick={() => refetch && void refetch()} data-hook="liked-loadmore-retry-button">
            Retry
          </button>
        </Box>
      )}
    </Box>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useGetLiked } from "../query/useLiked";
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
    <Box className="p-10 flex flex-col gap-4">
      <Text variant="h1">Liked</Text>
      {isPending && <Text role="status">Loading liked tracks...</Text>}
      {isError && tracks.length === 0 && (
        <Box className="flex items-center gap-3">
          <Text role="alert">{"Could not load liked tracks."}</Text>
          <button type="button" onClick={() => refetch && void refetch()}>
            Try again
          </button>
        </Box>
      )}
      {!isPending && !isError && tracks.length === 0 && (
        <Text>No listening liked tracks yet.</Text>
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
        <Box className="flex items-center gap-3">
          <Text role="alert">Could not load more liked tracks.</Text>
          <button type="button" onClick={() => refetch && void refetch()}>
            Retry
          </button>
        </Box>
      )}
    </Box>
  );
}

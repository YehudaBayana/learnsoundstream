import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { likedKeys } from "@/shared/api/keys";
import { getLiked, postLiked } from "../api/liked";
import { useLikedStore } from "../store/useLikedStore";
import { useState } from "react";
import { Track } from "@/types/global.types";

const PAGE_SIZE = 1000;

export function useGetLiked() {
  return useInfiniteQuery({
    queryKey: likedKeys.getLiked(),
    queryFn: ({ pageParam }) => getLiked(PAGE_SIZE, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length === 0 ? undefined : lastPageParam + PAGE_SIZE,
  });
}

// 1. Extract the repeating toggle logic into a simple helper function
const toggleTrackInList = (list: Track[], track: Track) => {
  const isLiked = list.some((t) => t.id === track.id);
  return isLiked ? list.filter((t) => t.id !== track.id) : [...list, track];
};

export function usePostLiked() {
  const queryClient = useQueryClient();
  const setLikedList = useLikedStore((state) => state.setLikedList);
  const likedTracks = useLikedStore((state) => state.likedTracks);
  const [toggledTrack, setToggledTrack] = useState<Track | null>(null);

  return useMutation({
    mutationKey: likedKeys.getLiked(),
    mutationFn: (track: Track) => {
      setToggledTrack(track);
      // Use our new helper function here
      setLikedList(toggleTrackInList(likedTracks, track));
      return postLiked(track.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: likedKeys.getLiked() });
    },
    onError: (error) => {
      // Revert the list back if something goes wrong
      if (toggledTrack) {
        setLikedList(toggleTrackInList(likedTracks, toggledTrack));
      }
      console.error("Error posting liked track:", error);
    },
  });
}

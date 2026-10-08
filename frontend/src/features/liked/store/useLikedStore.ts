import { create } from "zustand";
import type { Track } from "@/types/global.types";
import type { useGetLiked } from "../query/useLiked";

type LikedQueryResult = ReturnType<typeof useGetLiked>;

interface LikedState {
  likedTracks: Track[];
  isPending: boolean;
  isError: boolean;
  refetch: LikedQueryResult["refetch"] | null;

  // Populate the store when the app first loads
  setLikedList: (tracks: Track[]) => void;
  setLikedQueryState: (queryState: Pick<LikedState, "isPending" | "isError" | "refetch">) => void;

  // Toggle a video's like state locally
  toggleLike: (track: Track) => void;

  // Helper function to check if a video is liked
  isLiked: (videoId: string) => boolean;
}

export const useLikedStore = create<LikedState>((set, get) => ({
  likedTracks: [],
  isPending: true,
  isError: false,
  refetch: null,

  setLikedList: (tracks) => set({ likedTracks: tracks }),
  setLikedQueryState: (queryState) => set(queryState),

  toggleLike: (track) => {
    set((state) => {
      const isLiked = state.likedTracks.some((likedTrack) => likedTrack.id === track.id);
      return {
        likedTracks: isLiked
          ? state.likedTracks.filter((likedTrack) => likedTrack.id !== track.id)
          : [...state.likedTracks, track],
      };
    });
  },

  isLiked: (videoId) => {
    return get().likedTracks.some((track) => track.id === videoId);
  },
}));

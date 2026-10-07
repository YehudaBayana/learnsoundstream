import { create } from "zustand";
import type { Track } from "@/types/global.types";

export type RepeatMode = "none" | "all" | "one";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface PlaybackState {
  currentChosenTrack: Track | null;
  isPlaying: boolean;
  currentTrackIndex: number;
}

// ---------------------------------------------------------------------------
// Actions shape
// ---------------------------------------------------------------------------

interface PlaybackActions {
  playTrack: (track: Track, customQueue?: Track[]) => void;
  setPlaying: (playing: boolean) => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const usePlaybackStore = create<PlaybackState & PlaybackActions>(
  (set, get) => ({
    // --- initial state ---
    currentChosenTrack: null,
    isPlaying: false,
    currentTrackIndex: -1,

    // --- actions ---

    playTrack: (track) => {
      set({
        currentChosenTrack: track,
        isPlaying: true,
        currentTrackIndex: 0,
      });
    },

    setPlaying: (playing) => set({ isPlaying: playing }),
  }),
);

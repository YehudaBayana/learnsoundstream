import { create } from "zustand";
import type { Track } from "@/types/global.types";
import {
  reportPlayTrack,
  reportNextTrack,
  reportPrevTrack,
  reportPreferences,
} from "@/features/player/api/playback";

export type RepeatMode = "none" | "all" | "one";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTrackIndex: number;
}

// ---------------------------------------------------------------------------
// Actions shape
// ---------------------------------------------------------------------------

interface PlaybackActions {
  playTrack: (track: Track, customQueue?: Track[]) => void;
  playAll: (tracks: Track[]) => void;
  setPlaying: (playing: boolean) => void;
  nextTrack: () => void;
  prevTrack: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const usePlaybackStore = create<PlaybackState & PlaybackActions>(
  (set, get) => ({
    // --- initial state ---
    currentTrack: null,
    isPlaying: false,
    currentTrackIndex: -1,

    // --- actions ---

    playTrack: (track) => {
      set({
        currentTrack: track,
        isPlaying: true,
        currentTrackIndex: 0,
      });

      // Fire-and-forget: report to backend (routes to be implemented)
      reportPlayTrack(track.id).catch(() => {});
    },

    playAll: (tracks) => {
      if (tracks.length === 0) return;
      get().playTrack(tracks[0], tracks);
    },

    setPlaying: (playing) => set({ isPlaying: playing }),

    nextTrack: () => {
      const { currentTrack, playTrack } = get();

      if (currentTrack) {
        playTrack(currentTrack);
        return;
      }

      set({ isPlaying: false });

      reportNextTrack().catch(() => {});
    },

    prevTrack: () => {
      const { currentTrack, playTrack } = get();

      if (currentTrack) {
        playTrack(currentTrack);
      } else {
        set({ isPlaying: false });
      }

      reportPrevTrack().catch(() => {});
    },
  }),
);

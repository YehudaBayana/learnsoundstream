import { create } from 'zustand';
import type { Playlist } from '@/types';

// ---------------------------------------------------------------------------
// State + Actions
// ---------------------------------------------------------------------------

interface LibraryState {
  playlists: Playlist[];
  likedTrackIds: string[];
}

interface LibraryActions {
  setPlaylists: (playlists: Playlist[]) => void;
  toggleLike: (trackId: string) => void;
}

export const useLibraryStore = create<LibraryState & LibraryActions>((set, get) => ({
  // --- initial state ---
  playlists: [],
  likedTrackIds: [],

  // --- actions ---

  setPlaylists: (playlists) => set({ playlists }),

  toggleLike: (trackId) => {
    const { likedTrackIds } = get();
    set({
      likedTrackIds: likedTrackIds.includes(trackId)
        ? likedTrackIds.filter((id) => id !== trackId)
        : [...likedTrackIds, trackId],
    });
  },
}));

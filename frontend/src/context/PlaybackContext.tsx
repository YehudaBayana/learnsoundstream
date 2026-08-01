'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Track {
  videoId: string;
  title: string;
  desc: string;
  duration: string;
  emoji: string;
  category: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  trackIds: string[];
  emoji: string;
  createdAt: string;
}

export const TRACK_DATABASE: Track[] = [];

export type AppView = 'home' | 'search' | 'playlists' | 'playlist-detail' | 'liked-songs' | 'history';

interface PlaybackContextProps {
  currentView: AppView;
  selectedPlaylistId: string | null;
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  currentTrackIndex: number;
  playlists: Playlist[];
  likedTrackIds: string[];
  history: Track[];
  searchQuery: string;
  shuffleMode: boolean;
  repeatMode: 'none' | 'all' | 'one';
  
  // Navigation / Views
  setCurrentView: (view: AppView, playlistId?: string | null) => void;
  setSearchQuery: (query: string) => void;
  
  // Playback Operations
  playTrack: (track: Track, customQueue?: Track[]) => void;
  playAll: (tracks: Track[]) => void;
  setPlaying: (playing: boolean) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  
  // Custom Library Actions
  toggleLike: (trackId: string) => void;
  createPlaylist: (name: string, description?: string) => void;
  deletePlaylist: (playlistId: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
}

const PlaybackContext = createContext<PlaybackContextProps | undefined>(undefined);

const DEFAULT_PLAYLISTS: Playlist[] = [];

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  // Views & Routing State
  const [currentView, setView] = useState<AppView>('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Audio Playback State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [shuffleMode, setShuffleMode] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [originalQueue, setOriginalQueue] = useState<Track[]>([]); // Keeps order for un-shuffling

  // User Library State (Persisted)
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);
  const [history, setHistory] = useState<Track[]>([]);

  // Prevent SSR hydration mismatch
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize and synchronize states with LocalStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedPlaylists = localStorage.getItem('soundstream_playlists');
        const storedLikes = localStorage.getItem('soundstream_likes');
        const storedHistory = localStorage.getItem('soundstream_history');

        const initialPlaylists = storedPlaylists ? JSON.parse(storedPlaylists) : DEFAULT_PLAYLISTS;
        const initialLikes = storedLikes ? JSON.parse(storedLikes) : [];
        const initialHistory = storedHistory ? JSON.parse(storedHistory) : [];

        setTimeout(() => {
          setPlaylists(initialPlaylists);
          setLikedTrackIds(initialLikes);
          setHistory(initialHistory);
          setIsLoaded(true);
        }, 0);
      } catch (err) {
        console.error('Failed to load libraries from localStorage:', err);
        setTimeout(() => {
          setPlaylists(DEFAULT_PLAYLISTS);
          setIsLoaded(true);
        }, 0);
      }
    }
  }, []);

  // Save updates to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('soundstream_playlists', JSON.stringify(playlists));
    }
  }, [playlists, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('soundstream_likes', JSON.stringify(likedTrackIds));
    }
  }, [likedTrackIds, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('soundstream_history', JSON.stringify(history));
    }
  }, [history, isLoaded]);

  const setCurrentView = (view: AppView, playlistId: string | null = null) => {
    setView(view);
    setSelectedPlaylistId(playlistId);
  };

  const playTrack = (track: Track, customQueue?: Track[]) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    
    // Add to history (remove duplicate first to bump it to top)
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.videoId !== track.videoId);
      return [track, ...filtered].slice(0, 50); // limit history to 50 tracks
    });

    // Handle Queue
    if (customQueue && customQueue.length > 0) {
      const indexInCustom = customQueue.findIndex((t) => t.videoId === track.videoId);
      setOriginalQueue(customQueue);
      if (shuffleMode) {
        // Shuffle queue but keep playing track first
        const reordered = shuffleArray(customQueue.filter((t) => t.videoId !== track.videoId));
        const newQueue = [track, ...reordered];
        setQueue(newQueue);
        setCurrentTrackIndex(0);
      } else {
        setQueue(customQueue);
        setCurrentTrackIndex(indexInCustom >= 0 ? indexInCustom : 0);
      }
    } else {
      // If no custom queue provided, make queue containing just this track (or search results)
      const fallbackQueue = [track];
      setOriginalQueue(fallbackQueue);
      setQueue(fallbackQueue);
      setCurrentTrackIndex(0);
    }

    // Trigger standard legacy window event for any components that still listen to it
    const event = new CustomEvent('play-song', {
      detail: { videoId: track.videoId, title: track.title }
    });
    window.dispatchEvent(event);
  };

  const playAll = (tracks: Track[]) => {
    if (tracks.length === 0) return;
    playTrack(tracks[0], tracks);
  };

  const setPlaying = (playing: boolean) => {
    setIsPlaying(playing);
  };

  const nextTrack = () => {
    if (queue.length === 0) return;

    if (repeatMode === 'one' && currentTrack) {
      // Replay current song
      playTrack(currentTrack, queue);
      return;
    }

    const nextIndex = currentTrackIndex + 1;
    if (nextIndex < queue.length) {
      setCurrentTrackIndex(nextIndex);
      setCurrentTrack(queue[nextIndex]);
    } else {
      // Reached end of queue
      if (repeatMode === 'all') {
        setCurrentTrackIndex(0);
        setCurrentTrack(queue[0]);
      } else {
        setIsPlaying(false);
      }
    }
  };

  const prevTrack = () => {
    if (queue.length === 0) return;

    const prevIndex = currentTrackIndex - 1;
    if (prevIndex >= 0) {
      setCurrentTrackIndex(prevIndex);
      setCurrentTrack(queue[prevIndex]);
    } else {
      if (repeatMode === 'all') {
        const lastIndex = queue.length - 1;
        setCurrentTrackIndex(lastIndex);
        setCurrentTrack(queue[lastIndex]);
      } else {
        // Simply restart current track
        if (currentTrack) {
          playTrack(currentTrack, queue);
        }
      }
    }
  };

  const toggleShuffle = () => {
    setShuffleMode((prev) => {
      const nextShuffle = !prev;
      if (nextShuffle && queue.length > 0 && currentTrack) {
        // Enable shuffle
        const rest = originalQueue.filter((t) => t.videoId !== currentTrack.videoId);
        const shuffled = [currentTrack, ...shuffleArray(rest)];
        setQueue(shuffled);
        setCurrentTrackIndex(0);
      } else if (!nextShuffle && currentTrack) {
        // Disable shuffle - restore original queue and index
        setQueue(originalQueue);
        const idx = originalQueue.findIndex((t) => t.videoId === currentTrack.videoId);
        setCurrentTrackIndex(idx >= 0 ? idx : 0);
      }
      return nextShuffle;
    });
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'one';
      return 'none';
    });
  };

  const toggleLike = (trackId: string) => {
    setLikedTrackIds((prev) => {
      if (prev.includes(trackId)) {
        return prev.filter((id) => id !== trackId);
      } else {
        return [...prev, trackId];
      }
    });
  };

  const createPlaylist = (name: string, description?: string) => {
    const emojis = ['🎵', '🎧', '🔥', '✨', '💿', '🎸', '🎹', '⚡', '🌙', '🍂', '🍕', '🚗'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      description,
      trackIds: [],
      emoji: randomEmoji,
      createdAt: new Date().toISOString(),
    };
    setPlaylists((prev) => [...prev, newPlaylist]);
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((pl) => pl.id !== playlistId));
    if (selectedPlaylistId === playlistId) {
      setCurrentView('playlists');
    }
  };

  const addTrackToPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          if (pl.trackIds.includes(trackId)) return pl; // Avoid duplicates
          return {
            ...pl,
            trackIds: [...pl.trackIds, trackId],
          };
        }
        return pl;
      })
    );
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          return {
            ...pl,
            trackIds: pl.trackIds.filter((id) => id !== trackId),
          };
        }
        return pl;
      })
    );
  };

  // Helper shuffle function (Fisher-Yates)
  const shuffleArray = (array: Track[]): Track[] => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  return (
    <PlaybackContext.Provider
      value={{
        currentView,
        selectedPlaylistId,
        currentTrack,
        isPlaying,
        queue,
        currentTrackIndex,
        playlists,
        likedTrackIds,
        history,
        searchQuery,
        shuffleMode,
        repeatMode,
        setCurrentView,
        setSearchQuery,
        playTrack,
        playAll,
        setPlaying,
        nextTrack,
        prevTrack,
        toggleShuffle,
        toggleRepeat,
        toggleLike,
        createPlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const context = useContext(PlaybackContext);
  if (context === undefined) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }
  return context;
}

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Playlist, Track } from '@/types';

export type AppView = 'home' | 'search' | 'playlists' | 'playlist-detail' | 'liked-songs' | 'history';

interface PlaybackContextProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  currentTrackIndex: number;
  playlists: Playlist[];
  likedTrackIds: string[];
  searchQuery: string;
  shuffleMode: boolean;
  repeatMode: 'none' | 'all' | 'one';
  
  // Navigation / Views
  setSearchQuery: (query: string) => void;
  setPlaylists: (playlists: Playlist[]) => void;
  
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
}

const PlaybackContext = createContext<PlaybackContextProps | undefined>(undefined);

const DEFAULT_PLAYLISTS: Playlist[] = [];

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  // Views & Routing State
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

  const playTrack = (track: Track, customQueue?: Track[]) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    
    // Handle Queue
    if (customQueue && customQueue.length > 0) {
      const indexInCustom = customQueue.findIndex((t) => t.id === track.id);
      setOriginalQueue(customQueue);
      if (shuffleMode) {
        // Shuffle queue but keep playing track first
        const reordered = shuffleArray(customQueue.filter((t) => t.id !== track.id));
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
        const rest = originalQueue.filter((t) => t.id !== currentTrack.id);
        const shuffled = [currentTrack, ...shuffleArray(rest)];
        setQueue(shuffled);
        setCurrentTrackIndex(0);
      } else if (!nextShuffle && currentTrack) {
        // Disable shuffle - restore original queue and index
        setQueue(originalQueue);
        const idx = originalQueue.findIndex((t) => t.id === currentTrack.id);
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
        currentTrack,
        isPlaying,
        queue,
        currentTrackIndex,
        playlists,
        likedTrackIds,
        searchQuery,
        shuffleMode,
        repeatMode,
        setPlaylists,
        setSearchQuery,
        playTrack,
        playAll,
        setPlaying,
        nextTrack,
        prevTrack,
        toggleShuffle,
        toggleRepeat,
        toggleLike,
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

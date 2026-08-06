'use client';

import React, { useEffect, useState } from 'react';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import Flex from '@/components/ui/layout/Flex';
import Box from '@/components/ui/layout/Box';
import Container from '@/components/ui/layout/Container';
import TrackItem from '@/components/TrackItem';
import { usePlayback, Track } from '@/context/PlaybackContext';
import { apiUrl } from '@/constants';

interface SearchApiResult {
  videoId: string;
  title: string;
  channel: string;
  duration: string;
  durationSeconds: number;
  thumbnail: string;
}

function toTrack(result: SearchApiResult): Track {
  return {
    videoId: result.videoId,
    title: result.title,
    desc: result.channel,
    duration: result.duration,
    emoji: '🎵',
    category: 'YouTube',
  };
}

export default function LikedSongsView() {
  const { likedTrackIds, playAll, setCurrentView } = usePlayback();
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (likedTrackIds.length === 0) {
      setLikedTracks([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Fetch missing tracks from backend /api/videos
    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`${apiUrl}/api/videos?ids=${encodeURIComponent(likedTrackIds.join(','))}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch liked videos (${res.status})`);
        return res.json();
      })
      .then((data: { results: SearchApiResult[] }) => {
        if (isCancelled) return;
        const fetchedTracks = data.results.map(toTrack);
        setLikedTracks(fetchedTracks);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error('Failed to fetch batch videos for LikedSongsView:', err);
        setError(err.message || 'Failed to load liked tracks');
        setLikedTracks([]);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [likedTrackIds]);

  const handlePlayAll = () => {
    if (likedTracks.length === 0) return;
    playAll(likedTracks);
  };

  return (
    <Container className="px-6 py-8 max-w-[1000px] space-y-8 animate-[fadeIn_0.4s_ease_forwards]">
      {/* Header Banner */}
      <Flex direction="col" align="center" gap={6} className="bg-gradient-to-br from-emerald-950/20 via-[var(--bg-surface)] to-[var(--bg-primary)] border border-[var(--border-default)] p-6 sm:p-8 rounded-3xl select-none sm:flex-row">
        <Box className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-5xl shadow-lg shadow-emerald-500/25 flex-shrink-0 animate-pulse">
          ❤️
        </Box>
        <Flex direction="col" className="flex-1 min-w-0 text-center sm:text-left">
          <Text variant="caption" weight="bold" className="uppercase tracking-wider text-[10px] text-emerald-400">
            PLAYLIST
          </Text>
          <Heading level={2} size="xl" className="font-extrabold text-[var(--text-primary)] mt-1 mb-2">
            Liked Songs
          </Heading>
          <Text variant="body-sm" color="muted" className="leading-relaxed mb-4 text-[13px]">
            Your personal collection of favorite tracks, synced across sessions.
          </Text>
          <Text variant="caption" color="muted" className="text-xs">
            {likedTrackIds.length} {likedTrackIds.length === 1 ? 'song' : 'songs'}
          </Text>
        </Flex>
      </Flex>

      {/* Toolbar */}
      <Flex justify="between" align="center" className="pb-2 border-b border-[var(--border-default)]">
        <Button
          variant="primary"
          disabled={likedTracks.length === 0 || isLoading}
          onClick={handlePlayAll}
          leftIcon={<span>▶</span>}
          className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500 font-semibold px-6 py-2.5 text-xs shadow-md shadow-emerald-500/10"
        >
          Play All
        </Button>
        <Button
          variant="ghost"
          onClick={() => setCurrentView('home')}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold px-4 py-2"
        >
          Back to Home
        </Button>
      </Flex>

      {/* Track List */}
      <Flex direction="col" gap={4}>
        {isLoading ? (
          <Flex direction="col" gap={3} className="bg-[var(--bg-surface)] border border-[var(--border-default)] p-6 rounded-2xl">
            <Flex align="center" gap={3} className="px-1">
              <Box className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              <Text variant="body-sm" color="muted">
                Fetching details for your liked songs...
              </Text>
            </Flex>
          </Flex>
        ) : error ? (
          <Box className="w-full text-center py-8 rounded-2xl bg-red-500/[0.03] border border-red-500/10">
            <Text variant="body-sm" color="muted">
              {error}
            </Text>
          </Box>
        ) : likedTracks.length === 0 ? (
          <Box className="w-full text-center py-16 rounded-2xl bg-[var(--bg-surface)] border border-dashed border-[var(--border-default)]">
            <span className="text-4xl mb-4 block">🤍</span>
            <Heading level={3} size="sm" className="text-[var(--text-primary)] font-semibold mb-1">
              No liked songs yet
            </Heading>
            <Text variant="body-sm" color="muted" className="mb-6">
              Tap the heart icon on any track to save it here.
            </Text>
            <Button
              variant="primary"
              onClick={() => setCurrentView('search')}
              className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500 text-xs px-5 py-2"
            >
              Discover Tracks
            </Button>
          </Box>
        ) : (
          <Flex direction="col" gap={2} className="bg-[var(--bg-surface)] border border-[var(--border-default)] p-4 rounded-2xl">
            {likedTracks.map((track, idx) => (
              <TrackItem
                key={`liked-track-${track.videoId}-${idx}`}
                track={track}
                index={idx}
                contextQueue={likedTracks}
              />
            ))}
          </Flex>
        )}
      </Flex>
    </Container>
  );
}

'use client';

import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import Flex from '@/components/ui/layout/Flex';
import Box from '@/components/ui/layout/Box';
import Container from '@/components/ui/layout/Container';
import TrackItem from '@/components/TrackItem';
import { usePlayback, TRACK_DATABASE } from '@/context/PlaybackContext';

export default function LikedSongsView() {
  const { likedTrackIds, playAll, setCurrentView } = usePlayback();

  // Resolve Track objects from likedTrackIds
  const likedTracks = likedTrackIds
    .map((id) => TRACK_DATABASE.find((t) => t.videoId === id))
    .filter((t): t is typeof TRACK_DATABASE[0] => !!t);

  const handlePlayAll = () => {
    if (likedTracks.length === 0) return;
    playAll(likedTracks);
  };

  return (
    <Container className="px-6 py-8 max-w-[1000px] space-y-8 animate-[fadeIn_0.4s_ease_forwards]">
      {/* Header Banner */}
      <Flex direction="col" align="center" gap={6} className="bg-gradient-to-br from-emerald-950/20 via-neutral-900/60 to-black border border-white/5 p-6 sm:p-8 rounded-3xl select-none sm:flex-row">
        <Box className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-5xl shadow-lg shadow-emerald-500/25 flex-shrink-0 animate-pulse">
          ❤️
        </Box>
        <Flex direction="col" className="flex-1 min-w-0 text-center sm:text-left">
          <Text variant="caption" weight="bold" className="uppercase tracking-wider text-[10px] text-emerald-400">
            PLAYLIST
          </Text>
          <Heading level={2} size="xl" className="font-extrabold text-white mt-1 mb-2">
            Liked Songs
          </Heading>
          <Text variant="body-sm" color="muted" className="leading-relaxed mb-4 text-[13px]">
            Your personal collection of favorite tracks, synced across sessions.
          </Text>
          <Text variant="caption" color="muted" className="text-xs">
            {likedTracks.length} {likedTracks.length === 1 ? 'song' : 'songs'}
          </Text>
        </Flex>
      </Flex>

      {/* Toolbar */}
      <Flex justify="between" align="center" className="pb-2 border-b border-white/5">
        <Button
          variant="primary"
          disabled={likedTracks.length === 0}
          onClick={handlePlayAll}
          leftIcon={<span>▶</span>}
          className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500 font-semibold px-6 py-2.5 text-xs shadow-md shadow-emerald-500/10"
        >
          Play All
          </Button>
        <Button
          variant="ghost"
          onClick={() => setCurrentView('home')}
          className="text-gray-400 hover:text-white text-xs font-semibold px-4 py-2"
        >
          Back to Home
        </Button>
      </Flex>

      {/* Track List */}
      <Flex direction="col" gap={4}>
        {likedTracks.length === 0 ? (
          <Box className="w-full text-center py-16 rounded-2xl bg-white/[0.01] border border-dashed border-white/5">
            <span className="text-4xl mb-4 block">🤍</span>
            <Heading level={3} size="sm" className="text-white font-semibold mb-1">
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
          <Flex direction="col" gap={2} className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
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

'use client';

import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import Flex from '@/components/ui/layout/Flex';
import Box from '@/components/ui/layout/Box';
import Container from '@/components/ui/layout/Container';
import TrackItem from '@/components/TrackItem';
import { usePlayback } from '@/context/PlaybackContext';
import { useRouter } from 'next/navigation';

export default function HistoryView() {
  const { history, playAll } = usePlayback();
  const router = useRouter();

  const handlePlayAll = () => {
    if (history.length === 0) return;
    playAll(history);
  };

  return (
    <Container className="px-6 py-8 max-w-[1000px] space-y-8 animate-[fadeIn_0.4s_ease_forwards]">
      {/* Header Banner */}
      <Flex direction="col" align="center" gap={6} className="bg-gradient-to-br from-neutral-950/20 via-neutral-900/60 to-black border border-white/5 p-6 sm:p-8 rounded-3xl select-none sm:flex-row">
        <Box className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-5xl shadow-lg flex-shrink-0">
          🕰️
        </Box>
        <Flex direction="col" className="flex-1 min-w-0 text-center sm:text-left">
          <Text variant="caption" weight="bold" color="muted" className="uppercase tracking-wider text-[10px] text-gray-400">
            PLAYBACK
          </Text>
          <Heading level={2} size="xl" className="font-extrabold text-white mt-1 mb-2">
            Recently Played
          </Heading>
          <Text variant="body-sm" color="muted" className="leading-relaxed mb-4 text-[13px]">
            Review and re-play your recently streamed tracks.
          </Text>
          <Text variant="caption" color="muted" className="text-xs">
            {history.length} {history.length === 1 ? 'track' : 'tracks'}
          </Text>
        </Flex>
      </Flex>

      {/* Toolbar */}
      <Flex justify="between" align="center" className="pb-2 border-b border-white/5">
        <Button
          variant="primary"
          disabled={history.length === 0}
          onClick={handlePlayAll}
          leftIcon={<span>▶</span>}
          className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500 font-semibold px-6 py-2.5 text-xs shadow-md shadow-emerald-500/10"
        >
          Play All
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="text-gray-400 hover:text-white text-xs font-semibold px-4 py-2"
        >
          Back to Home
        </Button>
      </Flex>

      {/* Track List */}
      <Flex direction="col" gap={4}>
        {history.length === 0 ? (
          <Box className="w-full text-center py-16 rounded-2xl bg-white/[0.01] border border-dashed border-white/5">
            <span className="text-4xl mb-4 block">🎧</span>
            <Heading level={3} size="sm" className="text-white font-semibold mb-1">
              No playback history
            </Heading>
            <Text variant="body-sm" color="muted" className="mb-6">
              Tracks you stream will be cataloged here automatically.
            </Text>
            <Button
              variant="primary"
              onClick={() => router.push('/search')}
              className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500 text-xs px-5 py-2"
            >
              Start Streaming
            </Button>
          </Box>
        ) : (
          <Flex direction="col" gap={2} className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
            {history.map((track, idx) => (
              <TrackItem
                key={`history-track-${track.videoId}-${idx}`}
                track={track}
                index={idx}
                contextQueue={history}
              />
            ))}
          </Flex>
        )}
      </Flex>
    </Container>
  );
}

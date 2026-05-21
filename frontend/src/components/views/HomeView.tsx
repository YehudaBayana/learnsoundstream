'use client';

import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/layout/Container';
import Flex from '@/components/ui/layout/Flex';
import Box from '@/components/ui/layout/Box';
import ServerStatus from '@/components/ServerStatus';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import TrackItem from '@/components/TrackItem';
import { usePlayback, TRACK_DATABASE } from '@/context/PlaybackContext';

export default function HomeView() {
  const { playTrack, history } = usePlayback();

  // Define featured tracks subset from database
  const featuredTracks = TRACK_DATABASE.slice(0, 4);

  const handleStartListening = () => {
    if (featuredTracks.length > 0) {
      playTrack(featuredTracks[0], TRACK_DATABASE);
    }
  };

  return (
    <Container className="px-6 py-8 max-w-[1200px] space-y-12">
      {/* Premium Dashboard Welcome Banner */}
      <Box
        className="w-full relative rounded-3xl overflow-hidden p-8 sm:p-10 border border-white/5 bg-gradient-to-br from-emerald-950/20 via-neutral-900/60 to-black shadow-2xl animate-[fadeIn_0.5s_ease_forwards]"
      >
        <Box className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_40%)]" />
        
        <Flex direction="col" align="start" className="relative z-10 max-w-[600px]">
          <Heading level={2} size="xl" className="text-emerald-400 font-bold mb-2">
            Welcome to Soundstream
          </Heading>
          <Heading level={3} size="2xl" className="text-white font-extrabold mb-4 leading-tight">
            High-Performance Audio Piping
          </Heading>
          <Text variant="body" color="muted" className="mb-6 leading-relaxed">
            Experience high-fidelity, real-time audio streamed directly through a custom Go backend. No pre-buffered cache, zero storage overhead.
          </Text>
          <Button
            variant="primary"
            onClick={handleStartListening}
            className="rounded-full px-6 py-2.5 font-semibold bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500 transition-all duration-300 shadow-lg shadow-emerald-500/20"
          >
            Start Listening
          </Button>
        </Flex>
      </Box>

      {/* Server Status Widget */}
      <ServerStatus />

      {/* Grid for Featured Tracks & Recently Played */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Featured Tracks Showcase (Using unified TrackItem) */}
        <Flex direction="col" gap={4}>
          <Flex align="center" justify="between" className="px-1">
            <Heading level={3} size="md" className="font-bold text-white">
              Featured Showcase
            </Heading>
            <Text variant="caption" color="muted">
              Handpicked Jams
            </Text>
          </Flex>

          <Flex direction="col" gap={2} className="bg-white/[0.015] border border-white/5 p-4 rounded-2xl">
            {featuredTracks.map((track, idx) => (
              <TrackItem
                key={track.videoId}
                track={track}
                index={idx}
                contextQueue={featuredTracks}
              />
            ))}
          </Flex>
        </Flex>

        {/* Recently Played */}
        <Flex direction="col" gap={4}>
          <Flex align="center" justify="between" className="px-1">
            <Heading level={3} size="md" className="font-bold text-white">
              Recently Played
            </Heading>
            {history.length > 0 && (
              <Text variant="caption" color="muted">
                Your History
              </Text>
            )}
          </Flex>

          <Flex direction="col" gap={2} className="bg-white/[0.015] border border-white/5 p-4 rounded-2xl justify-center min-h-[220px]">
            {history.length === 0 ? (
              <Flex direction="col" align="center" justify="center" className="text-center py-8">
                <span className="text-3xl mb-3 opacity-60">🕰️</span>
                <Text variant="body-sm" color="muted">
                  No playback history yet.
                </Text>
                <Text variant="caption" color="muted" className="text-[11px] mt-1">
                  Tracks you play will show up here.
                </Text>
              </Flex>
            ) : (
              history.slice(0, 4).map((track, idx) => (
                <TrackItem
                  key={`history-${track.videoId}-${idx}`}
                  track={track}
                  index={idx}
                  contextQueue={history}
                />
              ))
            )}
          </Flex>
        </Flex>
      </div>

      {/* Value Propositions */}
      <Features />

      {/* Global Footer */}
      <Footer />
    </Container>
  );
}

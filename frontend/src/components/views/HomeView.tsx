'use client';

import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/layout/Container';
import Flex from '@/components/ui/layout/Flex';
import ServerStatus from '@/components/ServerStatus';
import Footer from '@/components/Footer';
import TrackItem from '@/components/TrackItem';
import { usePlayback } from '@/context/PlaybackContext';

export default function HomeView() {
  const { playTrack, history } = usePlayback();

  return (
    <Container className="px-6 py-8 max-w-[1200px] space-y-12">
      {/* Premium Dashboard Welcome Banner */}
      

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

     

      {/* Global Footer */}
      <Footer />
    </Container>
  );
}

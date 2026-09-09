'use client';

import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/layout/Container';
import Flex from '@/components/ui/layout/Flex';
import Grid from '@/components/ui/layout/Grid';
import { Track } from '@/types';
import Image from './ui/Image';

export const FEATURED_TRACKS: Track[] = [];

interface TrackShowcaseProps {
  onPlayTrack: (videoId: string, title: string) => void;
  activeVideoId?: string;
}

export default function TrackShowcase({ onPlayTrack, activeVideoId }: TrackShowcaseProps) {
  return (
    <Container as="section" className="max-w-[1200px] py-16 scroll-mt-20">
      <Flex direction="col" align="center" className="text-center mb-12">
        <Heading level={2} size="3xl" className="text-white font-bold mb-4">
          Featured Showcase
        </Heading>
        <Text variant="body" color="muted" className="max-w-[600px] mx-auto">
          Click play to stream audio live through our Go server. No pre-buffered files, zero storage bloat.
        </Text>
      </Flex>

      <Grid cols={3} colsMobile={1} colsTablet={2} gap={6} className="mt-10">
        {FEATURED_TRACKS.map((track, i) => {
          const isActive = track.id === activeVideoId;
          return (
            <Flex 
              key={i} 
              direction="col"
              justify="between"
              gap={5}
              className={`p-6 rounded-2xl bg-white/[0.015] border backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.035] hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] group ${
                isActive 
                  ? "border-emerald-500 shadow-[0_15px_30px_rgba(16,185,129,0.15)] bg-white/[0.035]" 
                  : "border-white/8 hover:border-emerald-500"
              }`}
            >
              {/* Header: Cover & Category Badge */}
              <Flex justify="between" align="start">
                <Image 
                  src={track.thumbnails[0].url}
                  alt={track.title}
                  width={64}
                  height={64}
                  className="w-14 h-14 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-3xl shadow-md transition-transform duration-300 group-hover:rotate-[-3deg] group-hover:scale-105 select-none"
                />
              </Flex>
              
              {/* Body: Title & Description */}
              <Flex direction="col" gap={2} className="flex-1 mt-2">
                <Heading level={3} size="md" className={`font-semibold truncate group-hover:text-emerald-400 transition-colors duration-200 ${isActive ? "text-emerald-400" : "text-white"}`}>
                  {track.title}
                </Heading>
                <Text variant="body-sm" color="muted" className="text-[13px] leading-relaxed line-clamp-3">
                  {track.channel}
                </Text>
              </Flex>

              {/* Footer: Duration & Play Button */}
              <Flex justify="between" align="center" className="mt-4 pt-3 border-t border-white/5">
                <Text variant="small" color="muted" className="font-mono tracking-wider">
                  {track.duration}
                </Text>
                <Button
                  variant={isActive ? "primary" : "outline"}
                  size="sm"
                  onClick={() => onPlayTrack(track.id, track.title)}
                  leftIcon={<span className="text-[10px]">{isActive ? "🔊" : "▶"}</span>}
                  className={`rounded-full py-1.5 px-4 text-xs font-semibold transition-all duration-200 ${
                    isActive 
                      ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 hover:text-white" 
                      : "text-white border-white/10 bg-white/[0.02] hover:bg-white hover:text-black hover:border-white"
                  }`}
                >
                  {isActive ? "Playing" : "Play Now"}
                </Button>
              </Flex>
            </Flex>
          );
        })}
      </Grid>
    </Container>
  );
}

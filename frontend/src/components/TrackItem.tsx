'use client';

import React from 'react';
import Text from '@/components/ui/Text';
import IconButton from '@/components/ui/IconButton';
import Badge from '@/components/ui/Badge';
import Flex from '@/components/ui/layout/Flex';
import Box from '@/components/ui/layout/Box';
import Menu from '@/components/ui/Menu';
import { usePlaybackStore } from '@/store/usePlaybackStore';
import { useLibraryStore } from '@/store/useLibraryStore';
import { Track } from '@/types';
import Image from './ui/Image';

interface TrackItemProps {
  track: Track;
  index?: number;
  showCover?: boolean;
  showCategory?: boolean;
  playlistId?: string; // If in a playlist context, we can support removal
}

export default function TrackItem({
  track,
  index,
  showCover = true,
  showCategory = true,
  playlistId,
}: TrackItemProps) {
  const currentTrack  = usePlaybackStore((s) => s.currentTrack);
  const isPlaying     = usePlaybackStore((s) => s.isPlaying);
  const playTrack     = usePlaybackStore((s) => s.playTrack);
  const setPlaying    = usePlaybackStore((s) => s.setPlaying);
  const likedTrackIds = useLibraryStore((s) => s.likedTrackIds);
  const toggleLike    = useLibraryStore((s) => s.toggleLike);

  const isCurrent = currentTrack?.id === track.id;
  const isLiked = likedTrackIds.includes(track.id);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      setPlaying(!isPlaying);
    } else {
      playTrack(track);
    }
  };

  return (
    <Flex
      align="center"
      justify="between"
      gap={4}
      className={`group w-full p-3 rounded-xl border border-transparent transition-all duration-200 select-none hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-default)] ${
        isCurrent ? 'bg-[var(--bg-surface)] border-[var(--border-default)]' : ''
      }`}
    >
      {/* Left Part: Play/Index, Cover, Title */}
      <Flex align="center" gap={4} className="min-w-0 flex-1">
        {/* Play Button or Index */}
        <Box className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
          {isCurrent ? (
            <IconButton
              size="xs"
              variant="ghost"
              onClick={handlePlayClick}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="text-emerald-400 group-hover:scale-110 transition-transform"
              icon={<span>{isPlaying ? '⏸' : '▶'}</span>}
            />
          ) : (
            <>
              {index !== undefined && (
                <Text
                  variant="body-sm"
                  color="muted"
                  className="font-mono group-hover:hidden transition-all duration-100"
                >
                  {String(index + 1).padStart(2, '0')}
                </Text>
              )}
              <IconButton
                size="xs"
                variant="ghost"
                onClick={handlePlayClick}
                aria-label="Play"
                className="hidden group-hover:flex text-white hover:text-emerald-400 group-hover:scale-110 transition-transform"
                icon={<span>▶</span>}
              />
            </>
          )}
        </Box>

        {/* Emoji Cover Icon */}
        {showCover && (
          <Flex
            align="center"
            justify="center"
            className={`w-10 h-10 rounded-lg flex-shrink-0 text-xl bg-gradient-to-br transition-all duration-300 ${
              isCurrent
                ? 'from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rotate-[-2deg] scale-105 shadow-[0_4px_12px_rgba(16,185,129,0.15)]'
                : 'from-[var(--bg-surface-hover)] to-[var(--bg-surface)] border border-[var(--border-default)] group-hover:from-[var(--bg-surface-active)] group-hover:rotate-[-2deg] group-hover:scale-105'
            }`}
          >
            <Image
              src={track.thumbnails?.[track.thumbnails.length - 1].url}
              alt={track.title}
              className="w-full h-full object-cover"
            />
          </Flex>
        )}

        {/* Text Info */}
        <Flex direction="col" className="min-w-0 flex-1">
          <Text
            variant="body-sm"
            weight={isCurrent ? 'semibold' : 'medium'}
            truncate
            className={`transition-colors duration-200 ${
              isCurrent ? 'text-emerald-400' : 'text-[var(--text-primary)] group-hover:text-emerald-400'
            }`}
          >
            {track.title}
          </Text>
        </Flex>
      </Flex>

      {/* Middle/Right Part: Category and Actions */}
      <Flex align="center" gap={4} className="flex-shrink-0">
        {/* Category Badge */}
        {/* {showCategory && (
          <Box className="hidden sm:block">
            <Badge
              variant="default"
              outlined
              size="sm"
              className="border-[var(--border-default)] text-[var(--text-secondary)] bg-[var(--bg-surface)] rounded-full"
            >
              {track.category}
            </Badge>
          </Box>
        )} */}

        {/* Duration */}
        <Text variant="small" color="muted" className="font-mono text-xs tracking-wider select-none w-10 text-right">
          {track.duration}
        </Text>

        {/* Like Heart Button */}
        <IconButton
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(track.id);
          }}
          aria-label={isLiked ? 'Unlike' : 'Like'}
          className={`transition-colors duration-200 ${
            isLiked
              ? 'text-emerald-500 hover:text-emerald-400'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] opacity-0 group-hover:opacity-100'
          }`}
          icon={<span>{isLiked ? '❤️' : '🤍'}</span>}
        />

        {/* Playlist Action Menu */}
        <Menu
          placement="bottom-end"
          trigger={
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Track options"
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] opacity-0 group-hover:opacity-100"
              icon={<span>⋮</span>}
            />
          }
        >
          <Menu.Label>Playlists</Menu.Label>

          {playlistId && (
            <>
              <Menu.Divider />
              <Menu.Item
                danger
                icon={<span>✕</span>}
              >
                Remove from Playlist
              </Menu.Item>
            </>
          )}
        </Menu>
      </Flex>
    </Flex>
  );
}

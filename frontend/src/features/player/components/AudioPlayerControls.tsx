import type { ChangeEvent, RefObject } from "react";
import Box from "@/components/ui/layout/Box";
import Flex from "@/components/ui/layout/Flex";
import IconButton from "@/components/ui/IconButton";
import Slider from "@/components/ui/Slider";
import Text from "@/components/ui/Text";
import { convertSecondsToTime } from "@/shared/utils";
import type { Track } from "@/types/global.types";

interface AudioPlayerControlsProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  error: string | null;
  progressRef: RefObject<HTMLInputElement | null>;
  onPlayPause: () => void;
  onSeek: (event: ChangeEvent<HTMLInputElement>) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export default function AudioPlayerControls({
  currentTrack,
  isPlaying,
  isLoading,
  currentTime,
  duration,
  error,
  progressRef,
  onPlayPause,
  onSeek,
  onDragStart,
  onDragEnd,
}: AudioPlayerControlsProps) {
  return (
    <Flex
      direction="col"
      align="center"
      gap={1}
      className="w-[40%] min-w-[280px]"
    >
      <Flex align="center" gap={4}>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Previous track"
          disabled={!currentTrack}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
        >
          <span>⏮</span>
        </IconButton>

        <IconButton
          variant="primary"
          size="md"
          rounded
          onClick={onPlayPause}
          disabled={!currentTrack || isLoading}
          aria-label={isPlaying ? "Pause" : "Play"}
          loading={isLoading}
          className="bg-[var(--text-primary)] text-[var(--bg-primary)] hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-md scale-105 active:scale-95"
        >
          <span>{isPlaying ? "⏸" : "▶"}</span>
        </IconButton>

        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Next track"
          disabled={!currentTrack}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
        >
          <span>⏭</span>
        </IconButton>
      </Flex>

      <Flex align="center" gap={3} className="w-full">
        <Text
          variant="caption"
          color="muted"
          className="w-[45px] text-center font-mono text-[11px] select-none"
        >
          {convertSecondsToTime(currentTime)}
        </Text>
        <Box className="flex-1">
          <Slider
            ref={progressRef}
            size="sm"
            color="primary"
            min={0}
            max={currentTrack?.duration || duration || 100}
            value={currentTime}
            onChange={onSeek}
            onMouseDown={onDragStart}
            onTouchStart={onDragStart}
            onMouseUp={onDragEnd}
            onTouchEnd={onDragEnd}
            disabled={!currentTrack || isLoading}
            className="w-full"
          />
        </Box>
        <Text
          variant="caption"
          color="muted"
          className="w-[35px] text-center font-mono text-[11px] select-none"
        >
          {currentTrack?.duration
            ? convertSecondsToTime(currentTrack.duration)
            : "0:00"}
        </Text>
      </Flex>

      {error && (
        <Text
          variant="small"
          color="danger"
          weight="medium"
          className="text-[11px] -mt-1 select-none"
        >
          {error}
        </Text>
      )}
    </Flex>
  );
}

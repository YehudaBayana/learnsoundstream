"use client";

import { useState, useEffect, useRef } from "react";
import { apiUrl } from "@/constants";
import Text from "@/components/ui/Text";
import IconButton from "@/components/ui/IconButton";
import Slider from "@/components/ui/Slider";
import Flex from "@/components/ui/layout/Flex";
import Box from "@/components/ui/layout/Box";
import { usePlaybackStore } from "@/store/usePlaybackStore";

// Helper to convert "M:SS", "MM:SS" or "H:MM:SS" into seconds
const parseDurationString = (durStr?: string): number => {
  if (!durStr) return 0;
  const parts = durStr.split(":");
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  if (parts.length === 3) {
    return (
      parseInt(parts[0], 10) * 3600 +
      parseInt(parts[1], 10) * 60 +
      parseInt(parts[2], 10)
    );
  }
  return parseFloat(durStr) || 0;
};

export default function AudioPlayer() {
  const currentTrack = usePlaybackStore((s) => s.currentTrack);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const setPlaying = usePlaybackStore((s) => s.setPlaying);
  const nextTrack = usePlaybackStore((s) => s.nextTrack);
  const prevTrack = usePlaybackStore((s) => s.prevTrack);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Seek position tracking
  const [seekTime, setSeekTime] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLInputElement>(null);

  const trackDuration = currentTrack
    ? parseDurationString(currentTrack.duration)
    : 0;

  // Reset seek and current time when track changes
  useEffect(() => {
    setSeekTime(0);
    setCurrentTime(0);
  }, [currentTrack?.id]);

  // Sync state with HTML5 audio player
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Audio playback failed or was interrupted:", err);
          setPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack?.id, seekTime, setPlaying]);

  // Handle mute synchronization
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Handle volume synchronization
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Formatter for time display (e.g. 03:45)
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handlePlayPause = () => {
    if (!currentTrack) return;
    setPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      setCurrentTime(seekTime + audioRef.current.currentTime);
    }
  };

  const handleDurationChange = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleAudioCanPlay = () => {
    setIsLoading(false);
  };

  const handleAudioError = () => {
    setIsLoading(false);
    setError("Failed to fetch audio stream from server.");
    setPlaying(false);
  };

  const performSeek = (newTime: number) => {
    setSeekTime(newTime);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    performSeek(currentTime);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (!isDragging) {
      performSeek(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <Flex
      align="center"
      className={`fixed left-4 right-4 md:left-[284px] md:right-6 h-[84px] z-[999] px-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-player)] backdrop-blur-xl shadow-[var(--shadow-player)] transition-all duration-500 cubic-bezier(0.16,1,0.3,1) ${
        currentTrack?.id
          ? "bottom-6 opacity-100 pointer-events-auto"
          : "-bottom-[150px] opacity-0 pointer-events-none"
      }`}
    >
      {currentTrack?.id && (
        <audio
          ref={audioRef}
          src={`${apiUrl}/api/stream?v=${currentTrack.id}${seekTime > 0 ? `&ss=${seekTime}` : ""}`}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onLoadStart={handleAudioLoadStart}
          onCanPlay={handleAudioCanPlay}
          onError={handleAudioError}
          onEnded={nextTrack}
        />
      )}

      <Flex justify="between" align="center" gap={6} className="w-full">
        {/* Left: Track Information */}
        <Flex
          align="center"
          gap={4}
          className="w-[30%] min-w-[200px] overflow-hidden"
        >
          {/* Visualizer bars */}
          <Flex
            align="end"
            gap={1}
            className="gap-[3px] h-5 w-6 select-none flex-shrink-0"
          >
            <span
              className={`w-[3px] bg-emerald-500 rounded-full transition-all duration-300 ${
                isPlaying
                  ? "animate-[bounce-bar_0.8s_ease_infinite_alternate] h-5"
                  : "h-1"
              }`}
            />
            <span
              className={`w-[3px] bg-emerald-500 rounded-full transition-all duration-300 ${
                isPlaying
                  ? "animate-[bounce-bar_0.5s_ease_infinite_alternate_0.15s] h-5"
                  : "h-1"
              }`}
            />
            <span
              className={`w-[3px] bg-emerald-500 rounded-full transition-all duration-300 ${
                isPlaying
                  ? "animate-[bounce-bar_0.7s_ease_infinite_alternate_0.3s] h-5"
                  : "h-1"
              }`}
            />
            <span
              className={`w-[3px] bg-emerald-500 rounded-full transition-all duration-300 ${
                isPlaying
                  ? "animate-[bounce-bar_0.6s_ease_infinite_alternate_0.05s] h-5"
                  : "h-1"
              }`}
            />
          </Flex>
          <Flex direction="col" className="min-w-0 select-none">
            <Box className="overflow-hidden text-ellipsis whitespace-nowrap">
              <Text
                variant="body-sm"
                weight="semibold"
                color="default"
                truncate
                className="text-[var(--text-primary)]"
              >
                {currentTrack?.title || "No track playing"}
              </Text>
            </Box>
            <Text variant="caption" color="muted" truncate>
              {isLoading
                ? "Streaming from Go API..."
                : error
                  ? "Error"
                  : "YouTube Soundstream"}
            </Text>
          </Flex>
        </Flex>

        {/* Center: Playback Controls & Progress Bar */}
        <Flex
          direction="col"
          align="center"
          gap={1}
          className="w-[40%] min-w-[280px]"
        >
          <Flex align="center" gap={4}>
            {/* Previous Button */}
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Previous track"
              disabled={!currentTrack}
              onClick={prevTrack}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
            >
              <span>⏮</span>
            </IconButton>

            {/* Play / Pause Button */}
            <IconButton
              variant="primary"
              size="md"
              rounded
              onClick={handlePlayPause}
              disabled={!currentTrack || isLoading}
              aria-label={isPlaying ? "Pause" : "Play"}
              loading={isLoading}
              className="bg-[var(--text-primary)] text-[var(--bg-primary)] hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-md scale-105 active:scale-95"
            >
              <span>{isPlaying ? "⏸" : "▶"}</span>
            </IconButton>

            {/* Next Button */}
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Next track"
              disabled={!currentTrack}
              onClick={nextTrack}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
            >
              <span>⏭</span>
            </IconButton>
          </Flex>

          <Flex align="center" gap={3} className="w-full">
            <Text
              variant="caption"
              color="muted"
              className="w-[35px] text-center font-mono text-[11px] select-none"
            >
              {formatTime(currentTime)}
            </Text>
            <Box className="flex-1">
              <Slider
                ref={progressRef}
                size="sm"
                color="primary"
                min={0}
                max={trackDuration || duration || 100}
                value={currentTime}
                onChange={handleSeek}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                onMouseUp={handleDragEnd}
                onTouchEnd={handleDragEnd}
                disabled={!currentTrack || isLoading}
                className="w-full"
              />
            </Box>
            <Text
              variant="caption"
              color="muted"
              className="w-[35px] text-center font-mono text-[11px] select-none"
            >
              {trackDuration > 0
                ? formatTime(trackDuration)
                : duration > 0
                  ? formatTime(duration)
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

        {/* Right: Volume & Utilities */}
        <Flex
          justify="end"
          align="center"
          gap={4}
          className="w-[30%] min-w-[150px]"
        >
          <Flex align="center" gap={2}>
            <IconButton
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              disabled={!currentTrack}
              aria-label={isMuted ? "Unmute" : "Mute"}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
            >
              <span>
                {isMuted || volume === 0
                  ? "🔇"
                  : volume < 0.4
                    ? "🔈"
                    : volume < 0.7
                      ? "🔉"
                      : "🔊"}
              </span>
            </IconButton>
            <Slider
              size="sm"
              color="secondary"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              disabled={!currentTrack}
              className="w-20"
            />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

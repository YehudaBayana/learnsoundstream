"use client";

import { useState, useEffect, useRef } from "react";
import Flex from "@/components/ui/layout/Flex";
import { useMSEPlayer } from "../hooks/useMSEPlayer";
import { usePlaybackStore } from "@/features/player/store/usePlaybackStore";
import AudioPlayerTrackInfo from "./audio-player-track-info/AudioPlayerTrackInfo";
import AudioPlayerControls from "./audio-player-controls/AudioPlayerControls";
import AudioPlayerVolume from "./audio-player-volume/AudioPlayerVolume";

interface AudioPlayerProps {
  dataHook?: string;
}

export default function AudioPlayer({ dataHook = "audio-player" }: AudioPlayerProps) {
  const currentTrack = usePlaybackStore((s) => s.currentChosenTrack);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const setPlaying = usePlaybackStore((s) => s.setPlaying);
  const [playbackPosition, setPlaybackPosition] = useState<{
    trackId: string | undefined;
    time: number;
  }>({ trackId: currentTrack?.id, time: 0 });
  const currentTime =
    playbackPosition.trackId === currentTrack?.id ? playbackPosition.time : 0;
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const duration = audioDuration ?? currentTrack?.duration ?? 0;
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLInputElement>(null);

  useMSEPlayer(audioRef, currentTrack?.id);

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
  }, [isPlaying, currentTrack?.id, setPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handlePlayPause = () => {
    if (!currentTrack) return;
    setPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      setPlaybackPosition({
        trackId: currentTrack?.id,
        time: audioRef.current.currentTime,
      });
    }
  };

  const handleDurationChange = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
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

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (audioRef.current) {
      audioRef.current.currentTime = currentTime;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setPlaybackPosition({ trackId: currentTrack?.id, time: newTime });
    if (!isDragging && audioRef.current) {
      audioRef.current.currentTime = newTime;
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

  const handleAudioEnded = () => {
    setPlaying(false);
    setPlaybackPosition({ trackId: currentTrack?.id, time: 0 });
  };

  return (
    <Flex
      align="center"
      className={`fixed left-4 right-4 md:left-[284px] md:right-6 h-[84px] z-[999] px-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-player)] backdrop-blur-xl shadow-[var(--shadow-player)] transition-all duration-500 cubic-bezier(0.16,1,0.3,1) ${
        currentTrack?.id
          ? "bottom-6 opacity-100 pointer-events-auto"
          : "-bottom-[150px] opacity-0 pointer-events-none"
      }`}
      dataHook={dataHook}
    >
      {currentTrack?.id && (
        <audio
          ref={audioRef}
          data-hook={`${dataHook}-audio`}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onLoadStart={handleAudioLoadStart}
          onCanPlay={handleAudioCanPlay}
          onError={handleAudioError}
          onEnded={handleAudioEnded}
        />
      )}

      <Flex justify="between" align="center" gap={6} className="w-full">
        <AudioPlayerTrackInfo
          dataHook={`${dataHook}-track-info`}
          track={currentTrack}
          isPlaying={isPlaying}
          isLoading={isLoading}
          hasError={Boolean(error)}
        />
        <AudioPlayerControls
          dataHook={`${dataHook}-controls`}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          isLoading={isLoading}
          currentTime={currentTime}
          duration={duration}
          error={error}
          progressRef={progressRef}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
        <AudioPlayerVolume
          dataHook={`${dataHook}-volume`}
          hasTrack={Boolean(currentTrack)}
          isMuted={isMuted}
          volume={volume}
          onToggleMute={toggleMute}
          onVolumeChange={handleVolumeChange}
        />
      </Flex>
    </Flex>
  );
}

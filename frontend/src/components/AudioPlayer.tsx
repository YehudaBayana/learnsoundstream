'use client';

import { useState, useEffect, useRef } from 'react';
import { apiUrl } from '@/constants';
import Text from '@/components/ui/Text';
import IconButton from '@/components/ui/IconButton';
import Slider from '@/components/ui/Slider';
import Flex from '@/components/ui/layout/Flex';
import Box from '@/components/ui/layout/Box';

interface Track {
  videoId: string;
  title: string;
}

export default function AudioPlayer() {
  const [videoId, setVideoId] = useState<string>('');
  const [trackTitle, setTrackTitle] = useState<string>('Select a track to play');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLInputElement>(null);

  // Decoupled listener: allows any component to trigger a song via window event
  useEffect(() => {
    const handlePlaySong = (e: Event) => {
      const customEvent = e as CustomEvent<Track>;
      const { videoId, title } = customEvent.detail;
      if (videoId) {
        setVideoId(videoId);
        setTrackTitle(title);
        setIsPlaying(true);
        setError(null);
        setIsLoading(true);
      }
    };

    window.addEventListener('play-song', handlePlaySong);
    return () => {
      window.removeEventListener('play-song', handlePlaySong);
    };
  }, []);

  // Sync state with HTML5 audio player
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio playback failed or was interrupted:', err);
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, videoId]);

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
    if (isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handlePlayPause = () => {
    if (!videoId) return;
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
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
    setError('Failed to fetch audio stream from server.');
    setIsPlaying(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
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

  return (
    <Flex 
      align="center"
      className={`fixed left-6 right-6 h-[84px] z-[999] px-6 rounded-2xl border border-white/8 bg-black/40 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-500 cubic-bezier(0.16,1,0.3,1) ${
        videoId ? 'bottom-6 opacity-100 pointer-events-auto' : '-bottom-[150px] opacity-0 pointer-events-none'
      }`}
    >
      {videoId && (
        <audio
          ref={audioRef}
          src={`${apiUrl}/api/stream?v=${videoId}`}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onLoadStart={handleAudioLoadStart}
          onCanPlay={handleAudioCanPlay}
          onError={handleAudioError}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      <Flex justify="between" align="center" gap={6} className="w-full">
        {/* Left: Track Information */}
        <Flex align="center" gap={4} className="w-[30%] min-w-[220px] overflow-hidden">
          {/* Animated visualizer bars in Tailwind */}
          <Flex align="end" gap={1} className="gap-[3px] h-5 w-6 select-none">
            <span className={`w-[3px] bg-emerald-500 rounded-full transition-all duration-300 ${
              isPlaying ? 'animate-[bounce-bar_0.8s_ease_infinite_alternate] h-5' : 'h-1'
            }`} />
            <span className={`w-[3px] bg-emerald-500 rounded-full transition-all duration-300 ${
              isPlaying ? 'animate-[bounce-bar_0.5s_ease_infinite_alternate_0.15s] h-5' : 'h-1'
            }`} />
            <span className={`w-[3px] bg-emerald-500 rounded-full transition-all duration-300 ${
              isPlaying ? 'animate-[bounce-bar_0.7s_ease_infinite_alternate_0.3s] h-5' : 'h-1'
            }`} />
            <span className={`w-[3px] bg-emerald-500 rounded-full transition-all duration-300 ${
              isPlaying ? 'animate-[bounce-bar_0.6s_ease_infinite_alternate_0.05s] h-5' : 'h-1'
            }`} />
          </Flex>
          <Flex direction="col" className="min-w-0 select-none">
            <Box className="overflow-hidden text-ellipsis whitespace-nowrap">
              <Text variant="body-sm" weight="semibold" color="default" truncate className="text-white">
                {trackTitle}
              </Text>
            </Box>
            <Text variant="caption" color="muted">
              {isLoading ? 'Streaming from Go API...' : error ? 'Error' : 'YouTube Soundstream'}
            </Text>
          </Flex>
        </Flex>

        {/* Center: Playback Controls & Progress Bar */}
        <Flex direction="col" align="center" gap={1} className="w-[40%] min-w-[280px]">
          <Flex align="center" gap={4}>
            <IconButton 
              variant="ghost"
              size="sm"
              aria-label="Shuffle"
              disabled={!videoId}
              className="text-gray-400 hover:text-white"
            >
              🔀
            </IconButton>
            <IconButton 
              variant="ghost"
              size="sm"
              aria-label="Previous track"
              disabled={!videoId}
              className="text-gray-400 hover:text-white"
            >
              ⏮
            </IconButton>
            
            <IconButton
              variant="primary"
              size="md"
              rounded
              onClick={handlePlayPause}
              disabled={!videoId || isLoading}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              loading={isLoading}
              className="bg-white text-black hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-md"
            >
              {isPlaying ? '⏸' : '▶'}
            </IconButton>

            <IconButton 
              variant="ghost"
              size="sm"
              aria-label="Next track"
              disabled={!videoId}
              className="text-gray-400 hover:text-white"
            >
              ⏭
            </IconButton>
            <IconButton 
              variant="ghost"
              size="sm"
              aria-label="Repeat"
              disabled={!videoId}
              className="text-gray-400 hover:text-white"
            >
              🔁
            </IconButton>
          </Flex>

          <Flex align="center" gap={3} className="w-full">
            <Text variant="caption" color="muted" className="w-[35px] text-center font-mono text-[11px] select-none">
              {formatTime(currentTime)}
            </Text>
            <Box className="flex-1">
              <Slider
                ref={progressRef}
                size="sm"
                color="primary"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                disabled={!videoId || isLoading}
                className="w-full"
              />
            </Box>
            <Text variant="caption" color="muted" className="w-[35px] text-center font-mono text-[11px] select-none">
              {duration > 0 ? formatTime(duration) : '0:00'}
            </Text>
          </Flex>
          
          {error && (
            <Text variant="small" color="danger" weight="medium" className="text-[11px] -mt-1 select-none">
              {error}
            </Text>
          )}
        </Flex>

        {/* Right: Volume & Utilities */}
        <Flex justify="end" align="center" gap={4} className="w-[30%] min-w-[150px]">
          <Flex align="center" gap={2}>
            <IconButton 
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              disabled={!videoId}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              className="text-gray-400 hover:text-white"
            >
              {isMuted || volume === 0 ? '🔇' : volume < 0.4 ? '🔈' : volume < 0.7 ? '🔉' : '🔊'}
            </IconButton>
            <Slider
              size="sm"
              color="secondary"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              disabled={!videoId}
              className="w-20"
            />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

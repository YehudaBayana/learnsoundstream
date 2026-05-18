'use client';

import { useState, useEffect, useRef } from 'react';
import { apiUrl } from '@/constants';

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

  // Helper percentage for dynamic styling of range input sliders
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  return (
    <div className={`audio-player-container glass ${videoId ? 'active' : ''}`}>
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

      <div className="player-inner">
        {/* Left: Track Information */}
        <div className="player-track-info">
          <div className={`track-visualizer ${isPlaying ? 'playing' : ''}`}>
            <span className="bar bar-1" />
            <span className="bar bar-2" />
            <span className="bar bar-3" />
            <span className="bar bar-4" />
          </div>
          <div className="track-details">
            <div className="track-title-wrapper">
              <span className="track-title">{trackTitle}</span>
            </div>
            <span className="track-artist">
              {isLoading ? 'Streaming from Go API...' : error ? 'Error' : 'YouTube Soundstream'}
            </span>
          </div>
        </div>

        {/* Center: Playback Controls & Progress Bar */}
        <div className="player-controls-section">
          <div className="player-buttons">
            <button 
              className="ctrl-btn secondary"
              aria-label="Shuffle"
              disabled={!videoId}
            >
              🔀
            </button>
            <button 
              className="ctrl-btn secondary"
              aria-label="Previous track"
              disabled={!videoId}
            >
              ⏮
            </button>
            <button
              className={`ctrl-btn main-play ${isPlaying ? 'playing' : ''}`}
              onClick={handlePlayPause}
              disabled={!videoId || isLoading}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <span className="loader" />
              ) : isPlaying ? (
                '⏸'
              ) : (
                '▶'
              )}
            </button>
            <button 
              className="ctrl-btn secondary"
              aria-label="Next track"
              disabled={!videoId}
            >
              ⏭
            </button>
            <button 
              className="ctrl-btn secondary"
              aria-label="Repeat"
              disabled={!videoId}
            >
              🔁
            </button>
          </div>

          <div className="progress-bar-wrapper">
            <span className="time-display">{formatTime(currentTime)}</span>
            <div className="slider-container">
              <input
                ref={progressRef}
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="progress-slider"
                style={{ '--percent': `${progressPercent}%` } as React.CSSProperties}
                disabled={!videoId || isLoading}
              />
            </div>
            <span className="time-display">
              {duration > 0 ? formatTime(duration) : '0:00'}
            </span>
          </div>
          
          {error && <span className="player-error-text">{error}</span>}
        </div>

        {/* Right: Volume & Utilities */}
        <div className="player-utilities">
          <div className="volume-wrapper">
            <button 
              className="volume-toggle"
              onClick={toggleMute}
              disabled={!videoId}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? '🔇' : volume < 0.4 ? '🔈' : volume < 0.7 ? '🔉' : '🔊'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="volume-slider"
              style={{ '--percent': `${volumePercent}%` } as React.CSSProperties}
              disabled={!videoId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

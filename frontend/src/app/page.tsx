'use client';

import { useState, useEffect } from 'react';
import ServerStatus from "@/components/ServerStatus";
import Hero from "@/components/Hero";
import TrackShowcase, { FEATURED_TRACKS } from "@/components/TrackShowcase";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Flex from "@/components/ui/layout/Flex";

export default function Home() {
  const [activeTrack, setActiveTrack] = useState<{ videoId: string; title: string } | null>(null);

  // Sync state with global playback events
  useEffect(() => {
    const handlePlaySong = (e: Event) => {
      const customEvent = e as CustomEvent<{ videoId: string; title: string }>;
      if (customEvent.detail) {
        setActiveTrack(customEvent.detail);
      }
    };
    window.addEventListener('play-song', handlePlaySong);
    return () => {
      window.removeEventListener('play-song', handlePlaySong);
    };
  }, []);

  const playTrack = (videoId: string, title: string) => {
    const event = new CustomEvent('play-song', {
      detail: { videoId, title }
    });
    window.dispatchEvent(event);
  };

  const handleStartListening = () => {
    // Play the currently clicked/active track if there is one; otherwise default to the first one
    if (activeTrack) {
      playTrack(activeTrack.videoId, activeTrack.title);
    } else if (FEATURED_TRACKS.length > 0) {
      const firstTrack = FEATURED_TRACKS[0];
      playTrack(firstTrack.videoId, firstTrack.title);
    }
  };

  const handleExploreTracks = () => {
    document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Flex as="main" direction="col" className="min-h-screen">
      {/* Server Status Widget */}
      <ServerStatus />
      
      {/* Hero Header Section */}
      <Hero 
        onStartListening={handleStartListening} 
        onExploreTracks={handleExploreTracks} 
      />

      {/* Showcase Grid Section */}
      <TrackShowcase 
        onPlayTrack={playTrack} 
        activeVideoId={activeTrack?.videoId}
      />

      {/* Value Proposition / Features Section */}
      <Features />

      {/* App Global Footer */}
      <Footer />
    </Flex>
  );
}

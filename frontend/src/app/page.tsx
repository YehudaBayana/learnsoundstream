'use client';

import ServerStatus from "@/components/ServerStatus";
import Hero from "@/components/Hero";
import TrackShowcase from "@/components/TrackShowcase";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Flex from "@/components/ui/layout/Flex";

export default function Home() {
  const playTrack = (videoId: string, title: string) => {
    const event = new CustomEvent('play-song', {
      detail: { videoId, title }
    });
    window.dispatchEvent(event);
  };

  const handleStartListening = () => {
    // Automatically trigger the first featured track (Never Gonna Give You Up)
    playTrack("e-U1lj57pv8", "Never Gonna Give You Up");
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
      <TrackShowcase onPlayTrack={playTrack} />

      {/* Value Proposition / Features Section */}
      <Features />

      {/* App Global Footer */}
      <Footer />
    </Flex>
  );
}

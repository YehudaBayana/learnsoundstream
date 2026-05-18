'use client';

import Image from "next/image";
import ServerStatus from "@/components/ServerStatus";
import "./landing.css";

interface Track {
  videoId: string;
  title: string;
  desc: string;
  duration: string;
  emoji: string;
  category: string;
}

const FEATURED_TRACKS: Track[] = [
  {
    videoId: "e-U1lj57pv8",
    title: "Never Gonna Give You Up",
    desc: "The absolute classic, perfect for validating high-fidelity audio pipe streaming.",
    duration: "3:32",
    emoji: "🕺",
    category: "Classic Pop",
  },
  {
    videoId: "e-U1lj57pv8",
    title: "Lofi Study Beats",
    desc: "Chill, high-fidelity atmospheric beats to code and pair-program to.",
    duration: "3:05",
    emoji: "📚",
    category: "Chill Lofi",
  },
  {
    videoId: "e-U1lj57pv8",
    title: "Retro Synthwave",
    desc: "Outrun synth tracks, perfect for late night hacking and coding sessions.",
    duration: "3:47",
    emoji: "🚗",
    category: "Synthwave",
  },
];

export default function Home() {
  const playTrack = (videoId: string, title: string) => {
    const event = new CustomEvent('play-song', {
      detail: { videoId, title }
    });
    window.dispatchEvent(event);
  };

  const handleStartListening = () => {
    // Automatically trigger the first featured track
    const firstTrack = FEATURED_TRACKS[0];
    playTrack(firstTrack.videoId, firstTrack.title);
  };

  return (
    <main className="landing">
      <ServerStatus />
      
      {/* Hero Section */}
      <section className="hero">
        <Image
          src="/hero.png"
          alt="Soundstream Hero"
          fill
          className="hero-bg"
          priority
        />
        <div className="hero-content animate-fade-in">
          <h1 className="hero-title">
            Stream Your <span className="gradient-text">World</span>
          </h1>
          <p className="hero-subtitle">
            Experience high-fidelity audio streaming powered by a high-performance 
            Go backend. No lag, no limits, just pure sound.
          </p>
          <div className="cta-group">
            <button 
              className="btn btn-primary"
              onClick={handleStartListening}
            >
              Start Listening
            </button>
            <a 
              href="#showcase" 
              className="btn btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore Tracks
            </a>
          </div>
        </div>
      </section>

      {/* Featured Tracks Showcase Section */}
      <section id="showcase" className="showcase">
        <div className="section-header">
          <h2 className="section-title">Featured Showcase</h2>
          <p className="hero-subtitle" style={{ marginInline: 'auto' }}>
            Click play to stream audio live through our Go server. No pre-buffered files, zero storage bloat.
          </p>
        </div>

        <div className="showcase-grid">
          {FEATURED_TRACKS.map((track, i) => (
            <div key={i} className="track-card">
              <div className="track-card-header">
                <div className="track-card-cover">
                  {track.emoji}
                </div>
                <span className="track-card-badge">{track.category}</span>
              </div>
              
              <div className="track-card-body">
                <h3 className="track-card-title">{track.title}</h3>
                <p className="track-card-desc">{track.desc}</p>
              </div>

              <div className="track-card-footer">
                <span className="track-card-duration">{track.duration}</span>
                <button
                  className="btn-play-now"
                  onClick={() => playTrack(track.videoId, track.title)}
                  aria-label={`Play ${track.title}`}
                >
                  <span>▶</span> Play Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features" style={{ paddingTop: '2rem' }}>
        <div className="section-header">
          <h2 className="section-title">Why Soundstream?</h2>
          <p className="hero-subtitle" style={{ marginInline: 'auto' }}>
            Built for performance and simplicity.
          </p>
        </div>
        
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-h3">Ultra Fast</h3>
            <p className="feature-p">
              Leveraging Go&apos;s concurrency for lightning-fast audio delivery 
              straight to your device.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">☁️</div>
            <h3 className="feature-h3">Cloud Integration</h3>
            <p className="feature-p">
              Dynamic streaming using yt-dlp, providing access to an 
              infinite library of sound.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💎</div>
            <h3 className="feature-h3">Premium UI</h3>
            <p className="feature-p">
              A modern, sleek interface designed for the ultimate 
              user experience and aesthetic.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '4rem 2rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          &copy; {new Date().getFullYear()} Soundstream. Built for learning backend engineering.
        </p>
      </footer>
    </main>
  );
}

import Image from "next/image";
import ServerStatus from "@/components/ServerStatus";
import "./landing.css";

export default function Home() {
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
            <button className="btn btn-primary">Start Listening</button>
            <button className="btn btn-secondary">Learn More</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
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

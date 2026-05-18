'use client';

import { useState, useEffect, useRef } from 'react';
import { apiUrl } from '@/constants';

interface ServicesStatus {
  database: string;
  cache: string;
}

interface HealthData {
  status: string;
  version: string;
  uptime: string;
  timestamp: string;
  services: ServicesStatus;
}

export default function ServerStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [data, setData] = useState<HealthData | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const checkHealth = async () => {
    setIsRefreshing(true);
    const start = performance.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const res = await fetch(`${apiUrl}/health`, {
        signal: controller.signal,
        cache: 'no-store',
      });
      
      clearTimeout(timeoutId);
      
      const end = performance.now();
      
      if (res.ok) {
        const body: HealthData = await res.json();
        if (body.status === 'OK') {
          setStatus('online');
          setData(body);
          setLatency(Math.round(end - start));
        } else {
          setStatus('offline');
          setData(null);
          setLatency(null);
        }
      } else {
        setStatus('offline');
        setData(null);
        setLatency(null);
      }
    } catch (err) {
      console.error('Failed to perform server health check:', err);
      setStatus('offline');
      setData(null);
      setLatency(null);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkHealth();
    // Poll the backend health every 100 seconds
    const interval = setInterval(checkHealth, 100000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close the panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="status-widget" ref={panelRef}>
      <button 
        className="status-badge" 
        onClick={togglePanel}
        aria-label="Toggle server health status"
        aria-expanded={isOpen}
      >
        <span className={`status-dot ${status}`} />
        <span className="status-label">
          {status === 'online' && 'Backend Connected'}
          {status === 'offline' && 'Backend Disconnected'}
          {status === 'checking' && 'Connecting...'}
        </span>
        {status === 'online' && latency !== null && (
          <span className="status-label-sub">({latency}ms)</span>
        )}
      </button>

      {isOpen && (
        <div className="status-panel">
          <div className="status-panel-header">
            <span className="status-panel-title">System Status</span>
            <button 
              className="status-panel-close" 
              onClick={() => setIsOpen(false)}
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>

          <div className="status-grid">
            <div className="status-row">
              <span className="status-key">Service:</span>
              <span className="status-val">Soundstream API</span>
            </div>
            
            <div className="status-row">
              <span className="status-key">Status:</span>
              <span className={`status-val ${status === 'online' ? 'success' : status === 'offline' ? 'danger' : 'warning'}`}>
                {status === 'online' && 'ONLINE'}
                {status === 'offline' && 'OFFLINE'}
                {status === 'checking' && 'CHECKING...'}
              </span>
            </div>

            {status === 'online' && latency !== null && (
              <div className="status-row">
                <span className="status-key">Latency:</span>
                <span className={`status-val ${latency < 50 ? 'success' : latency < 150 ? 'warning' : 'danger'}`}>
                  {latency}ms
                </span>
              </div>
            )}

            {data && (
              <>
                <div className="status-row">
                  <span className="status-key">Version:</span>
                  <span className="status-val">{data.version}</span>
                </div>
                <div className="status-row">
                  <span className="status-key">Uptime:</span>
                  <span className="status-val">{data.uptime}</span>
                </div>
              </>
            )}
            
            <div className="status-row">
              <span className="status-key">Endpoint:</span>
              <span className="status-val" style={{ fontSize: '0.72rem', opacity: 0.85 }}>
                {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}
              </span>
            </div>
          </div>

          {status === 'online' && data?.services && (
            <div className="status-services">
              <div className="status-services-title">Backend Services</div>
              <div className="status-row">
                <span className="status-key">Database (Postgres):</span>
                <span className="status-val warning" style={{ fontSize: '0.72rem' }}>
                  {data.services.database.includes('disconnected') ? 'Pending Config' : data.services.database}
                </span>
              </div>
              <div className="status-row">
                <span className="status-key">Cache (Redis):</span>
                <span className="status-val warning" style={{ fontSize: '0.72rem' }}>
                  {data.services.cache.includes('disconnected') ? 'Pending Config' : data.services.cache}
                </span>
              </div>
            </div>
          )}

          <button 
            className="status-refresh-btn" 
            onClick={checkHealth}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Checking...' : 'Refresh Status'}
          </button>
        </div>
      )}
    </div>
  );
}

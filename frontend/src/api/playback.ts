/**
 * Playback session API service stubs.
 *
 * These functions report playback events to the backend for history tracking,
 * analytics, and preference persistence. They are fire-and-forget: callers
 * should `.catch(() => {})` them and never await them in the hot path.
 *
 * The corresponding Go routes (`/api/playback/*`) are not yet implemented;
 * until they exist, every call will fail silently.
 */

import { apiUrl } from '@/constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlaybackPreferences {
  shuffleMode?: boolean;
  repeatMode?: 'none' | 'all' | 'one';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function post(path: string, body?: unknown): Promise<void> {
  await fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

// ---------------------------------------------------------------------------
// Stubs
// ---------------------------------------------------------------------------

/**
 * Report that a track started playing. Backend can use this to upsert
 * playback history (currently handled inside the stream handler, but this
 * stub allows for a dedicated session-tracking route in the future).
 */
export async function reportPlayTrack(trackId: string): Promise<void> {
  await post('/api/playback/play', { trackId });
}

/** Report that the user skipped to the next track. */
export async function reportNextTrack(): Promise<void> {
  await post('/api/playback/next');
}

/** Report that the user went back to the previous track. */
export async function reportPrevTrack(): Promise<void> {
  await post('/api/playback/prev');
}

/**
 * Persist shuffle/repeat preferences to the backend so they survive
 * page refreshes (once a preferences endpoint is available).
 */
export async function reportPreferences(prefs: PlaybackPreferences): Promise<void> {
  await post('/api/playback/preferences', prefs);
}

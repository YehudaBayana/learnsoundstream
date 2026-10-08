import { AudioPlayerTrackInfoDriver } from './AudioPlayerTrackInfo.driver';

describe('AudioPlayerTrackInfo', () => {
  it('shows the empty title and streaming status', () => {
    const driver = new AudioPlayerTrackInfoDriver();
    driver.render({ dataHook: 'track-info' });
    expect(driver.getTitle('track-info')).toBe('No track playing');
    expect(driver.getStatus('track-info')).toBe('YouTube Soundstream');
  });

  it('shows the current title and loading status', () => {
    const driver = new AudioPlayerTrackInfoDriver();
    driver.render({ track: { title: 'Late night mix' } as never, isLoading: true });
    expect(driver.getTitle()).toBe('Late night mix');
    expect(driver.getStatus()).toBe('Streaming from Go API...');
  });
});
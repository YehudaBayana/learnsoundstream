import { AudioPlayerControlsDriver } from './AudioPlayerControls.driver';

describe('AudioPlayerControls', () => {
  it('renders disabled controls without a track', () => {
    const driver = new AudioPlayerControlsDriver();
    driver.render({ dataHook: 'controls-panel' });
    expect(driver.isPlayPauseDisabled('controls-panel')).toBe(true);
    expect(driver.hasSeekSlider('controls-panel')).toBe(true);
  });

  it('invokes play/pause with an active track', () => {
    const onPlayPause = jest.fn();
    const driver = new AudioPlayerControlsDriver();
    driver.render({ currentTrack: { id: 'track-1', duration: 120 } as never, onPlayPause });
    driver.clickPlayPause();
    expect(onPlayPause).toHaveBeenCalledTimes(1);
  });
});
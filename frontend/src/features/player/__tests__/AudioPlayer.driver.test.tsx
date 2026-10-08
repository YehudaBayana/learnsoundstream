import { AudioPlayerDriver } from './AudioPlayer.driver';

jest.mock('../hooks/useMSEPlayer', () => ({ useMSEPlayer: jest.fn() }));
jest.mock('../components/AudioPlayerTrackInfo', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('../components/AudioPlayerControls', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('../components/AudioPlayerVolume', () => ({ __esModule: true, default: () => <div /> }));

describe('AudioPlayer', () => {
  let driver: AudioPlayerDriver;

  beforeEach(() => {
    jest.restoreAllMocks();
    driver = new AudioPlayerDriver();
  });

  it('renders its configurable root in the idle state', () => {
    driver.render({ dataHook: 'persistent-player' });
    expect(driver.exists('persistent-player')).toBe(true);
    expect(driver.getRootClassName('persistent-player')).toContain('pointer-events-none');
    expect(driver.hasAudioElement('persistent-player')).toBe(false);
  });

  it('attaches the audio element when a track is selected', () => {
    driver.render({ hasTrack: true });
    expect(driver.getRootClassName()).toContain('pointer-events-auto');
    expect(driver.hasAudioElement()).toBe(true);
  });
});
import { TrackItemDriver } from './TrackItem.driver';
import { usePlaybackStore } from '@/features/player/store/usePlaybackStore';
import * as likedQueryModule from '@/features/liked/query/useLiked';

jest.mock('@/features/liked/query/useLiked');

describe('TrackItem', () => {
  let driver: TrackItemDriver;
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (likedQueryModule.usePostLiked as jest.Mock).mockReturnValue({ mutate: mockMutate });
    usePlaybackStore.setState({ currentChosenTrack: null, isPlaying: false, currentTrackIndex: -1 });
    driver = new TrackItemDriver();
  });

  it('renders a custom root hook and track title', () => {
    driver.render({ dataHook: 'queue-track' });
    expect(driver.exists('queue-track')).toBe(true);
    expect(driver.getTitle('queue-track')).toBe('Track title');
  });

  it('plays the selected track and sends like actions', () => {
    driver.render();
    driver.clickPlay();
    expect(usePlaybackStore.getState().currentChosenTrack?.id).toBe('track-1');
    driver.clickLike();
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });
});
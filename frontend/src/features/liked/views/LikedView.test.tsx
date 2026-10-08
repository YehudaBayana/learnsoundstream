import { LikedViewDriver } from './LikedView.driver';
import { useLikedStore } from '../store/useLikedStore';

jest.mock('@/features/player/components/TrackItem', () => {
  return function MockTrackItem() {
    return <div data-hook="mock-track-item">Track</div>;
  };
});

describe('LikedView Feature Component', () => {
  let driver: LikedViewDriver;

  beforeEach(() => {
    driver = new LikedViewDriver();
    useLikedStore.setState({
      likedTracks: [],
      isPending: false,
      isError: false,
      refetch: null,
    });
  });

  describe('rendering initial and loaded states', () => {
    it('renders heading and container via driver', () => {
      driver.render();

      expect(driver.exists()).toBe(true);
      expect(driver.getHeadingText()).toBe('Liked');
    });

    it('shows loading indicator when query is pending', () => {
      useLikedStore.setState({
        isPending: true,
      });

      driver.render();

      expect(driver.isLoadingVisible()).toBe(true);
      expect(driver.getLoadingText()).toContain('Loading liked tracks...');
    });

    it('shows empty state when no tracks are liked', () => {
      useLikedStore.setState({
        likedTracks: [],
        isPending: false,
        isError: false,
      });

      driver.render();

      expect(driver.isEmptyStateVisible()).toBe(true);
    });
  });

  describe('error state and retry interaction', () => {
    it('shows error banner and executes retry when retry button is clicked', () => {
      const mockRefetch = jest.fn();
      useLikedStore.setState({
        likedTracks: [],
        isPending: false,
        isError: true,
        refetch: mockRefetch as unknown as ReturnType<typeof useLikedStore.getState>['refetch'],
      });

      driver.render();

      expect(driver.isErrorVisible()).toBe(true);
      expect(driver.getErrorText()).toBe('Could not load liked tracks.');

      driver.clickRetry();
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });
});

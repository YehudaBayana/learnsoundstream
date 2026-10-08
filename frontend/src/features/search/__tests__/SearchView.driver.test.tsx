import { SearchViewDriver } from './SearchView.driver';
import * as searchModule from '../store/useSearch';

jest.mock('../store/useSearch');
jest.mock('@/features/player/components/TrackItem', () => ({
  __esModule: true,
  default: ({ track }: { track: { id: string } }) => <div data-hook={`search-result-${track.id}`} />,
}));

describe('SearchView', () => {
  let driver: SearchViewDriver;

  beforeEach(() => {
    jest.clearAllMocks();
    (searchModule.useSearchBy as jest.Mock).mockReturnValue({ data: { results: [] } });
    driver = new SearchViewDriver();
  });

  it('renders a configurable root and submits only on Enter', () => {
    driver.render({ dataHook: 'track-search' });
    expect(driver.exists('track-search')).toBe(true);
    expect(searchModule.useSearchBy).toHaveBeenLastCalledWith('');

    driver.changeSearchTerm('ambient');
    expect(searchModule.useSearchBy).toHaveBeenLastCalledWith('');
    driver.submitSearch();
    expect(searchModule.useSearchBy).toHaveBeenLastCalledWith('ambient');
  });

  it('renders results returned for the submitted term', () => {
    const matchingTrack = { id: 'ambient-track' };
    (searchModule.useSearchBy as jest.Mock).mockImplementation((term: string) => ({
      data: { results: term ? [matchingTrack] : [] },
    }));
    driver.render();
    driver.changeSearchTerm('ambient');
    driver.submitSearch();

    expect(driver.hasResult('ambient-track')).toBe(true);
  });
});
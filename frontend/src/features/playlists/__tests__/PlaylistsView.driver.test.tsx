import { PlaylistsViewDriver } from './PlaylistsView.driver';

describe('PlaylistsView', () => {
  it('renders its feature root with a configurable data hook', () => {
    const driver = new PlaylistsViewDriver();
    driver.render('custom-playlists-view');

    expect(driver.exists('custom-playlists-view')).toBe(true);
  });
});
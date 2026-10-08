import { SongCardSkeletonDriver } from './SongCardSkeleton.driver';

describe('SongCardSkeleton', () => {
  it('renders one hooked card by default', () => {
    const driver = new SongCardSkeletonDriver();
    driver.render();
    expect(driver.getItemCount()).toBe(1);
  });

  it('renders the requested number of skeleton cards', () => {
    const driver = new SongCardSkeletonDriver();
    driver.render('song-loading', 3);
    expect(driver.getItemCount('song-loading')).toBe(3);
  });
});
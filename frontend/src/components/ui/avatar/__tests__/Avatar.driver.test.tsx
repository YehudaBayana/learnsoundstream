import { AvatarDriver } from './Avatar.driver';

describe('Avatar', () => {
  let driver: AvatarDriver;

  beforeEach(() => {
    driver = new AvatarDriver();
  });

  it('renders fallback initials with a custom root hook', () => {
    driver.render({ dataHook: 'profile-avatar', name: 'John Doe' });

    expect(driver.hasRoot('profile-avatar')).toBe(true);
    expect(driver.getFallbackText('profile-avatar')).toBe('JD');
  });

  it('renders an image and falls back to initials on error', () => {
    driver.render({ src: '/avatar.png', name: 'Jane Doe' });

    expect(driver.hasImage()).toBe(true);
    driver.failImage();

    expect(driver.hasImage()).toBe(false);
    expect(driver.getFallbackText()).toBe('JD');
  });

  it('applies size, shape, and status styling', () => {
    driver.render({ size: 'lg', square: true, status: 'online', name: 'User' });

    expect(driver.getRootClassName()).toContain('w-12');
    expect(driver.getRootClassName()).toContain('rounded-lg');
    expect(driver.getStatusClassName()).toContain('bg-green-500');
  });
});
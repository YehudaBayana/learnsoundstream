import { HeroDriver } from './Hero.driver';

jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage() {
    return <div data-hook="hero-image" />;
  },
}));

describe('Hero', () => {
  it('renders a custom root and delegates both calls to action', () => {
    const onStartListening = jest.fn();
    const onExploreTracks = jest.fn();
    const driver = new HeroDriver();
    driver.render({ dataHook: 'welcome-hero', onStartListening, onExploreTracks });

    expect(driver.exists('welcome-hero')).toBe(true);
    driver.clickStartListening('welcome-hero');
    driver.clickExploreTracks('welcome-hero');
    expect(onStartListening).toHaveBeenCalledTimes(1);
    expect(onExploreTracks).toHaveBeenCalledTimes(1);
  });
});
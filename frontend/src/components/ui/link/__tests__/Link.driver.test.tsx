import { LinkDriver } from './Link.driver';

describe('Link', () => {
  let driver: LinkDriver;

  beforeEach(() => {
    driver = new LinkDriver();
  });

  it('renders an internal link with a configurable hook and variant', () => {
    driver.render({ dataHook: 'library-link', variant: 'primary' });
    expect(driver.getHref('library-link')).toBe('/library');
    expect(driver.getClassName('library-link')).toContain('text-emerald-600');
  });

  it('renders external links in a new tab', () => {
    driver.render({ to: 'https://example.org', external: true });
    expect(driver.getHref()).toBe('https://example.org');
    expect(driver.getTarget()).toBe('_blank');
  });
});
import { PageShellDriver } from './PageShell.driver';

describe('PageShell', () => {
  let driver: PageShellDriver;

  beforeEach(() => {
    driver = new PageShellDriver();
  });

  it('renders its configurable root, title, actions, and page content', () => {
    driver.render({ dataHook: 'library-page' });

    expect(driver.exists('library-page')).toBe(true);
    expect(driver.hasElement('title', 'library-page')).toBe(true);
    expect(driver.hasElement('actions', 'library-page')).toBe(true);
    expect(driver.hasElement('content', 'library-page')).toBe(true);
  });

  it('replaces page content while loading', () => {
    driver.render({ loading: true });

    expect(driver.exists()).toBe(true);
    expect(driver.hasElement('content')).toBe(false);
  });

  it('renders caller-provided actions', () => {
    driver.render({ actions: <span data-hook="custom-actions">Custom actions</span> });

    expect(driver.hasElement('actions')).toBe(false);
    expect(driver.exists()).toBe(true);
  });
});
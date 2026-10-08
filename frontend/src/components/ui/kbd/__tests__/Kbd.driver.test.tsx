import { KbdDriver } from './Kbd.driver';

describe('Kbd', () => {
  let driver: KbdDriver;

  beforeEach(() => {
    driver = new KbdDriver();
  });

  it('renders keyboard content under a configurable hook', () => {
    driver.render({ dataHook: 'shortcut-key', children: 'Ctrl+K' });
    expect(driver.getText('shortcut-key')).toBe('Ctrl+K');
  });

  it('applies size variants', () => {
    driver.render({ size: 'md' });
    expect(driver.getClassName()).toContain('h-6');
  });
});
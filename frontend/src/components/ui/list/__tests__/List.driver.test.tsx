import { ListDriver } from './List.driver';

describe('List', () => {
  let driver: ListDriver;

  beforeEach(() => {
    driver = new ListDriver();
  });

  it('renders a data-hook root and item', () => {
    driver.render({ dataHook: 'queue-list' });

    expect(driver.getTagName('queue-list')).toBe('UL');
    expect(driver.hasItem('queue-list')).toBe(true);
  });

  it('renders ordered lists and applies variants', () => {
    driver.render({ ordered: true, variant: 'divided', spacing: 'lg' });

    expect(driver.getTagName()).toBe('OL');
    expect(driver.getClassName()).toContain('[&>*:not(:last-child)]:border-b');
    expect(driver.getClassName()).not.toContain('space-y-4');
  });
});
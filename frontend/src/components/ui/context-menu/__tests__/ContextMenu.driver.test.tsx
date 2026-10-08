import { ContextMenuDriver } from './ContextMenu.driver';

describe('ContextMenu', () => {
  let driver: ContextMenuDriver;

  beforeEach(() => {
    driver = new ContextMenuDriver();
  });

  it('renders a trigger and opens the menu on right click', () => {
    driver.render({ dataHook: 'track-actions' });

    expect(driver.hasTrigger('track-actions')).toBe(true);
    driver.rightClickTrigger('track-actions');

    expect(driver.isMenuOpen('track-actions')).toBe(true);
    expect(driver.hasItem('first', 'track-actions')).toBe(true);
    expect(driver.hasItem('second', 'track-actions')).toBe(true);
  });

  it('closes the menu on outside click', () => {
    driver.render();
    driver.rightClickTrigger();
    expect(driver.isMenuOpen()).toBe(true);

    driver.clickOutside();

    expect(driver.isMenuOpen()).toBe(false);
  });

  it('calls an item handler and closes the menu after selection', () => {
    const onFirstItemClick = jest.fn();
    driver.render({ onFirstItemClick });
    driver.rightClickTrigger();

    driver.clickItem('first');

    expect(onFirstItemClick).toHaveBeenCalledTimes(1);
    expect(driver.isMenuOpen()).toBe(false);
  });

  it('does not open when disabled', () => {
    driver.render({ disabled: true });
    driver.rightClickTrigger();

    expect(driver.isMenuOpen()).toBe(false);
  });
});
import { ListItemDriver } from './ListItem.driver';

describe('ListItem', () => {
  let driver: ListItemDriver;

  beforeEach(() => {
    driver = new ListItemDriver();
  });

  it('renders a list item by default', () => {
    driver.render();

    expect(driver.getTagName()).toBe('LI');
    expect(driver.getClassName()).toContain('px-4 py-3');
  });

  it('becomes an interactive button and invokes its handler', () => {
    const onClick = jest.fn();
    driver.render({ interactive: true, onClick, selected: true });

    expect(driver.getTagName()).toBe('BUTTON');
    expect(driver.getClassName()).toContain('bg-emerald-50');
    driver.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('prevents a disabled item action', () => {
    const onClick = jest.fn();
    driver.render({ interactive: true, disabled: true, onClick });

    expect(driver.isDisabled()).toBe(true);
    driver.click();
    expect(onClick).not.toHaveBeenCalled();
  });
});
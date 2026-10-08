import { UseModalDriver } from './useModal.driver';

describe('useModal', () => {
  let driver: UseModalDriver;

  beforeEach(() => {
    driver = new UseModalDriver();
  });

  it('supports open and close actions from its default closed state', () => {
    driver.render();
    expect(driver.isOpen()).toBe(false);
    driver.open();
    expect(driver.isOpen()).toBe(true);
    driver.close();
    expect(driver.isOpen()).toBe(false);
  });

  it('supports initial state, toggle, and direct state changes', () => {
    driver.render(true);
    expect(driver.isOpen()).toBe(true);
    driver.toggle();
    expect(driver.isOpen()).toBe(false);
    driver.setOpen(true);
    expect(driver.isOpen()).toBe(true);
  });
});
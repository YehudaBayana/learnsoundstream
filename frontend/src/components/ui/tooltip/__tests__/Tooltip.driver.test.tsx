import { TooltipDriver } from './Tooltip.driver';

describe('Tooltip', () => {
  let driver: TooltipDriver;

  beforeEach(() => {
    driver = new TooltipDriver();
  });

  it('shows on hover and hides when the pointer leaves', () => {
    driver.render({ dataHook: 'help-tooltip' });
    driver.hover('help-tooltip');
    expect(driver.isVisible('help-tooltip')).toBe(true);
    driver.leave('help-tooltip');
    expect(driver.isVisible('help-tooltip')).toBe(false);
  });

  it('shows on focus', () => {
    driver.render();
    driver.focus();
    expect(driver.isVisible()).toBe(true);
  });

  it('does not show when disabled', () => {
    driver = new TooltipDriver();
    driver.render({ disabled: true });
    driver.hover();
    expect(driver.isVisible()).toBe(false);
  });
});
import { ButtonWithLoadingDriver } from './ButtonWithLoading.driver';

describe('ButtonWithLoading', () => {
  let driver: ButtonWithLoadingDriver;

  beforeEach(() => {
    driver = new ButtonWithLoadingDriver();
  });

  it('renders content through a custom root hook', () => {
    driver.render({ dataHook: 'save-action' });
    expect(driver.getText('save-action')).toBe('Save');
  });

  it('disables while loading and displays loading text', () => {
    driver.render({ loading: true, loadingText: 'Saving...' });
    expect(driver.isDisabled()).toBe(true);
    expect(driver.getText()).toContain('Saving...');
  });

  it('invokes its click handler when enabled', () => {
    const onClick = jest.fn();
    driver.render({ onClick });
    driver.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
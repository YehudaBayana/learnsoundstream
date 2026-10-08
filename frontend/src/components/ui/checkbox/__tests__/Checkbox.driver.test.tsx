import { CheckboxDriver } from './Checkbox.driver';

describe('Checkbox', () => {
  let driver: CheckboxDriver;

  beforeEach(() => {
    driver = new CheckboxDriver();
  });

  it('supports default checked and disabled states through its hook', () => {
    driver.render({ dataHook: 'terms-check', defaultChecked: true, disabled: true, label: 'Terms' });
    expect(driver.isChecked('terms-check')).toBe(true);
    expect(driver.isDisabled('terms-check')).toBe(true);
  });

  it('emits changes when toggled', () => {
    const onChange = jest.fn();
    driver.render({ onChange });
    driver.click();
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
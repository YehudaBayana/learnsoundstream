import { RadioGroupDriver } from './RadioGroup.driver';

describe('RadioGroup', () => {
  let driver: RadioGroupDriver;

  beforeEach(() => {
    driver = new RadioGroupDriver();
  });

  it('renders options and reports the controlled selection', () => {
    driver.render({ dataHook: 'plan-picker', value: 'two' });
    expect(driver.isOptionChecked('two', 'plan-picker')).toBe(true);
    expect(driver.isOptionChecked('one', 'plan-picker')).toBe(false);
  });

  it('supports orientation and option selection callbacks', () => {
    const onChange = jest.fn();
    driver.render({ orientation: 'horizontal', onChange });
    expect(driver.getClassName()).toContain('flex-row');
    driver.selectOption('one');
    expect(onChange).toHaveBeenCalledWith('one');
  });
});
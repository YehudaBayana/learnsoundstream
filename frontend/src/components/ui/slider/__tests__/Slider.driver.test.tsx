import { SliderDriver } from './Slider.driver';

describe('Slider', () => {
  let driver: SliderDriver;

  beforeEach(() => {
    driver = new SliderDriver();
  });

  it('renders a data-hook range input with configured bounds', () => {
    driver.render({ dataHook: 'volume-control', value: 50, min: 0, max: 100 });
    expect(driver.getValue('volume-control')).toBe('50');
    expect(driver.getMin('volume-control')).toBe('0');
    expect(driver.getMax('volume-control')).toBe('100');
  });

  it('emits value changes and reflects size and disabled props', () => {
    const onChange = jest.fn();
    driver.render({ size: 'lg', disabled: true, onChange });
    expect(driver.getClassName()).toContain('h-3');
    expect(driver.isDisabled()).toBe(true);
    driver.changeValue('75');
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
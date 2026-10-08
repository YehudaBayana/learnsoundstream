import { ButtonDriver } from './Button.driver';

describe('Button Component', () => {
  let driver: ButtonDriver;

  beforeEach(() => {
    driver = new ButtonDriver();
  });

  describe('rendering', () => {
    it('renders text content correctly via driver', () => {
      driver.render({ children: 'Submit Application' });
      expect(driver.exists()).toBe(true);
      expect(driver.getText()).toBe('Submit Application');
    });

    it('renders with custom data-hook identifier', () => {
      const customHook = 'custom-action-button';
      driver.render({ children: 'Custom Button', dataHook: customHook });
      expect(driver.exists(customHook)).toBe(true);
      expect(driver.getText(customHook)).toBe('Custom Button');
    });

    it('renders with default button type attribute', () => {
      driver.render({ children: 'Default Button' });
      expect(driver.getType()).toBe('button');
    });

    it('supports custom submit type attribute', () => {
      driver.render({ children: 'Submit', type: 'submit' });
      expect(driver.getType()).toBe('submit');
    });
  });

  describe('variants and states', () => {
    it('applies primary variant styling classes by default', () => {
      driver.render({ children: 'Primary Action', variant: 'primary' });
      expect(driver.getClasses()).toContain('from-emerald-600');
    });

    it('applies danger variant styling classes', () => {
      driver.render({ children: 'Delete Item', variant: 'danger' });
      expect(driver.getClasses()).toContain('bg-rose-600');
    });

    it('disables button when disabled prop is provided', () => {
      driver.render({ children: 'Disabled Action', disabled: true });
      expect(driver.isDisabled()).toBe(true);
    });

    it('disables button and displays loading text when loading is true', () => {
      driver.render({
        children: 'Save Data',
        loading: true,
        loadingText: 'Saving...',
      });
      expect(driver.isDisabled()).toBe(true);
      expect(driver.getText()).toContain('Saving...');
    });
  });

  describe('user interactions', () => {
    it('invokes onClick handler when clicked', () => {
      const handleClick = jest.fn();
      driver.render({ children: 'Clickable', onClick: handleClick });

      driver.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not invoke onClick handler when disabled', () => {
      const handleClick = jest.fn();
      driver.render({ children: 'Disabled', disabled: true, onClick: handleClick });

      driver.click();
      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});

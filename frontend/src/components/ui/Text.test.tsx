import { TextDriver } from './Text.driver';

describe('Text Component', () => {
  let driver: TextDriver;

  beforeEach(() => {
    driver = new TextDriver();
  });

  describe('rendering', () => {
    it('renders text children correctly', () => {
      driver.render({ children: 'Soundstream music catalog' });
      expect(driver.exists()).toBe(true);
      expect(driver.getText()).toBe('Soundstream music catalog');
    });

    it('renders as paragraph by default for body variant', () => {
      driver.render({ variant: 'body' });
      expect(driver.getTagName()).toBe('p');
    });

    it('renders with appropriate tag for heading variants', () => {
      driver.render({ variant: 'h1', children: 'Big Title' });
      expect(driver.getTagName()).toBe('h1');
      expect(driver.getText()).toBe('Big Title');
    });

    it('allows overriding HTML element via `as` prop', () => {
      driver.render({ as: 'span', children: 'Inline span' });
      expect(driver.getTagName()).toBe('span');
    });

    it('supports label element and htmlFor attribute', () => {
      driver.render({
        as: 'label',
        htmlFor: 'search-input',
        children: 'Search Query',
      });
      expect(driver.getTagName()).toBe('label');
      expect(driver.getHtmlFor()).toBe('search-input');
    });
  });

  describe('styles and truncation', () => {
    it('applies muted color class', () => {
      driver.render({ color: 'muted' });
      expect(driver.getClasses()).toContain('text-gray-500');
    });

    it('applies font weight class', () => {
      driver.render({ weight: 'bold' });
      expect(driver.getClasses()).toContain('font-bold');
    });

    it('applies truncate class when truncate is true', () => {
      driver.render({ truncate: true });
      expect(driver.hasClassName('truncate')).toBe(true);
    });
  });
});

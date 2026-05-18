import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Text from './Text';

describe('Text', () => {
  // Basic rendering tests
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<Text>Hello World</Text>);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('renders as p element by default for body variant', () => {
      render(<Text variant="body">Paragraph text</Text>);
      const element = screen.getByText('Paragraph text');
      expect(element.tagName).toBe('P');
    });

    it('renders as span element for small variant', () => {
      render(<Text variant="small">Small text</Text>);
      const element = screen.getByText('Small text');
      expect(element.tagName).toBe('SPAN');
    });

    it('renders as label element for label variant', () => {
      render(
        <Text variant="label" htmlFor="test-input">
          Label text
        </Text>
      );
      const element = screen.getByText('Label text');
      expect(element.tagName).toBe('LABEL');
      expect(element).toHaveAttribute('for', 'test-input');
    });

    it('renders with custom "as" element', () => {
      render(
        <Text as="div" variant="body">
          Div text
        </Text>
      );
      const element = screen.getByText('Div text');
      expect(element.tagName).toBe('DIV');
    });
  });

  // Variant tests
  describe('variants', () => {
    it('applies body variant classes', () => {
      render(<Text variant="body">Body text</Text>);
      const element = screen.getByText('Body text');
      expect(element).toHaveClass('text-base');
    });

    it('applies body-sm variant classes', () => {
      render(<Text variant="body-sm">Small body text</Text>);
      const element = screen.getByText('Small body text');
      expect(element).toHaveClass('text-sm');
    });

    it('applies lead variant classes', () => {
      render(<Text variant="lead">Lead text</Text>);
      const element = screen.getByText('Lead text');
      expect(element).toHaveClass('text-lg');
    });

    it('applies small variant classes', () => {
      render(<Text variant="small">Small text</Text>);
      const element = screen.getByText('Small text');
      expect(element).toHaveClass('text-xs');
    });

    it('applies caption variant classes with muted color by default', () => {
      render(<Text variant="caption">Caption text</Text>);
      const element = screen.getByText('Caption text');
      expect(element).toHaveClass('text-xs');
      expect(element).toHaveClass('text-gray-500');
    });

    it('applies label variant classes with font-medium', () => {
      render(<Text variant="label">Label text</Text>);
      const element = screen.getByText('Label text');
      expect(element).toHaveClass('text-sm');
      expect(element).toHaveClass('font-medium');
    });
  });

  // Color tests
  describe('colors', () => {
    it('applies default color classes', () => {
      render(<Text color="default">Default color</Text>);
      const element = screen.getByText('Default color');
      expect(element).toHaveClass('text-gray-900');
    });

    it('applies muted color classes', () => {
      render(<Text color="muted">Muted color</Text>);
      const element = screen.getByText('Muted color');
      expect(element).toHaveClass('text-gray-500');
    });

    it('applies primary color classes', () => {
      render(<Text color="primary">Primary color</Text>);
      const element = screen.getByText('Primary color');
      expect(element).toHaveClass('text-emerald-600');
    });

    it('applies danger color classes', () => {
      render(<Text color="danger">Danger color</Text>);
      const element = screen.getByText('Danger color');
      expect(element).toHaveClass('text-rose-600');
    });

    it('applies no color classes for inherit', () => {
      render(<Text color="inherit">Inherit color</Text>);
      const element = screen.getByText('Inherit color');
      expect(element.className).not.toContain('text-gray-');
      expect(element.className).not.toContain('text-emerald-');
    });
  });

  // Weight tests
  describe('weight', () => {
    it('applies normal weight', () => {
      render(<Text weight="normal">Normal weight</Text>);
      expect(screen.getByText('Normal weight')).toHaveClass('font-normal');
    });

    it('applies medium weight', () => {
      render(<Text weight="medium">Medium weight</Text>);
      expect(screen.getByText('Medium weight')).toHaveClass('font-medium');
    });

    it('applies semibold weight', () => {
      render(<Text weight="semibold">Semibold weight</Text>);
      expect(screen.getByText('Semibold weight')).toHaveClass('font-semibold');
    });

    it('applies bold weight', () => {
      render(<Text weight="bold">Bold weight</Text>);
      expect(screen.getByText('Bold weight')).toHaveClass('font-bold');
    });
  });

  // Alignment tests
  describe('alignment', () => {
    it('applies left alignment', () => {
      render(<Text align="left">Left aligned</Text>);
      expect(screen.getByText('Left aligned')).toHaveClass('text-left');
    });

    it('applies center alignment', () => {
      render(<Text align="center">Center aligned</Text>);
      expect(screen.getByText('Center aligned')).toHaveClass('text-center');
    });

    it('applies right alignment', () => {
      render(<Text align="right">Right aligned</Text>);
      expect(screen.getByText('Right aligned')).toHaveClass('text-right');
    });

    it('applies justify alignment', () => {
      render(<Text align="justify">Justify aligned</Text>);
      expect(screen.getByText('Justify aligned')).toHaveClass('text-justify');
    });
  });

  // Truncate tests
  describe('truncate', () => {
    it('applies truncate class when enabled', () => {
      render(<Text truncate>Truncated text</Text>);
      expect(screen.getByText('Truncated text')).toHaveClass('truncate');
    });

    it('does not apply truncate class by default', () => {
      render(<Text>Normal text</Text>);
      expect(screen.getByText('Normal text')).not.toHaveClass('truncate');
    });
  });

  // Custom className tests
  describe('custom className', () => {
    it('applies custom className', () => {
      render(<Text className="custom-class">Custom text</Text>);
      expect(screen.getByText('Custom text')).toHaveClass('custom-class');
    });

    it('merges custom className with variant classes', () => {
      render(
        <Text variant="body" className="custom-class">
          Custom text
        </Text>
      );
      const element = screen.getByText('Custom text');
      expect(element).toHaveClass('text-base');
      expect(element).toHaveClass('custom-class');
    });
  });
});

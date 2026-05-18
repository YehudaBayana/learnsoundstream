import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Heading from './Heading';

describe('Heading', () => {
  // Basic rendering tests
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<Heading>Page Title</Heading>);
      expect(screen.getByText('Page Title')).toBeInTheDocument();
    });

    it('renders as h2 by default', () => {
      render(<Heading>Default Heading</Heading>);
      const element = screen.getByText('Default Heading');
      expect(element.tagName).toBe('H2');
    });

    it('renders with id for anchor linking', () => {
      render(<Heading id="section-title">Section Title</Heading>);
      const element = screen.getByText('Section Title');
      expect(element).toHaveAttribute('id', 'section-title');
    });
  });

  // Level tests
  describe('levels', () => {
    it('renders h1 for level 1', () => {
      render(<Heading level={1}>Heading 1</Heading>);
      expect(screen.getByText('Heading 1').tagName).toBe('H1');
    });

    it('renders h2 for level 2', () => {
      render(<Heading level={2}>Heading 2</Heading>);
      expect(screen.getByText('Heading 2').tagName).toBe('H2');
    });

    it('renders h3 for level 3', () => {
      render(<Heading level={3}>Heading 3</Heading>);
      expect(screen.getByText('Heading 3').tagName).toBe('H3');
    });

    it('renders h4 for level 4', () => {
      render(<Heading level={4}>Heading 4</Heading>);
      expect(screen.getByText('Heading 4').tagName).toBe('H4');
    });

    it('renders h5 for level 5', () => {
      render(<Heading level={5}>Heading 5</Heading>);
      expect(screen.getByText('Heading 5').tagName).toBe('H5');
    });

    it('renders h6 for level 6', () => {
      render(<Heading level={6}>Heading 6</Heading>);
      expect(screen.getByText('Heading 6').tagName).toBe('H6');
    });
  });

  // Size tests
  describe('sizes', () => {
    it('applies 5xl size classes', () => {
      render(<Heading size="5xl">5XL Heading</Heading>);
      const element = screen.getByText('5XL Heading');
      expect(element).toHaveClass('text-5xl', 'tracking-tight');
    });

    it('applies 4xl size classes', () => {
      render(<Heading size="4xl">4XL Heading</Heading>);
      const element = screen.getByText('4XL Heading');
      expect(element).toHaveClass('text-4xl', 'tracking-tight');
    });

    it('applies 3xl size classes', () => {
      render(<Heading size="3xl">3XL Heading</Heading>);
      expect(screen.getByText('3XL Heading')).toHaveClass('text-3xl');
    });

    it('applies 2xl size classes', () => {
      render(<Heading size="2xl">2XL Heading</Heading>);
      expect(screen.getByText('2XL Heading')).toHaveClass('text-2xl');
    });

    it('applies xl size classes', () => {
      render(<Heading size="xl">XL Heading</Heading>);
      expect(screen.getByText('XL Heading')).toHaveClass('text-xl');
    });

    it('applies lg size classes', () => {
      render(<Heading size="lg">LG Heading</Heading>);
      expect(screen.getByText('LG Heading')).toHaveClass('text-lg');
    });

    it('applies md size classes', () => {
      render(<Heading size="md">MD Heading</Heading>);
      expect(screen.getByText('MD Heading')).toHaveClass('text-base');
    });

    it('applies sm size classes', () => {
      render(<Heading size="sm">SM Heading</Heading>);
      expect(screen.getByText('SM Heading')).toHaveClass('text-sm');
    });

    it('applies xs size classes with uppercase', () => {
      render(<Heading size="xs">XS Heading</Heading>);
      const element = screen.getByText('XS Heading');
      expect(element).toHaveClass('text-xs', 'uppercase', 'tracking-wide');
    });
  });

  // Default size based on level
  describe('default sizes for levels', () => {
    it('level 1 defaults to 4xl', () => {
      render(<Heading level={1}>H1 Default</Heading>);
      expect(screen.getByText('H1 Default')).toHaveClass('text-4xl');
    });

    it('level 2 defaults to 3xl', () => {
      render(<Heading level={2}>H2 Default</Heading>);
      expect(screen.getByText('H2 Default')).toHaveClass('text-3xl');
    });

    it('level 3 defaults to 2xl', () => {
      render(<Heading level={3}>H3 Default</Heading>);
      expect(screen.getByText('H3 Default')).toHaveClass('text-2xl');
    });

    it('level 4 defaults to xl', () => {
      render(<Heading level={4}>H4 Default</Heading>);
      expect(screen.getByText('H4 Default')).toHaveClass('text-xl');
    });

    it('level 5 defaults to lg', () => {
      render(<Heading level={5}>H5 Default</Heading>);
      expect(screen.getByText('H5 Default')).toHaveClass('text-lg');
    });

    it('level 6 defaults to md', () => {
      render(<Heading level={6}>H6 Default</Heading>);
      expect(screen.getByText('H6 Default')).toHaveClass('text-base');
    });
  });

  // Color tests
  describe('colors', () => {
    it('applies default color classes', () => {
      render(<Heading color="default">Default Color</Heading>);
      const element = screen.getByText('Default Color');
      expect(element).toHaveClass('text-gray-900', 'dark:text-white');
    });

    it('applies muted color classes', () => {
      render(<Heading color="muted">Muted Color</Heading>);
      const element = screen.getByText('Muted Color');
      expect(element).toHaveClass('text-gray-600', 'dark:text-slate-300');
    });

    it('applies primary color classes', () => {
      render(<Heading color="primary">Primary Color</Heading>);
      expect(screen.getByText('Primary Color')).toHaveClass('text-emerald-600');
    });

    it('applies secondary color classes', () => {
      render(<Heading color="secondary">Secondary Color</Heading>);
      expect(screen.getByText('Secondary Color')).toHaveClass('text-teal-600');
    });

    it('applies no color classes for inherit', () => {
      render(<Heading color="inherit">Inherit Color</Heading>);
      const element = screen.getByText('Inherit Color');
      expect(element.className).not.toContain('text-gray-');
      expect(element.className).not.toContain('text-emerald-');
    });
  });

  // Weight tests
  describe('weight', () => {
    it('applies normal weight', () => {
      render(<Heading weight="normal">Normal Weight</Heading>);
      expect(screen.getByText('Normal Weight')).toHaveClass('font-normal');
    });

    it('applies medium weight', () => {
      render(<Heading weight="medium">Medium Weight</Heading>);
      expect(screen.getByText('Medium Weight')).toHaveClass('font-medium');
    });

    it('applies semibold weight', () => {
      render(<Heading weight="semibold">Semibold Weight</Heading>);
      expect(screen.getByText('Semibold Weight')).toHaveClass('font-semibold');
    });

    it('applies bold weight', () => {
      render(<Heading weight="bold">Bold Weight</Heading>);
      expect(screen.getByText('Bold Weight')).toHaveClass('font-bold');
    });

    it('applies extrabold weight', () => {
      render(<Heading weight="extrabold">Extrabold Weight</Heading>);
      expect(screen.getByText('Extrabold Weight')).toHaveClass('font-extrabold');
    });
  });

  // Default weight based on size
  describe('default weights for sizes', () => {
    it('5xl defaults to extrabold', () => {
      render(<Heading size="5xl">5XL Weight</Heading>);
      expect(screen.getByText('5XL Weight')).toHaveClass('font-extrabold');
    });

    it('3xl defaults to bold', () => {
      render(<Heading size="3xl">3XL Weight</Heading>);
      expect(screen.getByText('3XL Weight')).toHaveClass('font-bold');
    });

    it('lg defaults to semibold', () => {
      render(<Heading size="lg">LG Weight</Heading>);
      expect(screen.getByText('LG Weight')).toHaveClass('font-semibold');
    });

    it('xs defaults to medium', () => {
      render(<Heading size="xs">XS Weight</Heading>);
      expect(screen.getByText('XS Weight')).toHaveClass('font-medium');
    });
  });

  // Alignment tests
  describe('alignment', () => {
    it('applies left alignment', () => {
      render(<Heading align="left">Left Aligned</Heading>);
      expect(screen.getByText('Left Aligned')).toHaveClass('text-left');
    });

    it('applies center alignment', () => {
      render(<Heading align="center">Center Aligned</Heading>);
      expect(screen.getByText('Center Aligned')).toHaveClass('text-center');
    });

    it('applies right alignment', () => {
      render(<Heading align="right">Right Aligned</Heading>);
      expect(screen.getByText('Right Aligned')).toHaveClass('text-right');
    });
  });

  // Truncate tests
  describe('truncate', () => {
    it('applies truncate class when enabled', () => {
      render(<Heading truncate>Truncated Heading</Heading>);
      expect(screen.getByText('Truncated Heading')).toHaveClass('truncate');
    });

    it('does not apply truncate class by default', () => {
      render(<Heading>Normal Heading</Heading>);
      expect(screen.getByText('Normal Heading')).not.toHaveClass('truncate');
    });
  });

  // Custom className tests
  describe('custom className', () => {
    it('applies custom className', () => {
      render(<Heading className="custom-class">Custom Heading</Heading>);
      expect(screen.getByText('Custom Heading')).toHaveClass('custom-class');
    });

    it('merges custom className with size classes', () => {
      render(
        <Heading size="xl" className="custom-class">
          Custom Heading
        </Heading>
      );
      const element = screen.getByText('Custom Heading');
      expect(element).toHaveClass('text-xl', 'custom-class');
    });
  });

  // Semantic separation from visual size
  describe('semantic vs visual size', () => {
    it('allows h1 with small visual size', () => {
      render(
        <Heading level={1} size="sm">
          Small H1
        </Heading>
      );
      const element = screen.getByText('Small H1');
      expect(element.tagName).toBe('H1');
      expect(element).toHaveClass('text-sm');
    });

    it('allows h6 with large visual size', () => {
      render(
        <Heading level={6} size="4xl">
          Large H6
        </Heading>
      );
      const element = screen.getByText('Large H6');
      expect(element.tagName).toBe('H6');
      expect(element).toHaveClass('text-4xl');
    });
  });
});

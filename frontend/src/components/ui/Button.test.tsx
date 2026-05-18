import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';
import IconButton from './IconButton';
import ButtonGroup from './ButtonGroup';

describe('Button', () => {
  // Basic rendering tests
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('renders as button element', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('has type="button" by default', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('can override type to submit', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
  });

  // Variant tests
  describe('variants', () => {
    it('applies primary variant by default', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('from-emerald-600', 'to-teal-600');
    });

    it('applies secondary variant classes', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-200');
    });

    it('applies danger variant classes', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-rose-600');
    });

    it('applies ghost variant classes', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
    });

    it('applies link variant classes', () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-emerald-600');
    });

    it('applies outline variant classes', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-gray-300');
    });
  });

  // Size tests
  describe('sizes', () => {
    it('applies md size by default', () => {
      render(<Button>Medium</Button>);
      expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2');
    });

    it('applies xs size classes', () => {
      render(<Button size="xs">XS</Button>);
      expect(screen.getByRole('button')).toHaveClass('px-2', 'py-1', 'text-xs');
    });

    it('applies sm size classes', () => {
      render(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('px-3', 'text-sm');
    });

    it('applies lg size classes', () => {
      render(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-lg');
    });

    it('applies xl size classes', () => {
      render(<Button size="xl">XL</Button>);
      expect(screen.getByRole('button')).toHaveClass('px-8', 'py-4', 'text-xl');
    });
  });

  // Loading state tests
  describe('loading state', () => {
    it('shows spinner when loading', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('hides children when loading without loadingText', () => {
      render(<Button loading>Click me</Button>);
      expect(screen.queryByText('Click me')).not.toBeInTheDocument();
    });

    it('shows loadingText when provided', () => {
      render(
        <Button loading loadingText="Saving...">
          Save
        </Button>
      );
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('is disabled when loading', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('has opacity-50 when loading', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole('button')).toHaveClass('opacity-50');
    });
  });

  // Disabled state tests
  describe('disabled state', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('has opacity-50 when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('does not fire onClick when disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // Icon tests
  describe('icons', () => {
    it('renders left icon', () => {
      render(<Button leftIcon={<span data-testid="left-icon">+</span>}>Add</Button>);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders right icon', () => {
      render(<Button rightIcon={<span data-testid="right-icon">→</span>}>Next</Button>);
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('renders both icons', () => {
      render(
        <Button
          leftIcon={<span data-testid="left-icon">←</span>}
          rightIcon={<span data-testid="right-icon">→</span>}
        >
          Navigate
        </Button>
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  // Full width test
  describe('fullWidth', () => {
    it('applies w-full when fullWidth is true', () => {
      render(<Button fullWidth>Full Width</Button>);
      expect(screen.getByRole('button')).toHaveClass('w-full');
    });
  });

  // Click handler test
  describe('interactions', () => {
    it('fires onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  // Custom className test
  describe('custom className', () => {
    it('applies custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });
  });
});

describe('IconButton', () => {
  // Basic rendering tests
  describe('rendering', () => {
    it('renders icon correctly', () => {
      render(
        <IconButton icon={<span data-testid="icon">★</span>} aria-label="Star" />
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders as button element', () => {
      render(
        <IconButton icon={<span>★</span>} aria-label="Star" />
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('has accessible aria-label', () => {
      render(
        <IconButton icon={<span>★</span>} aria-label="Star rating" />
      );
      expect(screen.getByLabelText('Star rating')).toBeInTheDocument();
    });
  });

  // Size tests
  describe('sizes', () => {
    it('applies md size by default', () => {
      render(
        <IconButton icon={<span>★</span>} aria-label="Star" />
      );
      expect(screen.getByRole('button')).toHaveClass('w-10', 'h-10');
    });

    it('applies xs size classes', () => {
      render(
        <IconButton icon={<span>★</span>} aria-label="Star" size="xs" />
      );
      expect(screen.getByRole('button')).toHaveClass('w-6', 'h-6');
    });

    it('applies lg size classes', () => {
      render(
        <IconButton icon={<span>★</span>} aria-label="Star" size="lg" />
      );
      expect(screen.getByRole('button')).toHaveClass('w-12', 'h-12');
    });
  });

  // Rounded test
  describe('rounded', () => {
    it('applies rounded-full when rounded is true', () => {
      render(
        <IconButton icon={<span>★</span>} aria-label="Star" rounded />
      );
      expect(screen.getByRole('button')).toHaveClass('rounded-full');
    });
  });

  // Variant tests
  describe('variants', () => {
    it('applies ghost variant by default', () => {
      render(
        <IconButton icon={<span>★</span>} aria-label="Star" />
      );
      expect(screen.getByRole('button')).toHaveClass('bg-transparent');
    });

    it('applies primary variant classes', () => {
      render(
        <IconButton icon={<span>★</span>} aria-label="Star" variant="primary" />
      );
      expect(screen.getByRole('button')).toHaveClass('from-emerald-600');
    });

    it('applies danger variant classes', () => {
      render(
        <IconButton icon={<span>★</span>} aria-label="Star" variant="danger" />
      );
      expect(screen.getByRole('button')).toHaveClass('bg-rose-600');
    });
  });

  // Loading state tests
  describe('loading state', () => {
    it('shows spinner when loading', () => {
      render(
        <IconButton icon={<span>★</span>} aria-label="Star" loading />
      );
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('hides icon when loading', () => {
      render(
        <IconButton icon={<span data-testid="icon">★</span>} aria-label="Star" loading />
      );
      expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
    });

    it('is disabled when loading', () => {
      render(
        <IconButton icon={<span>★</span>} aria-label="Star" loading />
      );
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });
});

describe('ButtonGroup', () => {
  // Basic rendering tests
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(
        <ButtonGroup>
          <Button>One</Button>
          <Button>Two</Button>
        </ButtonGroup>
      );
      expect(screen.getByText('One')).toBeInTheDocument();
      expect(screen.getByText('Two')).toBeInTheDocument();
    });

    it('has role="group"', () => {
      render(
        <ButtonGroup>
          <Button>One</Button>
        </ButtonGroup>
      );
      expect(screen.getByRole('group')).toBeInTheDocument();
    });
  });

  // Orientation tests
  describe('orientation', () => {
    it('applies horizontal orientation by default', () => {
      render(
        <ButtonGroup>
          <Button>One</Button>
        </ButtonGroup>
      );
      expect(screen.getByRole('group')).toHaveClass('flex-row');
    });

    it('applies vertical orientation', () => {
      render(
        <ButtonGroup orientation="vertical">
          <Button>One</Button>
        </ButtonGroup>
      );
      expect(screen.getByRole('group')).toHaveClass('flex-col');
    });
  });

  // Gap tests
  describe('gap', () => {
    it('applies default gap', () => {
      render(
        <ButtonGroup>
          <Button>One</Button>
        </ButtonGroup>
      );
      expect(screen.getByRole('group')).toHaveClass('gap-2');
    });

    it('applies custom gap', () => {
      render(
        <ButtonGroup gap={4}>
          <Button>One</Button>
        </ButtonGroup>
      );
      expect(screen.getByRole('group')).toHaveClass('gap-4');
    });

    it('applies no gap when gap is 0', () => {
      render(
        <ButtonGroup gap={0}>
          <Button>One</Button>
        </ButtonGroup>
      );
      expect(screen.getByRole('group').className).not.toContain('gap-');
    });
  });

  // Attached mode tests
  describe('attached mode', () => {
    it('applies attached styles for horizontal', () => {
      const { container } = render(
        <ButtonGroup attached>
          <Button variant="outline">One</Button>
          <Button variant="outline">Two</Button>
        </ButtonGroup>
      );
      const group = container.querySelector('[role="group"]');
      expect(group?.className).toContain('[&>*:first-child]:rounded-r-none');
    });

    it('applies attached styles for vertical', () => {
      const { container } = render(
        <ButtonGroup attached orientation="vertical">
          <Button variant="outline">One</Button>
          <Button variant="outline">Two</Button>
        </ButtonGroup>
      );
      const group = container.querySelector('[role="group"]');
      expect(group?.className).toContain('[&>*:first-child]:rounded-b-none');
    });
  });

  // Custom className test
  describe('custom className', () => {
    it('applies custom className', () => {
      render(
        <ButtonGroup className="custom-class">
          <Button>One</Button>
        </ButtonGroup>
      );
      expect(screen.getByRole('group')).toHaveClass('custom-class');
    });
  });
});

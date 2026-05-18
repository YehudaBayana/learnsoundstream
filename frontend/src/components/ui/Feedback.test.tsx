import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Spinner from './Spinner';
import Progress from './Progress';
import Skeleton from './Skeleton';
import Alert from './Alert';
import Badge from './Badge';
import Tooltip from './Tooltip';

describe('Spinner', () => {
  describe('rendering', () => {
    it('renders with role="status"', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has accessible label', () => {
      render(<Spinner />);
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('uses custom label', () => {
      render(<Spinner label="Processing..." />);
      expect(screen.getByLabelText('Processing...')).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('applies xs size', () => {
      render(<Spinner size="xs" />);
      expect(screen.getByRole('status')).toHaveClass('w-3', 'h-3');
    });

    it('applies md size by default', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toHaveClass('w-6', 'h-6');
    });

    it('applies xl size', () => {
      render(<Spinner size="xl" />);
      expect(screen.getByRole('status')).toHaveClass('w-12', 'h-12');
    });
  });

  describe('variants', () => {
    it('applies default variant', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toHaveClass('border-gray-300');
    });

    it('applies primary variant', () => {
      render(<Spinner variant="primary" />);
      expect(screen.getByRole('status')).toHaveClass('border-emerald-200');
    });

    it('applies white variant', () => {
      render(<Spinner variant="white" />);
      expect(screen.getByRole('status')).toHaveClass('border-t-white');
    });
  });
});

describe('Progress', () => {
  describe('rendering', () => {
    it('renders with role="progressbar"', () => {
      render(<Progress value={50} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('sets correct aria values', () => {
      render(<Progress value={50} max={100} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '50');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('value', () => {
    it('clamps value to minimum 0', () => {
      render(<Progress value={-10} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    });

    it('clamps value to maximum', () => {
      render(<Progress value={150} max={100} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    });
  });

  describe('label', () => {
    it('shows label when showLabel is true', () => {
      render(<Progress value={50} showLabel />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('uses custom format function', () => {
      render(
        <Progress
          value={3}
          max={10}
          showLabel
          formatLabel={(val, max) => `${val} of ${max}`}
        />
      );
      expect(screen.getByText('3 of 10')).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('applies md size by default', () => {
      const { container } = render(<Progress value={50} />);
      expect(container.querySelector('.h-3')).toBeInTheDocument();
    });

    it('applies xs size', () => {
      const { container } = render(<Progress value={50} size="xs" />);
      expect(container.querySelector('.h-1')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('applies default variant', () => {
      const { container } = render(<Progress value={50} />);
      expect(container.querySelector('.from-emerald-500')).toBeInTheDocument();
    });

    it('applies danger variant', () => {
      const { container } = render(<Progress value={50} variant="danger" />);
      expect(container.querySelector('.bg-rose-500')).toBeInTheDocument();
    });
  });
});

describe('Skeleton', () => {
  describe('rendering', () => {
    it('renders skeleton element', () => {
      const { container } = render(<Skeleton />);
      expect(container.querySelector('.bg-gray-200')).toBeInTheDocument();
    });

    it('has pulse animation by default', () => {
      const { container } = render(<Skeleton />);
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('can disable animation', () => {
      const { container } = render(<Skeleton animate={false} />);
      expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('applies text variant by default', () => {
      const { container } = render(<Skeleton />);
      expect(container.querySelector('.rounded')).toBeInTheDocument();
    });

    it('applies circular variant', () => {
      const { container } = render(<Skeleton variant="circular" />);
      expect(container.querySelector('.rounded-full')).toBeInTheDocument();
    });

    it('applies rounded variant', () => {
      const { container } = render(<Skeleton variant="rounded" />);
      expect(container.querySelector('.rounded-xl')).toBeInTheDocument();
    });
  });

  describe('dimensions', () => {
    it('applies custom width', () => {
      const { container } = render(<Skeleton width={200} />);
      expect(container.firstChild).toHaveStyle({ width: '200px' });
    });

    it('applies custom height', () => {
      const { container } = render(<Skeleton height="50px" />);
      expect(container.firstChild).toHaveStyle({ height: '50px' });
    });
  });

  describe('lines', () => {
    it('renders multiple lines for text variant', () => {
      const { container } = render(<Skeleton variant="text" lines={3} />);
      const skeletons = container.querySelectorAll('.bg-gray-200');
      expect(skeletons.length).toBe(3);
    });

    it('makes last line shorter', () => {
      const { container } = render(<Skeleton variant="text" lines={2} />);
      const skeletons = container.querySelectorAll('.bg-gray-200');
      expect(skeletons[1]).toHaveStyle({ width: '75%' });
    });
  });
});

describe('Alert', () => {
  describe('rendering', () => {
    it('renders with role="alert"', () => {
      render(<Alert>Test message</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders children', () => {
      render(<Alert>Test message</Alert>);
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('renders title when provided', () => {
      render(<Alert title="Alert Title">Content</Alert>);
      expect(screen.getByText('Alert Title')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('applies info variant by default', () => {
      render(<Alert>Info message</Alert>);
      expect(screen.getByRole('alert')).toHaveClass('bg-blue-50');
    });

    it('applies success variant', () => {
      render(<Alert variant="success">Success message</Alert>);
      expect(screen.getByRole('alert')).toHaveClass('bg-emerald-50');
    });

    it('applies warning variant', () => {
      render(<Alert variant="warning">Warning message</Alert>);
      expect(screen.getByRole('alert')).toHaveClass('bg-amber-50');
    });

    it('applies error variant', () => {
      render(<Alert variant="error">Error message</Alert>);
      expect(screen.getByRole('alert')).toHaveClass('bg-rose-50');
    });
  });

  describe('icon', () => {
    it('shows icon by default', () => {
      const { container } = render(<Alert>Message</Alert>);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('hides icon when showIcon is false', () => {
      const { container } = render(<Alert showIcon={false}>Message</Alert>);
      expect(container.querySelector('svg')).not.toBeInTheDocument();
    });
  });

  describe('dismissible', () => {
    it('shows dismiss button when dismissible', () => {
      render(<Alert dismissible onDismiss={() => {}}>Message</Alert>);
      expect(screen.getByLabelText('Dismiss')).toBeInTheDocument();
    });

    it('calls onDismiss when clicked', () => {
      const handleDismiss = vi.fn();
      render(<Alert dismissible onDismiss={handleDismiss}>Message</Alert>);
      fireEvent.click(screen.getByLabelText('Dismiss'));
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });

    it('does not show dismiss button without onDismiss', () => {
      render(<Alert dismissible>Message</Alert>);
      expect(screen.queryByLabelText('Dismiss')).not.toBeInTheDocument();
    });
  });
});

describe('Badge', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText('New')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('applies default variant', () => {
      render(<Badge>Default</Badge>);
      expect(screen.getByText('Default')).toHaveClass('bg-gray-100');
    });

    it('applies primary variant', () => {
      render(<Badge variant="primary">Primary</Badge>);
      expect(screen.getByText('Primary')).toHaveClass('bg-emerald-100');
    });

    it('applies danger variant', () => {
      render(<Badge variant="danger">Danger</Badge>);
      expect(screen.getByText('Danger')).toHaveClass('bg-rose-100');
    });
  });

  describe('sizes', () => {
    it('applies md size by default', () => {
      render(<Badge>Medium</Badge>);
      expect(screen.getByText('Medium')).toHaveClass('px-2');
    });

    it('applies sm size', () => {
      render(<Badge size="sm">Small</Badge>);
      expect(screen.getByText('Small')).toHaveClass('px-1.5');
    });

    it('applies lg size', () => {
      render(<Badge size="lg">Large</Badge>);
      expect(screen.getByText('Large')).toHaveClass('px-2.5', 'text-sm');
    });
  });

  describe('styles', () => {
    it('applies outlined style', () => {
      render(<Badge outlined>Outlined</Badge>);
      expect(screen.getByText('Outlined')).toHaveClass('border', 'bg-transparent');
    });

    it('applies pill shape', () => {
      render(<Badge pill>Pill</Badge>);
      expect(screen.getByText('Pill')).toHaveClass('rounded-full');
    });
  });

  describe('dot', () => {
    it('shows dot indicator', () => {
      const { container } = render(<Badge dot>Online</Badge>);
      expect(container.querySelector('.rounded-full.w-2.h-2')).toBeInTheDocument();
    });
  });

  describe('icon', () => {
    it('renders icon', () => {
      render(<Badge icon={<span data-testid="icon">*</span>}>With Icon</Badge>);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });

  describe('removable', () => {
    it('shows remove button when removable', () => {
      render(<Badge removable onRemove={() => {}}>Removable</Badge>);
      expect(screen.getByLabelText('Remove')).toBeInTheDocument();
    });

    it('calls onRemove when clicked', () => {
      const handleRemove = vi.fn();
      render(<Badge removable onRemove={handleRemove}>Removable</Badge>);
      fireEvent.click(screen.getByLabelText('Remove'));
      expect(handleRemove).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Tooltip', () => {
  describe('rendering', () => {
    it('renders trigger element', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );
      expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
    });

    it('shows tooltip on hover', async () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByRole('button'));
      expect(await screen.findByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    });

    it('hides tooltip on mouse leave', async () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByRole('button'));
      await screen.findByRole('tooltip');
      fireEvent.mouseLeave(screen.getByRole('button'));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('shows tooltip on focus', async () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Focus me</button>
        </Tooltip>
      );

      fireEvent.focus(screen.getByRole('button'));
      expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    });
  });

  describe('disabled', () => {
    it('does not show tooltip when disabled', () => {
      render(
        <Tooltip content="Tooltip text" disabled>
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByRole('button'));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });
});

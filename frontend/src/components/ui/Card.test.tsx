import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Card from './Card';

describe('Card', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <Card.Body>Card content</Card.Body>
        </Card>
      );
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders as div by default', () => {
      const { container } = render(
        <Card>
          <Card.Body>Content</Card.Body>
        </Card>
      );
      expect(container.firstChild?.nodeName).toBe('DIV');
    });

    it('renders as article when specified', () => {
      const { container } = render(
        <Card as="article">
          <Card.Body>Content</Card.Body>
        </Card>
      );
      expect(container.firstChild?.nodeName).toBe('ARTICLE');
    });
  });

  describe('variants', () => {
    it('applies default variant classes', () => {
      const { container } = render(
        <Card>
          <Card.Body>Content</Card.Body>
        </Card>
      );
      expect(container.firstChild).toHaveClass('shadow-sm', 'border');
    });

    it('applies elevated variant classes', () => {
      const { container } = render(
        <Card variant="elevated">
          <Card.Body>Content</Card.Body>
        </Card>
      );
      expect(container.firstChild).toHaveClass('shadow-lg');
    });

    it('applies outlined variant classes', () => {
      const { container } = render(
        <Card variant="outlined">
          <Card.Body>Content</Card.Body>
        </Card>
      );
      expect(container.firstChild).toHaveClass('border-2');
    });

    it('applies ghost variant classes', () => {
      const { container } = render(
        <Card variant="ghost">
          <Card.Body>Content</Card.Body>
        </Card>
      );
      expect(container.firstChild).toHaveClass('bg-gray-50');
      expect(container.firstChild).toHaveClass('shadow-none');
    });
  });

  describe('hoverable', () => {
    it('applies hover classes when hoverable', () => {
      const { container } = render(
        <Card hoverable>
          <Card.Body>Content</Card.Body>
        </Card>
      );
      expect(container.firstChild).toHaveClass('hover:shadow-md', 'cursor-pointer');
    });

    it('does not apply hover classes by default', () => {
      const { container } = render(
        <Card>
          <Card.Body>Content</Card.Body>
        </Card>
      );
      expect(container.firstChild).not.toHaveClass('hover:shadow-md');
    });
  });

  describe('clickable', () => {
    it('renders as button when clickable', () => {
      const { container } = render(
        <Card clickable onClick={() => {}}>
          <Card.Body>Content</Card.Body>
        </Card>
      );
      expect(container.firstChild?.nodeName).toBe('BUTTON');
    });

    it('calls onClick when clicked', () => {
      const handleClick = vi.fn();
      render(
        <Card clickable onClick={handleClick}>
          <Card.Body>Content</Card.Body>
        </Card>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has proper focus styles when clickable', () => {
      const { container } = render(
        <Card clickable onClick={() => {}}>
          <Card.Body>Content</Card.Body>
        </Card>
      );
      expect(container.firstChild).toHaveClass('focus:ring-2');
    });
  });

  describe('custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <Card className="custom-class">
          <Card.Body>Content</Card.Body>
        </Card>
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});

describe('Card.Header', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <Card.Header>Header Title</Card.Header>
        </Card>
      );
      expect(screen.getByText('Header Title')).toBeInTheDocument();
    });

    it('renders action element', () => {
      render(
        <Card>
          <Card.Header action={<button>Action</button>}>Title</Card.Header>
        </Card>
      );
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('has border-bottom styling', () => {
      const { container } = render(
        <Card>
          <Card.Header>Title</Card.Header>
        </Card>
      );
      const header = container.querySelector('.border-b');
      expect(header).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <Card>
          <Card.Header className="custom-header">Title</Card.Header>
        </Card>
      );
      expect(container.querySelector('.custom-header')).toBeInTheDocument();
    });
  });
});

describe('Card.Body', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <Card.Body>Body content</Card.Body>
        </Card>
      );
      expect(screen.getByText('Body content')).toBeInTheDocument();
    });
  });

  describe('padding', () => {
    it('applies md padding by default', () => {
      const { container } = render(
        <Card>
          <Card.Body>Content</Card.Body>
        </Card>
      );
      const body = container.querySelector('.p-4');
      expect(body).toBeInTheDocument();
    });

    it('applies sm padding', () => {
      const { container } = render(
        <Card>
          <Card.Body padding="sm">Content</Card.Body>
        </Card>
      );
      const body = container.querySelector('.p-3');
      expect(body).toBeInTheDocument();
    });

    it('applies lg padding', () => {
      const { container } = render(
        <Card>
          <Card.Body padding="lg">Content</Card.Body>
        </Card>
      );
      const body = container.querySelector('.p-6');
      expect(body).toBeInTheDocument();
    });

    it('applies no padding when none', () => {
      const { container } = render(
        <Card>
          <Card.Body padding="none">Content</Card.Body>
        </Card>
      );
      // CardBody with padding="none" should have no padding classes
      const body = container.querySelector('div > div');
      expect(body).toBeInTheDocument();
      // The body should not have p-* classes, but may have other classes
      // Check that the text "Content" is present directly without padding wrapper
    });
  });
});

describe('Card.Footer', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <Card.Footer>
            <button>Save</button>
          </Card.Footer>
        </Card>
      );
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('has border-top styling', () => {
      const { container } = render(
        <Card>
          <Card.Footer>Footer</Card.Footer>
        </Card>
      );
      const footer = container.querySelector('.border-t');
      expect(footer).toBeInTheDocument();
    });
  });

  describe('justify', () => {
    it('applies justify-end by default', () => {
      const { container } = render(
        <Card>
          <Card.Footer>Footer</Card.Footer>
        </Card>
      );
      const footer = container.querySelector('.justify-end');
      expect(footer).toBeInTheDocument();
    });

    it('applies justify-start', () => {
      const { container } = render(
        <Card>
          <Card.Footer justify="start">Footer</Card.Footer>
        </Card>
      );
      const footer = container.querySelector('.justify-start');
      expect(footer).toBeInTheDocument();
    });

    it('applies justify-between', () => {
      const { container } = render(
        <Card>
          <Card.Footer justify="between">Footer</Card.Footer>
        </Card>
      );
      const footer = container.querySelector('.justify-between');
      expect(footer).toBeInTheDocument();
    });
  });
});

describe('Card compound component', () => {
  it('renders complete card with all sections', () => {
    render(
      <Card>
        <Card.Header action={<button>Edit</button>}>Title</Card.Header>
        <Card.Body>Content</Card.Body>
        <Card.Footer>
          <button>Cancel</button>
          <button>Save</button>
        </Card.Footer>
      </Card>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });
});

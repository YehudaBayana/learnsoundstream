import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Avatar from './Avatar';
import Image from './Image';
import List from './List';
import ListItem from './ListItem';
import Table from './Table';

describe('Avatar', () => {
  describe('rendering', () => {
    it('renders with image when src provided', () => {
      render(<Avatar src="/test.jpg" alt="Test User" />);
      expect(screen.getByRole('img')).toHaveAttribute('src', '/test.jpg');
    });

    it('renders initials when no src', () => {
      render(<Avatar name="John Doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('renders single initial for one name', () => {
      render(<Avatar name="John" />);
      expect(screen.getByText('JO')).toBeInTheDocument();
    });

    it('renders ? when no name', () => {
      render(<Avatar />);
      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('applies md size by default', () => {
      const { container } = render(<Avatar name="John" />);
      expect(container.firstChild).toHaveClass('w-10', 'h-10');
    });

    it('applies xs size', () => {
      const { container } = render(<Avatar name="John" size="xs" />);
      expect(container.firstChild).toHaveClass('w-6', 'h-6');
    });

    it('applies xl size', () => {
      const { container } = render(<Avatar name="John" size="xl" />);
      expect(container.firstChild).toHaveClass('w-16', 'h-16');
    });
  });

  describe('status', () => {
    it('shows online status indicator', () => {
      render(<Avatar name="John" status="online" />);
      expect(screen.getByLabelText('Status: online')).toHaveClass('bg-green-500');
    });

    it('shows offline status indicator', () => {
      render(<Avatar name="John" status="offline" />);
      expect(screen.getByLabelText('Status: offline')).toHaveClass('bg-gray-400');
    });

    it('shows busy status indicator', () => {
      render(<Avatar name="John" status="busy" />);
      expect(screen.getByLabelText('Status: busy')).toHaveClass('bg-rose-500');
    });
  });

  describe('shape', () => {
    it('is circular by default', () => {
      const { container } = render(<Avatar name="John" />);
      expect(container.firstChild).toHaveClass('rounded-full');
    });

    it('is square when square prop is true', () => {
      const { container } = render(<Avatar name="John" square />);
      expect(container.firstChild).toHaveClass('rounded-lg');
    });
  });

  describe('image fallback', () => {
    it('shows initials on image error', () => {
      render(<Avatar src="/broken.jpg" name="John Doe" />);
      const img = screen.getByRole('img');
      fireEvent.error(img);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });
});

describe('Image', () => {
  describe('rendering', () => {
    it('renders image with src and alt', () => {
      // Disable lazy loading for this test
      render(<Image src="/test.jpg" alt="Test image" lazy={false} />);
      expect(screen.getByRole('img')).toHaveAttribute('src', '/test.jpg');
      expect(screen.getByRole('img')).toHaveAttribute('alt', 'Test image');
    });
  });

  describe('loading', () => {
    it('shows skeleton while loading', () => {
      const { container } = render(<Image src="/test.jpg" alt="Test" showSkeleton lazy={false} />);
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('hides skeleton after load', () => {
      render(<Image src="/test.jpg" alt="Test" lazy={false} />);
      const img = screen.getByRole('img');
      fireEvent.load(img);
      expect(img).toHaveClass('opacity-100');
    });
  });

  describe('fit', () => {
    it('applies cover by default', () => {
      render(<Image src="/test.jpg" alt="Test" lazy={false} />);
      expect(screen.getByRole('img')).toHaveClass('object-cover');
    });

    it('applies contain fit', () => {
      render(<Image src="/test.jpg" alt="Test" fit="contain" lazy={false} />);
      expect(screen.getByRole('img')).toHaveClass('object-contain');
    });
  });

  describe('rounded', () => {
    it('applies rounded corners', () => {
      const { container } = render(<Image src="/test.jpg" alt="Test" rounded="lg" lazy={false} />);
      expect(container.firstChild).toHaveClass('rounded-lg');
    });
  });
});

describe('List', () => {
  describe('rendering', () => {
    it('renders as ul by default', () => {
      const { container } = render(
        <List>
          <li>Item</li>
        </List>
      );
      expect(container.querySelector('ul')).toBeInTheDocument();
    });

    it('renders as ol when ordered', () => {
      const { container } = render(
        <List ordered>
          <li>Item</li>
        </List>
      );
      expect(container.querySelector('ol')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('applies divided variant', () => {
      const { container } = render(
        <List variant="divided">
          <li>Item</li>
        </List>
      );
      expect(container.firstChild).toHaveClass('[&>*:not(:last-child)]:border-b');
    });
  });
});

describe('ListItem', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<ListItem>Item content</ListItem>);
      expect(screen.getByText('Item content')).toBeInTheDocument();
    });

    it('renders leading element', () => {
      render(
        <ListItem leading={<span data-testid="icon">*</span>}>
          Item
        </ListItem>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders trailing element', () => {
      render(
        <ListItem trailing={<span data-testid="badge">New</span>}>
          Item
        </ListItem>
      );
      expect(screen.getByTestId('badge')).toBeInTheDocument();
    });

    it('renders secondary text', () => {
      render(
        <ListItem secondaryText="Secondary">Primary</ListItem>
      );
      expect(screen.getByText('Secondary')).toBeInTheDocument();
    });
  });

  describe('interactive', () => {
    it('is clickable when interactive', () => {
      const handleClick = vi.fn();
      render(
        <ListItem interactive onClick={handleClick}>
          Clickable
        </ListItem>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is not clickable when disabled', () => {
      const handleClick = vi.fn();
      render(
        <ListItem interactive onClick={handleClick} disabled>
          Disabled
        </ListItem>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('selected', () => {
    it('applies selected styles', () => {
      const { container } = render(
        <ListItem selected>Selected</ListItem>
      );
      expect(container.firstChild).toHaveClass('bg-emerald-50');
    });
  });
});

describe('Table', () => {
  describe('rendering', () => {
    it('renders table structure', () => {
      render(
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Th>Header</Table.Th>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Td>Cell</Table.Td>
            </Table.Row>
          </Table.Body>
        </Table>
      );

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Cell')).toBeInTheDocument();
    });
  });

  describe('sortable', () => {
    it('shows sort indicators when sortable', () => {
      const { container } = render(
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Th sortable sortDirection="asc">Name</Table.Th>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Td>John</Table.Td>
            </Table.Row>
          </Table.Body>
        </Table>
      );

      expect(container.querySelectorAll('svg').length).toBeGreaterThan(0);
    });

    it('calls onSort when header clicked', () => {
      const handleSort = vi.fn();
      render(
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Th sortable onSort={handleSort}>Name</Table.Th>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Td>John</Table.Td>
            </Table.Row>
          </Table.Body>
        </Table>
      );

      fireEvent.click(screen.getByText('Name'));
      expect(handleSort).toHaveBeenCalledTimes(1);
    });
  });

  describe('row selection', () => {
    it('applies selected styles', () => {
      const { container } = render(
        <Table>
          <Table.Body>
            <Table.Row selected>
              <Table.Td>Selected</Table.Td>
            </Table.Row>
          </Table.Body>
        </Table>
      );

      expect(container.querySelector('tr')).toHaveClass('bg-emerald-50');
    });
  });

  describe('striped', () => {
    it('applies striped styles', () => {
      const { container } = render(
        <Table striped>
          <Table.Body>
            <Table.Row>
              <Table.Td>Row 1</Table.Td>
            </Table.Row>
          </Table.Body>
        </Table>
      );

      expect(container.querySelector('table')).toHaveClass('[&_tbody_tr:nth-child(even)]:bg-gray-50');
    });
  });
});

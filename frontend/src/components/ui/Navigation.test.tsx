import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Tabs from './Tabs';
import Breadcrumb from './Breadcrumb';
import Pagination from './Pagination';
import Link from './Link';
import Menu from './Menu';

// Wrapper for router-dependent components
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Tabs', () => {
  describe('rendering', () => {
    it('renders tab list and panels', () => {
      render(
        <Tabs defaultTab="tab1">
          <Tabs.List>
            <Tabs.Tab id="tab1">Tab 1</Tabs.Tab>
            <Tabs.Tab id="tab2">Tab 2</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel id="tab1">Content 1</Tabs.Panel>
          <Tabs.Panel id="tab2">Content 2</Tabs.Panel>
        </Tabs>
      );

      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
    });

    it('shows default tab panel', () => {
      render(
        <Tabs defaultTab="tab1">
          <Tabs.List>
            <Tabs.Tab id="tab1">Tab 1</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel id="tab1">Content 1</Tabs.Panel>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });
  });

  describe('tab switching', () => {
    it('switches content when tab is clicked', () => {
      render(
        <Tabs defaultTab="tab1">
          <Tabs.List>
            <Tabs.Tab id="tab1">Tab 1</Tabs.Tab>
            <Tabs.Tab id="tab2">Tab 2</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel id="tab1">Content 1</Tabs.Panel>
          <Tabs.Panel id="tab2">Content 2</Tabs.Panel>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('Tab 2'));

      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('calls onTabChange when tab changes', () => {
      const handleChange = vi.fn();
      render(
        <Tabs defaultTab="tab1" onTabChange={handleChange}>
          <Tabs.List>
            <Tabs.Tab id="tab1">Tab 1</Tabs.Tab>
            <Tabs.Tab id="tab2">Tab 2</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      );

      fireEvent.click(screen.getByText('Tab 2'));
      expect(handleChange).toHaveBeenCalledWith('tab2');
    });
  });

  describe('disabled tab', () => {
    it('does not switch to disabled tab', () => {
      render(
        <Tabs defaultTab="tab1">
          <Tabs.List>
            <Tabs.Tab id="tab1">Tab 1</Tabs.Tab>
            <Tabs.Tab id="tab2" disabled>Tab 2</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel id="tab1">Content 1</Tabs.Panel>
          <Tabs.Panel id="tab2">Content 2</Tabs.Panel>
        </Tabs>
      );

      fireEvent.click(screen.getByText('Tab 2'));
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('applies pills variant', () => {
      const { container } = render(
        <Tabs defaultTab="tab1" variant="pills">
          <Tabs.List>
            <Tabs.Tab id="tab1">Tab 1</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      );

      expect(container.querySelector('[role="tablist"]')).toHaveClass('rounded-xl');
    });
  });
});

describe('Breadcrumb', () => {
  describe('rendering', () => {
    it('renders breadcrumb items', () => {
      render(
        <RouterWrapper>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Library', href: '/library' },
              { label: 'Current' },
            ]}
          />
        </RouterWrapper>
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Library')).toBeInTheDocument();
      expect(screen.getByText('Current')).toBeInTheDocument();
    });

    it('renders links for items with href', () => {
      render(
        <RouterWrapper>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Current' },
            ]}
          />
        </RouterWrapper>
      );

      expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    });

    it('does not render link for last item', () => {
      render(
        <RouterWrapper>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Current', href: '/current' },
            ]}
          />
        </RouterWrapper>
      );

      // Last item should not be a link even if href is provided
      expect(screen.queryByRole('link', { name: 'Current' })).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has navigation role', () => {
      render(
        <RouterWrapper>
          <Breadcrumb items={[{ label: 'Home' }]} />
        </RouterWrapper>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('marks current page', () => {
      render(
        <RouterWrapper>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Current' },
            ]}
          />
        </RouterWrapper>
      );

      // The aria-current is on the parent span containing the label
      const currentSpan = screen.getByText('Current').parentElement;
      expect(currentSpan).toHaveAttribute('aria-current', 'page');
    });
  });
});

describe('Pagination', () => {
  describe('rendering', () => {
    it('renders page buttons', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={() => {}}
        />
      );

      expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 5')).toBeInTheDocument();
    });

    it('does not render for single page', () => {
      const { container } = render(
        <Pagination
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('navigation', () => {
    it('calls onPageChange when page is clicked', () => {
      const handleChange = vi.fn();
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={handleChange}
        />
      );

      fireEvent.click(screen.getByLabelText('Page 3'));
      expect(handleChange).toHaveBeenCalledWith(3);
    });

    it('navigates to next page', () => {
      const handleChange = vi.fn();
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={handleChange}
        />
      );

      fireEvent.click(screen.getByLabelText('Next page'));
      expect(handleChange).toHaveBeenCalledWith(2);
    });

    it('navigates to previous page', () => {
      const handleChange = vi.fn();
      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={handleChange}
        />
      );

      fireEvent.click(screen.getByLabelText('Previous page'));
      expect(handleChange).toHaveBeenCalledWith(2);
    });
  });

  describe('disabled states', () => {
    it('disables previous on first page', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={() => {}}
        />
      );

      expect(screen.getByLabelText('Previous page')).toBeDisabled();
    });

    it('disables next on last page', () => {
      render(
        <Pagination
          currentPage={5}
          totalPages={5}
          onPageChange={() => {}}
        />
      );

      expect(screen.getByLabelText('Next page')).toBeDisabled();
    });
  });

  describe('active state', () => {
    it('marks current page as active', () => {
      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={() => {}}
        />
      );

      expect(screen.getByLabelText('Page 3')).toHaveAttribute('aria-current', 'page');
      expect(screen.getByLabelText('Page 3')).toHaveClass('bg-emerald-500');
    });
  });
});

describe('Link', () => {
  describe('rendering', () => {
    it('renders as router link', () => {
      render(
        <RouterWrapper>
          <Link to="/test">Test Link</Link>
        </RouterWrapper>
      );

      expect(screen.getByRole('link', { name: 'Test Link' })).toHaveAttribute('href', '/test');
    });

    it('renders as external link', () => {
      render(
        <RouterWrapper>
          <Link to="https://example.com" external>
            External
          </Link>
        </RouterWrapper>
      );

      const link = screen.getByRole('link', { name: 'External' });
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('variants', () => {
    it('applies primary variant', () => {
      render(
        <RouterWrapper>
          <Link to="/test" variant="primary">Primary</Link>
        </RouterWrapper>
      );

      expect(screen.getByRole('link')).toHaveClass('text-emerald-600');
    });

    it('applies muted variant', () => {
      render(
        <RouterWrapper>
          <Link to="/test" variant="muted">Muted</Link>
        </RouterWrapper>
      );

      expect(screen.getByRole('link')).toHaveClass('text-gray-500');
    });
  });

  describe('icons', () => {
    it('renders left icon', () => {
      render(
        <RouterWrapper>
          <Link to="/test" leftIcon={<span data-testid="icon">←</span>}>
            Back
          </Link>
        </RouterWrapper>
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders right icon', () => {
      render(
        <RouterWrapper>
          <Link to="/test" rightIcon={<span data-testid="icon">→</span>}>
            Next
          </Link>
        </RouterWrapper>
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });
});

describe('Menu', () => {
  describe('rendering', () => {
    it('renders trigger', () => {
      render(
        <Menu trigger={<button>Open Menu</button>}>
          <Menu.Item>Item 1</Menu.Item>
        </Menu>
      );

      expect(screen.getByRole('button', { name: 'Open Menu' })).toBeInTheDocument();
    });

    it('opens on trigger click', async () => {
      render(
        <Menu trigger={<button>Open Menu</button>}>
          <Menu.Item>Item 1</Menu.Item>
        </Menu>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Open Menu' }));
      expect(await screen.findByRole('menu')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('closes on item click', async () => {
      const handleClick = vi.fn();
      render(
        <Menu trigger={<button>Open Menu</button>}>
          <Menu.Item onClick={handleClick}>Item 1</Menu.Item>
        </Menu>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Open Menu' }));
      await screen.findByRole('menu');

      fireEvent.click(screen.getByText('Item 1'));
      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('menu items', () => {
    it('renders danger item with danger styles', async () => {
      render(
        <Menu trigger={<button>Open</button>}>
          <Menu.Item danger>Delete</Menu.Item>
        </Menu>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Open' }));
      await screen.findByRole('menu');

      // The danger class is on the button containing the text
      const deleteButton = screen.getByText('Delete').closest('button');
      expect(deleteButton).toHaveClass('text-rose-600');
    });

    it('renders disabled item', async () => {
      render(
        <Menu trigger={<button>Open</button>}>
          <Menu.Item disabled>Disabled</Menu.Item>
        </Menu>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Open' }));
      await screen.findByRole('menu');

      expect(screen.getByText('Disabled').closest('button')).toBeDisabled();
    });

    it('renders divider', async () => {
      render(
        <Menu trigger={<button>Open</button>}>
          <Menu.Item>Item 1</Menu.Item>
          <Menu.Divider />
          <Menu.Item>Item 2</Menu.Item>
        </Menu>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Open' }));
      await screen.findByRole('menu');

      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    it('renders label', async () => {
      render(
        <Menu trigger={<button>Open</button>}>
          <Menu.Label>Actions</Menu.Label>
          <Menu.Item>Item 1</Menu.Item>
        </Menu>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Open' }));
      await screen.findByRole('menu');

      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });
});

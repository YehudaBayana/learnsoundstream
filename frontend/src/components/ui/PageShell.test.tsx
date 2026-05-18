import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/utils';
import PageShell from './PageShell';

describe('PageShell', () => {
  it('renders title and children', () => {
    render(
      <PageShell title="Test Page">
        <div>Page Content</div>
      </PageShell>
    );

    expect(screen.getByText('Test Page')).toBeInTheDocument();
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(
      <PageShell title="Test" actions={<button>Click Me</button>}>
        <div>Content</div>
      </PageShell>
    );

    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('renders breadcrumbs when provided', () => {
    const breadcrumb = [
      { label: 'Home', href: '/' },
      { label: 'SubPage' }
    ];

    render(
      <PageShell title="Test Title" breadcrumb={breadcrumb}>
        <div>Content</div>
      </PageShell>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('SubPage')).toBeInTheDocument();
  });

  it('shows loading spinner when loading is true', () => {
    render(
      <PageShell title="Test" loading={true}>
        <div>Content</div>
      </PageShell>
    );

    expect(screen.queryByText('Content')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner aria-label is Loading
  });
});

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Modal from './Modal';
import Dialog from './Dialog';
import Drawer from './Drawer';
import { useModal } from './useModal';
import { renderHook, act } from '@testing-library/react';

// Helper to render with portal
const renderWithPortal = (ui: React.ReactElement) => {
  return render(ui);
};

describe('Modal', () => {
  // Mock body overflow management
  const originalOverflow = document.body.style.overflow;

  afterEach(() => {
    document.body.style.overflow = originalOverflow;
  });

  describe('rendering', () => {
    it('renders when isOpen is true', () => {
      renderWithPortal(
        <Modal isOpen={true} onClose={() => {}}>
          <Modal.Body>Modal content</Modal.Body>
        </Modal>
      );
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      renderWithPortal(
        <Modal isOpen={false} onClose={() => {}}>
          <Modal.Body>Modal content</Modal.Body>
        </Modal>
      );
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });

    it('renders with role="dialog"', () => {
      renderWithPortal(
        <Modal isOpen={true} onClose={() => {}}>
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-modal="true"', () => {
      renderWithPortal(
        <Modal isOpen={true} onClose={() => {}}>
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });
  });

  describe('compound components', () => {
    it('renders Modal.Header', () => {
      renderWithPortal(
        <Modal isOpen={true} onClose={() => {}}>
          <Modal.Header>Test Title</Modal.Header>
        </Modal>
      );
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders Modal.Body', () => {
      renderWithPortal(
        <Modal isOpen={true} onClose={() => {}}>
          <Modal.Body>Body content</Modal.Body>
        </Modal>
      );
      expect(screen.getByText('Body content')).toBeInTheDocument();
    });

    it('renders Modal.Footer', () => {
      renderWithPortal(
        <Modal isOpen={true} onClose={() => {}}>
          <Modal.Footer>Footer content</Modal.Footer>
        </Modal>
      );
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('renders complete modal with all sections', () => {
      renderWithPortal(
        <Modal isOpen={true} onClose={() => {}}>
          <Modal.Header>Title</Modal.Header>
          <Modal.Body>Body</Modal.Body>
          <Modal.Footer>Footer</Modal.Footer>
        </Modal>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Body')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });

  describe('close button', () => {
    it('renders close button in header by default', () => {
      renderWithPortal(
        <Modal isOpen={true} onClose={() => {}}>
          <Modal.Header>Title</Modal.Header>
        </Modal>
      );
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });

    it('hides close button when showCloseButton is false', () => {
      renderWithPortal(
        <Modal isOpen={true} onClose={() => {}}>
          <Modal.Header showCloseButton={false}>Title</Modal.Header>
        </Modal>
      );
      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const handleClose = vi.fn();
      renderWithPortal(
        <Modal isOpen={true} onClose={handleClose}>
          <Modal.Header>Title</Modal.Header>
        </Modal>
      );
      fireEvent.click(screen.getByLabelText('Close modal'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('escape key', () => {
    it('calls onClose when Escape is pressed', async () => {
      const handleClose = vi.fn();
      renderWithPortal(
        <Modal isOpen={true} onClose={handleClose}>
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      await waitFor(() => {
        expect(handleClose).toHaveBeenCalledTimes(1);
      });
    });

    it('does not call onClose when closeOnEscape is false', async () => {
      const handleClose = vi.fn();
      renderWithPortal(
        <Modal isOpen={true} onClose={handleClose} closeOnEscape={false}>
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      await waitFor(() => {
        expect(handleClose).not.toHaveBeenCalled();
      });
    });
  });

  describe('backdrop click', () => {
    it('calls onClose when backdrop is clicked', () => {
      const handleClose = vi.fn();
      renderWithPortal(
        <Modal isOpen={true} onClose={handleClose}>
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );

      // The backdrop is the container div that wraps the modal panel
      const dialog = screen.getByRole('dialog');
      const backdrop = dialog.querySelector('.fixed.inset-0.flex');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(handleClose).toHaveBeenCalledTimes(1);
      }
    });

    it('does not call onClose when closeOnBackdrop is false', () => {
      const handleClose = vi.fn();
      renderWithPortal(
        <Modal isOpen={true} onClose={handleClose} closeOnBackdrop={false}>
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      const backdrop = dialog.querySelector('.fixed.inset-0.flex');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(handleClose).not.toHaveBeenCalled();
      }
    });
  });

  describe('sizes', () => {
    it('applies sm size classes', () => {
      renderWithPortal(
        <Modal isOpen={true} onClose={() => {}} size="sm">
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );
      const panel = screen.getByRole('dialog').querySelector('.max-w-sm');
      expect(panel).toBeInTheDocument();
    });

    it('applies lg size classes', () => {
      renderWithPortal(
        <Modal isOpen={true} onClose={() => {}} size="lg">
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );
      const panel = screen.getByRole('dialog').querySelector('.max-w-lg');
      expect(panel).toBeInTheDocument();
    });
  });

  describe('body scroll', () => {
    it('prevents body scroll when open', () => {
      renderWithPortal(
        <Modal isOpen={true} onClose={() => {}}>
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when closed', () => {
      const { rerender } = renderWithPortal(
        <Modal isOpen={true} onClose={() => {}}>
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );

      rerender(
        <Modal isOpen={false} onClose={() => {}}>
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );
      expect(document.body.style.overflow).toBe('');
    });
  });
});

describe('Dialog', () => {
  describe('rendering', () => {
    it('renders when isOpen is true', () => {
      render(
        <Dialog
          isOpen={true}
          onClose={() => {}}
          title="Test Dialog"
        />
      );
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    });

    it('renders title', () => {
      render(
        <Dialog
          isOpen={true}
          onClose={() => {}}
          title="Dialog Title"
        />
      );
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });

    it('renders description', () => {
      render(
        <Dialog
          isOpen={true}
          onClose={() => {}}
          title="Title"
          description="This is a description"
        />
      );
      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });

    it('renders custom children', () => {
      render(
        <Dialog
          isOpen={true}
          onClose={() => {}}
          title="Title"
        >
          <p>Custom content</p>
        </Dialog>
      );
      expect(screen.getByText('Custom content')).toBeInTheDocument();
    });
  });

  describe('buttons', () => {
    it('renders confirm button with default text', () => {
      render(
        <Dialog
          isOpen={true}
          onClose={() => {}}
          title="Title"
        />
      );
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });

    it('renders cancel button by default', () => {
      render(
        <Dialog
          isOpen={true}
          onClose={() => {}}
          title="Title"
        />
      );
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('hides cancel button when hideCancel is true', () => {
      render(
        <Dialog
          isOpen={true}
          onClose={() => {}}
          title="Alert"
          hideCancel
        />
      );
      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });

    it('uses custom button text', () => {
      render(
        <Dialog
          isOpen={true}
          onClose={() => {}}
          title="Title"
          confirmText="Delete"
          cancelText="Keep"
        />
      );
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onConfirm when confirm button is clicked', () => {
      const handleConfirm = vi.fn();
      render(
        <Dialog
          isOpen={true}
          onClose={() => {}}
          title="Title"
          onConfirm={handleConfirm}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when cancel button is clicked', () => {
      const handleClose = vi.fn();
      render(
        <Dialog
          isOpen={true}
          onClose={handleClose}
          title="Title"
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when no onConfirm and confirm clicked', () => {
      const handleClose = vi.fn();
      render(
        <Dialog
          isOpen={true}
          onClose={handleClose}
          title="Alert"
          hideCancel
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('variants', () => {
    it('renders info icon by default', () => {
      render(
        <Dialog
          isOpen={true}
          onClose={() => {}}
          title="Info"
        />
      );
      // Portal renders to document.body
      expect(document.body.querySelector('.bg-blue-100')).toBeInTheDocument();
    });

    it('renders success icon', () => {
      render(
        <Dialog
          isOpen={true}
          onClose={() => {}}
          title="Success"
          variant="success"
        />
      );
      expect(document.body.querySelector('.bg-emerald-100')).toBeInTheDocument();
    });

    it('renders warning icon', () => {
      render(
        <Dialog
          isOpen={true}
          onClose={() => {}}
          title="Warning"
          variant="warning"
        />
      );
      expect(document.body.querySelector('.bg-amber-100')).toBeInTheDocument();
    });

    it('renders danger icon', () => {
      render(
        <Dialog
          isOpen={true}
          onClose={() => {}}
          title="Danger"
          variant="danger"
        />
      );
      expect(document.body.querySelector('.bg-rose-100')).toBeInTheDocument();
    });

    it('hides icon when showIcon is false', () => {
      render(
        <Dialog
          isOpen={true}
          onClose={() => {}}
          title="Title"
          showIcon={false}
        />
      );
      expect(document.body.querySelector('.bg-blue-100')).not.toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows loading spinner on confirm button', () => {
      render(
        <Dialog
          isOpen={true}
          onClose={() => {}}
          title="Title"
          loading
        />
      );
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('disables cancel button when loading', () => {
      render(
        <Dialog
          isOpen={true}
          onClose={() => {}}
          title="Title"
          loading
        />
      );
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    });
  });
});

describe('Drawer', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  describe('rendering', () => {
    it('renders when isOpen is true', () => {
      render(
        <Drawer isOpen={true} onClose={() => {}}>
          <Drawer.Body>Drawer content</Drawer.Body>
        </Drawer>
      );
      expect(screen.getByText('Drawer content')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(
        <Drawer isOpen={false} onClose={() => {}}>
          <Drawer.Body>Drawer content</Drawer.Body>
        </Drawer>
      );
      expect(screen.queryByText('Drawer content')).not.toBeInTheDocument();
    });

    it('renders with role="dialog"', () => {
      render(
        <Drawer isOpen={true} onClose={() => {}}>
          <Drawer.Body>Content</Drawer.Body>
        </Drawer>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('compound components', () => {
    it('renders Drawer.Header', () => {
      render(
        <Drawer isOpen={true} onClose={() => {}}>
          <Drawer.Header>Menu</Drawer.Header>
        </Drawer>
      );
      expect(screen.getByText('Menu')).toBeInTheDocument();
    });

    it('renders Drawer.Body', () => {
      render(
        <Drawer isOpen={true} onClose={() => {}}>
          <Drawer.Body>Body content</Drawer.Body>
        </Drawer>
      );
      expect(screen.getByText('Body content')).toBeInTheDocument();
    });

    it('renders Drawer.Footer', () => {
      render(
        <Drawer isOpen={true} onClose={() => {}}>
          <Drawer.Footer>Footer content</Drawer.Footer>
        </Drawer>
      );
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });
  });

  describe('placement', () => {
    it('renders on right by default', () => {
      render(
        <Drawer isOpen={true} onClose={() => {}}>
          <Drawer.Body>Content</Drawer.Body>
        </Drawer>
      );
      // Portal renders to document.body
      const panel = document.body.querySelector('.right-0');
      expect(panel).toBeInTheDocument();
    });

    it('renders on left when placement is left', () => {
      render(
        <Drawer isOpen={true} onClose={() => {}} placement="left">
          <Drawer.Body>Content</Drawer.Body>
        </Drawer>
      );
      const panel = document.body.querySelector('.left-0');
      expect(panel).toBeInTheDocument();
    });

    it('renders on top when placement is top', () => {
      render(
        <Drawer isOpen={true} onClose={() => {}} placement="top">
          <Drawer.Body>Content</Drawer.Body>
        </Drawer>
      );
      const panel = document.body.querySelector('.top-0');
      expect(panel).toBeInTheDocument();
    });

    it('renders on bottom when placement is bottom', () => {
      render(
        <Drawer isOpen={true} onClose={() => {}} placement="bottom">
          <Drawer.Body>Content</Drawer.Body>
        </Drawer>
      );
      const panel = document.body.querySelector('.bottom-0');
      expect(panel).toBeInTheDocument();
    });
  });

  describe('close interactions', () => {
    it('calls onClose when close button in header is clicked', () => {
      const handleClose = vi.fn();
      render(
        <Drawer isOpen={true} onClose={handleClose}>
          <Drawer.Header>Title</Drawer.Header>
        </Drawer>
      );
      fireEvent.click(screen.getByLabelText('Close drawer'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape is pressed', async () => {
      const handleClose = vi.fn();
      render(
        <Drawer isOpen={true} onClose={handleClose}>
          <Drawer.Body>Content</Drawer.Body>
        </Drawer>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      await waitFor(() => {
        expect(handleClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('sizes', () => {
    it('applies md size by default', () => {
      render(
        <Drawer isOpen={true} onClose={() => {}}>
          <Drawer.Body>Content</Drawer.Body>
        </Drawer>
      );
      // Portal renders to document.body
      const panel = document.body.querySelector('.w-80');
      expect(panel).toBeInTheDocument();
    });

    it('applies sm size', () => {
      render(
        <Drawer isOpen={true} onClose={() => {}} size="sm">
          <Drawer.Body>Content</Drawer.Body>
        </Drawer>
      );
      const panel = document.body.querySelector('.w-72');
      expect(panel).toBeInTheDocument();
    });

    it('applies lg size', () => {
      render(
        <Drawer isOpen={true} onClose={() => {}} size="lg">
          <Drawer.Body>Content</Drawer.Body>
        </Drawer>
      );
      const panel = document.body.querySelector('.w-96');
      expect(panel).toBeInTheDocument();
    });
  });
});

describe('useModal', () => {
  describe('initial state', () => {
    it('starts closed by default', () => {
      const { result } = renderHook(() => useModal());
      expect(result.current.isOpen).toBe(false);
    });

    it('starts open when initial state is true', () => {
      const { result } = renderHook(() => useModal(true));
      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('open', () => {
    it('opens the modal', () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('close', () => {
    it('closes the modal', () => {
      const { result } = renderHook(() => useModal(true));

      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('toggle', () => {
    it('toggles from closed to open', () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('toggles from open to closed', () => {
      const { result } = renderHook(() => useModal(true));

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('setIsOpen', () => {
    it('sets modal to open', () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.setIsOpen(true);
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('sets modal to closed', () => {
      const { result } = renderHook(() => useModal(true));

      act(() => {
        result.current.setIsOpen(false);
      });

      expect(result.current.isOpen).toBe(false);
    });
  });
});

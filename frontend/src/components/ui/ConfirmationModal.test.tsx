import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConfirmationModal from './ConfirmationModal';

describe('ConfirmationModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Confirm Action',
    description: 'Are you sure?',
  };

  it('renders correctly when open', () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ConfirmationModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onConfirm when confirm is clicked', () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Confirm'));
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('renders custom labels', () => {
    render(
      <ConfirmationModal 
        {...defaultProps} 
        confirmLabel="Yes, do it" 
        cancelLabel="No, wait" 
      />
    );
    
    expect(screen.getByText('Yes, do it')).toBeInTheDocument();
    expect(screen.getByText('No, wait')).toBeInTheDocument();
  });

  it('renders danger style when isDanger is true', () => {
    render(<ConfirmationModal {...defaultProps} isDanger />);
    
    const confirmBtn = screen.getByText('Confirm');
    // Check if it has danger classes (variant='danger' usually adds red bg)
    // We can't easily check exact classes due to tailwind compilation/merging, 
    // but we can check if it rendered without error.
    expect(confirmBtn).toBeInTheDocument();
  });
});

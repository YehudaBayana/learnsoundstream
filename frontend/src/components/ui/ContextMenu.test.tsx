import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ContextMenu from './ContextMenu';

describe('ContextMenu', () => {
  const TestComponent = () => (
    <ContextMenu
      content={
        <>
          <ContextMenu.Item onClick={vi.fn()}>Item 1</ContextMenu.Item>
          <ContextMenu.Item onClick={vi.fn()}>Item 2</ContextMenu.Item>
        </>
      }
    >
      <div data-testid="trigger">Trigger</div>
    </ContextMenu>
  );

  it('renders trigger', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('trigger')).toBeInTheDocument();
  });

  it('shows menu on right click', () => {
    render(<TestComponent />);
    
    const trigger = screen.getByTestId('trigger');
    fireEvent.contextMenu(trigger);
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('closes menu on outside click', () => {
    render(<TestComponent />);
    
    const trigger = screen.getByTestId('trigger');
    fireEvent.contextMenu(trigger);
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    
    fireEvent.mouseDown(document.body);
    
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('calls onClick when item is clicked and closes menu', () => {
    const handleClick = vi.fn();
    render(
      <ContextMenu
        content={
          <ContextMenu.Item onClick={handleClick}>Action</ContextMenu.Item>
        }
      >
        <div data-testid="trigger">Trigger</div>
      </ContextMenu>
    );
    
    const trigger = screen.getByTestId('trigger');
    fireEvent.contextMenu(trigger);
    
    const item = screen.getByText('Action');
    fireEvent.click(item);
    
    expect(handleClick).toHaveBeenCalled();
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
  });
});

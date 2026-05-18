import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FileInput from './FileInput';
import Slider from './Slider';

describe('FileInput', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      render(<FileInput buttonText="Choose file" />);
      expect(screen.getByText('Choose file')).toBeInTheDocument();
    });

    it('renders as button-like element', () => {
      render(<FileInput buttonText="Choose File" />);
      expect(screen.getByRole('button', { name: /choose file/i })).toBeInTheDocument();
    });

    it('has hidden file input', () => {
      const { container } = render(<FileInput />);
      const input = container.querySelector('input[type="file"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass('sr-only');
    });
  });

  describe('interactions', () => {
    it('opens file dialog when clicked', () => {
      render(<FileInput />);
      const button = screen.getByRole('button');
      const input = screen.getByTestId('file-input-hidden');
      
      const clickSpy = vi.spyOn(input, 'click');
      fireEvent.click(button);
      expect(clickSpy).toHaveBeenCalled();
    });

    it('calls onChange when file is selected', () => {
      const handleChange = vi.fn();
      render(<FileInput onChange={handleChange} />);
      const input = screen.getByTestId('file-input-hidden');
      
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      fireEvent.change(input, { target: { files: [file] } });
      
      expect(handleChange).toHaveBeenCalled();
    });

    it('displays selected filename', () => {
      render(<FileInput />);
      const input = screen.getByTestId('file-input-hidden');
      
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      fireEvent.change(input, { target: { files: [file] } });
      
      expect(screen.getByText('test.png')).toBeInTheDocument();
    });
  });

  describe('states', () => {
    it('can be disabled', () => {
      render(<FileInput disabled />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('shows error state', () => {
      render(<FileInput error />);
      expect(screen.getByRole('button')).toHaveClass('ring-rose-500');
    });
  });
});

describe('Slider', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      render(<Slider value={50} onChange={() => {}} />);
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('sets correct values', () => {
      render(<Slider value={50} min={0} max={100} onChange={() => {}} />);
      const slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider.value).toBe('50');
      expect(slider.min).toBe('0');
      expect(slider.max).toBe('100');
    });
  });

  describe('interactions', () => {
    it('calls onChange when value changes', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onChange={handleChange} />);
      const slider = screen.getByRole('slider');
      
      fireEvent.change(slider, { target: { value: '75' } });
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('states', () => {
    it('can be disabled', () => {
      render(<Slider disabled value={50} onChange={() => {}} />);
      expect(screen.getByRole('slider')).toBeDisabled();
    });

    it('applies horizontal orientation by default', () => {
      const { container } = render(<Slider value={50} onChange={() => {}} />);
      // The wrapper div should have flex items-center
      expect(container.firstChild).toHaveClass('flex', 'items-center');
    });
  });

  describe('sizes', () => {
    it('applies sm size', () => {
      render(<Slider size="sm" value={50} onChange={() => {}} data-testid="slider" />);
      expect(screen.getByTestId('slider')).toHaveClass('h-1');
    });

    it('applies md size by default', () => {
      render(<Slider value={50} onChange={() => {}} data-testid="slider" />);
      expect(screen.getByTestId('slider')).toHaveClass('h-2');
    });

    it('applies lg size', () => {
      render(<Slider size="lg" value={50} onChange={() => {}} data-testid="slider" />);
      expect(screen.getByTestId('slider')).toHaveClass('h-3');
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';
import TextArea from './TextArea';
import Select from './Select';
import Checkbox from './Checkbox';
import Radio from './Radio';
import RadioGroup from './RadioGroup';
import Switch from './Switch';
import FormField from './FormField';
import Form from './Form';

describe('Input', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with left icon', () => {
      render(<Input leftIcon={<span data-testid="icon">🔍</span>} />);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
      render(<Input rightIcon={<span data-testid="icon">✓</span>} />);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('applies sm size classes', () => {
      render(<Input size="sm" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('h-8', 'text-sm');
    });

    it('applies md size classes by default', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('h-10', 'text-base');
    });

    it('applies lg size classes', () => {
      render(<Input size="lg" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('h-12', 'text-lg');
    });
  });

  describe('variants', () => {
    it('applies outline variant by default', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('border', 'rounded-lg');
    });

    it('applies filled variant', () => {
      render(<Input variant="filled" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('bg-gray-100');
    });

    it('applies flushed variant', () => {
      render(<Input variant="flushed" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('border-b-2', 'rounded-none');
    });
  });

  describe('error state', () => {
    it('applies error styling', () => {
      render(<Input error data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('border-rose-500');
    });
  });

  describe('disabled state', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Input disabled data-testid="input" />);
      expect(screen.getByTestId('input')).toBeDisabled();
      expect(screen.getByTestId('input')).toHaveClass('opacity-50', 'cursor-not-allowed');
    });
  });
});

describe('TextArea', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      render(<TextArea placeholder="Enter description" />);
      expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
    });
  });

  describe('resize', () => {
    it('applies vertical resize by default', () => {
      render(<TextArea data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveClass('resize-y');
    });

    it('applies no resize', () => {
      render(<TextArea resize="none" data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveClass('resize-none');
    });
  });
});

describe('Select', () => {
  const options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
  ];

  describe('rendering', () => {
    it('renders options correctly', () => {
      render(<Select options={options} />);
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('renders placeholder', () => {
      render(<Select placeholder="Select an option" options={options} />);
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('renders children as options', () => {
      render(
        <Select>
          <option value="a">Choice A</option>
          <option value="b">Choice B</option>
        </Select>
      );
      expect(screen.getByText('Choice A')).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('applies sm size classes', () => {
      render(<Select size="sm" options={options} data-testid="select" />);
      expect(screen.getByTestId('select')).toHaveClass('h-8', 'text-sm');
    });
  });
});

describe('Checkbox', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      render(<Checkbox />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Checkbox label="Accept terms" />);
      expect(screen.getByText('Accept terms')).toBeInTheDocument();
    });

    it('renders with description', () => {
      render(<Checkbox label="Newsletter" description="Weekly updates" />);
      expect(screen.getByText('Weekly updates')).toBeInTheDocument();
    });
  });

  describe('states', () => {
    it('can be checked', () => {
      render(<Checkbox defaultChecked />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('can be disabled', () => {
      render(<Checkbox disabled />);
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });
  });
});

describe('Radio', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      render(<Radio name="test" value="1" />);
      expect(screen.getByRole('radio')).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Radio name="test" value="1" label="Option 1" />);
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
  });
});

describe('RadioGroup', () => {
  const options = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
  ];

  describe('rendering', () => {
    it('renders all options', () => {
      render(<RadioGroup name="test" options={options} />);
      expect(screen.getByText('Option A')).toBeInTheDocument();
      expect(screen.getByText('Option B')).toBeInTheDocument();
    });

    it('has correct radiogroup role', () => {
      render(<RadioGroup name="test" options={options} />);
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('calls onChange when option is selected', async () => {
      const handleChange = vi.fn();
      render(<RadioGroup name="test" options={options} onChange={handleChange} />);

      await userEvent.click(screen.getByLabelText('Option A'));
      expect(handleChange).toHaveBeenCalledWith('a');
    });

    it('shows correct option as checked', () => {
      render(<RadioGroup name="test" options={options} value="b" />);
      const radioB = screen.getByLabelText('Option B');
      expect(radioB).toBeChecked();
    });
  });

  describe('orientation', () => {
    it('applies vertical orientation by default', () => {
      render(<RadioGroup name="test" options={options} />);
      expect(screen.getByRole('radiogroup')).toHaveClass('flex-col');
    });

    it('applies horizontal orientation', () => {
      render(<RadioGroup name="test" options={options} orientation="horizontal" />);
      expect(screen.getByRole('radiogroup')).toHaveClass('flex-row');
    });
  });
});

describe('Switch', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      render(<Switch />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Switch label="Enable notifications" />);
      expect(screen.getByText('Enable notifications')).toBeInTheDocument();
    });
  });

  describe('states', () => {
    it('can be checked', () => {
      render(<Switch checked onChange={() => {}} />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    });

    it('can be disabled', () => {
      render(<Switch disabled />);
      expect(screen.getByRole('switch')).toBeDisabled();
    });
  });

  describe('label position', () => {
    it('places label on right by default', () => {
      const { container } = render(<Switch label="Test" />);
      expect(container.firstChild).not.toHaveClass('flex-row-reverse');
    });

    it('places label on left when specified', () => {
      const { container } = render(<Switch label="Test" labelPosition="left" />);
      expect(container.firstChild).toHaveClass('flex-row-reverse');
    });
  });
});

describe('FormField', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(
        <FormField>
          <Input placeholder="test" />
        </FormField>
      );
      expect(screen.getByPlaceholderText('test')).toBeInTheDocument();
    });

    it('renders label', () => {
      render(
        <FormField label="Email">
          <Input />
        </FormField>
      );
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('renders required indicator', () => {
      render(
        <FormField label="Email" required>
          <Input />
        </FormField>
      );
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('renders helper text', () => {
      render(
        <FormField helperText="Enter your email address">
          <Input />
        </FormField>
      );
      expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    });

    it('renders error message instead of helper text', () => {
      render(
        <FormField helperText="Enter your email" error="Email is required">
          <Input />
        </FormField>
      );
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.queryByText('Enter your email')).not.toBeInTheDocument();
    });
  });
});

describe('Form', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(
        <Form>
          <Input placeholder="test" />
        </Form>
      );
      expect(screen.getByPlaceholderText('test')).toBeInTheDocument();
    });
  });

  describe('submission', () => {
    it('calls onSubmit and prevents default', () => {
      const handleSubmit = vi.fn();
      render(
        <Form onSubmit={handleSubmit}>
          <button type="submit">Submit</button>
        </Form>
      );

      fireEvent.click(screen.getByText('Submit'));
      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe('gap', () => {
    it('applies default gap', () => {
      const { container } = render(
        <Form>
          <Input />
        </Form>
      );
      expect(container.firstChild).toHaveClass('gap-6');
    });

    it('applies custom gap', () => {
      const { container } = render(
        <Form gap={4}>
          <Input />
        </Form>
      );
      expect(container.firstChild).toHaveClass('gap-4');
    });
  });
});

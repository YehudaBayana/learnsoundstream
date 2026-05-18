import React from 'react';
import Radio, { type RadioSize } from './Radio';

/**
 * RadioGroup option type.
 */
export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

/**
 * RadioGroup orientation options.
 */
export type RadioGroupOrientation = 'horizontal' | 'vertical';

interface RadioGroupProps {
  /** Group name (used for all radio inputs) */
  name: string;
  /** Current selected value */
  value?: string;
  /** Radio options */
  options: RadioOption[];
  /** Called when selection changes */
  onChange?: (value: string) => void;
  /** Radio size */
  size?: RadioSize;
  /** Group orientation */
  orientation?: RadioGroupOrientation;
  /** Whether all radios are disabled */
  disabled?: boolean;
  /** Whether the group has an error */
  error?: boolean;
  /** Gap between radio options */
  gap?: 2 | 3 | 4 | 6;
  /** Additional CSS classes */
  className?: string;
}

/**
 * RadioGroup - Container for grouping related radio buttons.
 *
 * Features:
 * - Horizontal and vertical orientations
 * - Controlled value with onChange callback
 * - Options via prop
 * - Configurable gap
 * - Error state styling
 * - Disabled state for entire group
 * - Dark mode support
 *
 * Usage:
 *   <RadioGroup
 *     name="plan"
 *     value={selectedPlan}
 *     onChange={setSelectedPlan}
 *     options={[
 *       { value: 'free', label: 'Free' },
 *       { value: 'pro', label: 'Pro', description: '$9/month' },
 *     ]}
 *   />
 */
const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  options,
  onChange,
  size = 'md',
  orientation = 'vertical',
  disabled = false,
  error = false,
  gap = 3,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const containerClasses = [
    'flex',
    orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col',
    `gap-${gap}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} role="radiogroup">
      {options.map((option) => (
        <Radio
          key={option.value}
          name={name}
          value={option.value}
          label={option.label}
          description={option.description}
          checked={value === option.value}
          onChange={handleChange}
          size={size}
          disabled={disabled || option.disabled}
          error={error}
        />
      ))}
    </div>
  );
};

export default RadioGroup;

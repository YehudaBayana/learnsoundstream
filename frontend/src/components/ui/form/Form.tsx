import React from 'react';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  /** Form content */
  children: React.ReactNode;
  /** Called when form is submitted (with preventDefault already called) */
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  /** Gap between form elements */
  gap?: 4 | 6 | 8;
  /** Additional CSS classes */
  className?: string;
  dataHook?: string;
}

/**
 * Form - Form wrapper component with consistent styling.
 *
 * Features:
 * - Automatic preventDefault on submit
 * - Consistent vertical spacing
 * - Flexible gap configuration
 * - Passes through all form attributes
 *
 * Usage:
 *   <Form onSubmit={handleSubmit}>
 *     <FormField label="Email">
 *       <Input type="email" />
 *     </FormField>
 *     <Button type="submit">Submit</Button>
 *   </Form>
 */
const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
  gap = 6,
  className = '',
  dataHook,
  ...props
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  const formClasses = [
    'flex flex-col',
    `gap-${gap}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <form onSubmit={handleSubmit} className={formClasses} data-hook={dataHook} {...props}>
      {children}
    </form>
  );
};

export default Form;

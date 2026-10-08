import React from "react";
import Text from "../text/Text";

interface FormFieldProps {
  /** Form field content (input, select, etc.) */
  children: React.ReactNode;
  /** Field label */
  label?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Error message (overrides helperText when present) */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** HTML id for the input (used to link label) */
  htmlFor?: string;
  /** Additional CSS classes */
  className?: string;
  dataHook?: string;
}

/**
 * FormField - Wrapper component for form inputs with label and error support.
 *
 * Use this component to wrap="wrap" form inputs and provide consistent
 * label, helper text, and error message styling.
 *
 * Features:
 * - Optional label with required indicator
 * - Helper text or error message
 * - Accessible label linking via htmlFor
 * - Consistent spacing
 * - Dark mode support
 *
 * Usage:
 *   <FormField label="Email" htmlFor="email" required>
 *     <Input id="email" type="email" />
 *   </FormField>
 *
 *   <FormField label="Password" error="Password is required">
 *     <Input type="password" error />
 *   </FormField>
 */
const FormField: React.FC<FormFieldProps> = ({
  children,
  label,
  helperText,
  error,
  required = false,
  htmlFor,
  className = "",
  dataHook,
}) => {
  const hasError = Boolean(error);
  const messageText = hasError ? error : helperText;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`} data-hook={dataHook}>
      {label && (
        <Text as="label" variant="label" htmlFor={htmlFor} className="flex items-center gap-1">
          {label}
          {required && (
            <span className="text-rose-500" aria-hidden="true">
              *
            </span>
          )}
        </Text>
      )}
      {children}
      {messageText && (
        <Text
          variant="small"
          color={hasError ? "danger" : "muted"}
          className="mt-0.5"
          dataHook={dataHook ? `${dataHook}-message` : undefined}
        >
          {messageText}
        </Text>
      )}
    </div>
  );
};

export default FormField;

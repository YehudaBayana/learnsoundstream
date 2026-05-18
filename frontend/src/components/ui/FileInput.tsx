import React, { forwardRef, useRef, useState } from 'react';

/**
 * FileInput size options.
 */
export type FileInputSize = 'sm' | 'md' | 'lg';

/**
 * FileInput variant options.
 */
export type FileInputVariant = 'button' | 'dropzone';

interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Input size */
  size?: FileInputSize;
  /** Input variant */
  variant?: FileInputVariant;
  /** Whether the input has an error */
  error?: boolean;
  /** Helper text to display */
  helperText?: string;
  /** Button text (for button variant) */
  buttonText?: string;
  /** Dropzone text (for dropzone variant) */
  dropzoneText?: string;
  /** Dropzone subtext (for dropzone variant) */
  dropzoneSubtext?: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Called when files are selected */
  onFilesChange?: (files: FileList | null) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get size-specific Tailwind classes for button variant.
 */
const getButtonSizeClasses = (size: FileInputSize): string => {
  switch (size) {
    case 'sm':
      return 'px-3 py-1.5 text-sm';
    case 'md':
      return 'px-4 py-2 text-base';
    case 'lg':
      return 'px-6 py-3 text-lg';
  }
};

/**
 * Get size-specific Tailwind classes for dropzone variant.
 */
const getDropzoneSizeClasses = (size: FileInputSize): string => {
  switch (size) {
    case 'sm':
      return 'p-6';
    case 'md':
      return 'p-8';
    case 'lg':
      return 'p-12';
  }
};

/**
 * FileInput - File upload input component.
 *
 * Features:
 * - Two variants: button and dropzone
 * - Multiple sizes (sm, md, lg)
 * - Drag and drop support (dropzone variant)
 * - File selection feedback
 * - Error state styling
 * - Custom icon support
 * - Disabled state handling
 * - Dark mode support
 * - Forwarded ref for form libraries
 *
 * Usage:
 *   <FileInput accept="audio/*" onFilesChange={handleFiles} />
 *   <FileInput variant="dropzone" accept="image/*" />
 *   <FileInput buttonText="Choose File" />
 */
const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      size = 'md',
      variant = 'button',
      error = false,
      helperText,
      buttonText = 'Choose File',
      dropzoneText = 'Drop files here or click to upload',
      dropzoneSubtext,
      icon,
      onFilesChange,
      disabled,
      className = '',
      accept,
      multiple,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

    // Merge refs
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const handleClick = () => {
      inputRef.current?.click();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        setSelectedFiles(Array.from(files).map((f) => f.name));
      } else {
        setSelectedFiles([]);
      }
      onFilesChange?.(files);
      props.onChange?.(e);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        setSelectedFiles(Array.from(files).map((f) => f.name));
        onFilesChange?.(files);

        // Update the input element's files
        if (inputRef.current) {
          const dataTransfer = new DataTransfer();
          Array.from(files).forEach((file) => dataTransfer.items.add(file));
          inputRef.current.files = dataTransfer.files;
        }
      }
    };

    const defaultIcon = (
      <svg
        className={`${size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-10 h-10'} text-gray-400`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
        />
      </svg>
    );

    if (variant === 'dropzone') {
      const dropzoneClasses = [
        'flex flex-col items-center justify-center',
        getDropzoneSizeClasses(size),
        'border-2 border-dashed rounded-xl',
        'transition-colors duration-200',
        'cursor-pointer',
        isDragging
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
          : error
            ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
            : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ');

      return (
        <div
          className={dropzoneClasses}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            data-testid="file-input-hidden"
            className="sr-only"
            disabled={disabled}
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            {...props}
          />
          {icon || defaultIcon}
          <p className="mt-2 text-sm font-medium text-gray-700 dark:text-slate-300">
            {selectedFiles.length > 0 ? selectedFiles.join(', ') : dropzoneText}
          </p>
          {dropzoneSubtext && (
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{dropzoneSubtext}</p>
          )}
          {helperText && (
            <p
              className={`mt-2 text-xs ${error ? 'text-rose-500' : 'text-gray-500 dark:text-slate-400'}`}
            >
              {helperText}
            </p>
          )}
        </div>
      );
    }

    // Button variant
    const buttonClasses = [
      'inline-flex items-center justify-center gap-2',
      getButtonSizeClasses(size),
      'rounded-lg',
      'transition-colors duration-200',
      'cursor-pointer',
      'bg-gray-200 dark:bg-slate-700',
      'text-gray-700 dark:text-slate-300',
      'hover:bg-gray-300 dark:hover:bg-slate-600',
      error ? 'ring-2 ring-rose-500' : '',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={`flex flex-col ${className}`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={buttonClasses}
            onClick={handleClick}
            disabled={disabled}
          >
            {icon || (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            )}
            {buttonText}
          </button>
          {selectedFiles.length > 0 && (
            <span className="text-sm text-gray-600 dark:text-slate-400 truncate max-w-xs">
              {selectedFiles.join(', ')}
            </span>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          data-testid="file-input-hidden"
          className="sr-only"
          disabled={disabled}
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          {...props}
        />
        {helperText && (
          <p
            className={`mt-1 text-sm ${error ? 'text-rose-500' : 'text-gray-500 dark:text-slate-400'}`}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';

export default FileInput;

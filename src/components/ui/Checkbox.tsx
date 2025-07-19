import React from 'react';
import clsx from 'clsx';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className, id, ...props }, ref) => {
    return (
      <div className={clsx('relative flex items-start', className)}>
        <div className="flex h-5 items-center">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className={clsx(
              'h-4 w-4 rounded',
              error
                ? 'border-red-300 text-red-600 focus:ring-red-500'
                : 'border-gray-300 text-indigo-600 focus:ring-indigo-500',
              props.disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${id}-error` : description ? `${id}-description` : undefined
            }
            {...props}
          />
        </div>
        {(label || description || error) && (
          <div className="ml-3 text-sm">
            {label && (
              <label htmlFor={id} className="font-medium text-gray-700">
                {label}
              </label>
            )}
            {description && (
              <p id={`${id}-description`} className="text-gray-500">
                {description}
              </p>
            )}
            {error && (
              <p id={`${id}-error`} className="text-red-600">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox'; 
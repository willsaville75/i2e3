import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = true, className, id, ...props }, ref) => {
    return (
      <div className={clsx(fullWidth && 'w-full', className)}>
        {label && (
          <label htmlFor={id} className="block text-sm/6 font-medium text-gray-900">
            {label}
          </label>
        )}
        <div className={label ? 'mt-2' : ''}>
          <input
            ref={ref}
            id={id}
            className={clsx(
              'block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900',
              'outline outline-1 -outline-offset-1 placeholder:text-gray-400',
              'sm:text-sm/6',
              error
                ? 'outline-red-300 text-red-900 placeholder-red-300 focus:outline-red-600 focus:outline-2 focus:-outline-offset-2'
                : 'outline-gray-300 focus:outline-indigo-600 focus:outline-2 focus:-outline-offset-2',
              props.disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed'
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-description` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600" id={`${id}-error`}>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500" id={`${id}-description`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input'; 
import React from 'react';
import clsx from 'clsx';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
  error?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ 
    label, 
    helperText, 
    error, 
    showValue = true,
    formatValue = (v) => String(v),
    className, 
    id, 
    min = 0,
    max = 100,
    step = 1,
    value,
    ...props 
  }, ref) => {
    const currentValue = value !== undefined ? Number(value) : Number(props.defaultValue) || min;
    
    return (
      <div className={clsx('w-full', className)}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className={label ? 'mt-1' : ''}>
          <input
            ref={ref}
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            className={clsx(
              'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer',
              error ? 'accent-red-600' : 'accent-indigo-600',
              props.disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-description` : undefined}
            {...props}
          />
          {showValue && (
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{min}</span>
              <span className="font-medium text-gray-900">{formatValue(Number(currentValue))}</span>
              <span>{max}</span>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500" id={`${id}-description`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider'; 
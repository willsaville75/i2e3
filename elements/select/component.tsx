import React from 'react';
import clsx from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  id?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  options: SelectOption[];
  disabled?: boolean;
  required?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  className?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

export const Select: React.FC<SelectProps> = ({
  id,
  value,
  defaultValue,
  placeholder,
  options = [],
  disabled = false,
  required = false,
  label,
  helperText,
  error,
  size = 'md',
  variant = 'default',
  className,
  onChange,
  onBlur,
  onFocus,
}) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  const variantClasses = {
    default: 'border border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500',
    filled: 'border-0 bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500',
    outlined: 'border-2 border-gray-300 bg-transparent focus:border-blue-500',
  };

  const selectClasses = clsx(
    'block w-full rounded-lg transition-colors appearance-none',
    'focus:outline-none focus:ring-1',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    sizeClasses[size],
    variantClasses[variant],
    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
    className
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          id={id}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          required={required}
          className={selectClasses}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom arrow icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}; 
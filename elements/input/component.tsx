import React from 'react';
import clsx from 'clsx';

export interface InputProps {
  id?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
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

export const Input: React.FC<InputProps> = ({
  id,
  type = 'text',
  placeholder,
  value,
  defaultValue,
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

  const inputClasses = clsx(
    'block w-full rounded-lg transition-colors',
    'focus:outline-none focus:ring-1',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    sizeClasses[size],
    variantClasses[variant],
    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
    className
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        required={required}
        className={inputClasses}
        onChange={handleChange}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}; 
import React, { Fragment, useRef } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  preview?: React.ReactNode; // For visual preview in style picker
  color?: string; // For color swatches
  gradient?: string; // For gradient swatches
}

interface SelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  id?: string;
  // New prop to control dropdown behavior
  variant?: 'dropdown' | 'native' | 'style-picker' | 'visual-grid';
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  className,
  label,
  error,
  id,
  variant = 'dropdown'
}) => {
  const selectedOption = options.find(option => option.value === value);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Use native select for better mobile experience or when specified
  if (variant === 'native' || options.length > 10) {
    return (
      <div className={className}>
        {label && (
          <label htmlFor={id} className="block text-sm/6 font-medium text-gray-900">
            {label}
          </label>
        )}
        <div className={label ? 'mt-2' : ''}>
          <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={clsx(
              'block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900',
              'outline outline-1 -outline-offset-1 placeholder:text-gray-400',
              'sm:text-sm/6',
              error
                ? 'outline-red-300 focus:outline-red-600 focus:outline-2 focus:-outline-offset-2'
                : 'outline-gray-300 focus:outline-indigo-600 focus:outline-2 focus:-outline-offset-2',
              disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed'
            )}
          >
            {!value && (
              <option value="">{placeholder}</option>
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
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  // For small option sets (2-5), use a clean radio group
  if (options.length <= 5 && variant !== 'visual-grid') {
    return (
      <fieldset className={className}>
        {label && (
          <legend className="text-sm/6 font-medium text-gray-900">{label}</legend>
        )}
        <div className="mt-3 space-y-3">
          {options.map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                id={`${id}-${option.value}`}
                type="radio"
                name={id || 'radio-group'}
                checked={value === option.value}
                onChange={() => !disabled && !option.disabled && onChange(option.value)}
                disabled={disabled || option.disabled}
                className={clsx(
                  'relative size-4 appearance-none rounded-full border bg-white',
                  'before:absolute before:inset-1 before:rounded-full before:bg-white',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                  'forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden',
                  value === option.value
                    ? 'border-current bg-current focus-visible:outline-current'
                    : 'border-gray-300',
                  (disabled || option.disabled) 
                    ? 'border-gray-300 bg-gray-100 before:bg-gray-400 cursor-not-allowed'
                    : 'cursor-pointer'
                )}
                style={value === option.value ? { 
                  borderColor: 'currentColor',
                  backgroundColor: 'currentColor',
                  outlineColor: 'currentColor'
                } : undefined}
              />
              <label
                htmlFor={`${id}-${option.value}`}
                className={clsx(
                  'ml-3 flex items-center gap-2 text-sm/6 font-medium',
                  (disabled || option.disabled)
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-900 cursor-pointer'
                )}
              >
                {/* Color/Gradient Swatch */}
                {(option.color || option.gradient) && (
                  <div 
                    className="w-5 h-5 rounded border border-gray-300 shadow-sm flex-shrink-0"
                    style={
                      option.gradient 
                        ? { background: option.gradient }
                        : { backgroundColor: option.color }
                    }
                  />
                )}
                <span>{option.label}</span>
              </label>
            </div>
          ))}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </fieldset>
    );
  }

  // Visual grid variant for style selections with previews
  if (variant === 'visual-grid' && options.some(opt => opt.preview)) {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm/6 font-medium text-gray-900 mb-3">
            {label}
          </label>
        )}
        <div className="grid grid-cols-2 gap-2">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => !disabled && !option.disabled && onChange(option.value)}
              disabled={disabled || option.disabled}
              className={clsx(
                'relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                value === option.value
                  ? 'border-current bg-current/5 ring-1 ring-current/20'
                  : 'border-gray-200 hover:border-gray-300 bg-white',
                (disabled || option.disabled) && 'opacity-50 cursor-not-allowed'
              )}
              style={value === option.value ? { 
                borderColor: 'currentColor',
                backgroundColor: 'currentColor',
                opacity: 0.05
              } : undefined}
            >
              {option.preview && (
                <div className="mb-2">
                  {option.preview}
                </div>
              )}
              <span className={clsx(
                'text-xs font-medium',
                value === option.value ? 'text-current' : 'text-gray-700'
              )}>
                {option.label}
              </span>
              {value === option.value && (
                <div 
                  className="absolute top-1 right-1 size-4 rounded-full bg-current flex items-center justify-center"
                  style={{ backgroundColor: 'currentColor' }}
                >
                  <CheckIcon className="size-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  // For medium option sets (5-10), use a compact list style
  if (options.length <= 10) {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm/6 font-medium text-gray-900 mb-2">
            {label}
          </label>
        )}
        <div className="space-y-1">
          {options.map((option) => (
            <label
              key={option.value}
              className={clsx(
                'flex items-center px-3 py-2 rounded-md text-sm cursor-pointer',
                'transition-colors duration-150',
                value === option.value
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'hover:bg-gray-50 text-gray-700',
                (disabled || option.disabled) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <input
                type="radio"
                className="sr-only"
                checked={value === option.value}
                onChange={() => !disabled && !option.disabled && onChange(option.value)}
                disabled={disabled || option.disabled}
              />
              <span className="flex-1">{option.label}</span>
              {value === option.value && (
                <CheckIcon className="h-4 w-4 text-indigo-600" />
              )}
            </label>
          ))}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  // Original dropdown for medium option sets (6-10)
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm/6 font-medium text-gray-900">
          {label}
        </label>
      )}
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative mt-2">
          <Listbox.Button
            ref={buttonRef}
            id={id}
            className={clsx(
              'relative w-full cursor-default rounded-md bg-white px-3 py-1.5 text-left',
              'outline outline-1 -outline-offset-1 placeholder:text-gray-400',
              'sm:text-sm/6',
              error
                ? 'outline-red-300 focus:outline-red-600 focus:outline-2 focus:-outline-offset-2'
                : 'outline-gray-300 focus:outline-indigo-600 focus:outline-2 focus:-outline-offset-2',
              disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed'
            )}
          >
            <span className={clsx('block truncate', !selectedOption && 'text-gray-400')}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active }) =>
                    clsx(
                      'relative cursor-default select-none py-2 pl-10 pr-4',
                      active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                      option.disabled && 'opacity-50 cursor-not-allowed'
                    )
                  }
                  value={option.value}
                  disabled={option.disabled}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={clsx(
                          'block truncate',
                          selected ? 'font-medium' : 'font-normal'
                        )}
                      >
                        {option.label}
                      </span>
                      {selected ? (
                        <span
                          className={clsx(
                            'absolute inset-y-0 left-0 flex items-center pl-3',
                            active ? 'text-white' : 'text-indigo-600'
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}; 
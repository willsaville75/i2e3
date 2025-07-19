import React from 'react';
import { RadioGroup as HeadlessRadioGroup } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

export interface RadioOption {
  value: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: RadioOption[];
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onChange,
  options,
  label,
  description,
  disabled = false,
  className,
  orientation = 'vertical'
}) => {
  return (
    <HeadlessRadioGroup value={value} onChange={onChange} disabled={disabled} className={className}>
      {label && (
        <HeadlessRadioGroup.Label className="text-sm font-medium text-gray-900">
          {label}
        </HeadlessRadioGroup.Label>
      )}
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
      <div className={clsx(
        'mt-2',
        orientation === 'horizontal' ? 'flex flex-wrap gap-3' : 'space-y-2'
      )}>
        {options.map((option) => (
          <HeadlessRadioGroup.Option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className={({ active, checked }) =>
              clsx(
                'relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none',
                active && 'ring-2 ring-indigo-500 ring-offset-2',
                checked
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-900',
                option.disabled && 'opacity-50 cursor-not-allowed',
                orientation === 'horizontal' && 'flex-1'
              )
            }
          >
            {({ checked }) => (
              <>
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-sm">
                      <HeadlessRadioGroup.Label
                        as="p"
                        className={clsx(
                          'font-medium',
                          checked ? 'text-white' : 'text-gray-900'
                        )}
                      >
                        {option.label}
                      </HeadlessRadioGroup.Label>
                      {option.description && (
                        <HeadlessRadioGroup.Description
                          as="span"
                          className={clsx(
                            'inline',
                            checked ? 'text-indigo-100' : 'text-gray-500'
                          )}
                        >
                          <span>{option.description}</span>
                        </HeadlessRadioGroup.Description>
                      )}
                    </div>
                  </div>
                  {checked && (
                    <div className="shrink-0 text-white">
                      <CheckCircleIcon className="h-6 w-6" />
                    </div>
                  )}
                </div>
              </>
            )}
          </HeadlessRadioGroup.Option>
        ))}
      </div>
    </HeadlessRadioGroup>
  );
}; 
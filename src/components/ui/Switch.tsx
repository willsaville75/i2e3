import React from 'react';
import { Switch as HeadlessSwitch } from '@headlessui/react';
import clsx from 'clsx';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
  id
}) => {
  return (
    <HeadlessSwitch.Group as="div" className={clsx('flex items-center', className)}>
      <HeadlessSwitch
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={clsx(
          checked ? 'bg-indigo-600' : 'bg-gray-200',
          disabled && 'opacity-50 cursor-not-allowed',
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
        )}
      >
        <span className="sr-only">{label || 'Toggle'}</span>
        <span
          aria-hidden="true"
          className={clsx(
            checked ? 'translate-x-5' : 'translate-x-0',
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
          )}
        />
      </HeadlessSwitch>
      {(label || description) && (
        <HeadlessSwitch.Label as="span" className="ml-3 cursor-pointer">
          {label && (
            <span className="text-sm font-medium text-gray-900">{label}</span>
          )}
          {description && (
            <span className="block text-sm text-gray-500">{description}</span>
          )}
        </HeadlessSwitch.Label>
      )}
    </HeadlessSwitch.Group>
  );
}; 
import React from 'react';
import clsx from 'clsx';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  id?: string;
  name?: string;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  id,
  name,
  className
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  const toggleElement = (
    <div className={clsx(
      "group relative inline-flex w-11 shrink-0 rounded-full p-0.5",
      "outline-offset-2 outline-indigo-600 ring-1 ring-inset transition-colors duration-200 ease-in-out",
      checked ? "bg-indigo-600" : "bg-gray-200",
      "ring-gray-900/5",
      "has-[:focus-visible]:outline has-[:focus-visible]:outline-2",
      disabled && "opacity-50 cursor-not-allowed"
    )}>
      <span className={clsx(
        "size-5 rounded-full bg-white shadow-sm ring-1 ring-gray-900/5",
        "transition-transform duration-200 ease-in-out",
        checked && "translate-x-5"
      )} />
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        aria-label={label || "Toggle setting"}
        className="absolute inset-0 appearance-none focus:outline-none"
      />
    </div>
  );

  if (!label && !description) {
    return <div className={className}>{toggleElement}</div>;
  }

  return (
    <div className={clsx("flex items-start", className)}>
      <div className="flex-shrink-0">{toggleElement}</div>
      <div className="ml-3">
        {label && (
          <label htmlFor={id} className={clsx(
            "text-sm font-medium",
            disabled ? "text-gray-400" : "text-gray-900",
            "cursor-pointer"
          )}>
            {label}
          </label>
        )}
        {description && (
          <p className={clsx(
            "text-sm",
            disabled ? "text-gray-300" : "text-gray-500"
          )}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}; 
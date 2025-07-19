import React, { useState } from 'react';
import clsx from 'clsx';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { FormFieldConfig } from '../blocks/shared/schema-generator';
import { renderFieldInput } from './fieldRenderers';
import { getNestedValue } from '../blocks/shared/property-mappings';

interface CollapsibleFieldGroupProps {
  groupName: string;
  fields: FormFieldConfig[];
  blockData: any;
  onChange: (path: string, value: any) => void;
  defaultExpanded?: boolean;
  sectionConfig?: {
    bgColor: string;
    borderColor: string;
    iconColor: string;
    hoverColor: string;
  };
}

export const CollapsibleFieldGroup: React.FC<CollapsibleFieldGroupProps> = ({
  groupName,
  fields,
  blockData,
  onChange,
  defaultExpanded = false,
  sectionConfig = {
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    iconColor: 'text-gray-400',
    hoverColor: 'hover:bg-gray-100'
  }
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const renderField = (field: FormFieldConfig) => {
    const value = getNestedValue(blockData, field.path);
    const displayValue = value !== undefined ? value : field.defaultValue;

    const handleChange = (newValue: any) => {
      onChange(field.path, newValue);
    };

    // For boolean fields (toggle), the component handles its own label
    if (field.type === 'boolean') {
      return (
        <div key={field.id}>
          {renderFieldInput(field, displayValue, handleChange)}
        </div>
      );
    }

    return (
      <div key={field.id}>
        <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
          {field.label}
        </label>
        {field.description && (
          <p className="mt-1 text-sm text-gray-500">
            {field.description}
          </p>
        )}
        <div className="mt-1">
          {renderFieldInput(field, displayValue, handleChange)}
        </div>
      </div>
    );
  };

  return (
    <div className={clsx(
      "rounded-md border",
      sectionConfig.borderColor,
      "overflow-hidden"
    )}>
      <button
        type="button"
        className={clsx(
          "w-full flex items-center justify-between px-3 py-2 text-left",
          sectionConfig.bgColor,
          sectionConfig.hoverColor,
          "transition-colors duration-150"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <h4 className="text-sm font-semibold text-gray-700">{groupName}</h4>
        <ChevronDownIcon
          className={clsx(
            "h-4 w-4 text-gray-400 transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>
      
      <div className={clsx(
        "px-3 py-3 space-y-4 bg-white",
        !isExpanded && "hidden"
      )}>
        {fields.map(renderField)}
      </div>
    </div>
  );
}; 
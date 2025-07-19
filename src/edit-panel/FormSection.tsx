import React from 'react';
import clsx from 'clsx';
import { FormSection as FormSectionType, FormFieldConfig } from '../blocks/shared/schema-generator';
import { 
  ChevronDownIcon, 
  Squares2X2Icon, 
  QueueListIcon, 
  Square2StackIcon 
} from '@heroicons/react/24/outline';
import { getNestedValue } from '../blocks/shared/property-mappings';
import { renderFieldInput } from './fieldRenderers';
import { isFieldVisible } from './fieldVisibility';
import { CollapsibleFieldGroup } from './CollapsibleFieldGroup';

interface FormSectionProps {
  section: FormSectionType;
  blockData: any;
  onChange: (path: string, value: any) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

// Get icon and color based on section title
const getSectionConfig = (title: string) => {
  const normalizedTitle = title.toLowerCase();
  
  if (normalizedTitle.includes('layout')) {
    return {
      icon: Squares2X2Icon,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:bg-blue-50'
    };
  } else if (normalizedTitle.includes('content') || normalizedTitle.includes('element')) {
    return {
      icon: QueueListIcon,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200',
      hoverColor: 'hover:bg-purple-50'
    };
  } else if (normalizedTitle.includes('background')) {
    return {
      icon: Square2StackIcon,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
      hoverColor: 'hover:bg-green-50'
    };
  }
  
  // Default fallback
  return {
    icon: QueueListIcon,
    bgColor: 'bg-gray-50',
    iconColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    hoverColor: 'hover:bg-gray-50'
  };
};

export const FormSection: React.FC<FormSectionProps> = ({
  section,
  blockData,
  onChange,
  isExpanded,
  onToggle
}) => {
  const visibleFields = section.fields.filter(field => isFieldVisible(field, blockData));
  const sectionConfig = getSectionConfig(section.title);
  const Icon = sectionConfig.icon;
  
  if (visibleFields.length === 0) return null;

  // Group fields by group name
  const fieldGroups = visibleFields.reduce((groups, field) => {
    const groupName = field.group || 'General';
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(field);
    return groups;
  }, {} as Record<string, FormFieldConfig[]>);

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
        {field.description && (field.type as string) !== 'boolean' && (
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
      "bg-white rounded-lg shadow-sm overflow-hidden border",
      sectionConfig.borderColor
    )}>
      {/* Section Header */}
      <button
        type="button"
        className={clsx(
          "group w-full flex items-start justify-between p-4 text-left",
          section.collapsible && sectionConfig.hoverColor,
          "transition-colors duration-150",
          sectionConfig.bgColor
        )}
        onClick={() => section.collapsible && onToggle()}
        aria-expanded={section.collapsible ? isExpanded : undefined}
      >
        <div className="flex items-start space-x-3">
          <Icon className={clsx("h-5 w-5 mt-0.5", sectionConfig.iconColor)} />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{section.title}</span>
            {section.description && (
              <span className="text-xs text-gray-500">{section.description}</span>
            )}
          </div>
        </div>
        {section.collapsible && (
          <ChevronDownIcon
            className={clsx(
              "h-5 w-5 text-gray-400 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        )}
      </button>

      {/* Panel body */}
      <div 
        className={clsx(
          "px-4 py-4 border-t",
          section.collapsible && !isExpanded && "hidden",
          "bg-gray-50",
          sectionConfig.borderColor.replace('border-', 'border-t-')
        )}
        data-expand-panel
      >
        {Object.entries(fieldGroups).map(([groupName, fields], groupIndex) => {
          // Use collapsible groups for Content, Layout, and Background sections
          if ((section.id === 'content' || section.id === 'layout' || section.id === 'background') && groupName !== 'General') {
            return (
              <div key={groupName} className={clsx(groupIndex > 0 && "mt-4")}>
                <CollapsibleFieldGroup
                  groupName={groupName}
                  fields={fields}
                  blockData={blockData}
                  onChange={onChange}
                  defaultExpanded={false}
                  sectionConfig={sectionConfig}
                />
              </div>
            );
          }
          
          // Regular rendering for other sections
          return (
            <div key={groupName} className={clsx(groupIndex > 0 && "mt-6")}>
              {groupName !== 'General' && (
                <div className={clsx(
                  "mb-4 -mx-2 px-3 py-2 rounded-md",
                  sectionConfig.bgColor,
                  "border",
                  sectionConfig.borderColor
                )}>
                  <h4 className="text-sm font-semibold text-gray-700">
                    {groupName}
                  </h4>
                </div>
              )}
              <div className="space-y-4">
                {fields.map(renderField)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 
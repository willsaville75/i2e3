import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { FormFieldConfig, FormSection, ConditionalRule } from '../blocks/shared/schema-generator';
import { getNestedValue, setNestedValue } from '../blocks/shared/property-mappings';

export interface DynamicFormRendererProps {
  sections: FormSection[];
  blockData: any;
  onChange: (path: string, value: any) => void;
  className?: string;
}

/**
 * Dynamic Form Renderer
 * 
 * Renders form fields based on schema-generated configuration
 * Supports conditional fields, validation, and grouped sections
 */
export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  sections,
  blockData,
  onChange,
  className
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Initialize expanded sections
  useEffect(() => {
    const defaultExpanded = sections
      .filter(section => section.defaultExpanded)
      .map(section => section.id);
    setExpandedSections(new Set(defaultExpanded));
  }, [sections]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const isFieldVisible = (field: FormFieldConfig): boolean => {
    if (!field.conditional) return true;
    
    const fieldValue = getNestedValue(blockData, field.conditional.field);
    const expectedValue = field.conditional.value;
    
    switch (field.conditional.operator) {
      case 'equals':
        return fieldValue === expectedValue;
      case 'not_equals':
        return fieldValue !== expectedValue;
      case 'contains':
        return Array.isArray(fieldValue) && fieldValue.includes(expectedValue);
      case 'greater_than':
        return fieldValue > expectedValue;
      case 'less_than':
        return fieldValue < expectedValue;
      default:
        return true;
    }
  };

  const renderField = (field: FormFieldConfig) => {
    if (!isFieldVisible(field)) return null;

    const value = getNestedValue(blockData, field.path);
    const displayValue = value !== undefined ? value : field.defaultValue;

    const handleChange = (newValue: any) => {
      onChange(field.path, newValue);
    };

    return (
      <div key={field.id} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.description && (
            <span className="block text-xs text-gray-500 font-normal mt-1">
              {field.description}
            </span>
          )}
        </label>
        
        {renderFieldInput(field, displayValue, handleChange)}
      </div>
    );
  };

  const renderFieldInput = (field: FormFieldConfig, value: any, onChange: (value: any) => void) => {
    const baseInputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={baseInputClasses}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={baseInputClasses}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            min={field.min}
            max={field.max}
            step={field.step}
            className={baseInputClasses}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClasses}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-600">
              {field.description || 'Enable this option'}
            </span>
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <input
              type="range"
              value={value || field.defaultValue || field.min || 0}
              onChange={(e) => onChange(Number(e.target.value))}
              min={field.min}
              max={field.max}
              step={field.step}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{field.min}</span>
              <span className="font-medium">{value || field.defaultValue}</span>
              <span>{field.max}</span>
            </div>
          </div>
        );

      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              className={clsx(baseInputClasses, "flex-1")}
            />
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClasses}
          />
        );
    }
  };

  const renderSection = (section: FormSection) => {
    const isExpanded = expandedSections.has(section.id);
    const visibleFields = section.fields.filter(isFieldVisible);
    
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

    return (
      <div key={section.id} className="border border-gray-200 rounded-lg">
        {/* Section Header */}
        <div
          className={clsx(
            "flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50",
            section.collapsible && "border-b border-gray-200"
          )}
          onClick={() => section.collapsible && toggleSection(section.id)}
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
            {section.description && (
              <p className="text-sm text-gray-600 mt-1">{section.description}</p>
            )}
          </div>
          {section.collapsible && (
            <svg
              className={clsx(
                "w-5 h-5 text-gray-400 transition-transform duration-200",
                isExpanded ? "transform rotate-180" : ""
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>

        {/* Section Content */}
        {(!section.collapsible || isExpanded) && (
          <div className="p-4 space-y-6">
            {Object.entries(fieldGroups).map(([groupName, fields]) => (
              <div key={groupName} className="space-y-4">
                {groupName !== 'General' && (
                  <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
                    {groupName}
                  </h4>
                )}
                <div className="space-y-4">
                  {fields.map(renderField)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={clsx("space-y-4", className)}>
      {sections.map(renderSection)}
    </div>
  );
}; 
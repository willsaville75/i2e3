import React from 'react';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Toggle } from '../components/ui/Toggle';
import { Slider } from '../components/ui/Slider';
import { ArrayField } from './array';
import { FormFieldConfig } from '../blocks/shared/schema-generator';
import { gradient } from '../blocks/shared/tokens';

// Color mappings for swatches
const colorMap: Record<string, string> = {
  blue: '#3b82f6',
  red: '#ef4444',
  green: '#10b981',
  yellow: '#eab308',
  purple: '#a855f7',
  pink: '#ec4899',
  gray: '#6b7280',
  black: '#000000',
  white: '#ffffff'
};

// Get gradient CSS for gradient options
const getGradientCSS = (gradientName: string): string => {
  const preset = gradient.presets[gradientName as keyof typeof gradient.presets];
  if (!preset) return '';
  return `linear-gradient(${gradient.direction[preset.direction as keyof typeof gradient.direction]}, ${preset.fromColor}, ${preset.toColor})`;
};

export interface FieldConfig {
  type: string;
  label?: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  itemType?: string;
  itemLabel?: string;
  itemSchema?: Record<string, any>;
  defaultValue?: any;
  path?: string[];
}

/**
 * Renders the appropriate input component based on field type
 */
export const renderField = (
  type: string,
  props: any,
  fieldConfig?: FieldConfig
) => {
  // For input-based components, we need to extract the value from the event
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (props.onChange) {
      props.onChange(e.target.value);
    }
  };

  switch (type) {
    case 'string':
    case 'text':
    case 'url':
    case 'email':
      return <Input {...props} onChange={handleInputChange} type={type === 'email' ? 'email' : type === 'url' ? 'url' : 'text'} />;
    
    case 'number':
      return <Input {...props} onChange={handleInputChange} type="number" />;
    
    case 'textarea':
      return <Textarea {...props} onChange={handleInputChange} rows={4} />;
    
    case 'select':
      return <Select {...props} />;
    
    case 'boolean':
    case 'toggle':
      return <Toggle {...props} checked={props.value} onChange={(checked) => props.onChange(checked)} />;
    
    case 'slider':
      return (
        <Slider
          {...props}
          min={fieldConfig?.min || 0}
          max={fieldConfig?.max || 100}
          step={fieldConfig?.step || 1}
        />
      );
    
    case 'array':
      return (
        <ArrayField
          {...props}
          fieldConfig={fieldConfig || {}}
          path={props.path || []}
        />
      );
    
    case 'color':
      return <Input {...props} onChange={handleInputChange} type="color" />;
    
    case 'date':
      return <Input {...props} onChange={handleInputChange} type="date" />;
    
    case 'time':
      return <Input {...props} onChange={handleInputChange} type="time" />;
    
    case 'datetime':
      return <Input {...props} onChange={handleInputChange} type="datetime-local" />;
    
    default:
      return <Input {...props} placeholder={`Unsupported type: ${type}`} disabled />;
  }
};

/**
 * Legacy function for backward compatibility
 */
export const renderFieldInput = (field: FormFieldConfig, value: any, onChange: (value: any) => void) => {
  const fieldConfig: FieldConfig = {
    type: field.type,
    label: field.label,
    options: field.options,
    min: field.min,
    max: field.max,
    step: field.step,
    defaultValue: field.defaultValue,
    itemType: field.itemType,
    itemLabel: field.itemLabel,
    itemSchema: field.itemSchema
  };

  const props = {
    id: field.id,
    value,
    onChange,
    placeholder: field.placeholder,
    label: field.label,
    description: field.description,
    options: field.options,
    // Add path prop - convert string to array if needed
    path: Array.isArray(field.path) ? field.path : [field.path]
  };

  return renderField(field.type, props, fieldConfig);
}; 
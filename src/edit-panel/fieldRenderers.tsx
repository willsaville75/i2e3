import { FormFieldConfig } from '../blocks/shared/schema-generator';
import { Input, Textarea, Select, Toggle, Slider } from '../components/ui';
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

/**
 * Renders the appropriate input component based on field type
 */
export const renderFieldInput = (field: FormFieldConfig, value: any, onChange: (value: any) => void) => {
  switch (field.type) {
    case 'text':
      return (
        <Input
          id={field.id}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      );

    case 'textarea':
      return (
        <Textarea
          id={field.id}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          resize="none"
        />
      );

    case 'number':
      return (
        <Input
          id={field.id}
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          min={field.min}
          max={field.max}
          step={field.step}
        />
      );

    case 'select':
      // Check if this is a color or gradient field
      const isColorField = field.id?.includes('color') || field.id?.includes('Color');
      const isGradientField = field.id?.includes('gradient') || field.id?.includes('Gradient');
      
      return (
        <Select
          id={field.id}
          value={value || ''}
          onChange={onChange}
          options={field.options?.map(opt => {
            const option: any = {
              value: opt.value,
              label: opt.label
            };
            
            // Add color swatch for color fields
            if (isColorField && colorMap[opt.value]) {
              option.color = colorMap[opt.value];
            }
            
            // Add gradient swatch for gradient fields
            if (isGradientField) {
              const gradientCSS = getGradientCSS(opt.value);
              if (gradientCSS) {
                option.gradient = gradientCSS;
              }
            }
            
            return option;
          }) || []}
          placeholder={field.placeholder || 'Select an option'}
        />
      );

    case 'boolean':
      return (
        <Toggle
          id={field.id}
          checked={value || false}
          onChange={onChange}
          label={field.label}
          description={field.description}
        />
      );

    case 'slider':
      return (
        <Slider
          id={field.id}
          value={value || field.defaultValue || field.min || 0}
          onChange={(e) => onChange(Number(e.target.value))}
          min={field.min}
          max={field.max}
          step={field.step}
        />
      );

    case 'color':
      return (
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-8 rounded border border-gray-300 cursor-pointer"
          />
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
          />
        </div>
      );

    default:
      return (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}; 
import { FormSection, FormFieldConfig } from './schema-generator';
import { AnyProperty, ArrayProperty, ObjectProperty } from './schema-types';

/**
 * Generates form sections from a block schema
 */
export function generateFormSections(schema: any): FormSection[] {
  const sections: FormSection[] = [];
  
  if (!schema || !schema.properties) {
    return sections;
  }

  // Process top-level properties into sections
  Object.entries(schema.properties).forEach(([key, property]: [string, any]) => {
    if (property.type === 'object' && property.properties) {
      // Create a section for each top-level object
      const section = createFormSection(key, property as ObjectProperty);
      if (section.fields.length > 0) {
        sections.push(section);
      }
    } else if (property.type === 'array') {
      // Create a special section for arrays
      const section = createArraySection(key, property as ArrayProperty);
      sections.push(section);
    }
  });

  return sections;
}

/**
 * Creates a form section from an object property
 */
function createFormSection(key: string, property: ObjectProperty): FormSection {
  const fields: FormFieldConfig[] = [];
  const title = property.title || capitalizeWords(key);
  
  // Recursively process object properties
  processProperties(property.properties || {}, fields, [key]);
  
  return {
    id: key,
    title,
    description: property.description,
    fields,
    collapsible: true,
    defaultExpanded: key === 'elements' // Elements section is expanded by default
  };
}

/**
 * Creates a form section for array properties
 */
function createArraySection(key: string, property: ArrayProperty): FormSection {
  const title = property.title || capitalizeWords(key);
  
  // For arrays, we create a special field that will be rendered as ArrayField
  const arrayField: FormFieldConfig = {
    id: key,
    label: title,
    type: 'array',
    path: key,
    description: property.description,
    itemType: determineItemType(key, property),
    itemLabel: determineSingular(key),
    itemSchema: property.items?.type === 'object' && property.items.properties 
      ? property.items.properties 
      : undefined
  };

  return {
    id: key,
    title,
    description: property.description,
    fields: [arrayField],
    collapsible: true,
    defaultExpanded: false
  };
}

/**
 * Recursively processes properties into form fields
 */
function processProperties(
  properties: Record<string, AnyProperty>,
  fields: FormFieldConfig[],
  path: string[] = [],
  group?: string
): void {
  Object.entries(properties).forEach(([key, property]) => {
    const fieldPath = [...path, key];
    
    if (property.type === 'object' && property.properties) {
      // For nested objects, create a group and process children
      const groupName = property.title || capitalizeWords(key);
      processProperties(
        property.properties,
        fields,
        fieldPath,
        groupName
      );
    } else if (property.type !== 'array') {
      // Create a field for non-array, non-object properties
      const field = createFormField(key, property, fieldPath, group);
      fields.push(field);
    }
  });
}

/**
 * Creates a form field configuration from a property
 */
function createFormField(
  key: string,
  property: AnyProperty,
  path: string[],
  group?: string
): FormFieldConfig {
  const field: FormFieldConfig = {
    id: path.join('.'),
    label: property.title || capitalizeWords(key),
    type: mapPropertyTypeToFieldType(property),
    path: path.join('.'),
    defaultValue: property.default,
    description: property.description,
    group
  };

  // Add type-specific configurations
  if (property.type === 'string' && property.enum) {
    field.type = 'select';
    field.options = property.enum.map(value => ({
      value,
      label: capitalizeWords(value)
    }));
  } else if (property.type === 'number') {
    if (property.enum) {
      field.type = 'select';
      field.options = property.enum.map(value => {
        // Special handling for heading levels
        if (path.includes('level') && value >= 1 && value <= 6) {
          return {
            value: String(value),
            label: `Heading ${value} (H${value})`
          };
        }
        // Default for other number enums
        return {
          value: String(value),
          label: String(value)
        };
      });
    } else {
      field.min = property.minimum;
      field.max = property.maximum;
      field.step = property.multipleOf;
    }
  } else if (property.type === 'boolean') {
    field.type = 'boolean';
  }

  return field;
}

/**
 * Maps schema property types to form field types
 */
function mapPropertyTypeToFieldType(property: AnyProperty): FormFieldConfig['type'] {
  if (property.type === 'string') {
    if (property.maxLength && property.maxLength > 100) {
      return 'textarea';
    }
    return 'string';
  }
  
  if (property.type === 'number') {
    return 'number';
  }
  
  if (property.type === 'boolean') {
    return 'boolean';
  }
  
  return 'string'; // Default fallback
}

/**
 * Determines the item type for array fields (used for special rendering)
 */
function determineItemType(key: string, property: ArrayProperty): string {
  if (key === 'cards') return 'card';
  if (key === 'items') return 'item';
  if (key === 'features') return 'feature';
  return 'item';
}

/**
 * Converts plural key to singular for item labels
 */
function determineSingular(key: string): string {
  if (key === 'cards') return 'Card';
  if (key === 'items') return 'Item';
  if (key === 'features') return 'Feature';
  if (key.endsWith('s')) return capitalizeWords(key.slice(0, -1));
  return capitalizeWords(key);
}

/**
 * Capitalizes words for display
 */
function capitalizeWords(str: string): string {
  return str
    .split(/(?=[A-Z])|_|-/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
} 
import { FormFieldConfig } from '../blocks/shared/schema-generator';
import { getNestedValue } from '../blocks/shared/property-mappings';

/**
 * Determines if a field should be visible based on conditional rules
 */
export const isFieldVisible = (field: FormFieldConfig, blockData: any): boolean => {
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
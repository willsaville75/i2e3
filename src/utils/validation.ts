/**
 * Type-safe validation utilities for JSON parsing and input validation
 */

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse<T>(
  json: string,
  validator?: (value: unknown) => value is T
): { success: true; data: T } | { success: false; error: string } {
  try {
    const parsed = JSON.parse(json);
    
    if (validator && !validator(parsed)) {
      return {
        success: false,
        error: 'Parsed JSON failed validation'
      };
    }
    
    return {
      success: true,
      data: parsed as T
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid JSON'
    };
  }
}

/**
 * Validate object has required string field
 */
export function hasStringField(
  obj: unknown,
  field: string
): obj is Record<string, unknown> & { [K in typeof field]: string } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    field in obj &&
    typeof (obj as any)[field] === 'string'
  );
}

/**
 * Validate object has required fields
 */
export function hasRequiredFields<T extends readonly string[]>(
  obj: unknown,
  fields: T
): obj is Record<T[number], unknown> {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  return fields.every(field => field in obj);
}

/**
 * Type guard for block data
 */
export function isValidBlockData(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

/**
 * Type guard for array
 */
export function isArray<T>(
  value: unknown,
  itemValidator?: (item: unknown) => item is T
): value is T[] {
  if (!Array.isArray(value)) {
    return false;
  }
  
  if (itemValidator) {
    return value.every(itemValidator);
  }
  
  return true;
} 
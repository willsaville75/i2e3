export interface CompressedUpdateContext {
  blockType: string
  intent: 'update'
  target: string
  current: Partial<any>
  schema: Partial<any>
  tokens: object
}

/**
 * Helper function to safely get a nested property value using dot notation
 * @param obj - The object to traverse
 * @param path - Dot-separated path (e.g., 'elements.title.content')
 * @returns The value at the path, or undefined if not found
 */
function getNestedValue(obj: any, path: string): any {
  if (!obj || typeof obj !== 'object') return undefined
  
  const keys = path.split('.')
  let current = obj
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return undefined
    }
  }
  
  return current
}

/**
 * Helper function to safely set a nested property value using dot notation
 * @param obj - The object to modify
 * @param path - Dot-separated path (e.g., 'elements.title.content')
 * @param value - The value to set
 * @returns The modified object
 */
function setNestedValue(obj: any, path: string, value: any): any {
  if (!obj || typeof obj !== 'object') return obj
  
  const keys = path.split('.')
  const result = { ...obj }
  let current = result
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    } else {
      current[key] = { ...current[key] }
    }
    current = current[key]
  }
  
  const lastKey = keys[keys.length - 1]
  current[lastKey] = value
  
  return result
}

/**
 * Helper function to create a minimal object structure containing only the target path
 * @param obj - The source object
 * @param path - Dot-separated path to extract
 * @returns Minimal object with only the target path and its value
 */
function extractTargetPath(obj: any, path: string): any {
  const value = getNestedValue(obj, path)
  if (value === undefined) return {}
  
  return setNestedValue({}, path, value)
}

/**
 * Compresses a full block update context to focus on a specific target path
 * Used for targeted updates of specific block properties
 * @param ctx - Full update context from prepareBlockUpdateContext
 * @param target - Dot-separated path to isolate (e.g., 'background', 'elements.title')
 * @returns Compressed update context focused on the target
 */
export function compressBlockUpdateContextForTarget(
  ctx: any,
  target: string
): CompressedUpdateContext {
  // Validate input context
  if (!ctx || typeof ctx !== 'object') {
    return {
      blockType: 'unknown',
      intent: 'update',
      target,
      current: {},
      schema: {},
      tokens: {}
    }
  }

  // Extract current data for the target path
  let targetCurrent = {}
  if (ctx.current) {
    targetCurrent = extractTargetPath(ctx.current, target)
    
    // If target path doesn't exist in current, include full current
    if (Object.keys(targetCurrent).length === 0) {
      targetCurrent = ctx.current
    }
  }

  // Extract schema for the target path
  let targetSchema = {}
  if (ctx.schema && ctx.schema.properties) {
    // Try to extract the relevant schema part
    const schemaValue = getNestedValue(ctx.schema.properties, target)
    if (schemaValue) {
      targetSchema = setNestedValue({ properties: {} }, `properties.${target}`, schemaValue)
    } else {
      // If we can't find the exact path, include the full schema
      targetSchema = ctx.schema
    }
  }

  return {
    blockType: ctx.blockType || 'unknown',
    intent: 'update',
    target,
    current: targetCurrent,
    schema: targetSchema,
    tokens: ctx.tokens || {}
  }
} 
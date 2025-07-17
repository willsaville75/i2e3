import { blockRegistry } from '../index'
import { DesignTokens } from '../shared/token-types'

export interface BlockAIContext {
  blockType: string
  intent: 'create' | 'update'
  schema: any
  tokens: DesignTokens
  defaults: any
  aiHints: any
}

/**
 * Prepares AI context for a block using the registry
 * @param blockType - The type of block to prepare context for
 * @param tokens - Design tokens to include in context
 * @param intent - Whether creating or updating a block (default: 'create')
 * @returns Prepared AI context object
 * @throws Error if blockType is not found in registry
 */
export function prepareBlockAIContext(
  blockType: string,
  tokens: DesignTokens,
  intent: 'create' | 'update' = 'create'
): BlockAIContext {
  // Look up block entry in registry
  const blockEntry = blockRegistry[blockType]
  
  if (!blockEntry) {
    throw new Error(`Block type "${blockType}" not found in registry`)
  }

  // Prepare schema - use toJSON() if available, otherwise use schema directly
  let schema = blockEntry.schema
  if (schema && typeof schema.toJSON === 'function') {
    schema = schema.toJSON()
  }

  // Combine all AI hints from the block.aiHints object
  const aiHints = {
    ...blockEntry.aiHints
  }

  return {
    blockType,
    intent,
    schema,
    tokens,
    defaults: blockEntry.defaultData,
    aiHints
  }
} 
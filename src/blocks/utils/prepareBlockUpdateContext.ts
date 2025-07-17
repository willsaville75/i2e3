import { blockRegistry } from '../index'
import { DesignTokens } from '../shared/token-types'

export interface BlockUpdateContext {
  blockType: string
  intent: 'update'
  current: any
  schema: any
  tokens: DesignTokens
  aiHints: any
}

/**
 * Prepares update context for a block when user wants to update style or layout
 * Used by Indy for style/layout modifications, not just content changes
 * @param blockType - The type of block to prepare update context for
 * @param currentData - Current block data including elements, layout, background, etc.
 * @param tokens - Design tokens to include in context
 * @returns Prepared block update context object
 * @throws Error if blockType is not found in registry
 */
export function prepareBlockUpdateContext(
  blockType: string,
  currentData: any,
  tokens: DesignTokens
): BlockUpdateContext {
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

  // Combine all AI hints from the block.ai object
  // Focus on layout, performance, and styling guidance for updates
  const aiHints = {
    ...blockEntry.aiHints
  }

  return {
    blockType,
    intent: 'update',
    current: currentData,
    schema,
    tokens,
    aiHints
  }
} 
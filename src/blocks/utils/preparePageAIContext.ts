import { blockRegistry } from '../index'
import { DesignTokens } from '../shared/token-types'

export interface PageBlockInput {
  blockType: string
  currentData?: any
}

export interface PageMeta {
  route?: string
  title?: string
  intent?: string
  layoutStyle?: string
}

export interface EnrichedBlockContext {
  blockType: string
  intent: 'create' | 'update'
  current?: any
  schema: any
  defaults: any
  tokens: DesignTokens
  aiHints: any
}

export interface PageAIContext {
  pageIntent: string
  route?: string
  layoutStyle?: string
  blocks: EnrichedBlockContext[]
}

/**
 * Prepares AI context for a page with multiple blocks
 * Used by Indy page planner for multi-block workflows
 * @param blocks - Array of block configurations with optional current data
 * @param tokens - Design tokens to include in context
 * @param pageMeta - Optional page metadata
 * @returns Prepared page AI context object
 * @throws Error if any blockType is not found in registry
 */
export function preparePageAIContext(
  blocks: PageBlockInput[],
  tokens: DesignTokens,
  pageMeta: PageMeta = {}
): PageAIContext {
  // Process each block and create enriched context
  const enrichedBlocks: EnrichedBlockContext[] = blocks.map(block => {
    // Look up block entry in registry
    const blockEntry = blockRegistry[block.blockType]
    
    if (!blockEntry) {
      throw new Error(`Block type "${block.blockType}" not found in registry`)
    }

    // Prepare schema - use toJSON() if available, otherwise use schema directly
    let schema = blockEntry.schema
    if (schema && typeof schema.toJSON === 'function') {
      schema = schema.toJSON()
    }

    // Determine intent based on presence of current data
    const intent = block.currentData ? 'update' : 'create'

    // Combine all AI hints from the block.aiHints object
    const aiHints = {
      ...blockEntry.aiHints
    }

    return {
      blockType: block.blockType,
      intent,
      current: block.currentData,
      schema,
      defaults: blockEntry.defaultData,
      tokens,
      aiHints
    }
  })

  return {
    pageIntent: pageMeta.intent || 'create',
    route: pageMeta.route,
    layoutStyle: pageMeta.layoutStyle,
    blocks: enrichedBlocks
  }
} 
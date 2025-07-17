import { blockRegistry } from '../index';
import { prepareBlockUpdateContext } from './prepareBlockUpdateContext';
import { compressBlockUpdateContextForTarget } from './compressBlockUpdateContextForTarget';

/**
 * Block definition for page updates
 */
export interface PageUpdateBlock {
  /** The type of block (e.g., 'hero', 'cardGrid') */
  blockType: string;
  /** Current data/props for the block */
  currentData: any;
  /** Optional target path for focused updates (e.g., 'background', 'elements.title.content') */
  target?: string;
}

/**
 * Page metadata for updates
 */
export interface PageUpdateMeta {
  /** Route/path of the page */
  route?: string;
  /** Title of the page */
  title?: string;
  /** Intent for the page update */
  intent?: string;
}

/**
 * Processed block context for page updates
 */
export interface PageUpdateBlockContext {
  /** The type of block */
  blockType: string;
  /** Always 'update' for page updates */
  intent: 'update';
  /** Target path if provided */
  target?: string;
  /** Current block data */
  current: any;
  /** Block schema (may be compressed if target specified) */
  schema?: any;
  /** Design tokens (may be compressed if target specified) */
  tokens: any;
  /** AI hints (may be compressed if target specified) */
  aiHints?: any;
}

/**
 * Complete page update context
 */
export interface PageUpdateContext {
  /** Intent for the page update */
  pageIntent: string;
  /** Route/path of the page */
  route?: string;
  /** Title of the page */
  title?: string;
  /** Global design tokens */
  tokens: any;
  /** Array of processed block contexts */
  blocks: PageUpdateBlockContext[];
}

/**
 * Prepares context for updating an entire page with multiple blocks
 * 
 * @param blocks - Array of blocks to update with their current data and optional targets
 * @param tokens - Global design tokens (colors, spacing, typography, etc.)
 * @param pageMeta - Optional page metadata (route, title, intent)
 * @returns Complete page update context for AI processing
 */
export function preparePageUpdateContext({
  blocks,
  tokens,
  pageMeta = {}
}: {
  blocks: PageUpdateBlock[];
  tokens: any;
  pageMeta?: PageUpdateMeta;
}): PageUpdateContext {
  const processedBlocks: PageUpdateBlockContext[] = [];

  for (const block of blocks) {
    const { blockType, currentData, target } = block;

    // Check if block type is registered
    if (!blockRegistry[blockType]) {
      // Skip unregistered block types
      continue;
    }

    try {
      if (target) {
        // First get full context, then compress it
        const fullContext = prepareBlockUpdateContext(blockType, currentData, tokens);
        const compressedContext = compressBlockUpdateContextForTarget(fullContext, target);

        processedBlocks.push({
          blockType,
          intent: 'update',
          target,
          current: compressedContext.current,
          schema: compressedContext.schema,
          tokens: compressedContext.tokens,
          aiHints: fullContext.aiHints // Use aiHints from full context
        });
      } else {
        // Use full block update context
        const fullContext = prepareBlockUpdateContext(blockType, currentData, tokens);

        processedBlocks.push({
          blockType,
          intent: 'update',
          current: fullContext.current,
          schema: fullContext.schema,
          tokens: fullContext.tokens,
          aiHints: fullContext.aiHints
        });
      }
    } catch (error) {
      // Continue processing other blocks
    }
  }

  return {
    pageIntent: pageMeta.intent || 'update',
    route: pageMeta.route,
    title: pageMeta.title,
    tokens,
    blocks: processedBlocks
  };
} 
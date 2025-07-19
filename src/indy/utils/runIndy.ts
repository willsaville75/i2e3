import { prepareBlockAIContext } from '../../blocks/utils/prepareBlockAIContext';
import { preparePageAIContext } from '../../blocks/utils/preparePageAIContext';
import { getFastModel } from '../../ai/client';
import blockOperations from '../agents/blockOperations';
import runIndyPageAgent from '../agents/runIndyPageAgent';
import { ResponseAgentResult } from '../../types/agents';

/**
 * Input options for the Indy orchestrator
 */
export interface RunIndyOptions {
  /** Mode of operation - block or page level */
  mode: 'block' | 'page';
  /** Context data for block or page */
  data: any;
  /** Optional page-level high-level objective */
  goal?: string;
  /** Optional block-level specific update instructions */
  instructions?: string;
  /** Optional OpenAI model to use */
  model?: string;
  /** Optional target path for focused block edits */
  target?: string;
  /** Optional focus block type for page operations */
  focusBlockType?: string;
}

/**
 * Result from Indy orchestrator
 */
export interface IndyResult extends ResponseAgentResult {
  /** The mode that was used */
  mode: 'block' | 'page';
  /** Context that was prepared */
  context: any;
}

/**
 * Top-level Indy orchestrator function
 * 
 * This function serves as the main entry point for all Indy operations:
 * - Routes block or page requests to appropriate agents
 * - Handles context preparation automatically
 * - Provides a unified interface for all AI operations
 * 
 * @param options - Configuration for the Indy operation
 * @returns Promise resolving to the processed result
 * @throws Error if unknown mode is provided
 */
export async function runIndy(options: RunIndyOptions): Promise<IndyResult> {
  const { 
    mode, 
    data, 
    goal, 
    instructions, 
    model = getFastModel(), 
    focusBlockType 
  } = options;

  let context: any;
  let result: ResponseAgentResult;

  switch (mode) {
    case 'block': {
      // Prepare block context
      if (!data.blockType) {
        throw new Error('Block mode requires data.blockType to be specified');
      }
      
      context = prepareBlockAIContext(
        data.blockType,
        data.tokens || { colors: [], spacing: [] },
        data.currentData ? 'update' : 'create'
      );

      // Call block agent
      const blockResult = await blockOperations({
        operation: data.currentData ? 'update' : 'create',
        blockType: data.blockType,
        intent: instructions || '',
        currentData: data.currentData,
        tokens: data.tokens || {}
      });
      
      // Convert blockOperations result to ResponseAgentResult format
      result = {
        result: JSON.stringify(blockResult.blockData),
        raw: JSON.stringify(blockResult.blockData),
        target: blockResult.selectedBlockType || data.blockType,
        mode: 'block' as const,
        success: blockResult.success
      };
      
      break;
    }

    case 'page': {
      // Prepare page context
      if (!data.blocks || !Array.isArray(data.blocks)) {
        throw new Error('Page mode requires data.blocks array to be specified');
      }

      context = preparePageAIContext(
        data.blocks,
        data.tokens || { colors: [], spacing: [] },
        data.pageMeta || {}
      );

      // Call page agent
      result = await runIndyPageAgent({
        context,
        model,
        goal,
        focusBlockType
      });
      
      break;
    }

    default:
      throw new Error(`Unknown mode: ${mode}. Expected 'block' or 'page'`);
  }

  // Return enhanced result with context
  return {
    ...result,
    mode: mode as 'block' | 'page',
    context
  };
} 
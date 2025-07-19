import { blockRegistry } from '../../blocks';
import { callAI } from '../../ai/call';
import { getFastModel } from '../../ai/client';
import { buildOpenAIPromptForBlock } from '../utils/buildOpenAIPromptForBlock';
import { prepareBlockUpdateContext } from '../../blocks/utils/prepareBlockUpdateContext';

export interface BlockOperationInput {
  operation: 'create' | 'update';
  blockType?: string; // Made optional for AI selection
  intent: string;
  currentData?: any;
  tokens?: Record<string, any>;
}

export interface BlockOperationOutput {
  success: boolean;
  blockData?: any;
  selectedBlockType?: string; // Added for when AI selects the block type
  error?: string;
}

/**
 * Unified block operations agent - handles both create and update
 * Consolidates createAgent.ts and updateAgent.ts into a single efficient agent
 */
export default async function run(input: BlockOperationInput): Promise<BlockOperationOutput> {
  const startTime = Date.now();
  const { operation, blockType, intent, currentData, tokens = {} } = input;
  
  try {
    // If no blockType is provided and operation is create, let AI select it
    if (!blockType && operation === 'create') {
      // Build prompt for block selection
      const prompt = buildOpenAIPromptForBlock({
        blockType: undefined,
        context: { intent },
        mode: 'create',
        instructions: intent
      });
      
      // Call AI to select block type and generate content
      const response = await callAI({
        prompt,
        model: getFastModel(),
        maxTokens: 800,
        temperature: 0.2
      });
      
      // Parse response expecting both block selection and content
      let parsedResponse;
      try {
        const cleaned = response
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        parsedResponse = JSON.parse(cleaned);
      } catch (error) {
        return {
          success: false,
          error: `Failed to parse AI response: ${error}`
        };
      }
      
      // Validate response has required fields
      if (!parsedResponse.selectedBlockType || !parsedResponse.blockContent) {
        return {
          success: false,
          error: 'AI response missing selectedBlockType or blockContent'
        };
      }
      
      console.log(`✅ Block ${operation} with AI-selected type '${parsedResponse.selectedBlockType}' completed in ${Date.now() - startTime}ms`);
      
      return {
        success: true,
        blockData: parsedResponse.blockContent,
        selectedBlockType: parsedResponse.selectedBlockType
      };
    }
    
    // Validate block type for normal operations
    if (!blockType) {
      return {
        success: false,
        error: 'Block type is required for update operations'
      };
    }
    
    if (!blockRegistry[blockType]) {
      return {
        success: false,
        error: `Block type '${blockType}' not found in registry`
      };
    }
    
    // For updates, validate current data exists
    if (operation === 'update' && !currentData) {
      return {
        success: false,
        error: 'Cannot update block: no current data provided'
      };
    }
    
    // Build appropriate prompt based on operation
    let prompt: string;
    
    if (operation === 'create') {
      // Direct creation prompt (optimized for speed)
      prompt = buildOpenAIPromptForBlock({
        blockType,
        context: { blockType, intent },
        mode: 'create',
        instructions: intent
      });
    } else {
      // Update prompt with context
      const basicTokens = {
        colors: tokens.colors || { scheme: { blue: 'bg-blue-500' } },
        spacing: tokens.spacing || { scale: { sm: '0.5rem', md: '1rem', lg: '1.5rem' } },
        ...tokens
      };
      const context = prepareBlockUpdateContext(blockType, currentData, basicTokens as any);
      prompt = buildOpenAIPromptForBlock({
        blockType,
        context,
        mode: 'update',
        instructions: intent
      });
    }
    
    // Call AI with optimized parameters
    const response = await callAI({
      prompt,
      model: getFastModel(),
      maxTokens: 500,
      temperature: 0.2
    });
    
    // Parse response
    let blockData;
    try {
      const cleaned = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      blockData = JSON.parse(cleaned);
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse AI response: ${error}`
      };
    }
    
    console.log(`✅ Block ${operation} completed in ${Date.now() - startTime}ms`);
    
    return {
      success: true,
      blockData
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 
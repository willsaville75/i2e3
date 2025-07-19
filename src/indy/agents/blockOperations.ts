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
  
  console.log('🔍 BlockOperations Input:', {
    operation,
    blockType,
    intent,
    hasCurrentData: !!currentData,
    tokens: Object.keys(tokens)
  });
  
  try {
    // If no blockType is provided and operation is create, let AI select it
    if (!blockType && operation === 'create') {
      console.log('🤖 No blockType provided, letting AI select...');
      
      // Build prompt for block selection
      const prompt = buildOpenAIPromptForBlock({
        blockType: undefined,
        context: { intent },
        mode: 'create',
        instructions: intent
      });
      
      console.log('📝 Block Selection Prompt:', prompt);
      
      // Call AI to select block type and generate content
      const response = await callAI({
        prompt,
        model: getFastModel(),
        maxTokens: 800,
        temperature: 0.2
      });
      
      console.log('🤖 AI Raw Response:', response);
      
      // Parse response expecting both block selection and content
      let parsedResponse;
      try {
        const cleaned = response
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        parsedResponse = JSON.parse(cleaned);
      } catch (error) {
        console.error('❌ Failed to parse AI response:', error);
        return {
          success: false,
          error: `Failed to parse AI response: ${error}`
        };
      }
      
      console.log('📦 Parsed AI Response:', {
        selectedBlockType: parsedResponse.selectedBlockType,
        hasBlockContent: !!parsedResponse.blockContent,
        blockContentKeys: parsedResponse.blockContent ? Object.keys(parsedResponse.blockContent) : []
      });
      
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
      // Get block entry for schema
      const blockEntry = blockRegistry[blockType];
      
      console.log('📚 Block Registry Entry:', {
        blockType,
        hasSchema: !!blockEntry.schema,
        hasAIHints: !!blockEntry.aiHints,
        hasDefaults: !!blockEntry.defaultData,
        aiHintKeys: blockEntry.aiHints ? Object.keys(blockEntry.aiHints) : [],
        schemaType: typeof blockEntry.schema,
        schemaKeys: blockEntry.schema ? Object.keys(blockEntry.schema) : [],
        hasToJSON: blockEntry.schema && typeof blockEntry.schema.toJSON === 'function'
      });
      
      // Log the actual schema structure
      if (blockEntry.schema) {
        console.log('🔍 Schema structure:', JSON.stringify(blockEntry.schema, null, 2).substring(0, 500) + '...');
      }
      
      // Create context with schema
      const context = {
        blockType,
        intent,
        schema: blockEntry.schema,
        aiHints: blockEntry.aiHints,
        defaults: blockEntry.defaultData
      };
      
      prompt = buildOpenAIPromptForBlock({
        blockType,
        context,
        mode: 'create',
        instructions: intent
      });
      
      console.log('📝 Create Prompt:', prompt);
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
    
    // Call AI with the prompt
    const aiResponse = await callAI({
      prompt,
      model: getFastModel(),
      maxTokens: blockType === 'grid' ? 2000 : 800,  // Grid blocks need more tokens for multiple cards
      temperature: 0.2
    });
    
    console.log('🤖 AI Raw Response for', operation, ':', aiResponse);
    
    // Parse and validate response
    let blockData;
    try {
      const cleaned = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      blockData = JSON.parse(cleaned);
      
      console.log('📦 Parsed Block Data:', {
        topLevelKeys: Object.keys(blockData),
        hasElements: !!blockData.elements,
        hasLayout: !!blockData.layout,
        hasCards: !!blockData.cards,
        cardsCount: blockData.cards ? blockData.cards.length : 0
      });
    } catch (parseError: any) {
      console.error('❌ Failed to parse AI response:', parseError.message);
      console.error('📝 Raw AI response:', aiResponse);
      
      // Try to find the error location
      if (parseError.message.includes('position')) {
        const match = parseError.message.match(/position (\d+)/);
        if (match) {
          const position = parseInt(match[1]);
          const start = Math.max(0, position - 100);
          const end = Math.min(aiResponse.length, position + 100);
          console.error(`📍 Error context (${start}-${end}):`);
          console.error(aiResponse.substring(start, end));
          console.error(' '.repeat(position - start) + '^');
        }
      }
      
      return {
        success: false,
        error: `Failed to parse AI response: ${parseError.message}`
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
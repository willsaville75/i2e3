// Update agent for modifying existing blocks
import { prepareBlockUpdateContext } from '../../blocks/utils/prepareBlockUpdateContext';

import { buildOpenAIPromptForBlock } from '../utils/buildOpenAIPromptForBlock';

import { blockRegistry } from '../../blocks';
import { callAI } from '../../ai/call';
import { getFastModel } from '../../ai/client';
import { UpdateAgentInput, UpdateAgentOutput } from '../../types/agents';

/**
 * Update agent for modifying existing blocks
 * 
 * This agent:
 * 1. Extracts target paths from user intent for focused updates
 * 2. Uses compressed context when updating specific fields
 * 3. Generates diffs for precise updates
 * 4. Includes schema summaries and AI hints for better results
 * 
 * @param input - UpdateAgentInput object containing configuration
 * @param memory - Optional memory context for agent
 * @returns Promise resolving to UpdateAgentOutput
 */
export default async function run(input: UpdateAgentInput, _memory?: any): Promise<UpdateAgentOutput> {
  try {
    const { blockType, currentData, intent, tokens = {} } = input;
    
    // Validate block type exists
    if (!blockRegistry[blockType]) {
      return {
        success: false,
        error: `Block type '${blockType}' not found in registry`
      };
    }
    
    // Prepare AI context with basic tokens
    const basicTokens = {
      colors: tokens.colors || ['blue', 'gray', 'green', 'red', 'purple'],
      spacing: tokens.spacing || ['sm', 'md', 'lg', 'xl', '2xl'],
      ...tokens
    };
    
    // Prepare full update context
    const fullContext = prepareBlockUpdateContext(blockType, currentData, basicTokens);
    
    // Use buildOpenAIPromptForBlock for all updates - let OpenAI handle the intent naturally
    const prompt = buildOpenAIPromptForBlock({
      blockType,
      context: fullContext,
      mode: 'update',
      instructions: intent
    });

    // Call AI with optimized prompt using fast model
    const response = await callAI({
      prompt,
      model: getFastModel(),
      maxTokens: 400, // Standard token limit for updates
      temperature: 0.3
    });
    
    // Parse AI response
    let aiOutput;
    try {
      // First try to parse as JSON
      aiOutput = JSON.parse(response);
    } catch (parseError) {
      // If that fails, check if it's a simple string value (for leaf nodes like button.text)
      const trimmedResponse = response.trim();
      if (trimmedResponse.startsWith('"') && trimmedResponse.endsWith('"')) {
        // It's a quoted string, parse it
        try {
          aiOutput = JSON.parse(trimmedResponse);
        } catch {
          // If even that fails, use the trimmed response without quotes
          aiOutput = trimmedResponse.slice(1, -1);
        }
      } else {
        // Try to extract JSON from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiOutput = JSON.parse(jsonMatch[0]);
        } else {
          return {
            success: false,
            error: 'AI response was not valid JSON'
          };
        }
      }
    }
    
    // Use the AI output as the updated block data
    const blockData = aiOutput;
    
    return {
      success: true,
      blockData
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
} 
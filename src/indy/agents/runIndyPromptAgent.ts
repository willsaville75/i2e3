import { buildOpenAIPromptForPage } from '../utils/buildOpenAIPromptForPage';
import { buildOpenAIPromptForBlock } from '../utils/buildOpenAIPromptForBlock';
import { PromptAgentInput } from '../../types/agents';

/**
 * Generates appropriate prompts for AI models based on context and mode
 * 
 * This agent serves as a unified interface for prompt generation:
 * - Routes to block or page prompt builders based on mode
 * - Handles different parameter sets for each mode
 * - Provides consistent prompt generation interface
 * 
 * @param input - PromptAgentInput object containing configuration
 * @param memory - Optional memory context for agent
 * @returns Generated prompt string ready for AI model
 */
export default function run(input: PromptAgentInput, _memory?: any): string {
  const { context, mode, instructions, goal, target, focusBlockType } = input;

  if (mode === 'page') {
    // Generate page-level prompt
    return buildOpenAIPromptForPage({ 
      context, 
      goal,
      focusBlockType
    });
  } else {
    // Generate block-level prompt
    return buildOpenAIPromptForBlock({ 
      blockType: context.blockType,
      context, 
      mode: 'update', // Default to update mode for prompt agent
      target,
      instructions
    });
  }
} 
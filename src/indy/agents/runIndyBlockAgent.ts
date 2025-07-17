import { buildOpenAIPromptForBlock } from '../utils/buildOpenAIPromptForBlock';
import { callAI } from '../../ai/call';
import runIndyResponseAgent from './runIndyResponseAgent';
import { BlockAgentInput } from '../../types/agents';

/**
 * Runs the Indy block agent for AI-driven block content generation (OPTIMIZED)
 * 
 * This agent orchestrates the complete flow with performance optimizations:
 * 1. Skips decision engine for simple cases (performance boost)
 * 2. Builds minimal prompts for faster processing
 * 3. Uses optimized AI call parameters
 * 4. Processes the AI response efficiently
 * 
 * @param input - BlockAgentInput object containing configuration
 * @param memory - Optional memory context for agent
 * @returns Processed result ready for application
 */
export default async function run(input: BlockAgentInput, _memory?: any) {
  const { context, model, instructions, target } = input;

  // Step 1: Build optimized prompt using minimal context
  const prompt = buildOpenAIPromptForBlock({
    blockType: context.blockType,
    context,
    mode: context.intent === 'create' ? 'create' : 'update',
    target,
    instructions
  });

  // Step 2: Call OpenAI API with optimized parameters
  const response = await callAI({ 
    prompt, 
    model,
    maxTokens: 300,      // Further reduced for speed
    temperature: 0.7     // Higher for faster responses
  });

  // Step 3: Parse the response using response agent
  const parsedResult = runIndyResponseAgent({
    blockType: context.blockType,
    aiOutput: response,
    context,
    mode: 'block'
  });

  // Step 4: Return the parsed result
  if (!parsedResult.success) {
    throw new Error(parsedResult.error || 'Failed to parse AI response');
  }

  return parsedResult;
} 
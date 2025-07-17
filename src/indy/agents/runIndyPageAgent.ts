import { runIndyDecisionEngine } from '../utils/runIndyDecisionEngine';
import { buildOpenAIPromptForPage } from '../utils/buildOpenAIPromptForPage';
import { callAI } from '../../ai/call';
import { getComplexModel } from '../../ai/client';
import { PageAgentInput } from '../../types/agents';

/**
 * Runs the Indy page agent for AI-driven page content generation
 * 
 * This agent orchestrates the complete flow for page-level operations:
 * 1. Analyzes the page context using the decision engine
 * 2. Builds an appropriate prompt for OpenAI
 * 3. Calls the AI model for coordinated content generation
 * 4. Processes the AI response into structured output
 * 
 * @param input - PageAgentInput object containing configuration
 * @param memory - Optional memory context for agent
 * @returns Processed result ready for application
 */
export default async function run(input: PageAgentInput, _memory?: any) {
  const { context, model, goal, focusBlockType } = input;

  // Step 1: Analyze the page context to determine actions for each block
  const decisionResult = runIndyDecisionEngine({ 
    mode: 'page', 
    context 
  });

  // Step 2: Build optimized prompt using dedicated prompt builder
  const prompt = buildOpenAIPromptForPage({
    context,
    goal,
    focusBlockType
  });

  // Step 3: Call OpenAI API for coordinated content generation using complex model
  const response = await callAI({ prompt, model: model || getComplexModel() });

  // Step 4: Return structured result with decision context
  return {
    result: response,
    raw: response,
    target: 'page',
    mode: 'page' as const,
    success: true,
    decisionContext: decisionResult
  };
} 
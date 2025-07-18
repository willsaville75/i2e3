import { callAI } from '../../ai/call';
import { buildOpenAIPromptForBlock } from '../utils/buildOpenAIPromptForBlock';

export interface BlockAgentInput {
  context: any;
  model?: string;
  instructions?: string;
  target?: string;
}

export default async function runIndyBlockAgent(input: BlockAgentInput) {
  const { context, model, instructions, target } = input;

  // Build the prompt for the block
  const prompt = buildOpenAIPromptForBlock({
    blockType: context.blockType,
    context,
    mode: context.current ? 'update' : 'create',
    target,
    instructions
  });

  // Call AI to generate the response
  const response = await callAI({ 
    prompt, 
    model: model || 'gpt-4o-mini'
  });

  return {
    result: response,
    raw: response,
    target: context.blockType,
    mode: 'block' as const,
    success: true
  };
} 
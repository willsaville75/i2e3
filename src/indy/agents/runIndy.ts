import { classifyIntentToAgent } from './orchestrator';
import { runAgent } from './orchestrator';

/**
 * Simplified Indy runner that automatically selects and executes the appropriate agent
 * 
 * @param input - User input string to classify and process
 * @param memory - Optional memory context for the agent
 * @returns Object containing the selected agent name and result
 */
export async function runIndy(input: string) {
  const agentName = await classifyIntentToAgent(input);
  const result = await runAgent(agentName, input);
  return { agentName, result };
} 
import { agentMap } from './agentMap';

/**
 * Execute an agent by name with input and optional memory
 */
export async function runAgent(agentName: string, input: any, memory?: any): Promise<any> {
  const startTime = Date.now();
  console.log(`🎬 Orchestrator: Starting agent ${agentName} (${Date.now() - startTime}ms)`);
  
  const agent = agentMap[agentName];
  if (!agent) {
    throw new Error(`Unknown agent: ${agentName}`);
  }
  
  console.log(`🎭 Orchestrator: Agent ${agentName} found, executing (${Date.now() - startTime}ms)`);
  const result = await agent(input, memory);
  console.log(`🎉 Orchestrator: Agent ${agentName} completed (${Date.now() - startTime}ms)`);
  return result;
}

/**
 * Classify user intent and return appropriate agent name
 */
export function classifyIntentToAgent(input: string): string {
  const startTime = Date.now();
  console.log(`🧠 Classifying intent: "${input}" (${Date.now() - startTime}ms)`);
  
  const lower = input.toLowerCase();
  let agentName: string;
  
  if (lower.includes('explain') || lower.includes('describe') || lower.includes('what is') || lower.includes('tell me about')) agentName = 'runIndyContextAgent';
  else if (lower.includes('create') || lower.includes('new')) agentName = 'createAgent';
  else if (lower.includes('update') || lower.includes('change')) agentName = 'updateAgent';
  else if (lower.includes('page')) agentName = 'runIndyPageAgent';
  else if (lower.includes('block')) agentName = 'runIndyBlockAgent';
  else if (lower.includes('flow') || lower.includes('execute')) agentName = 'runIndyExecutionAgent';
  else agentName = 'createAgent'; // Default to createAgent for new blocks instead of runIndyPromptAgent
  
  console.log(`🎯 Intent classified as: ${agentName} (${Date.now() - startTime}ms)`);
  return agentName;
}

/**
 * Get list of available agent names
 */
export function getAvailableAgents(): string[] {
  return Object.keys(agentMap);
}

/**
 * Check if an agent exists
 */
export function hasAgent(agentName: string): boolean {
  return agentName in agentMap;
}

// Re-export agentMap for direct access
export { agentMap } from './agentMap'; 
import { agentMap } from './agentMap';
// AI-first orchestrator - no regex-based classification needed

/**
 * Execute an agent by name with input and optional memory
 */
export async function runAgent(agentName: string, input: any): Promise<any> {
  try {
    const agent = agentMap[agentName];
    if (!agent) {
      throw new Error(`Agent '${agentName}' not found`);
    }

    const result = await agent(input);
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Classify user intent and return appropriate agent name
 * AI-first: The agents themselves use AI, classification is simple keyword matching
 */
export function classifyIntentToAgent(input: string): string {
  const startTime = Date.now();
  console.log(`🧠 Classifying intent: "${input}" (${Date.now() - startTime}ms)`);
  
  const lower = input.toLowerCase();
  let agentName: string;
  
  if (lower.includes('explain') || lower.includes('describe') || lower.includes('what is') || lower.includes('tell me about') || lower.includes('what do you know')) {
    agentName = 'runIndyContextAgent';
  } else if (lower.includes('create') || lower.includes('new')) {
    agentName = 'createAgent';
  } else if (lower.includes('update') || lower.includes('change') || lower.includes('make') || lower.includes('set')) {
    agentName = 'updateAgent';
  } else if (lower.includes('page')) {
    agentName = 'runIndyPageAgent';
  } else if (lower.includes('block')) {
    agentName = 'runIndyBlockAgent';
  } else if (lower.includes('flow') || lower.includes('execute')) {
    agentName = 'runIndyExecutionAgent';
  } else {
    agentName = 'updateAgent'; // Default to updateAgent - it can handle most requests
  }
  
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
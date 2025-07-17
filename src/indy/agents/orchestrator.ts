import { agentMap } from './agentMap';
import { isPropertyIntent } from './runIndyPropertyAgent';

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
 */
export function classifyIntentToAgent(input: string): string {
  // First check if it's a property-related intent
  if (isPropertyIntent(input)) {
    return 'propertyAgent';
  }
  
  // Simple keyword-based classification for other intents
  const lowerInput = input.toLowerCase();
  
  // Check for update-related keywords
  if (lowerInput.includes('update') || lowerInput.includes('change') || lowerInput.includes('modify') || lowerInput.includes('edit')) {
    return 'updateAgent';
  }
  
  // Check for create-related keywords
  if (lowerInput.includes('create') || lowerInput.includes('new') || lowerInput.includes('add') || lowerInput.includes('make') || lowerInput.includes('generate')) {
    return 'createAgent';
  }
  
  // Default to createAgent for ambiguous cases
  return 'createAgent';
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
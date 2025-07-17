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
  
  // Check for explanation/context requests first
  if (lower.includes('explain') || lower.includes('describe') || lower.includes('what is') || lower.includes('tell me about')) {
    agentName = 'runIndyContextAgent';
  }
  // Check for explicit create/new requests
  else if (lower.includes('create') || lower.includes('new')) {
    agentName = 'createAgent';
  }
  // Check for page-level requests
  else if (lower.includes('page')) {
    agentName = 'runIndyPageAgent';
  }
  // Check for execution/flow requests
  else if (lower.includes('flow') || lower.includes('execute')) {
    agentName = 'runIndyExecutionAgent';
  }
  // Check for complex multi-part requests or content changes
  else if (
    // Multiple targets (contains "and")
    lower.includes(' and ') ||
    // Content transformation requests
    lower.includes('make it about') ||
    lower.includes('change it to') ||
    lower.includes('transform') ||
    lower.includes('convert') ||
    // Complex update patterns
    (lower.includes('update') && (lower.includes('also') || lower.includes('plus'))) ||
    // Content-focused requests without specific targets
    (!lower.includes('background') && !lower.includes('button') && !lower.includes('title') && !lower.includes('subtitle') && 
     (lower.includes('about') || lower.includes('topic') || lower.includes('content') || lower.includes('theme')))
  ) {
    agentName = 'runIndyBlockAgent'; // Use block agent for complex requests
  }
  // Simple update requests with specific targets
  else if (lower.includes('update') || lower.includes('change')) {
    agentName = 'updateAgent';
  }
  // Block-specific requests
  else if (lower.includes('block')) {
    agentName = 'runIndyBlockAgent';
  }
  // Default to updateAgent for existing blocks, createAgent for new ones
  else {
    agentName = 'updateAgent';
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
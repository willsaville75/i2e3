import { agentMap } from './agentMap';
import { classifyIntent, type ClassificationResult } from '../utils/hybridClassification';

/**
 * Execute an agent by name with input and optional memory
 */
export async function runAgent(agentName: string, input: any): Promise<any> {
  try {
    const agent = agentMap[agentName as keyof typeof agentMap];
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
 * Enhanced classification with hybrid intelligence
 * Combines quick keyword matching with AI analysis for ambiguous cases
 */
export async function classifyIntentToAgentEnhanced(
  input: string,
  sessionId?: string,
  context?: {
    currentBlock?: {
      blockType: string;
      blockId?: string;
    };
  }
): Promise<ClassificationResult> {
  return await classifyIntent(input, {
    currentData: context?.currentBlock,
    blockType: context?.currentBlock?.blockType,
    sessionId
  });
}

/**
 * Legacy classification function for backward compatibility
 * @deprecated Use classifyIntentToAgentEnhanced for better results
 */
export function classifyIntentToAgent(input: string): string {
  const startTime = Date.now();
  console.log(`🧠 Classifying intent: "${input}" (${Date.now() - startTime}ms)`);
  
  const lower = input.toLowerCase().trim();
  let agentName: string;
  
  // Phase 1: Conversational Intelligence - detect greetings, questions, help
  if (isConversationalInput(lower)) {
    agentName = 'runIndyConversationAgent';
  }
  // Context requests - asking about current state (check before modification requests)
  else if (lower.includes('explain') || lower.includes('describe') || lower.includes('what is') || lower.includes('tell me about') || lower.includes('what do you know') || 
           lower.includes('what can i') || lower.includes('what can you') || lower.includes('what are the') || lower.includes('show me') || 
           lower.includes('list') || lower.includes('properties') || lower.includes('options') || lower.includes('available') ||
           (lower.includes('what are') && lower.includes('properties'))) {
    agentName = 'runIndyContextAgent';
  }
  // Content creation requests - check for creation intent first
  else if (lower.includes('create') || lower.includes('new') || lower.includes('add') || lower.includes('need') || lower.includes('want') || lower.includes('build') || lower.includes('make')) {
    agentName = 'createAgent';
  }
  // Content modification requests
  else if (lower.includes('update') || lower.includes('change') || lower.includes('set') || lower.includes('modify') || lower.includes('edit')) {
    agentName = 'updateAgent';
  }
  // Page-level operations
  else if (lower.includes('page')) {
    agentName = 'runIndyPageAgent';
  }
  // Block-level operations (only if not creation intent)
  else if (lower.includes('block')) {
    agentName = 'runIndyBlockAgent';
  }
  // Execution/flow operations
  else if (lower.includes('flow') || lower.includes('execute')) {
    agentName = 'runIndyExecutionAgent';
  }
  // Default: assume content modification
  else {
    agentName = 'updateAgent';
  }
  
  console.log(`🎯 Intent classified as: ${agentName} (${Date.now() - startTime}ms)`);
  return agentName;
}

/**
 * Detect conversational inputs that should be handled by conversation agent
 */
function isConversationalInput(input: string): boolean {
  // First check for content modification keywords - these take priority
  const contentModificationKeywords = [
    'make', 'change', 'update', 'set', 'adjust', 'modify', 'edit', 'create', 'add', 'remove', 'delete', 'new'
  ];
  
  const hasContentModification = contentModificationKeywords.some(keyword => 
    input.includes(keyword)
  );
  
  // Check for context keywords - these should go to context agent
  const contextKeywords = [
    'explain', 'describe', 'what is', 'tell me about', 'what do you know', 
    'what can i', 'what can you', 'what are the', 'show me', 
    'list', 'properties', 'options', 'available'
  ];
  
  const hasContextKeywords = contextKeywords.some(keyword => 
    input.includes(keyword)
  );
  
  // If it has content modification or context keywords, it's not conversational
  if (hasContentModification || hasContextKeywords) {
    return false;
  }
  
  const conversationalPatterns = [
    // Greetings
    'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
    'hi indy', 'hello indy', 'hey indy',
    
    // Questions about Indy
    'how are you', 'how are you doing', 'what\'s up', 'how\'s it going',
    'who are you', 'what are you', 'what can you do',
    
    // Help requests
    'help', 'help me', 'i need help', 'can you help', 'what can you help with',
    'how do i', 'how can i', 'show me how',
    
    // Politeness
    'thanks', 'thank you', 'please', 'excuse me',
    
    // General questions (but not content-specific)
    'what', 'why', 'when', 'where', 'how',
    
    // Casual conversation
    'nice', 'cool', 'awesome', 'great', 'perfect',
    'ok', 'okay', 'sure', 'yes', 'no'
  ];
  
  // Check if input starts with conversational patterns or is very short and casual
  const isShortAndCasual = input.length < 15 && !input.includes('block') && !input.includes('page');
  const hasConversationalPattern = conversationalPatterns.some(pattern => 
    input.includes(pattern) || input.startsWith(pattern)
  );
  
  return hasConversationalPattern || isShortAndCasual;
}

/**
 * Hybrid Response Strategy - determines how to handle classified intents
 */
export interface ResponseStrategy {
  approach: 'direct' | 'clarify' | 'fallback' | 'hybrid';
  primaryAgent: string;
  fallbackAgent?: string;
  clarificationMessage?: string;
  confidence: number;
}

/**
 * Determine response strategy based on classification results
 * @deprecated Use confidence from ClassificationResult directly
 */
export function determineResponseStrategy(classification: ClassificationResult): ResponseStrategy {
  // This function is deprecated and only kept for backward compatibility
  // The new hybrid classification handles confidence internally
  return {
    approach: 'direct',
    primaryAgent: classification.agent,
    confidence: classification.confidence
  };
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
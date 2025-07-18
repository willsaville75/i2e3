export * from './buildOpenAIPromptForBlock';
export * from './buildOpenAIPromptForPage';
export { classifyIntent } from './classifyIntent';
export * from './conversationMemory';
export * from './hybridClassification';
export * from './responseAdapter';
export * from './runIndy';
export * from './runIndyDecisionEngine';

/**
 * Robust intent classification that balances speed and accuracy
 * Uses patterns and context rather than brittle keyword matching
 */
export interface ClassificationResult {
  agent: string;
  confidence: number;
  method: 'pattern' | 'ai';
}

/**
 * Pattern-based classification that understands context better than simple keywords
 */
export function classifyByPatterns(input: string): ClassificationResult | null {
  const normalized = input.toLowerCase().trim();
  
  // Block creation patterns - very reliable
  const blockCreationPatterns = [
    /^(i need|i want|create|add|make|build)\s+(a|an|new)?\s*\w*\s*block/i,
    /^(a|an)\s+\w+\s+block\s+(about|with|for)/i,
    /block\s+(about|with|for)\s+.+/i,
  ];
  
  if (blockCreationPatterns.some(pattern => pattern.test(normalized))) {
    return { agent: 'createAgent', confidence: 0.95, method: 'pattern' };
  }
  
  // Update patterns
  const updatePatterns = [
    /^(change|update|modify|edit|set)\s+(the|this)/i,
    /make\s+(it|this|that|the)\s+\w+/i,
    /^(adjust|fix|correct)/i,
  ];
  
  if (updatePatterns.some(pattern => pattern.test(normalized))) {
    return { agent: 'updateAgent', confidence: 0.9, method: 'pattern' };
  }
  
  // Context/question patterns
  const contextPatterns = [
    /^(what|how|when|where|why|which)/i,
    /^(explain|describe|tell me|show me)/i,
    /^can (i|you)/i,
  ];
  
  if (contextPatterns.some(pattern => pattern.test(normalized))) {
    return { agent: 'runIndyContextAgent', confidence: 0.85, method: 'pattern' };
  }
  
  // Clear conversational patterns
  const conversationPatterns = [
    /^(hi|hello|hey|thanks|thank you|bye|goodbye)$/i,
    /^(good morning|good afternoon|good evening)/i,
    /^(yes|no|ok|okay|sure|great|awesome|nice)$/i,
  ];
  
  if (conversationPatterns.some(pattern => pattern.test(normalized))) {
    return { agent: 'runIndyConversationAgent', confidence: 0.95, method: 'pattern' };
  }
  
  // No clear pattern found
  return null;
} 
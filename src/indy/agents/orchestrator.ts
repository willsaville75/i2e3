import { agentMap } from './agentMap';
import { classifyByPatterns } from '../utils';

// Re-export types
export type { ClassificationResult } from '../utils/hybridClassification';

/**
 * Execute an agent by name with input
 */
export async function runAgent(agentName: string, input: any): Promise<any> {
  console.log(`🎯 runAgent called:`, {
    agentName,
    inputKeys: Object.keys(input),
    blockType: input.blockType,
    operation: input.operation
  });
  
  try {
    const agent = agentMap[agentName as keyof typeof agentMap];
    if (!agent) {
      console.error(`❌ Agent '${agentName}' not found in agentMap`);
      throw new Error(`Agent '${agentName}' not found`);
    }

    console.log(`🚀 Executing agent: ${agentName}`);
    const result = await agent(input);
    console.log(`✅ Agent ${agentName} completed successfully`);
    return result;
  } catch (error) {
    console.error(`❌ Agent ${agentName} failed:`, error);
    throw error;
  }
}

/**
 * Enhanced intent classification with pattern matching and AI fallback
 * Much more robust than brittle keyword matching
 */
export async function classifyIntentToAgent(input: string): Promise<string> {
  const startTime = Date.now();
  console.log(`🧠 Classifying intent: "${input}" (${Date.now() - startTime}ms)`);
  
  // Try pattern-based classification first (fast and reliable)
  const patternResult = classifyByPatterns(input);
  if (patternResult && patternResult.confidence >= 0.9) {
    console.log(`🎯 Intent classified as: ${patternResult.agent} (pattern, confidence: ${patternResult.confidence}) (${Date.now() - startTime}ms)`);
    return patternResult.agent;
  }
  
  // For ambiguous cases, use AI classification
  try {
    const { callAI } = await import('../../ai/call');
    const { getFastModel } = await import('../../ai/client');
    
    const prompt = `Classify this user intent into exactly one category:

createAgent - User wants to CREATE something new (block, section, component)
updateAgent - User wants to MODIFY existing content  
runIndyContextAgent - User is ASKING about current state or capabilities
runIndyConversationAgent - General chat or unclear intent

Examples:
- "a hero block about X" → createAgent
- "make the title bigger" → updateAgent  
- "what blocks do I have" → runIndyContextAgent
- "hello" → runIndyConversationAgent

User said: "${input}"

Respond with ONLY the agent name, nothing else.`;

    const response = await callAI({
      prompt,
      model: getFastModel(),
      maxTokens: 20,
      temperature: 0
    });
    
    const agentName = response.trim();
    console.log(`🎯 Intent classified as: ${agentName} (AI) (${Date.now() - startTime}ms)`);
    return agentName;
    
  } catch (error) {
    // Ultimate fallback
    console.warn('AI classification failed, using fallback:', error);
    const fallback = patternResult?.agent || 'runIndyConversationAgent';
    console.log(`🎯 Intent classified as: ${fallback} (fallback) (${Date.now() - startTime}ms)`);
    return fallback;
  }
}
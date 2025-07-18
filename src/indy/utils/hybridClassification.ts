import { callAI } from '../../ai/call';
import { getFastModel } from '../../ai/client';

export interface ClassificationResult {
  agent: string;
  confidence: number;
  reasoning: string;
  method: 'keyword' | 'ai' | 'fallback';
  duration: number;
}

/**
 * Hybrid classification: Keywords first, AI fallback for ambiguous cases
 * This replaces the dual classification system with a more efficient approach
 */
export async function classifyIntent(
  userInput: string,
  context?: {
    currentData?: any;
    blockType?: string;
    sessionId?: string;
  }
): Promise<ClassificationResult> {
  const startTime = Date.now();
  
  // STEP 1: Quick keyword classification (0.1ms)
  const keywordResult = quickKeywordClassify(userInput, context);
  
  // STEP 2: If high confidence, use keyword result
  if (keywordResult.confidence >= 0.9) {
    return {
      ...keywordResult,
      method: 'keyword',
      duration: Date.now() - startTime
    };
  }
  
  // STEP 3: Use AI for ambiguous cases (200ms)
  try {
    const aiResult = await aiClassify(userInput, context);
    return {
      ...aiResult,
      method: 'ai',
      duration: Date.now() - startTime
    };
  } catch (error) {
    // STEP 4: Fallback to conversation agent if AI fails
    return {
      agent: 'runIndyConversationAgent',
      confidence: 0.5,
      reasoning: `AI classification failed: ${error}`,
      method: 'fallback',
      duration: Date.now() - startTime
    };
  }
}

/**
 * Fast keyword-based classification for obvious cases
 */
function quickKeywordClassify(
  input: string,
  context?: { currentData?: any; blockType?: string }
): Omit<ClassificationResult, 'method' | 'duration'> {
  const text = input.toLowerCase().trim();
  
  // HIGH CONFIDENCE PATTERNS (0.95+)
  
  // Explicit creation requests
  if (text.match(/^(create|add|new|make)\s+(a\s+)?(hero|block|section)/i)) {
    return {
      agent: 'createAgent',
      confidence: 0.95,
      reasoning: 'Explicit creation request with block type'
    };
  }
  
  // Explicit update requests with specific targets
  if (text.match(/^(change|update|modify|edit|set)\s+(the\s+)?(title|background|button|color|text)/i)) {
    return {
      agent: 'updateAgent',
      confidence: 0.95,
      reasoning: 'Explicit update request with specific target'
    };
  }
  
  // Clear question patterns
  if (text.match(/^(what|how|can\s+i|help|explain|describe|tell\s+me)/i)) {
    return {
      agent: 'runIndyContextAgent',
      confidence: 0.9,
      reasoning: 'Clear question pattern'
    };
  }
  
  // Canvas-specific questions
  if (text.includes('canvas') || text.includes('page') || text.includes('all blocks')) {
    return {
      agent: 'runIndyContextAgent',
      confidence: 0.9,
      reasoning: 'Canvas/page question'
    };
  }
  
  // Greeting patterns
  if (text.match(/^(hi|hello|hey|good\s+(morning|afternoon|evening))/i)) {
    return {
      agent: 'runIndyConversationAgent',
      confidence: 0.95,
      reasoning: 'Greeting pattern'
    };
  }
  
  // MEDIUM CONFIDENCE PATTERNS (0.7-0.8)
  
  // Contains creation keywords
  if (text.includes('create') || text.includes('add') || text.includes('new') || text.includes('make')) {
    // If no current data, likely creation
    if (!context?.currentData) {
      return {
        agent: 'createAgent',
        confidence: 0.8,
        reasoning: 'Creation keywords without current data'
      };
    }
    // With current data, might be ambiguous
    return {
      agent: 'createAgent',
      confidence: 0.6,
      reasoning: 'Creation keywords with existing data (ambiguous)'
    };
  }
  
  // Contains update keywords
  if (text.includes('change') || text.includes('update') || text.includes('modify') || text.includes('edit') || text.includes('set')) {
    // If current data exists, likely update
    if (context?.currentData) {
      return {
        agent: 'updateAgent',
        confidence: 0.8,
        reasoning: 'Update keywords with current data'
      };
    }
    // Without current data, might be ambiguous
    return {
      agent: 'updateAgent',
      confidence: 0.6,
      reasoning: 'Update keywords without current data (ambiguous)'
    };
  }
  
  // Context/question keywords
  if (text.includes('what') || text.includes('how') || text.includes('can') || text.includes('help')) {
    return {
      agent: 'runIndyContextAgent',
      confidence: 0.7,
      reasoning: 'Question keywords'
    };
  }
  
  // LOW CONFIDENCE - Needs AI classification
  return {
    agent: 'runIndyConversationAgent',
    confidence: 0.3,
    reasoning: 'Ambiguous input, needs AI classification'
  };
}

/**
 * AI-based classification for complex/ambiguous cases
 */
async function aiClassify(
  input: string,
  context?: { currentData?: any; blockType?: string }
): Promise<Omit<ClassificationResult, 'method' | 'duration'>> {
  const prompt = `
You are an expert at classifying user requests for a website builder.

USER INPUT: "${input}"
CONTEXT: ${context ? JSON.stringify(context, null, 2) : 'None'}

Available agents:
- createAgent: Add new content/blocks (use when user wants to ADD something new)
- updateAgent: Modify existing content (use when user wants to CHANGE existing content)
- runIndyContextAgent: Answer questions about capabilities (use for QUESTIONS)
- runIndyConversationAgent: General chat/unclear requests (use for CONVERSATION)

Classification rules:
1. If user mentions adding/creating something new → createAgent
2. If user wants to modify existing content → updateAgent  
3. If user asks questions about the system → runIndyContextAgent
4. If unclear or general chat → runIndyConversationAgent

Context clues:
- If currentData exists, user likely wants to update existing content
- If no currentData, user likely wants to create new content
- Consider the specific words used and their intent

Return ONLY valid JSON: 
{
  "agent": "createAgent|updateAgent|runIndyContextAgent|runIndyConversationAgent",
  "confidence": 0.5-1.0,
  "reasoning": "brief explanation of classification"
}
`;

  const response = await callAI({
    prompt,
    model: getFastModel(), // Use fast model for classification
    maxTokens: 100,
    temperature: 0.1 // Low temperature for consistent classification
  });
  
  try {
    // Clean response of any markdown formatting
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim();
    const parsed = JSON.parse(cleanedResponse);
    
    return {
      agent: parsed.agent,
      confidence: Math.max(0.5, Math.min(1.0, parsed.confidence)), // Clamp between 0.5-1.0
      reasoning: `AI: ${parsed.reasoning}`
    };
  } catch (error) {
    throw new Error(`Failed to parse AI classification response: ${error}`);
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use classifyIntent instead
 */
export function classifyIntentToAgent(input: string): string {
  // For immediate backward compatibility, use synchronous keyword classification
  const result = quickKeywordClassify(input);
  return result.agent;
} 
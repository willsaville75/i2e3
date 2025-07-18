import { conversationMemory, type ConversationContext } from './conversationMemory';
import { callAI } from '../../ai/call';
import { getFastModel } from '../../ai/client';

/**
 * Response adaptation configuration
 */
export interface ResponseAdaptationConfig {
  userSkillLevel: 'beginner' | 'intermediate' | 'advanced';
  responseStyle: 'concise' | 'detailed' | 'friendly';
  contextualDepth: 'minimal' | 'moderate' | 'comprehensive';
  includeExplanations: boolean;
  includeProactiveSuggestions: boolean;
  adaptToConversationFlow: boolean;
}

/**
 * Enhanced response structure
 */
export interface EnhancedResponse {
  primaryMessage: string;
  explanation?: string;
  proactiveSuggestions?: Array<{
    title: string;
    description: string;
    example: string;
    category: 'optimization' | 'enhancement' | 'alternative' | 'next-step';
    confidence: number;
  }>;
  contextualTips?: string[];
  actionSummary?: string;
  followUpQuestions?: string[];
}

/**
 * Adapt response based on user context and preferences
 */
export async function adaptResponse(
  originalResponse: string,
  sessionId: string,
  context: {
    actionTaken?: any;
    agentUsed: string;
    userInput: string;
    blockContext?: {
      blockType: string;
      blockId?: string;
      blockData?: any;
    };
  }
): Promise<EnhancedResponse> {
  try {
    // Get user context and preferences
    const conversationContext = conversationMemory.getContext(sessionId);
    const config = buildAdaptationConfig(conversationContext);
    
    // Generate enhanced response
    const enhancedResponse = await generateEnhancedResponse(
      originalResponse,
      config,
      context,
      conversationContext
    );
    
    return enhancedResponse;
    
  } catch (error) {
    console.error('Error adapting response:', error);
    
    // Fallback to basic response
    return {
      primaryMessage: originalResponse,
      explanation: 'Response adaptation temporarily unavailable',
      contextualTips: ['Try being more specific in your requests for better results']
    };
  }
}

/**
 * Build adaptation configuration based on user context
 */
function buildAdaptationConfig(context: ConversationContext): ResponseAdaptationConfig {
  const prefs = context.userPreferences;
  
  return {
    userSkillLevel: prefs.skillLevel,
    responseStyle: prefs.preferredResponseStyle,
    contextualDepth: determineContextualDepth(prefs.skillLevel, context.history.length),
    includeExplanations: prefs.skillLevel === 'beginner' || prefs.preferredResponseStyle === 'detailed',
    includeProactiveSuggestions: context.history.length > 2, // After some interaction
    adaptToConversationFlow: true
  };
}

/**
 * Determine appropriate contextual depth
 */
function determineContextualDepth(
  skillLevel: 'beginner' | 'intermediate' | 'advanced',
  conversationLength: number
): 'minimal' | 'moderate' | 'comprehensive' {
  if (skillLevel === 'beginner') {
    return 'comprehensive';
  } else if (skillLevel === 'advanced' && conversationLength > 5) {
    return 'minimal';
  } else {
    return 'moderate';
  }
}

/**
 * Generate enhanced response using AI
 */
async function generateEnhancedResponse(
  originalResponse: string,
  config: ResponseAdaptationConfig,
  context: any,
  conversationContext: ConversationContext
): Promise<EnhancedResponse> {
  
  // Build context for AI enhancement
  const userContext = buildUserContextSummary(conversationContext);
  const actionContext = buildActionContextSummary(context);
  
  const prompt = `You are an expert response enhancer for Indy, a CMS editing assistant. Your job is to take a basic response and enhance it based on user preferences and context.

USER PROFILE:
- Skill Level: ${config.userSkillLevel}
- Response Style: ${config.responseStyle}
- Contextual Depth: ${config.contextualDepth}
- Include Explanations: ${config.includeExplanations}
- Include Proactive Suggestions: ${config.includeProactiveSuggestions}

USER CONTEXT:
${userContext}

ACTION CONTEXT:
${actionContext}

ORIGINAL RESPONSE:
"${originalResponse}"

ENHANCEMENT GUIDELINES:
1. **Skill Level Adaptation**:
   - Beginner: Use simple language, explain technical terms, provide step-by-step guidance
   - Intermediate: Use standard terminology, provide helpful context
   - Advanced: Use technical language, focus on efficient solutions

2. **Response Style Adaptation**:
   - Concise: Brief, to-the-point responses
   - Detailed: Comprehensive explanations with examples
   - Friendly: Warm, encouraging tone with emojis

3. **Proactive Intelligence**:
   - Suggest related improvements
   - Anticipate next steps
   - Offer optimization tips

4. **Context Awareness**:
   - Reference previous actions
   - Build on conversation history
   - Adapt to user's working patterns

RESPONSE FORMAT (JSON only):
{
  "primaryMessage": "Enhanced main response adapted to user preferences",
  "explanation": "Optional explanation of what was done and why",
  "proactiveSuggestions": [
    {
      "title": "Suggestion title",
      "description": "What this suggestion does",
      "example": "Example command or action",
      "category": "optimization|enhancement|alternative|next-step",
      "confidence": 0.8
    }
  ],
  "contextualTips": ["Tip 1", "Tip 2"],
  "actionSummary": "Brief summary of what action was taken",
  "followUpQuestions": ["Question 1?", "Question 2?"]
}

Enhance the response while maintaining its core meaning and intent.`;

  // Call AI for response enhancement
  const response = await callAI({
    prompt,
    model: getFastModel(),
    maxTokens: 600,
    temperature: 0.7
  });
  
  // Parse and validate AI response
  const cleanedResponse = response.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
  const enhanced = JSON.parse(cleanedResponse);
  
  return {
    primaryMessage: enhanced.primaryMessage || originalResponse,
    explanation: enhanced.explanation,
    proactiveSuggestions: enhanced.proactiveSuggestions || [],
    contextualTips: enhanced.contextualTips || [],
    actionSummary: enhanced.actionSummary,
    followUpQuestions: enhanced.followUpQuestions || []
  };
}

/**
 * Build user context summary for AI enhancement
 */
function buildUserContextSummary(context: ConversationContext): string {
  const parts = [
    `Conversation turns: ${context.history.length}`,
    `Common requests: ${context.userPreferences.commonRequests.slice(0, 3).join(', ') || 'none yet'}`,
    `Favorite features: ${context.userPreferences.favoriteFeatures.slice(0, 3).join(', ') || 'none yet'}`,
    `Last active block: ${context.userPreferences.lastActiveBlock || 'none'}`
  ];
  
  if (context.lastAction) {
    parts.push(`Last action: ${context.lastAction.type} (${context.lastAction.success ? 'successful' : 'failed'})`);
  }
  
  return parts.join('\n');
}

/**
 * Build action context summary
 */
function buildActionContextSummary(context: any): string {
  const parts = [
    `Agent used: ${context.agentUsed}`,
    `User input: "${context.userInput}"`
  ];
  
  if (context.blockContext) {
    parts.push(`Block type: ${context.blockContext.blockType}`);
    if (context.blockContext.blockId) {
      parts.push(`Block ID: ${context.blockContext.blockId}`);
    }
  }
  
  if (context.actionTaken) {
    parts.push(`Action taken: ${JSON.stringify(context.actionTaken).substring(0, 100)}...`);
  }
  
  return parts.join('\n');
}

/**
 * Generate proactive suggestions based on context
 */
export function generateProactiveSuggestions(
  context: ConversationContext,
  _currentAction?: any
): Array<{
  title: string;
  description: string;
  example: string;
  category: 'optimization' | 'enhancement' | 'alternative' | 'next-step';
  confidence: number;
}> {
  const suggestions: Array<any> = [];
  const prefs = context.userPreferences;
  
  // Based on common requests
  if (prefs.commonRequests.includes('make this full width')) {
    suggestions.push({
      title: 'Layout Optimization',
      description: 'Consider responsive design for different screen sizes',
      example: 'set content width to responsive',
      category: 'optimization',
      confidence: 0.8
    });
  }
  
  // Based on current block type
  if (context.currentBlock?.blockType === 'hero') {
    suggestions.push({
      title: 'Hero Enhancement',
      description: 'Add a compelling call-to-action button',
      example: 'add a button with "Get Started" text',
      category: 'enhancement',
      confidence: 0.7
    });
  }
  
  // Based on skill level
  if (prefs.skillLevel === 'beginner') {
    suggestions.push({
      title: 'Learning Tip',
      description: 'Try combining multiple changes in one request',
      example: 'make this full width with blue background',
      category: 'next-step',
      confidence: 0.6
    });
  }
  
  return suggestions.slice(0, 3); // Limit to 3 suggestions
} 
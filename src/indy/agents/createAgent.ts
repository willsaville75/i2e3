// Create agent for generating new blocks
import { blockRegistry } from '../../blocks';
import { callAI } from '../../ai/call';
import { getFastModel } from '../../ai/client';
import { CreateAgentInput, CreateAgentOutput } from '../../types/agents';

/**
 * Create agent for generating new blocks based on user intent (OPTIMIZED)
 * 
 * This agent uses minimal prompts for fast generation:
 * 1. Validates block type exists
 * 2. Uses hardcoded template for hero blocks (fastest path)
 * 3. Calls AI with minimal context
 * 
 * @param input - CreateAgentInput object containing configuration
 * @param memory - Optional memory context for agent
 * @returns Promise resolving to CreateAgentOutput
 */
export default async function run(input: CreateAgentInput, _memory?: any): Promise<CreateAgentOutput> {
  const startTime = Date.now();
  try {
    const { blockType, intent: userMessage, tokens: _tokens = {} } = input;
    console.log(`🏗️  CreateAgent started (${Date.now() - startTime}ms)`);
    
    // Validate block type exists
    if (!blockRegistry[blockType]) {
      return {
        success: false,
        error: `Block type '${blockType}' not found in registry`
      };
    }
    console.log(`✅ Block type validated (${Date.now() - startTime}ms)`);
    
    // For hero blocks, use optimized template-based prompt
    if (blockType === 'hero') {
      const prompt = `You are an expert UI content creator. Generate a hero block JSON for: "${userMessage}"

Return ONLY valid JSON in this EXACT format:
{
  "elements": {
    "title": { "content": "[Generated title based on request]", "level": 1 },
    "subtitle": { "content": "[Generated subtitle based on request]" },
    "button": { "text": "[Action text]", "href": "/[path]", "variant": "primary", "size": "lg" }
  },
  "layout": {
    "blockSettings": { "height": "screen", "margin": { "top": "lg", "bottom": "lg" } },
    "contentSettings": {
      "contentAlignment": { "horizontal": "center", "vertical": "center" },
      "textAlignment": "center",
      "contentWidth": "wide",
      "padding": { "top": "2xl", "bottom": "2xl" }
    }
  },
  "background": { "type": "color", "color": "blue", "colorIntensity": "medium" }
}

BACKGROUND RULES:
- For solid colors: { "type": "color", "color": "blue", "colorIntensity": "medium" }
- For gradients: { "type": "gradient", "gradient": "preset_name", "colorIntensity": "medium" }
- Available gradient presets: "sunset", "ocean", "purple", "forest", "fire", "sky", "rose", "mint"
- If user mentions specific gradient colors, use the closest preset name
- Examples: "sunset gradient" → "gradient": "sunset", "mint background" → "gradient": "mint"

Make the content engaging and relevant to: "${userMessage}". No explanations, just JSON.`;

      // Call AI with optimized parameters
      const model = getFastModel();
      console.log(`🤖 CreateAgent using model: ${model} (${Date.now() - startTime}ms)`);
      const aiStartTime = Date.now();
      const response = await callAI({
        prompt,
        model,
        maxTokens: 400,
        temperature: 0.3
      });
      console.log(`🔥 AI call completed in ${Date.now() - aiStartTime}ms (${Date.now() - startTime}ms total)`);

      // Parse response directly (no response agent needed)
      try {
        const cleanedOutput = response
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        const blockData = JSON.parse(cleanedOutput);
        console.log(`✅ CreateAgent completed successfully (${Date.now() - startTime}ms total)`);
        
        return {
          success: true,
          blockData,
          metadata: {
            blockType,
            userIntent: userMessage
          }
        };
      } catch (parseError) {
        // Fallback to default data if parsing fails
        const defaultData = blockRegistry[blockType]?.defaultData;
        if (defaultData) {
          return {
            success: true,
            blockData: defaultData,
            metadata: {
              blockType,
              userIntent: userMessage
            }
          };
        }
        throw new Error('Failed to parse AI response and no default data available');
      }
    }
    
    // For other block types, use minimal schema approach
    const blockEntry = blockRegistry[blockType];
    const prompt = `Generate a ${blockType} block for: "${userMessage}". Return valid JSON matching the schema structure.`;
    
    const response = await callAI({
      prompt,
      model: getFastModel(),
      maxTokens: 400,
      temperature: 0.3
    });
    
    try {
      const blockData = JSON.parse(response.trim());
      return {
        success: true,
        blockData,
        metadata: {
          blockType,
          userIntent: userMessage
        }
      };
    } catch (parseError) {
      return {
        success: true,
        blockData: blockEntry.defaultData,
        metadata: {
          blockType,
          userIntent: userMessage
        }
      };
    }
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      metadata: {
        blockType: input.blockType,
        userIntent: input.intent
      }
    };
  }
} 
// Update agent for modifying existing blocks
import { prepareBlockUpdateContext } from '../../blocks/utils/prepareBlockUpdateContext';
import { compressBlockUpdateContextForTarget } from '../../blocks/utils/compressBlockUpdateContextForTarget';
import { summariseBlockSchemaForAI } from '../../blocks/utils/summariseBlockSchemaForAI';
import { buildOpenAIPromptForBlock } from '../utils/buildOpenAIPromptForBlock';
import { extractTargetFromIntent } from '../utils/extractTargetFromIntent';
import { blockRegistry } from '../../blocks';
import { callAI } from '../../ai/call';
import { getFastModel } from '../../ai/client';
import { UpdateAgentInput, UpdateAgentOutput } from '../../types/agents';

/**
 * Update agent for modifying existing blocks
 * 
 * This agent:
 * 1. Extracts target paths from user intent for focused updates
 * 2. Uses compressed context when updating specific fields
 * 3. Generates diffs for precise updates
 * 4. Includes schema summaries and AI hints for better results
 * 
 * @param input - UpdateAgentInput object containing configuration
 * @param memory - Optional memory context for agent
 * @returns Promise resolving to UpdateAgentOutput
 */
export default async function run(input: UpdateAgentInput, _memory?: any): Promise<UpdateAgentOutput> {
  try {
    const { blockType, currentData, intent, tokens = {} } = input;
    
    // Validate block type exists
    if (!blockRegistry[blockType]) {
      return {
        success: false,
        error: `Block type '${blockType}' not found in registry`
      };
    }
    
    // Extract target path from user intent
    const target = extractTargetFromIntent(intent, blockType);
    
    // Prepare AI context with basic tokens
    const basicTokens = {
      colors: tokens.colors || ['blue', 'gray', 'green', 'red', 'purple'],
      spacing: tokens.spacing || ['sm', 'md', 'lg', 'xl', '2xl'],
      ...tokens
    };
    
    // Prepare full update context
    const fullContext = prepareBlockUpdateContext(blockType, currentData, basicTokens);
    
    let prompt: string;
    
    if (target) {
      // Use compressed context for focused updates
      const compressedContext = compressBlockUpdateContextForTarget(fullContext, target);
      
      // Generate schema summary for the target
      const schemaSummary = summariseBlockSchemaForAI(compressedContext.schema, {
        includeEnums: true,
        includeDefaults: false,
        maxDepth: 2,
        includeHints: true
      });
      
      // Build focused prompt with compressed context
      prompt = `You are an expert UI content assistant. Update the "${target}" of a "${blockType}" block.

User Intent: "${intent}"

Current ${target}:
${JSON.stringify(compressedContext.current, null, 2)}

Schema for ${target}:
${schemaSummary}

${fullContext.aiHints ? `AI Hints:\n${JSON.stringify(fullContext.aiHints, null, 2)}\n` : ''}

Generate ONLY the updated value for "${target}". 

For example:
- If updating "elements.title", return: { "content": "New Title", "level": 1 }
- If updating "elements.button.text", return just: "New Button Text"
- If updating "background.color", return just: "purple"

Important:
- Return ONLY the direct value that should replace the current value at "${target}"
- Do NOT wrap it in the path structure
- Do NOT include parent objects
- Do NOT include explanations`;
      
    } else {
      // Full block update - use the standard prompt builder
      prompt = buildOpenAIPromptForBlock({
        blockType,
        context: fullContext,
        mode: 'update',
        instructions: intent
      });
    }

    // Call AI with optimized prompt using fast model
    const response = await callAI({
      prompt,
      model: getFastModel(),
      maxTokens: target ? 200 : 400, // Less tokens needed for focused updates
      temperature: 0.3
    });
    
    // Parse AI response
    let aiOutput;
    try {
      // First try to parse as JSON
      aiOutput = JSON.parse(response);
    } catch (parseError) {
      // If that fails, check if it's a simple string value (for leaf nodes like button.text)
      const trimmedResponse = response.trim();
      if (trimmedResponse.startsWith('"') && trimmedResponse.endsWith('"')) {
        // It's a quoted string, parse it
        try {
          aiOutput = JSON.parse(trimmedResponse);
        } catch {
          // If even that fails, use the trimmed response without quotes
          aiOutput = trimmedResponse.slice(1, -1);
        }
      } else {
        // Try to extract JSON from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiOutput = JSON.parse(jsonMatch[0]);
        } else {
          return {
            success: false,
            error: 'AI response was not valid JSON',
            target
          };
        }
      }
    }
    
    // Build the final block data
    let blockData;
    if (target) {
      // Check if AI returned a nested structure when we asked for a direct value
      // This happens when AI returns {"elements": {"button": {"text": "value"}}} instead of just "value"
      let actualValue = aiOutput;
      
      // Try to extract the actual value if it's nested following the target path
      if (typeof aiOutput === 'object' && aiOutput !== null) {
        const pathParts = target.split('.');
        let current = aiOutput;
        
        // Try to navigate the returned object following the target path
        for (const part of pathParts) {
          if (current && typeof current === 'object' && part in current) {
            current = current[part];
          } else {
            // Path doesn't match, use the original output
            break;
          }
        }
        
        // If we successfully navigated to a different value, use it
        if (current !== aiOutput) {
          actualValue = current;
        }
      }
      
      // For targeted updates, merge the AI output into the current data
      blockData = { ...currentData };
      
      // Apply the update at the target path
      const pathParts = target.split('.');
      let current = blockData;
      
      // Navigate to the parent of the target
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      // Set the new value
      const lastPart = pathParts[pathParts.length - 1];
      current[lastPart] = actualValue;
      
      // Also return the diff for precise updates
      return {
        success: true,
        blockData,
        diff: {
          [target]: actualValue
        },
        target
      };
    } else {
      // For full updates, use the AI output as-is
      blockData = aiOutput;
      
      return {
        success: true,
        blockData,
        target: null
      };
    }
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      target: null
    };
  }
} 
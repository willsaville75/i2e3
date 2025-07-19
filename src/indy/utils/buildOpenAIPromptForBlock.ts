import { summariseBlockSchemaForAI } from '../../blocks/utils/summariseBlockSchemaForAI';
import { compressBlockUpdateContextForTarget } from '../../blocks/utils/compressBlockUpdateContextForTarget';
import { getAvailableBlocksForAI } from '../../blocks';
import { prepareBlockAIContext } from '../../blocks/utils/prepareBlockAIContext';
import { blockRegistry } from '../../blocks';

export interface PromptInput {
  blockType?: string; // Made optional for block selection
  context: any;
  mode: 'create' | 'update';
  target?: string;
  instructions?: string;
}

/**
 * Builds an OPTIMIZED OpenAI prompt for block content generation
 * 
 * This function creates minimal, focused prompts that provide AI models with
 * only the essential context needed for generation, reducing token usage
 * and improving response times.
 * 
 * @param input - Configuration for prompt generation
 * @returns Optimized prompt string ready for OpenAI API
 */
export function buildOpenAIPromptForBlock(input: PromptInput): string {
  const { blockType, context, mode, target, instructions } = input;

  // If no blockType is specified, we need to select one based on user intent
  if (!blockType) {
    const availableBlocks = getAvailableBlocksForAI();
    
    return `You are an expert UI content assistant. Based on the user's request, select the most appropriate block type AND generate its content.

Available block types:
${availableBlocks.map(block => `- ${block.type}: ${block.description} (${block.useCase})`).join('\n')}

User request: "${instructions || context.intent}"

Analyze the user's intent and:
1. Select the most appropriate block type
2. Generate content that matches the block's schema

Return a JSON response in this format:
{
  "selectedBlockType": "[chosen block type]",
  "blockContent": { ... generated content matching the block's schema ... }
}

Select the block type that best matches the user's intent and generate appropriate content.`;
  }

  // Build the base instruction
  const base = `You are an expert UI content assistant. ${mode === 'create' ? 'Create' : 'Update'} a "${blockType}" block.`;

  // Add user instructions if provided
  const goal = instructions ? `\n\nUser Intent: "${instructions}"` : '';

  // For targeted updates, use compressed context
  if (target) {
    const compressedContext = compressBlockUpdateContextForTarget(context, target);
    return `${base}${goal}\n\nTarget: ${target}\nCurrent: ${JSON.stringify(compressedContext.current, null, 2)}\n\nReturn only valid JSON matching the existing structure.`;
  }

  // Get block entry from registry
  const blockEntry = blockRegistry[blockType];
  if (!blockEntry) {
    throw new Error(`Block type "${blockType}" not found in registry`);
  }

  // For update mode with current data
  if (mode === 'update' && context.current) {
    return `${base}${goal}

Current Data:
${JSON.stringify(context.current, null, 2)}

${blockEntry.aiHints?.contentGuidelines ? `Guidelines: ${JSON.stringify(blockEntry.aiHints.contentGuidelines)}` : ''}

Update the content based on the user's intent while preserving the existing structure.
Return ONLY valid JSON with your updates.`;
  }

  // For create mode, use schema summary and AI hints
  const schemaSummary = summariseBlockSchemaForAI(blockEntry.schema, {
    includeHints: true,
    includeDefaults: true,
    includeEnums: true,
    maxDepth: 3
  });
  
  console.log(`\n📋 Schema Summary for ${blockType}:\n${schemaSummary}\n`);

  // Build AI hints section
  let aiHintsSection = '';
  if (blockEntry.aiHints) {
    const hints = blockEntry.aiHints;
    
    if (hints.contentPatterns) {
      // Try to match user intent with content patterns
      const intentWords = (instructions || '').toLowerCase();
      for (const [pattern, config] of Object.entries(hints.contentPatterns)) {
        if (intentWords.includes(pattern)) {
          aiHintsSection += `\nSuggested configuration for ${pattern}: ${JSON.stringify(config)}`;
          break;
        }
      }
    }

    if (hints.contentGuidelines) {
      aiHintsSection += `\nContent Guidelines: ${JSON.stringify(hints.contentGuidelines)}`;
    }
  }

  return `${base}${goal}

Schema Structure:
${schemaSummary}

${aiHintsSection}

CRITICAL: You MUST follow the exact property names and structure shown above. 
- Use the EXACT field names as specified (e.g., if the schema shows "cards", do NOT use "items" or "teamCards")
- Match the nested structure exactly as shown
- Include all required fields
- Use the correct data types for each field
- The response MUST be a complete block data object with all top-level properties (elements, layout, cards, background)

Generate content that matches the schema structure exactly. Be creative with the content while maintaining the required format.
Return ONLY valid JSON that can be directly used as block data. No explanations, no wrapper objects.`;
} 
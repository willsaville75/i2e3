import { summariseBlockSchemaForAI } from '../../blocks/utils/summariseBlockSchemaForAI';
import { compressBlockUpdateContextForTarget } from '../../blocks/utils/compressBlockUpdateContextForTarget';

export interface PromptInput {
  blockType: string;
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

  // Build the base instruction (concise)
  const base = `You are an expert UI content assistant. ${mode === 'create' ? 'Create' : 'Update'} a "${blockType}" block.`;

  // Add user instructions if provided
  const goal = instructions ? `\n\nUser Intent: "${instructions}"` : '';

  // For targeted updates, use compressed context
  if (target) {
    const compressedContext = compressBlockUpdateContextForTarget(context, target);
    return `${base}${goal}\n\nTarget: ${target}\nCurrent: ${JSON.stringify(compressedContext.current, null, 2)}\n\nReturn only valid JSON matching the existing structure.`;
  }

  // For hero blocks, use specific structure template
  if (blockType === 'hero') {
    return `${base}${goal}

Return ONLY valid JSON in this EXACT format:
{
  "elements": {
    "title": { "content": "[Generated title based on context]", "level": 1 },
    "subtitle": { "content": "[Generated subtitle based on context]" },
    "button": { "text": "[Action]", "href": "/[path]", "variant": "primary", "size": "lg" }
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

Make the content engaging and relevant to the user's intent. No explanations, just JSON.`;
  }

  // For create mode, use minimal schema (optimized settings)
  if (mode === 'create') {
    const minimalSchema = summariseBlockSchemaForAI(context.schema, {
      includeEnums: false,    // Skip enums to reduce size
      includeDefaults: false, // Skip defaults to reduce size
      maxDepth: 1,           // Shallow depth
      includeHints: false    // Skip hints to reduce size
    });

    return `${base}${goal}\n\nSchema: ${minimalSchema}\n\nReturn only valid JSON matching the schema structure. No explanations.`;
  }

  // For update mode, use current data and minimal context
  const currentData = context.current ? JSON.stringify(context.current, null, 2) : '';
  
  return `${base}${goal}\n\nCurrent Data:\n${currentData}\n\nReturn only valid JSON with your updates. Keep the same structure.`;
} 
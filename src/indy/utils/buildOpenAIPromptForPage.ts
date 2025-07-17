import { summariseBlockSchemaForAI } from '../../blocks/utils/summariseBlockSchemaForAI';
import { preparePageAIContext } from '../../blocks/utils/preparePageAIContext';
import { classifyBlockIntent } from '../../blocks/utils/classifyBlockIntent';

/**
 * Input configuration for building OpenAI prompts for page operations
 */
interface PagePromptInput {
  /** Context from preparePageAIContext */
  context: ReturnType<typeof preparePageAIContext>;
  /** Optional user goal (e.g. "Make the whole page more engaging") */
  goal?: string;
  /** Optional focus on specific block type if user clicked a specific block */
  focusBlockType?: string;
}

/**
 * Builds a comprehensive OpenAI prompt for page-level content generation
 * 
 * This function creates structured prompts that provide AI models with complete
 * page context including all blocks, their current states, schemas, and relationships.
 * It enables AI to make coordinated changes across multiple blocks while maintaining
 * consistency and flow.
 * 
 * @param input - Configuration for page prompt generation
 * @returns Formatted prompt string ready for OpenAI API
 */
export function buildOpenAIPromptForPage(input: PagePromptInput): string {
  const { context, goal, focusBlockType } = input;
  
  // Build the base instruction for page-level work
  const pageHeader = `You are an expert in designing high-converting, accessible webpages using modular blocks.`;

  // Add user goal if provided
  const userGoal = goal
    ? `\n\n🧠 The user's goal:\n"${goal}"`
    : '';

  // Introduce the page structure
  const structureIntro = `\n\n📄 The current page is composed of ${context.blocks.length} blocks:`;

  // Build detailed summary for each block
  const blocksSummary = context.blocks
    .map((block, i) => {
      // Generate schema summary for this block
      const summary = summariseBlockSchemaForAI(block.schema, {
        includeEnums: true,
        includeDefaults: false,
        maxDepth: 2
      });
      
      // Classify intent for this block
      const intent = classifyBlockIntent({
        current: block.current,
        defaultData: block.defaults,
        schemaSummary: summary
      });

      // Build block information sections
      const blockLabel = `🧱 Block ${i + 1}: ${block.blockType}`;
      const action = `🔧 Intent: ${intent.intent} — ${intent.reason}`;
      const data = `📍 Current Data:\n${JSON.stringify(block.current, null, 2)}`;
      const aiHints = block.aiHints
        ? `💡 Hints:\n${JSON.stringify(block.aiHints, null, 2)}`
        : '';

      return [blockLabel, action, data, aiHints].filter(Boolean).join('\n');
    })
    .join('\n\n---\n\n');

  // Add page-level tokens from the first block (they should be consistent)
  const tokens = context.blocks.length > 0 && context.blocks[0].tokens
    ? `\n\n🎨 Design Tokens:\n${JSON.stringify(context.blocks[0].tokens, null, 2)}`
    : '';

  // Add page metadata if available
  const pageInfo = context.route || context.layoutStyle
    ? `\n\n📋 Page Info:\n${context.route ? `Route: ${context.route}\n` : ''}${context.layoutStyle ? `Layout Style: ${context.layoutStyle}` : ''}`
    : '';

  // General guidance for page-level work
  const guidance = `\n\n🎯 Guidance:\n- Maintain consistent tone and style across all blocks\n- Ensure logical flow and hierarchy between blocks\n- Respect existing structure while improving clarity and engagement\n- Consider how blocks work together to achieve the page goal\n- Use design tokens consistently for visual coherence`;

  // Add focus instruction if specific block type is targeted
  const focus = focusBlockType
    ? `\n\n🔍 Focus: Pay special attention to the "${focusBlockType}" block(s) while ensuring changes complement the overall page.`
    : '';

  // Add output format instructions
  const outputFormat = `\n\n📝 Output Format:\nReturn a JSON object with updated data for each block that needs changes. Use the format:\n{\n  "blockUpdates": [\n    {\n      "blockIndex": 0,\n      "blockType": "hero",\n      "updatedData": { /* new block data */ }\n    }\n  ]\n}`;

  return `${pageHeader}${userGoal}${structureIntro}\n\n${blocksSummary}${tokens}${pageInfo}${guidance}${focus}${outputFormat}`;
} 
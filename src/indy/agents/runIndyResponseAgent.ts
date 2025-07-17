import { ResponseAgentInput, ResponseAgentResult } from '../../types/agents';

/**
 * Processes AI output into structured block or page content
 * 
 * This agent handles:
 * - Parsing JSON responses from AI models
 * - Validating output structure
 * - Providing fallback for malformed responses
 * - Preparing results for application to the store
 * 
 * @param input - ResponseAgentInput object containing configuration
 * @param memory - Optional memory context for agent
 * @returns Structured result ready for execution
 */
export default function run(input: ResponseAgentInput, _memory?: any): ResponseAgentResult {
  const { blockType, aiOutput, context, mode = 'block' } = input;

  try {
    // Attempt to parse the AI output as JSON
    let parsedOutput;
    
    // Clean up common AI response formatting issues
    const cleanedOutput = aiOutput
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^[^{]*({.*})[^}]*$/s, '$1')
      .trim();

    try {
      parsedOutput = JSON.parse(cleanedOutput);
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON from the response
      const jsonMatch = cleanedOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedOutput = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    }

    // Validate the parsed output structure
    if (mode === 'page') {
      // For page mode, expect blockUpdates array
      if (!parsedOutput.blockUpdates || !Array.isArray(parsedOutput.blockUpdates)) {
        throw new Error('Page response must contain blockUpdates array');
      }
    } else {
      // For block mode, expect object with block properties
      if (typeof parsedOutput !== 'object' || parsedOutput === null) {
        throw new Error('Block response must be a valid object');
      }
    }

    return {
      result: parsedOutput,
      mode,
      target: blockType || 'page',
      raw: aiOutput,
      success: true
    };

  } catch (error) {
    // If parsing fails, wrap the response as a generic result
    return {
      result: mode === 'page' 
        ? { blockUpdates: [] }
        : context.defaults || {},
      mode,
      target: blockType || 'page',
      raw: aiOutput,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error'
    };
  }
} 
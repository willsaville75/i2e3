import blockOperations from './blockOperations';
import runIndyPageAgent from './runIndyPageAgent';
import runIndyContextAgent from './runIndyContextAgent';
import runIndyExecutionAgent from './runIndyExecutionAgent';
import runIndyPromptAgent from './runIndyPromptAgent';
import runIndyResponseAgent from './runIndyResponseAgent';

/**
 * Agent registry mapping agent names to their implementations
 * 
 * CONSOLIDATED:
 * - createAgent → blockOperations (operation: 'create')
 * - updateAgent → blockOperations (operation: 'update')
 * - runIndyBlockAgent → blockOperations
 */
export const agentMap = {
  // Unified block operations (replaces createAgent, updateAgent, runIndyBlockAgent)
  createAgent: async (input: any) => blockOperations({ ...input, operation: 'create' }),
  updateAgent: async (input: any) => blockOperations({ ...input, operation: 'update' }),
  runIndyBlockAgent: async (input: any) => blockOperations({ ...input, operation: input.mode || 'update' }),
  
  // Page and utility agents
  runIndyPageAgent,
  runIndyContextAgent,
  runIndyExecutionAgent,
  runIndyPromptAgent,
  runIndyResponseAgent,
  
  // Simple conversation agent
  runIndyConversationAgent: async (input: any) => {
    // Import inline to avoid circular dependency
    const { callAI } = await import('../../ai/call');
    const { getFastModel } = await import('../../ai/client');
    
    const userInput = input.userInput || input.intent || input;
    
    const prompt = `You are Indy, a helpful AI assistant for the I2E intranet builder.

User said: "${userInput}"

Respond naturally and helpfully. Keep responses concise and friendly.

If they're greeting you, greet them back warmly.
If they're asking what you can do, explain you can:
- Create new content blocks (hero sections, etc.)
- Update existing content (titles, colors, backgrounds, etc.)
- Answer questions about the system

Keep your response to 1-2 sentences unless they ask for more detail.`;

    try {
      const response = await callAI({
        prompt,
        model: getFastModel(),
        maxTokens: 150,
        temperature: 0.7
      });
      
      return {
        response: response.trim(),
        success: true
      };
    } catch (error) {
      return {
        response: "I can help you create and update content. What would you like to do?",
        success: true
      };
    }
  }
}; 
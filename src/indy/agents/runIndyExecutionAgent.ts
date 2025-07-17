import type { ExecutionAgentInput, ExecutionAgentResult } from '../../types/agents';

/**
 * Applies processed AI results to the block/page store
 * 
 * This agent handles:
 * - Applying block or page updates to the store
 * - Optional validation before applying changes
 * - Error handling for failed applications
 * - Rollback capabilities for failed updates
 * 
 * @param input - ExecutionAgentInput object containing configuration
 * @param memory - Optional memory context for agent
 * @returns Execution result with success status
 */
export default function run(input: ExecutionAgentInput, _memory?: any): ExecutionAgentResult {
  const { result, store, validate = true } = input;

  try {
    // Check if the result was successfully parsed
    if (!result.success) {
      return {
        success: false,
        error: `Cannot apply failed result: ${result.error}`,
        mode: result.mode,
        target: result.target
      };
    }

    // Optional validation step
    if (validate && store.validate) {
      const isValid = store.validate(result.result);
      if (!isValid) {
        return {
          success: false,
          error: 'Result failed store validation',
          mode: result.mode,
          target: result.target
        };
      }
    }

    // Apply the result to the store
    store.update(result.result);

    return {
      success: true,
      applied: result.result,
      mode: result.mode,
      target: result.target
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown execution error',
      mode: result.mode,
      target: result.target
    };
  }
} 
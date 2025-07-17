import createAgent from './createAgent';
import updateAgent from './updateAgent';
import runIndyBlockAgent from './runIndyBlockAgent';
import runIndyPageAgent from './runIndyPageAgent';
import runIndyExecutionAgent from './runIndyExecutionAgent';
import runIndyPromptAgent from './runIndyPromptAgent';
import runIndyResponseAgent from './runIndyResponseAgent';
import runIndyContextAgent from './runIndyContextAgent';
// Property agent removed - using AI-first orchestrator system

/**
 * Agent registry mapping agent names to their implementations
 */
export const agentMap: Record<string, Function> = {
  createAgent,
  updateAgent,
  // propertyAgent removed - using AI-first orchestrator system
  runIndyBlockAgent,
  runIndyPageAgent,
  runIndyExecutionAgent,
  runIndyPromptAgent,
  runIndyResponseAgent,
  runIndyContextAgent,
}; 
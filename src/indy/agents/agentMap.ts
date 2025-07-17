import createAgent from './createAgent';
import updateAgent from './updateAgent';
import runIndyBlockAgent from './runIndyBlockAgent';
import runIndyPageAgent from './runIndyPageAgent';
import runIndyExecutionAgent from './runIndyExecutionAgent';
import runIndyPromptAgent from './runIndyPromptAgent';
import runIndyResponseAgent from './runIndyResponseAgent';
import runIndyContextAgent from './runIndyContextAgent';

/**
 * Agent registry mapping agent names to their implementations
 */
export const agentMap: Record<string, Function> = {
  createAgent,
  updateAgent,
  runIndyBlockAgent,
  runIndyPageAgent,
  runIndyExecutionAgent,
  runIndyPromptAgent,
  runIndyResponseAgent,
  runIndyContextAgent
}; 
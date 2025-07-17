// Main entry point for Indy functionality
export { runIndy } from './agents/runIndy';

// Decision engine and utilities
export { runIndyDecisionEngine } from './utils/runIndyDecisionEngine';
export { buildOpenAIPromptForBlock } from './utils/buildOpenAIPromptForBlock';
export { buildOpenAIPromptForPage } from './utils/buildOpenAIPromptForPage';

export { classifyIntent } from './utils/classifyIntent';

// Agent orchestration
export { agentMap, runAgent, classifyIntentToAgent, getAvailableAgents, hasAgent } from './agents';

// Export agents
export { 
  createAgent,
  updateAgent,
  runIndyBlockAgent,
  runIndyPageAgent,
  runIndyPromptAgent,
  runIndyResponseAgent,
  runIndyExecutionAgent
} from './agents';

// Type exports
export type {
  CreateAgentInput,
  CreateAgentOutput,
  UpdateAgentInput,
  UpdateAgentOutput,
  ResponseAgentResult,
  BlockAgentInput,
  PageAgentInput,
  ResponseAgentInput,
  ExecutionAgentInput,
  ExecutionAgentResult,
  PromptAgentInput
} from './agents';

// Client functionality from runIndyAction
export { runIndyAction } from './runIndyAction';
export { applyIndyAction } from './runIndyAction';
export type { BlockData } from './runIndyAction';
export type { IndyAction } from './runIndyAction';
export type { IndyActionType } from './runIndyAction';
export type { IndyActionResult } from './runIndyAction';
export type { PageContext } from './runIndyAction';

// Default export is the simplified runner
export { runIndy as default } from './agents/runIndy'; 
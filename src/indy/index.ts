// Main entry point for Indy functionality
export { runIndy } from './utils/runIndy';

// Decision engine and utilities
export { runIndyDecisionEngine } from './utils/runIndyDecisionEngine';
export { buildOpenAIPromptForBlock } from './utils/buildOpenAIPromptForBlock';
export { buildOpenAIPromptForPage } from './utils/buildOpenAIPromptForPage';
export { classifyIntent } from './utils/classifyIntent';

// Agent orchestration
export { runAgent, classifyIntentToAgent } from './agents';
export type { ClassificationResult } from './agents';

// Export agents
export { 
  blockOperations,
  runIndyPageAgent,
  runIndyPromptAgent,
  runIndyResponseAgent,
  runIndyExecutionAgent,
  runIndyContextAgent,
  runSchemaPresenterAgent
} from './agents';

// Type exports
export type {
  ResponseAgentResult,
  PageAgentInput,
  ResponseAgentInput,
  ExecutionAgentInput,
  ExecutionAgentResult,
  PromptAgentInput
} from '../types/agents';

// Default export is the simplified runner
export { runIndy as default } from './utils/runIndy'; 
/**
 * Type definitions for Indy agents to replace unsafe 'any' types
 */

// Agent input/output types for the Indy system

// Common types
export interface TokenConfig {
  colors?: string[];
  spacing?: string[];
  gradientDirections?: string[];
  [key: string]: any;
}

// Create Agent
export interface CreateAgentInput {
  blockType: string;
  intent: string;
  tokens?: TokenConfig;
}

export interface CreateAgentOutput {
  success: boolean;
  blockData?: any;
  error?: string;
  metadata?: {
    blockType: string;
    userIntent: string;
  };
}

// Update Agent
export interface UpdateAgentInput {
  blockType: string;
  currentData: any;
  intent: string;
  tokens?: TokenConfig;
}

export interface UpdateAgentOutput {
  success: boolean;
  blockData?: any;
  diff?: any;
  target?: string | null;
  error?: string;
}

// Block Agent
export interface BlockAgentInput {
  context: any;
  model: string;
  instructions?: string;
  target?: string;
}

// Page Agent
export interface PageAgentInput {
  context: any;
  model: string;
  goal?: string;
  focusBlockType?: string;
}

// Response Agent
export interface ResponseAgentInput {
  blockType?: string;
  aiOutput: string;
  context: any;
  mode?: 'block' | 'page';
}

export interface ResponseAgentResult {
  result: any;
  mode: 'block' | 'page';
  target: string;
  raw: string;
  success: boolean;
  error?: string;
}

// Execution Agent
export interface ExecutionAgentInput {
  result: ResponseAgentResult;
  store: {
    update: (result: any) => void;
    get?: () => any;
    validate?: (result: any) => boolean;
  };
  validate?: boolean;
}

export interface ExecutionAgentResult {
  success: boolean;
  applied?: any;
  error?: string;
  mode: 'block' | 'page';
  target: string;
}

// Prompt Agent
export interface PromptAgentInput {
  context: any;
  mode: 'block' | 'page';
  instructions?: string;
  goal?: string;
  target?: string;
  focusBlockType?: string;
}

// Agent function type
export type AgentFunction<TInput, TOutput> = (
  input: TInput,
  memory?: any
) => TOutput | Promise<TOutput>; 
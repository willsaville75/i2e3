/**
 * Centralized token type definitions to avoid duplication
 */

export interface DesignTokens {
  colors: string[];
  spacing: string[];
  gradientDirections?: string[];
  typography?: string[];
  // Additional token types can be added here
}

// Alias for backward compatibility
export type BlockAIContextTokens = DesignTokens;
export type BlockUpdateContextTokens = DesignTokens;
export type PageAIContextTokens = DesignTokens; 
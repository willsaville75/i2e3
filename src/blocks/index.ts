// Import all blocks
import { HeroBlock } from './hero/hero-block';
import { heroSchema, heroDefaultData } from './hero/schema';
import { heroMetadata, heroAIHints } from './hero/metadata';

import { GridBlock } from './grid/grid-block';
import { gridSchema, gridDefaultData } from './grid/schema';
import { gridMetadata } from './grid/metadata';
import { gridAIHints } from './grid/ai';

// Block registry entry interface
export interface BlockRegistryEntry {
  component: React.ComponentType<any>;
  schema: any;
  defaultData: any;
  metadata: any;
  aiHints: any;
}

// Main block registry
export const blockRegistry: Record<string, BlockRegistryEntry> = {
  hero: {
    component: HeroBlock,
    schema: heroSchema,
    defaultData: heroDefaultData,
    metadata: heroMetadata,
    aiHints: heroAIHints
  },
  grid: {
    component: GridBlock,
    schema: gridSchema,
    defaultData: gridDefaultData,
    metadata: gridMetadata,
    aiHints: gridAIHints
  }
};

// Export individual blocks
export { HeroBlock } from './hero/hero-block';
export { GridBlock } from './grid/grid-block';

// Export block types
export type { HeroProps } from './hero/schema';
export type { GridProps } from './grid/schema';

// Export utilities
export * from './utils';
export * from './shared';

// Helper function to get available blocks for AI
export function getAvailableBlocksForAI(): Array<{ type: string; description: string; useCase: string }> {
  return Object.entries(blockRegistry).map(([type, entry]) => ({
    type,
    description: entry.metadata.description,
    useCase: entry.aiHints.usageContext?.purpose || entry.metadata.hints?.usage || ''
  }));
}

// Default export
export default blockRegistry; 
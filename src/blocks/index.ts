// Central block registry
import { HeroBlock } from './hero/hero-block';
import { heroMetadata, heroAIHints } from './hero/metadata';
import { heroSchema, heroDefaultData } from './hero/schema';

// Block registry interface
export interface BlockRegistryEntry {
  component: any;
  schema: any;
  defaultData: any;
  metadata: {
    name: string;
    description: string;
    category: string;
    icon: string;
    tags: string[];
    version: string;
    author: string;
    isAIGenerated: boolean;
    hints?: Record<string, any>;
  };
  aiHints: {
    description: string;
    usageContext: any;
    contentHints?: any;
    layoutGuidance?: any;
  };
}

// Main block registry
export const blockRegistry: Record<string, BlockRegistryEntry> = {
  hero: {
    component: HeroBlock,
    schema: heroSchema,
    defaultData: heroDefaultData,
    metadata: heroMetadata,
    aiHints: heroAIHints
  }
};

// Export individual blocks
export { HeroBlock } from './hero/hero-block';

// Export block types
export type { HeroProps } from './hero/schema';

// Export utilities
export * from './utils';
export * from './shared';

// Default export
export default blockRegistry; 
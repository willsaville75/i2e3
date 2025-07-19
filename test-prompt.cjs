// Test script to see what prompt is generated for grid block
const { buildOpenAIPromptForBlock } = require('./src/indy/utils/buildOpenAIPromptForBlock.ts');
const { blockRegistry } = require('./src/blocks/index.ts');
const { summariseBlockSchemaForAI } = require('./src/blocks/utils/summariseBlockSchemaForAI.ts');

// Test 1: When blockType is NOT specified (AI needs to select)
console.log('=== TEST 1: No blockType specified ===\n');
const prompt1 = buildOpenAIPromptForBlock({
  blockType: undefined,
  context: { intent: 'i need a grid with 3 team cards' },
  mode: 'create',
  instructions: 'i need a grid with 3 team cards'
});
console.log(prompt1);

console.log('\n\n=== TEST 2: When blockType IS specified ===\n');
const prompt2 = buildOpenAIPromptForBlock({
  blockType: 'grid',
  context: {
    blockType: 'grid',
    intent: 'i need a grid with 3 team cards',
    schema: blockRegistry.grid.schema,
    aiHints: blockRegistry.grid.aiHints,
    defaults: blockRegistry.grid.defaultData
  },
  mode: 'create',
  instructions: 'i need a grid with 3 team cards'
});
console.log(prompt2);

console.log('\n\n=== TEST 3: Grid Schema Summary ===\n');
const schemaSummary = summariseBlockSchemaForAI(blockRegistry.grid.schema, {
  includeHints: true,
  includeDefaults: true,
  includeEnums: true,
  maxDepth: 3
});
console.log(schemaSummary); 
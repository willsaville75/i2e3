// Test schema summarization
const { summariseBlockSchemaForAI } = require('./src/blocks/utils/summariseBlockSchemaForAI.ts');
const { gridSchema } = require('./src/blocks/grid/schema.ts');

// Mock the schema object to test
const mockSchema = {
  id: 'grid-block',
  title: 'Grid Block',
  description: 'A flexible grid layout',
  properties: {
    elements: {
      type: 'object',
      properties: {
        sectionTitle: {
          type: 'object',
          properties: {
            content: { type: 'string', default: 'Our Team' },
            level: { type: 'number', enum: [1,2,3,4,5,6], default: 2 }
          }
        }
      }
    },
    cards: {
      type: 'array',
      title: 'Cards',
      description: 'Array of card objects',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          elements: {
            type: 'object',
            properties: {
              title: {
                type: 'object',
                properties: {
                  content: { type: 'string' },
                  level: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }
  }
};

const summary = summariseBlockSchemaForAI(mockSchema, {
  includeHints: true,
  includeDefaults: true,
  includeEnums: true,
  maxDepth: 3
});

console.log('Schema Summary:');
console.log(summary); 
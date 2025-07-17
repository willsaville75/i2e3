const { default: runIndyContextAgent } = require('./src/indy/agents/runIndyContextAgent.ts');

// Test with a hero block
const testInput = {
  blockType: 'hero',
  props: {
    elements: {
      title: { content: 'Welcome to Our Platform', level: 1 },
      subtitle: { content: 'Build amazing experiences with our tools' },
      button: { text: 'Get Started', href: '/signup', variant: 'primary' }
    },
    layout: {
      blockSettings: { height: 'screen' },
      contentSettings: { textAlignment: 'center' }
    },
    background: { type: 'color', color: 'blue', colorIntensity: 'medium' }
  },
  aiHints: {
    description: 'This hero block is designed to create a strong first impression and drive user engagement with a clear call-to-action.'
  }
};

runIndyContextAgent(testInput).then(result => {
  console.log('Context Agent Output:');
  console.log('='.repeat(50));
  console.log(result);
}).catch(console.error);

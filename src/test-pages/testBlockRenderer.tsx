import { BlockRenderer } from '../components/BlockRenderer';
import { blockRegistry } from '../blocks';

export function TestBlockRenderer() {
  // Log available block types
  console.log('Available block types:', Object.keys(blockRegistry));
  
  // Test data
  const testHeroProps = {
    elements: {
      title: { content: "Test Hero Title", level: 1 },
      subtitle: { content: "This is a test subtitle" },
      button: { text: "Click Me", href: "/test", variant: "primary", size: "lg" }
    },
    layout: {
      blockSettings: { height: "screen" },
      contentSettings: { textAlignment: "center", contentWidth: "wide" }
    },
    background: { type: "color", color: "blue", colorIntensity: "medium" }
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">BlockRenderer Test Page</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Test 1: Valid Hero Block</h2>
        <BlockRenderer 
          type="hero" 
          props={testHeroProps}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Test 2: Unknown Block Type</h2>
        <BlockRenderer 
          type="unknown-block" 
          props={{ test: "data" }}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Test 3: Invalid Props</h2>
        <BlockRenderer 
          type="hero" 
          props={{ invalid: "props" }}
        />
      </div>
    </div>
  );
} 
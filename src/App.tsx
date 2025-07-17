import { useBlocksStore } from './stores/blocksStore';
import { BlockRenderer } from './components/BlockRenderer';
import { TestElementsPage } from './test-pages/testElements';

export function App() {
  const { blocks } = useBlocksStore();

  return (
    <>
      {/* Show test page if no blocks */}
      {blocks.length === 0 && <TestElementsPage />}
      
      {blocks.map((block) => (
        <BlockRenderer
          key={block.id}
          type={block.type}
          props={block.props}
        />
      ))}
    </>
  );
} 
import { useBlocksStore } from './stores/blocksStore';
import { BlockRenderer } from './components/BlockRenderer';

export function App() {
  const { blocks } = useBlocksStore();

  return (
    <>
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
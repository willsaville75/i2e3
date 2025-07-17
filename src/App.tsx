import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useBlocksStore } from './store/blocksStore';
import { BlockRenderer } from './components/BlockRenderer';
import { SiteRouter } from './components/SiteRouter';

// Default home page that shows blocks from the store
function HomePage() {
  const { blocks } = useBlocksStore();

  // Minimal markup - blocks handle their own layout
  return (
    <>
      {blocks.length === 0 ? (
        <div>No blocks available. Use the chat to create blocks.</div>
      ) : (
        blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            type={block.blockType}
            props={block.blockData}
          />
        ))
      )}
    </>
  );
}

export function App() {
  return (
    <Router>
      <Routes>
        {/* Default home route */}
        <Route path="/" element={<HomePage />} />
        
        {/* Site routing - /:siteSlug/* */}
        <Route path="/:siteSlug/*" element={<SiteRouter />} />
      </Routes>
    </Router>
  );
} 
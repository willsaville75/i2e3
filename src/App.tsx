import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useBlocksStore } from './stores/blocksStore';
import { BlockRenderer } from './components/BlockRenderer';
import { SiteRouter } from './components/SiteRouter';

// Default home page that shows blocks from the store
function HomePage() {
  const { blocks } = useBlocksStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">I2E Site Builder</h1>
          <p className="text-gray-600">AI-powered site builder</p>
        </div>
        
        {blocks.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Blocks</h3>
              <p className="text-gray-600">Use the chat to create blocks</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {blocks.map((block) => (
              <BlockRenderer
                key={block.id}
                type={block.type}
                props={block.props}
              />
            ))}
          </div>
        )}
      </div>
    </div>
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
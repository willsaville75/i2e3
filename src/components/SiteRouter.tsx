import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useBlocksStore, BlockInstance } from '../store/blocksStore';
import { PropertiesPanel } from '../edit-panel';
import { BlockRenderer } from './BlockRenderer';
import { PageNav } from './PageNav';
import { 
  EditModeProvider, 
  useEditMode, 
  EditLayout
} from '../edit-mode';

interface Entry {
  id: string;
  title: string;
  slug: string;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED';
  site: {
    id: string;
    name: string;
  };
  blocks: Array<{
    id: string;
    blockType: string;
    blockData: any;
    position: number;
  }>;
}

interface SiteRouterState {
  entry: Entry | null;
  loading: boolean;
  error: string | null;
}

// Inner component that has access to EditMode context
const SiteRouterContent: React.FC<{ siteSlug: string; entrySlug: string }> = ({ 
  siteSlug, 
  entrySlug 
}) => {
  const { blocks, clearBlocks, addBlock } = useBlocksStore();
  const { setEntry, isEditMode } = useEditMode();
  
  const [state, setState] = useState<SiteRouterState>({
    entry: null,
    loading: true,
    error: null
  });

  // Fetch entry data
  useEffect(() => {
    const fetchEntry = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await fetch(`/api/entries/${siteSlug}/${entrySlug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Entry not found');
          }
          throw new Error(`Failed to fetch entry: ${response.status}`);
        }
        
        const entry: Entry = await response.json();
        
        console.log('📥 SiteRouter fetched entry data:', {
          title: entry.title,
          blocksCount: entry.blocks?.length,
          firstBlockTitle: entry.blocks?.[0]?.blockData?.elements?.title?.content
        });
        
        // Only sync blocks if we have new data
        if (entry.blocks) {
          // Always sync fetched blocks into the block store
          clearBlocks();
          
          // Sort blocks by position before adding to store
          const sortedBlocks = [...entry.blocks].sort((a, b) => a.position - b.position);
          
          // Add each block to the store
          sortedBlocks.forEach(block => {
            addBlock(block.blockType, block.blockData, block.id);
          });
        }
        
        // Set entry in edit mode context
        setEntry(entry);
        
        setState(prev => ({ 
          ...prev, 
          entry, 
          loading: false 
        }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Failed to load entry',
          loading: false 
        }));
      }
    };

    if (siteSlug && entrySlug) {
      fetchEntry();
    }
  }, [siteSlug, entrySlug]);

  // Loading state
  if (state.loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Entry not found
  if (!state.entry) {
    return (
      <div className="flex h-screen">
        <PropertiesPanel />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Entry not found</h1>
            <p className="text-gray-600">The requested entry could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  // Main render - only render after entry is loaded to prevent flash
  if (!state.entry) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Conditional Navigation */}
      {isEditMode ? (
        <EditLayout />
      ) : (
        <>
          <PageNav />
          <div className="min-h-screen bg-white">
            {blocks.map((block: BlockInstance) => (
              <BlockRenderer
                key={block.id}
                type={block.blockType}
                props={block.blockData}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
};

export function SiteRouter() {
  const { siteSlug } = useParams<{ siteSlug: string }>();
  const location = useLocation();

  // Extract entrySlug from pathname
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const entrySlug = pathSegments.length > 1 ? pathSegments[1] : 'home';

  if (!siteSlug) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Route</h1>
          <p className="text-gray-600">Site slug is required.</p>
        </div>
      </div>
    );
  }

  return (
    <EditModeProvider siteSlug={siteSlug} entrySlug={entrySlug}>
      <SiteRouterContent siteSlug={siteSlug} entrySlug={entrySlug} />
    </EditModeProvider>
  );
} 
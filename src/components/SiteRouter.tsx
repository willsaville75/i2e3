import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { BlockRenderer } from './BlockRenderer';
import { blockRegistry } from '../blocks';
import { useBlocksStore } from '../stores/blocksStore';

interface Entry {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  metadata: any;
  siteId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  site: {
    id: string;
    name: string;
    description: string | null;
    domain: string | null;
    settings: any;
    createdAt: string;
    updatedAt: string;
  };
  blocks: Array<{
    id: string;
    blockType: string;
    blockData: any;
    position: number;
    styles: any;
    entryId: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

interface SiteRouterState {
  entry: Entry | null;
  loading: boolean;
  error: string | null;
  isEditMode: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

export function SiteRouter() {
  const { siteSlug } = useParams<{ siteSlug: string }>();
  const location = useLocation();
  const { blocks, clearBlocks, addBlock, selectedBlockId, setSelectedBlock } = useBlocksStore();
  const [state, setState] = useState<SiteRouterState>({
    entry: null,
    loading: true,
    error: null,
    isEditMode: false,
    isSaving: false,
    hasUnsavedChanges: false
  });

  // Parse pathname to get entrySlug (default to 'home')
  const getEntrySlug = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    // Remove the siteSlug from the path to get the entry slug
    const entrySlug = pathSegments.slice(1).join('/') || 'home';
    return entrySlug;
  };

  const fetchEntry = async (siteSlug: string, entrySlug: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch(`/api/entries/${siteSlug}/${entrySlug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Entry not found');
        }
        throw new Error(`Failed to fetch entry: ${response.status}`);
      }
      
      const entry = await response.json();
      
      // Always sync fetched blocks into the block store
      clearBlocks();
      
      // Sort blocks by position before adding to store
      const sortedBlocks = [...entry.blocks].sort((a, b) => a.position - b.position);
      
      // Add each block to the store
      sortedBlocks.forEach(block => {
        addBlock(block.blockType, block.blockData, block.id);
      });
      
      setState(prev => ({ 
        ...prev, 
        entry, 
        loading: false, 
        error: null,
        hasUnsavedChanges: false 
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        entry: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }));
    }
  };

  const toggleEditMode = () => {
    setState(prev => ({ ...prev, isEditMode: !prev.isEditMode }));
  };

  const saveChanges = async () => {
    if (!state.entry || !state.hasUnsavedChanges) return;

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      // Prepare blocks data for API
      const blocksData = blocks.map((block, index) => ({
        id: block.id,
        blockType: block.blockType,
        blockData: block.blockData,
        position: index + 1
      }));

      // Update the entry with new blocks
      const response = await fetch(`/api/entries/${siteSlug}/${state.entry.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: state.entry.title,
          description: state.entry.description,
          blocks: blocksData
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save changes: ${response.status}`);
      }

      // Refresh the entry to get updated data
      await fetchEntry(siteSlug!, getEntrySlug());
      
      setState(prev => ({ 
        ...prev, 
        isSaving: false, 
        hasUnsavedChanges: false 
      }));
      
    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }));
      console.error('Error saving changes:', error);
      // You could add a toast notification here
    }
  };

  const discardChanges = () => {
    if (state.entry) {
      // Reload blocks from the original entry
      clearBlocks();
      const sortedBlocks = [...state.entry.blocks].sort((a, b) => a.position - b.position);
      sortedBlocks.forEach(block => {
        addBlock(block.blockType, block.blockData, block.id);
      });
      setState(prev => ({ ...prev, hasUnsavedChanges: false }));
    }
  };

  useEffect(() => {
    if (siteSlug) {
      const entrySlug = getEntrySlug();
      fetchEntry(siteSlug, entrySlug);
    }
  }, [siteSlug, location.pathname]);

  // Track changes in blocks when in edit mode
  useEffect(() => {
    if (state.isEditMode && state.entry) {
      // Check if blocks have changed from the original entry
      const originalBlocks = state.entry.blocks.sort((a, b) => a.position - b.position);
      const currentBlocks = blocks;
      
      const hasChanges = originalBlocks.length !== currentBlocks.length ||
        originalBlocks.some((original, index) => {
          const current = currentBlocks[index];
          return !current || 
            original.blockType !== current.blockType ||
            JSON.stringify(original.blockData) !== JSON.stringify(current.blockData);
        });
      
      setState(prev => ({ ...prev, hasUnsavedChanges: hasChanges }));
    }
  }, [blocks, state.isEditMode, state.entry]);

  // Loading state
  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{state.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No entry found
  if (!state.entry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Entry Not Found</h2>
          <p className="text-gray-600">The requested entry could not be found.</p>
        </div>
      </div>
    );
  }

  // Render the entry using blocks from the store (live source of truth)
  return (
    <div className="min-h-screen">
      {/* Entry Header with Edit Mode Toggle */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{state.entry.title}</h1>
              {state.entry.description && (
                <p className="mt-2 text-lg text-gray-600">{state.entry.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                state.entry.status === 'PUBLISHED' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {state.entry.status}
              </span>
              <span className="text-sm text-gray-500">
                {state.entry.site.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Mode Controls */}
      <div className="bg-gray-50 border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Edit Mode Toggle */}
              <button
                onClick={toggleEditMode}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  state.isEditMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>{state.isEditMode ? 'Exit Edit Mode' : 'Edit Mode'}</span>
              </button>

              {/* Edit Mode Status */}
              {state.isEditMode && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Edit Mode Active</span>
                  {state.hasUnsavedChanges && (
                    <span className="text-sm text-orange-600 font-medium">• Unsaved Changes</span>
                  )}
                </div>
              )}
            </div>

            {/* Save/Discard Controls */}
            {state.isEditMode && state.hasUnsavedChanges && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={discardChanges}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={saveChanges}
                  disabled={state.isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {state.isSaving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      <span>Update</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Entry Content - Live Canvas from Block Store */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {blocks.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Content</h3>
              <p className="text-gray-600">
                {state.isEditMode 
                  ? "Use the Indy assistant to create your first block"
                  : "This entry doesn't have any blocks yet."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {blocks.map((block) => {
              // Use blocks from store as live source of truth
              const { blockType, blockData, id } = block;
              const isSelected = selectedBlockId === id;
              
              // Look up blockType in the block registry
              const blockEntry = blockRegistry[blockType];
              
              // Skip unknown types safely
              if (!blockEntry) {
                console.warn(`Unknown block type: ${blockType}. Skipping block with ID: ${id}`);
                return (
                  <div key={id} className="w-full">
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                      <div className="flex items-start space-x-3">
                        <svg className="w-6 h-6 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-yellow-800">
                            Unknown Block Type: "{blockType}"
                          </h3>
                          <p className="mt-1 text-sm text-yellow-700">
                            This block type is not registered in the block registry. Block ID: {id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              
              // Render the block with selection support for editing
              return (
                <div 
                  key={id} 
                  className={`w-full transition-all duration-200 rounded-lg ${
                    state.isEditMode ? (
                      isSelected 
                        ? 'ring-2 ring-blue-500 ring-offset-4' 
                        : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2 cursor-pointer'
                    ) : ''
                  }`}
                  onClick={() => state.isEditMode && setSelectedBlock(isSelected ? null : id)}
                >
                  {isSelected && state.isEditMode && (
                    <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs px-3 py-1 rounded-full z-10 shadow-lg">
                      Selected
                    </div>
                  )}
                  
                  <BlockRenderer
                    type={blockType}
                    props={blockData}
                  />
                  
                  {/* Debug info for development */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600 font-mono">
                      Block: {blockType} | ID: {id} | Store: ✓ | Registry: {blockEntry ? '✓' : '✗'}
                      {state.isEditMode && ' | Edit Mode: ✓'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 
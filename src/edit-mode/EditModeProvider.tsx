import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useBlocksStore } from '../store/blocksStore';

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

interface EditModeState {
  isEditMode: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  entry: Entry | null;
}

interface EditModeContextType extends EditModeState {
  toggleEditMode: () => void;
  saveChanges: () => Promise<void>;
  discardChanges: () => void;
  setEntry: (entry: Entry | null) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  return context;
};

interface EditModeProviderProps {
  children: ReactNode;
  siteSlug: string;
  entrySlug: string;
}

export const EditModeProvider: React.FC<EditModeProviderProps> = ({ 
  children, 
  siteSlug, 
  entrySlug 
}) => {
  const { blocks, setBlocks, clearBlocks, addBlock, setSelectedIndex } = useBlocksStore();
  const changeDetectionTimeoutRef = useRef<NodeJS.Timeout>();
  
  const [state, setState] = useState<EditModeState>({
    isEditMode: false,
    isSaving: false,
    hasUnsavedChanges: false,
    entry: null
  });

  // Track changes to blocks with debouncing
  useEffect(() => {
    if (state.entry) {
      // Clear any existing timeout
      if (changeDetectionTimeoutRef.current) {
        clearTimeout(changeDetectionTimeoutRef.current);
      }
      
      // Debounce change detection to prevent excessive runs
      changeDetectionTimeoutRef.current = setTimeout(() => {
        // Compare current blocks with original entry blocks
        const originalBlocks = [...(state.entry!.blocks || [])].sort((a, b) => a.position - b.position);
        const currentBlocks = [...blocks].sort((a, b) => a.position - b.position);
        
        const originalJson = JSON.stringify(originalBlocks.map(b => ({
          id: b.id,
          blockType: b.blockType,
          blockData: b.blockData,
          position: b.position
        })));
        
        const currentJson = JSON.stringify(currentBlocks.map(b => ({
          id: b.id,
          blockType: b.blockType,
          blockData: b.blockData,
          position: b.position
        })));
        
        const hasChanges = originalJson !== currentJson;
        
        // Enhanced debug logging
        console.log('🔍 Change detection running:', {
          originalCount: originalBlocks.length,
          currentCount: currentBlocks.length,
          originalFirst: originalBlocks[0]?.blockData?.elements?.title?.content,
          currentFirst: currentBlocks[0]?.blockData?.elements?.title?.content,
          hasChanges,
          originalJson: originalJson.substring(0, 200) + '...',
          currentJson: currentJson.substring(0, 200) + '...'
        });
        
        setState(prev => ({ ...prev, hasUnsavedChanges: hasChanges }));
      }, 100); // 100ms debounce
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (changeDetectionTimeoutRef.current) {
        clearTimeout(changeDetectionTimeoutRef.current);
      }
    };
  }, [blocks, state.entry]);

  // Toggle edit mode
  const toggleEditMode = () => {
    setState(prev => ({ ...prev, isEditMode: !prev.isEditMode }));
    // Clear selection when exiting edit mode
    if (state.isEditMode) {
      setSelectedIndex(null);
    }
  };

  // Save changes via Done button
  const saveChanges = async () => {
    console.log('💾 saveChanges called:', {
      hasEntry: !!state.entry,
      hasUnsavedChanges: state.hasUnsavedChanges,
      blocksCount: blocks.length
    });
    
    if (!state.entry || !state.hasUnsavedChanges) {
      console.log('💾 saveChanges early return - no entry or no unsaved changes');
      return;
    }
    
    setState(prev => ({ ...prev, isSaving: true }));
    
    try {
      // Prepare the payload
      const payload = {
        title: state.entry.title,
        slug: state.entry.slug,
        description: state.entry.description,
        published: state.entry.status === 'PUBLISHED',
        blocks: blocks.map(block => ({
          id: block.id,
          blockType: block.blockType,
          blockData: block.blockData,
          position: block.position
        }))
      };
      
      console.log('💾 saveChanges: Sending payload to API:', {
        blocksCount: payload.blocks.length,
        firstBlockTitle: payload.blocks[0]?.blockData?.elements?.title?.content,
        fullPayload: JSON.stringify(payload, null, 2)
      });
      
      // Use the proper API endpoint: PUT /api/entries/:siteSlug/:entrySlug
      const response = await fetch(`/api/entries/${siteSlug}/${entrySlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save: ${response.status}`);
      }
      
      const updatedEntry = await response.json();
      
      // Rehydrate the blockStore with the saved blocks
      const savedBlocks = updatedEntry.blocks.sort((a: any, b: any) => a.position - b.position);
      const rehydratedBlocks = savedBlocks.map((block: any) => ({
        id: block.id,
        blockType: block.blockType,
        blockData: block.blockData,
        position: block.position
      }));
      
      setBlocks(rehydratedBlocks);
      
      console.log('💾 Save completed, updating state:', {
        updatedEntryTitle: updatedEntry.title,
        updatedEntryBlocksCount: updatedEntry.blocks?.length,
        rehydratedBlocksCount: rehydratedBlocks.length
      });
      
      setState(prev => ({ 
        ...prev, 
        entry: updatedEntry, 
        hasUnsavedChanges: false,
        isSaving: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isSaving: false 
      }));
      throw error; // Re-throw to let parent handle error display
    }
  };

  // Discard changes
  const discardChanges = () => {
    if (state.entry) {
      // Reload blocks from the original entry
      clearBlocks();
      const sortedBlocks = [...state.entry.blocks].sort((a, b) => a.position - b.position);
      sortedBlocks.forEach(block => {
        addBlock(block.blockType, block.blockData, block.id);
      });
      setState(prev => ({ ...prev, hasUnsavedChanges: false }));
      setSelectedIndex(null);
    }
  };

  // Set entry (called from parent when data is loaded)
  const setEntry = (entry: Entry | null) => {
    setState(prev => ({ ...prev, entry }));
  };

  // Set hasUnsavedChanges (for external control if needed)
  const setHasUnsavedChanges = (hasChanges: boolean) => {
    setState(prev => ({ ...prev, hasUnsavedChanges: hasChanges }));
  };

  const contextValue: EditModeContextType = {
    ...state,
    toggleEditMode,
    saveChanges,
    discardChanges,
    setEntry,
    setHasUnsavedChanges
  };

  return (
    <EditModeContext.Provider value={contextValue}>
      {children}
    </EditModeContext.Provider>
  );
};
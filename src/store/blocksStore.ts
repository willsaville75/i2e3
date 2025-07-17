import { create } from 'zustand';
import { nanoid } from 'nanoid';

// Lean block structure - single source of truth
export interface BlockInstance {
  id: string;
  blockType: string;
  blockData: any;
  position: number;
}

interface BlocksState {
  // Core state - keep it lean
  blocks: BlockInstance[];
  selectedBlockId: string | null;
  selectedIndex: number | null;
  
  // CRUD operations
  addBlock: (blockType: string, blockData: any, id?: string) => string;
  updateBlock: (index: number, blockData: any) => void;
  deleteBlock: (index: number) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  
  // Utility operations
  setSelectedBlock: (id: string | null) => void;
  setSelectedIndex: (index: number | null) => void;
  clearBlocks: () => void;
  setBlocks: (blocks: BlockInstance[]) => void;
  
  // Helper methods
  getBlockById: (id: string) => BlockInstance | undefined;
  getBlockIndex: (id: string) => number;
}

export const useBlocksStore = create<BlocksState>((set, get) => ({
  // Core state - flat array of blocks
  blocks: [],
  selectedBlockId: null,
  selectedIndex: null,
  
  // Add block to the end of the list
  addBlock: (blockType, blockData, id) => {
    const blockId = id || nanoid();
    const position = get().blocks.length + 1;
    
    set((state) => ({
      blocks: [...state.blocks, { 
        id: blockId, 
        blockType, 
        blockData, 
        position 
      }]
    }));
    
    return blockId;
  },
  
  // Update block by index
  updateBlock: (index, blockData) => {
    console.log('🔄 BlocksStore updateBlock called:', {
      index,
      blockDataTitle: blockData?.elements?.title?.content,
      blockDataType: typeof blockData,
      blockDataKeys: Object.keys(blockData || {}),
      fullBlockData: JSON.stringify(blockData, null, 2)
    });
    
    set((state) => {
      if (index < 0 || index >= state.blocks.length) {
        console.log('❌ BlocksStore updateBlock: Invalid index', { index, blocksLength: state.blocks.length });
        return state;
      }
      
      const newBlocks = [...state.blocks];
      const oldBlock = newBlocks[index];
      
      // Deep clone the blockData to prevent mutation issues
      const clonedBlockData = JSON.parse(JSON.stringify(blockData));
      newBlocks[index] = { ...newBlocks[index], blockData: clonedBlockData };
      
      console.log('✅ BlocksStore updateBlock: Updated block', {
        index,
        oldTitle: oldBlock?.blockData?.elements?.title?.content,
        newTitle: newBlocks[index]?.blockData?.elements?.title?.content,
        oldBlockData: JSON.stringify(oldBlock?.blockData, null, 2),
        newBlockData: JSON.stringify(newBlocks[index]?.blockData, null, 2)
      });
      
      return { blocks: newBlocks };
    });
  },
  
  // Delete block by index
  deleteBlock: (index) => {
    set((state) => {
      if (index < 0 || index >= state.blocks.length) return state;
      
      const newBlocks = state.blocks.filter((_, i) => i !== index);
      // Reposition remaining blocks
      const repositionedBlocks = newBlocks.map((block, i) => ({
        ...block,
        position: i + 1
      }));
      
      // Clear selection if deleted block was selected
      const deletedBlockId = state.blocks[index].id;
      const selectedBlockId = state.selectedBlockId === deletedBlockId 
        ? null 
        : state.selectedBlockId;
      
      // Update selectedIndex if needed
      let selectedIndex = state.selectedIndex;
      if (selectedIndex === index) {
        selectedIndex = null; // Clear if deleted block was selected
      } else if (selectedIndex !== null && selectedIndex > index) {
        selectedIndex = selectedIndex - 1; // Adjust index if after deleted block
      }
      
      return { 
        blocks: repositionedBlocks,
        selectedBlockId,
        selectedIndex
      };
    });
  },
  
  // Reorder blocks
  reorderBlocks: (fromIndex, toIndex) => {
    set((state) => {
      if (fromIndex < 0 || fromIndex >= state.blocks.length ||
          toIndex < 0 || toIndex >= state.blocks.length ||
          fromIndex === toIndex) {
        return state;
      }
      
      const newBlocks = [...state.blocks];
      const [movedBlock] = newBlocks.splice(fromIndex, 1);
      newBlocks.splice(toIndex, 0, movedBlock);
      
      // Update positions
      const repositionedBlocks = newBlocks.map((block, i) => ({
        ...block,
        position: i + 1
      }));
      
      // Update selectedIndex if the selected block was moved
      let selectedIndex = state.selectedIndex;
      if (selectedIndex === fromIndex) {
        selectedIndex = toIndex;
      } else if (selectedIndex !== null) {
        if (fromIndex < toIndex) {
          // Moving down: adjust if selection is between fromIndex and toIndex
          if (selectedIndex > fromIndex && selectedIndex <= toIndex) {
            selectedIndex = selectedIndex - 1;
          }
        } else {
          // Moving up: adjust if selection is between toIndex and fromIndex
          if (selectedIndex >= toIndex && selectedIndex < fromIndex) {
            selectedIndex = selectedIndex + 1;
          }
        }
      }
      
      return { 
        blocks: repositionedBlocks,
        selectedIndex
      };
    });
  },
  
  // Set selected block
  setSelectedBlock: (id) => {
    const index = id ? get().getBlockIndex(id) : null;
    set({ 
      selectedBlockId: id,
      selectedIndex: index !== -1 ? index : null
    });
  },

  // Set selected index
  setSelectedIndex: (index) => {
    const blocks = get().blocks;
    const id = index !== null && index >= 0 && index < blocks.length 
      ? blocks[index].id 
      : null;
    set({ 
      selectedIndex: index,
      selectedBlockId: id
    });
  },
  
  // Clear all blocks
  clearBlocks: () => 
    set({ blocks: [], selectedBlockId: null, selectedIndex: null }),
  
  // Set blocks (for rehydration after save)
  setBlocks: (blocks: BlockInstance[]) => 
    set({ blocks, selectedBlockId: null, selectedIndex: null }),
  
  // Helper: Get block by ID
  getBlockById: (id) => 
    get().blocks.find(block => block.id === id),
  
  // Helper: Get block index by ID
  getBlockIndex: (id) => 
    get().blocks.findIndex(block => block.id === id),
})); 
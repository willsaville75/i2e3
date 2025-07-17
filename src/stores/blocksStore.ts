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
  
  // CRUD operations
  addBlock: (blockType: string, blockData: any, id?: string) => string;
  updateBlock: (index: number, blockData: any) => void;
  deleteBlock: (index: number) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  
  // Utility operations
  setSelectedBlock: (id: string | null) => void;
  clearBlocks: () => void;
  
  // Helper methods
  getBlockById: (id: string) => BlockInstance | undefined;
  getBlockIndex: (id: string) => number;
}

export const useBlocksStore = create<BlocksState>((set, get) => ({
  // Core state - flat array of blocks
  blocks: [],
  selectedBlockId: null,
  
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
  updateBlock: (index, blockData) =>
    set((state) => {
      if (index < 0 || index >= state.blocks.length) return state;
      
      const newBlocks = [...state.blocks];
      newBlocks[index] = { ...newBlocks[index], blockData };
      
      return { blocks: newBlocks };
    }),
  
  // Delete block by index
  deleteBlock: (index) =>
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
      
      return { 
        blocks: repositionedBlocks,
        selectedBlockId
      };
    }),
  
  // Reorder blocks
  reorderBlocks: (fromIndex, toIndex) =>
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
      
      return { blocks: repositionedBlocks };
    }),
  
  // Set selected block
  setSelectedBlock: (id) =>
    set({ selectedBlockId: id }),
  
  // Clear all blocks
  clearBlocks: () => 
    set({ blocks: [], selectedBlockId: null }),
  
  // Helper: Get block by ID
  getBlockById: (id) => 
    get().blocks.find(block => block.id === id),
  
  // Helper: Get block index by ID
  getBlockIndex: (id) => 
    get().blocks.findIndex(block => block.id === id),
})); 
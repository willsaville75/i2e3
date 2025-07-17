import { create } from 'zustand';
import { nanoid } from 'nanoid';

export interface BlockInstance {
  id: string;
  type: string;
  props: any;
}

interface BlocksState {
  blocks: BlockInstance[];
  selectedBlockId: string | null;
  addBlock: (type: string, props: any, id?: string) => string;
  updateBlock: (id: string, props: any) => void;
  removeBlock: (id: string) => void;
  setSelectedBlock: (id: string | null) => void;
  clearBlocks: () => void;
}

export const useBlocksStore = create<BlocksState>((set) => ({
  blocks: [],
  selectedBlockId: null,
  
  addBlock: (type, props, id) => {
    const blockId = id || nanoid();
    console.log(`🏪 BlocksStore: addBlock called - type: ${type}, id: ${blockId}, props:`, props);
    set((state) => {
      const newBlocks = [...state.blocks, { id: blockId, type, props }];
      console.log(`🏪 BlocksStore: Updated blocks array:`, newBlocks);
      return { blocks: newBlocks };
    });
    return blockId;
  },
    
  updateBlock: (id, props) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id ? { ...block, props } : block
      ),
    })),
    
  removeBlock: (id) =>
    set((state) => ({
      blocks: state.blocks.filter((block) => block.id !== id),
      selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
    })),
    
  setSelectedBlock: (id) =>
    set({ selectedBlockId: id }),
    
  clearBlocks: () => set({ blocks: [], selectedBlockId: null }),
})); 
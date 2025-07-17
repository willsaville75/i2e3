import { DesignTokens } from '../blocks/shared/token-types';
import { nanoid } from 'nanoid';
import { useBlocksStore, type BlockInstance } from '../store/blocksStore';
import { isPropertyIntent, runIndyPropertyAgent } from './agents/runIndyPropertyAgent';

/**
 * Block data structure for existing blocks
 */
export interface BlockData {
  blockType: string;
  props: any;
  id?: string;
}

/**
 * Page context for multi-block operations
 */
export interface PageContext {
  blocks?: BlockData[];
  tokens?: DesignTokens;
  route?: string;
}

/**
 * Allowed action types for Indy
 */
export type IndyActionType = 'ADD_BLOCK' | 'UPDATE_BLOCK' | 'REPLACE_BLOCK' | 'REMOVE_BLOCK' | 'PROPERTY_UPDATE';

/**
 * Indy action structure
 */
export interface IndyAction {
  type: IndyActionType;
  data?: any;
  blockType?: string;
  blockId?: string;
  target?: string;
  propertyChanges?: any[];  // For property updates
}

/**
 * Result of executing an Indy action
 */
export interface IndyActionResult {
  success: boolean;
  action?: IndyAction;
  error?: string;
  blockData?: any;
  agentUsed?: string;
  userInput?: string;
  executionTime?: number;
}

/**
 * Main function to run an Indy action
 * 
 * IMPORTANT: blockStore is the single source of truth
 * Never fetch from database - always use the store
 */
export async function runIndyAction(
  userInput: string,
  blockId?: string
): Promise<IndyAction> {
  try {
    const { blocks } = useBlocksStore.getState();
    
    // Find block in store (blockStore is single source of truth)
    let blockType: string;
    let currentBlock: BlockInstance | undefined;
    
    if (blockId) {
      currentBlock = blocks.find((b: BlockInstance) => b.id === blockId);
      if (!currentBlock) {
        throw new Error(`Block with id ${blockId} not found in store`);
      }
      blockType = currentBlock.blockType;
    } else {
      // Default to hero block if no specific block
      blockType = 'hero';
    }
    
    // Check if this is a property-related intent
    if (isPropertyIntent(userInput) && currentBlock) {
      console.log('🔧 Detected property intent, using property agent');
      
      const propertyResult = await runIndyPropertyAgent(
        userInput,
        blockId!,
        currentBlock.blockData
      );
      
      if (propertyResult.success) {
        return {
          type: 'PROPERTY_UPDATE',
          blockType,
          blockId: blockId!,
          data: propertyResult.changes,
          propertyChanges: propertyResult.changes
        };
      } else {
        throw new Error(propertyResult.message);
      }
    }
    
    // Fallback to original API-based approach for content changes
    console.log('📝 Using API-based approach for content changes');
    
    // Prepare request data
    const requestData = {
      userInput,
      blockType,
      currentData: currentBlock?.blockData,
      tokens: {
        colors: ['blue', 'red', 'green', 'yellow', 'purple', 'pink', 'gray', 'black', 'white'],
        spacing: ['sm', 'md', 'lg', 'xl', '2xl']
      }
    };
    
    // Make HTTP request to API
    const response = await fetch('/api/indy/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const apiResponse = await response.json();
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.error || 'API request failed');
    }
    
    // Map API response to IndyAction
    const action: IndyAction = {
      type: currentBlock ? 'UPDATE_BLOCK' : 'ADD_BLOCK',
      blockType,
      blockId: currentBlock?.id,
      data: apiResponse.blockData
    };
    
    return action;
    
  } catch (error) {
    throw new Error(`Failed to run Indy action: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Apply an Indy action to update the blocks store
 * 
 * IMPORTANT: This updates the store immediately
 * Database save happens when "Done" is clicked
 */
export function applyIndyAction(action: IndyAction): void {
  const { addBlock, updateBlock, getBlockIndex } = useBlocksStore.getState();
  
  if (action.type === 'ADD_BLOCK') {
    const id = action.blockId || nanoid();
    addBlock(action.blockType || 'hero', action.data, id);
  } else if (action.type === 'UPDATE_BLOCK' && action.blockId) {
    const index = getBlockIndex(action.blockId);
    if (index !== -1) {
      updateBlock(index, action.data);
    }
  } else if (action.type === 'PROPERTY_UPDATE') {
    // Property updates are already handled by the property agent
    console.log('✅ Property update completed by property agent');
  }
} 
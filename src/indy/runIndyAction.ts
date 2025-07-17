import { DesignTokens } from '../blocks/shared/token-types';
import { nanoid } from 'nanoid';

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
export type IndyActionType = 'ADD_BLOCK' | 'UPDATE_BLOCK' | 'REPLACE_BLOCK' | 'REMOVE_BLOCK';

/**
 * Indy action structure
 */
export interface IndyAction {
  type: IndyActionType;
  data?: any;
  blockType?: string;
  blockId?: string;
  target?: string;
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
 * CLIENT-SIDE: Executes an Indy action by calling the API server
 * This function runs in the browser and makes HTTP requests to the server
 * 
 * @param message - The user's message/intent
 * @param blockType - Optional specific block type to target
 * @param context - Optional page context with existing blocks
 * @returns Result of the action from the server
 */
export async function runIndyAction(
  message: string,
  blockType?: string,
  context?: PageContext
): Promise<IndyActionResult> {
  const startTime = Date.now();
  console.log(`🎬 Frontend: runIndyAction started (${Date.now() - startTime}ms)`);
  
  try {
    // If no block type is specified and we have context, try to infer it
    if (!blockType && context?.blocks && context.blocks.length === 1) {
      blockType = context.blocks[0].blockType;
    }
    console.log(`🔍 Frontend: Block type determined: ${blockType} (${Date.now() - startTime}ms)`);

    // Still require a block type for now
    if (!blockType) {
      return {
        success: false,
        error: 'Block type is required for Indy actions'
      };
    }

    // Find the current block if updating
    const currentBlock = context?.blocks?.find(b => b.blockType === blockType);

    // Call the API endpoint
    console.log(`📡 Frontend: Making HTTP request to /api/indy/generate (${Date.now() - startTime}ms)`);
    const httpStartTime = Date.now();
    const response = await fetch('/api/indy/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive',
      },
      body: JSON.stringify({
        userInput: message,
        blockType,
        currentData: currentBlock?.props,
        tokens: context?.tokens || {}
      }),
    });
    console.log(`📨 Frontend: HTTP response received in ${Date.now() - httpStartTime}ms (${Date.now() - startTime}ms total)`);

    // Add timing around JSON parsing
    const jsonParseStartTime = Date.now();
    console.log(`🔧 Frontend: Starting JSON parsing (${Date.now() - startTime}ms)`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: `HTTP error! status: ${response.status}` 
      }));
      throw new Error(errorData.error || errorData.details || `Request failed: ${response.status}`);
    }

    console.log(`🔍 Frontend: Parsing JSON response (${Date.now() - startTime}ms)`);
    const apiResponse = await response.json();
    
    console.log(`📡 Frontend: JSON parsing completed in ${Date.now() - jsonParseStartTime}ms (${Date.now() - startTime}ms total)`);
    console.log(`📊 Frontend: API Response:`, apiResponse);
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.error || 'Failed to generate content');
    }
    
    console.log(`🔄 Frontend: Mapping API response to IndyAction (${Date.now() - startTime}ms)`);
    // Map the API response to IndyAction format
    const action: IndyAction = {
      type: apiResponse.currentData ? 'UPDATE_BLOCK' : 'ADD_BLOCK',
      data: apiResponse.blockData,
      blockId: apiResponse.currentData ? undefined : `block-${nanoid()}`,
      blockType,
      target: apiResponse.target
    };
    console.log(`🎯 Frontend: Created action:`, action);
    
    console.log(`✅ Frontend: runIndyAction completed successfully (${Date.now() - startTime}ms)`);
    return {
      success: true,
      action,
      blockData: apiResponse.blockData,
      agentUsed: apiResponse.agentUsed,
      userInput: apiResponse.userInput,
      error: apiResponse.error
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * CLIENT-SIDE: Apply an Indy action to the blocks store
 * This is typically called after runIndyAction succeeds
 * 
 * @param action - The action to apply
 * @param store - The blocks store instance
 * @returns Whether the action was applied successfully
 */
export function applyIndyAction(
  action: IndyAction,
  store: {
    addBlock: (type: string, props: any, id?: string) => string;
    updateBlock: (id: string, props: any) => void;
    removeBlock: (id: string) => void;
  }
): boolean {
  console.log(`🔧 applyIndyAction: Starting with action:`, action);
  try {
    switch (action.type) {
      case 'ADD_BLOCK': {
        if (!action.blockType || !action.data) {
          console.error('ADD_BLOCK requires blockType and data');
          return false;
        }
        const id = action.blockId || nanoid();
        console.log(`➕ applyIndyAction: Adding block - type: ${action.blockType}, id: ${id}, data:`, action.data);
        store.addBlock(action.blockType, action.data, id);
        console.log(`✅ applyIndyAction: Block added successfully`);
        return true;
      }
      
      case 'UPDATE_BLOCK':
      case 'REPLACE_BLOCK': {
        if (!action.blockId || !action.data) {
          console.error(`${action.type} requires blockId and data`);
          return false;
        }
        store.updateBlock(action.blockId, action.data);
        return true;
      }
      
      case 'REMOVE_BLOCK': {
        if (!action.blockId) {
          console.error('REMOVE_BLOCK requires blockId');
          return false;
        }
        store.removeBlock(action.blockId);
        return true;
      }
      
      default:
        console.error(`Unknown action type: ${action.type}`);
        return false;
    }
  } catch (error) {
    console.error('Error applying Indy action:', error);
    return false;
  }
} 
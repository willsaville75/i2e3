/**
 * Indy Function Definitions for OpenAI Function Calling
 * 
 * This file defines the functions that Indy AI can call through OpenAI's function calling feature.
 * These functions provide structured ways for Indy to manipulate blocks, pages, and content.
 */

export const functionDefinitions = [
  {
    name: "updateBlock",
    description: "Update a specific block with new content, layout, or styling values. Use this when users want to modify existing block properties like titles, colors, backgrounds, spacing, etc.",
    parameters: {
      type: "object",
      properties: {
        index: { 
          type: "integer", 
          description: "Index of the block to update (0-based). Use the currently selected block index when user says 'this block' or similar." 
        },
        updates: { 
          type: "object", 
          description: "Updated blockData values. Should match the block's schema structure (e.g., {content: {title: 'New Title'}} for hero blocks)." 
        }
      },
      required: ["index", "updates"]
    }
  },
  {
    name: "addBlock",
    description: "Add a new block to the page. Use this when users want to create new sections, add content blocks, or insert new elements.",
    parameters: {
      type: "object",
      properties: {
        type: { 
          type: "string", 
          description: "Block type to create. Currently supported: 'hero'. Use 'hero' for landing sections, main headings, or call-to-action areas." 
        },
        props: { 
          type: "object", 
          description: "Initial block data/props. Should include content, layout, and background properties based on the block type." 
        },
        position: { 
          type: "integer", 
          description: "Optional index to insert the block at. If not provided, block will be added at the end." 
        }
      },
      required: ["type", "props"]
    }
  },
  {
    name: "deleteBlock",
    description: "Delete a block by index. Use this when users want to remove sections, delete content blocks, or clear unwanted elements.",
    parameters: {
      type: "object",
      properties: {
        index: { 
          type: "integer", 
          description: "Index of the block to delete (0-based). Use the currently selected block index when user says 'delete this block' or similar." 
        }
      },
      required: ["index"]
    }
  },
  {
    name: "savePage",
    description: "Save all current blocks to the database. Use this when users explicitly ask to save changes, persist data, or publish their work.",
    parameters: {
      type: "object",
      properties: {},
      description: "No parameters needed. This function saves the current state of all blocks to the database."
    }
  }
];

/**
 * Type definitions for function parameters
 */
export interface UpdateBlockParams {
  index: number;
  updates: Record<string, any>;
}

export interface AddBlockParams {
  type: string;
  props: Record<string, any>;
  position?: number;
}

export interface DeleteBlockParams {
  index: number;
}

export interface SavePageParams {
  // No parameters needed for save
}

/**
 * Union type for all function parameters
 */
export type IndyFunctionParams = 
  | UpdateBlockParams 
  | AddBlockParams 
  | DeleteBlockParams 
  | SavePageParams;

/**
 * Function name type
 */
export type IndyFunctionName = 'updateBlock' | 'addBlock' | 'deleteBlock' | 'savePage';

/**
 * Helper function to create default block data for new blocks
 */
export function createDefaultBlockData(blockType: string): Record<string, any> {
  switch (blockType) {
    case 'hero':
      return {
        elements: {
          title: {
            content: "New Hero Section",
            level: 1
          },
          subtitle: {
            content: "Add your subtitle here"
          },
          button: {
            text: "Get Started",
            href: "#",
            variant: "primary",
            size: "lg"
          }
        },
        layout: {
          blockSettings: {
            height: "auto",
            margin: { top: "lg", bottom: "lg" }
          },
          contentSettings: {
            contentWidth: "narrow",
            textAlignment: "center",
            contentAlignment: { horizontal: "center", vertical: "center" },
            padding: { top: "xl", bottom: "xl" }
          }
        },
        background: {
          type: "color",
          color: "blue",
          colorIntensity: "medium"
        }
      };
    default:
      return {
        content: {},
        layout: {},
        background: {}
      };
  }
}

/**
 * Helper function to validate function parameters
 */
export function validateFunctionCall(functionName: IndyFunctionName, args: any): { valid: boolean; error?: string } {
  switch (functionName) {
    case 'updateBlock':
      if (typeof args.index !== 'number') {
        return { valid: false, error: 'updateBlock requires a numeric index parameter' };
      }
      if (!args.updates || typeof args.updates !== 'object') {
        return { valid: false, error: 'updateBlock requires an updates object parameter' };
      }
      break;
    
    case 'addBlock':
      if (!args.type || typeof args.type !== 'string') {
        return { valid: false, error: 'addBlock requires a string type parameter' };
      }
      if (!args.props || typeof args.props !== 'object') {
        return { valid: false, error: 'addBlock requires a props object parameter' };
      }
      break;
    
    case 'deleteBlock':
      if (typeof args.index !== 'number') {
        return { valid: false, error: 'deleteBlock requires a numeric index parameter' };
      }
      break;
    
    case 'savePage':
      // No parameters to validate
      break;
    
    default:
      return { valid: false, error: `Unknown function: ${functionName}` };
  }
  
  return { valid: true };
} 
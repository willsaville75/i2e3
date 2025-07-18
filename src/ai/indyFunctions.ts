/**
 * Indy Function Definitions for OpenAI Function Calling
 * 
 * This file defines the functions that Indy AI can call through OpenAI's function calling feature.
 * These functions provide structured ways for Indy to manipulate blocks, pages, and content.
 */

export const functionDefinitions = [
  {
    name: "updateBlock",
    description: "Update a specific block with new content or layout values.",
    parameters: {
      type: "object",
      properties: {
        index: { type: "integer", description: "Index of the block to update." },
        updates: { type: "object", description: "Updated blockData values." }
      },
      required: ["index", "updates"]
    }
  },
  {
    name: "addBlock",
    description: "Add a new block to the page.",
    parameters: {
      type: "object",
      properties: {
        type: { type: "string", description: "Block type (e.g. 'hero')" },
        props: { type: "object", description: "Block props" },
        position: { type: "integer", description: "Optional index to insert at" }
      },
      required: ["type", "props"]
    }
  },
  {
    name: "deleteBlock",
    description: "Delete a block by index.",
    parameters: {
      type: "object",
      properties: {
        index: { type: "integer", description: "Index of the block to delete." }
      },
      required: ["index"]
    }
  },
  {
    name: "savePage",
    description: "Save all blocks to the database.",
    parameters: {
      type: "object",
      properties: {}
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
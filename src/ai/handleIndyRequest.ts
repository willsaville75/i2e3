/**
 * Indy Request Handler with OpenAI Function Calling
 * 
 * This module handles user requests to Indy AI by:
 * 1. Sending the request to OpenAI with function definitions
 * 2. Executing any function calls returned by the AI
 * 3. Updating the block store and database accordingly
 */

import { createOpenAIClient, isOpenAIConfigured } from './client';
import { functionDefinitions, type IndyFunctionName } from './indyFunctions';
import { useBlocksStore } from '../store/blocksStore';
import { blockRegistry } from '../blocks';
import { summariseBlockSchemaForAI } from '../blocks/utils/summariseBlockSchemaForAI';

/**
 * Handle an Indy request using OpenAI function calling
 * 
 * @param userInput - The user's natural language request
 * @param selectedIndex - Currently selected block index (if any)
 * @returns Promise resolving to a response message
 */
export async function handleIndyRequest(userInput: string, selectedIndex: number | null = null): Promise<string> {
  // Check if OpenAI is configured
  if (!isOpenAIConfigured()) {
    throw new Error('OpenAI is not configured. Please set OPENAI_API_KEY environment variable.');
  }

  try {
    // Get current blocks state
    const blocks = useBlocksStore.getState().blocks;
    
    // Create OpenAI client
    const client = await createOpenAIClient();
    
    // Prepare context for the AI
    const contextMessage = selectedIndex !== null && blocks[selectedIndex]
      ? `Currently selected block: ${blocks[selectedIndex].blockType} at index ${selectedIndex}`
      : `No block selected. Available blocks: ${blocks.map((b, i) => `${i}: ${b.blockType}`).join(', ')}`;

    // Prepare messages array
    const messages = [
      { 
        role: "system" as const, 
        content: `You're Indy, an AI assistant helping users build CMS pages using blocks. 
        
Context: ${contextMessage}

You can manipulate blocks using the provided functions. When users ask to modify content, use updateBlock. When they want to add new sections, use addBlock. When they want to remove content, use deleteBlock. When they want to save changes, use savePage.

Be helpful and execute the user's requests directly using the appropriate functions.` 
      },
      { role: "user" as const, content: userInput }
    ];

    // Add current block schema summary if a block is selected
    if (selectedIndex !== null && blocks[selectedIndex]) {
      const currentBlock = blocks[selectedIndex];
      const blockEntry = blockRegistry[currentBlock.blockType];
      
      if (blockEntry && blockEntry.schema) {
        const blockSummary = summariseBlockSchemaForAI(blockEntry.schema, {
          includeHints: true,
          includeDefaults: true,
          includeEnums: true
        });
        
        // Add schema summary and current data as a system message
        const currentDataSummary = JSON.stringify(currentBlock.blockData, null, 2);
        messages.unshift({
          role: "system" as const,
          content: `Current block is of type "${currentBlock.blockType}".

Schema: ${blockSummary}

Current Data: ${currentDataSummary}`
        });
      }
    }

    // Send request to OpenAI with function calling
    const response = await client.chat.completions.create({
      model: "gpt-4-0613",
      messages,
      functions: functionDefinitions,
      function_call: "auto",
      temperature: 0.7,
      max_tokens: 1000
    });

    const message = response.choices[0].message;
    const fnCall = message.function_call;
    
    // If no function call, return the AI's text response
    if (!fnCall) {
      return message.content || "I'm not sure how to help with that.";
    }

    // Parse function arguments
    const args = JSON.parse(fnCall.arguments || '{}');
    const functionName = fnCall.name as IndyFunctionName;

    // Execute the function call
    return await executeFunction(functionName, args, blocks);

  } catch (error) {
    console.error('Error handling Indy request:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return '⚠️ Rate limit exceeded. Please try again in a moment.';
      }
      if (error.message.includes('insufficient_quota')) {
        return '⚠️ API quota exceeded. Please check your OpenAI billing.';
      }
      if (error.message.includes('invalid_api_key')) {
        return '⚠️ Invalid API key. Please check your OpenAI configuration.';
      }
    }
    
    return '❌ Sorry, I encountered an error processing your request. Please try again.';
  }
}

/**
 * Execute a function call from OpenAI
 */
async function executeFunction(functionName: IndyFunctionName, args: any, blocks: any[]): Promise<string> {
  const store = useBlocksStore.getState();

  switch (functionName) {
    case 'updateBlock':
      const { index, updates } = args;
      
      if (index < 0 || index >= blocks.length) {
        return `❌ Invalid block index ${index}. Available blocks: 0-${blocks.length - 1}`;
      }
      
      store.updateBlock(index, updates);
      return `✅ Updated block ${index} (${blocks[index].blockType}).`;

    case 'addBlock':
      const { type, props, position } = args;
      
      const blockId = store.addBlock(type, props);
      const newIndex = blocks.length; // Will be added at the end
      
      return `✅ Added new ${type} block at position ${newIndex}.`;

    case 'deleteBlock':
      const { index: deleteIndex } = args;
      
      if (deleteIndex < 0 || deleteIndex >= blocks.length) {
        return `❌ Invalid block index ${deleteIndex}. Available blocks: 0-${blocks.length - 1}`;
      }
      
      const deletedBlockType = blocks[deleteIndex].blockType;
      store.deleteBlock(deleteIndex);
      
      return `🗑️ Deleted ${deletedBlockType} block at index ${deleteIndex}.`;

    case 'savePage':
      return await savePageToDatabase(blocks);

    default:
      return `⚠️ Unknown function: ${functionName}`;
  }
}

/**
 * Save the current page state to the database
 */
async function savePageToDatabase(blocks: any[]): Promise<string> {
  try {
    // Get current entry context from URL or store
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    
    // Extract site and entry slugs from URL (assuming /edit/siteSlug/entrySlug format)
    if (pathParts.length < 4 || pathParts[1] !== 'edit') {
      return '⚠️ Unable to determine page context for saving.';
    }
    
    const siteSlug = pathParts[2];
    const entrySlug = pathParts[3];
    
    // Prepare payload similar to EditModeProvider
    const payload = {
      blocks: blocks.map(block => ({
        id: block.id,
        blockType: block.blockType,
        blockData: block.blockData,
        position: block.position
      }))
    };
    
    // Save to database using the CMS API
    const response = await fetch(`/api/cms/entries/${siteSlug}/${entrySlug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Save failed with status ${response.status}`);
    }
    
    return '💾 Page saved successfully to database.';
    
  } catch (error) {
    console.error('Error saving page:', error);
    return `❌ Failed to save page: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * Type guard to check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
} 
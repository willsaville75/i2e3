import { useState } from 'react';
import { runIndyAction, applyIndyAction } from '../indy';
import { useBlocksStore } from '../stores/blocksStore';
import { useIndyChatStore } from '../stores/indyChatStore';

/**
 * IndyChatPanel - A fixed chat panel for interacting with Indy agents
 * 
 * Features:
 * - Fixed positioning on the right side of the screen
 * - Input field bound to store state
 * - Message history display
 * - Integration with runIndyAction() function
 * - Block selection and update support
 */
export const IndyChatPanel: React.FC = () => {
  const {
    messages,
    input,
    addMessage,
    setInput,
    clearMessages
  } = useIndyChatStore();

  // Blocks store for managing blocks on the page
  const { 
    blocks, 
    selectedBlockId, 
    addBlock, 
    updateBlock,
    setSelectedBlock 
  } = useBlocksStore();

  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const startTime = Date.now();
    console.log(`🎬 UI: handleSend started (${Date.now() - startTime}ms)`);
    
    // Add user message to chat
    addMessage('user', userMessage);
    console.log(`💬 UI: User message added to chat (${Date.now() - startTime}ms)`);
    
    // Clear input
    setInput('');
    
    // Set loading state
    setIsLoading(true);
    console.log(`⏳ UI: Loading state set (${Date.now() - startTime}ms)`);

    try {
      // Find the selected block if any
      const selectedBlock = selectedBlockId 
        ? blocks.find(b => b.id === selectedBlockId)
        : undefined;

      // Get current block data if updating
      const currentBlock = selectedBlockId && selectedBlock ? {
        id: selectedBlockId,
        type: selectedBlock.type,
        blockType: selectedBlock.type,
        props: selectedBlock.props
      } : undefined;

      // Call runIndyAction with intelligent block type detection
      const result = await runIndyAction(
        userMessage,
        currentBlock?.type || 'hero', // Default to 'hero' but AI can override
        currentBlock ? { blocks: [currentBlock] } : undefined
      );
      console.log(`📨 UI: runIndyAction completed (${Date.now() - startTime}ms)`);

      // Check if the action was successful
      if (!result.success) {
        addMessage('assistant', `❌ Error: ${result.error || 'Failed to process request'}`);
        return;
      }

      // Apply the action if successful
      if (result.action) {
        console.log(`🔄 UI: Applying Indy action (${Date.now() - startTime}ms)`);
        const success = applyIndyAction(result.action, {
          addBlock,
          updateBlock,
          removeBlock: (_id: string) => {
            // Not implemented in the store yet
            console.warn('removeBlock not implemented');
          }
        });
        console.log(`✅ UI: Action applied successfully: ${success} (${Date.now() - startTime}ms)`);

        if (success) {
          // Generate appropriate success message
          switch (result.action.type) {
            case 'ADD_BLOCK':
              addMessage('assistant', `✅ Created new ${result.action.blockType} block and added it to the page.`);
              // Auto-select the newly created block
              if (result.action.blockId) {
                setSelectedBlock(result.action.blockId);
              }
              break;

            case 'UPDATE_BLOCK':
              const updateType = result.action.target 
                ? `specific field (${result.action.target})` 
                : 'entire content';
              addMessage('assistant', `✅ Updated ${updateType} in the selected ${result.action.blockType} block.`);
              break;

            case 'REPLACE_BLOCK':
              addMessage('assistant', `✅ Replaced content in the selected ${result.action.blockType} block.`);
              break;

            default:
              addMessage('assistant', `✅ Action completed: ${result.action.type}`);
          }
        } else {
          addMessage('assistant', `⚠️ Failed to apply action to the page`);
        }
      }

      // Add metadata info if in development
      if (process.env.NODE_ENV === 'development' && result.agentUsed) {
        const debugParts = [
          `Agent="${result.agentUsed}"`,
        ];
        if (result.executionTime) {
          debugParts.push(`Time=${result.executionTime}ms`);
        }
        addMessage('assistant', `🔍 Debug: ${debugParts.join(', ')}`);
      }

    } catch (error) {
      // Handle errors
      const errorMessage = error instanceof Error 
        ? `Error: ${error.message}` 
        : 'An unknown error occurred';
      
      addMessage('assistant', `❌ ${errorMessage}`);
    } finally {
      setIsLoading(false);
      console.log(`🏁 UI: handleSend completed (${Date.now() - startTime}ms total)`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed right-4 top-4 bottom-4 w-96 bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Indy Chat</h3>
        <button
          onClick={clearMessages}
          className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
        >
          Clear
        </button>
      </div>

      {/* Block Selection Info */}
      {selectedBlockId && (
        <div className="px-4 py-2 bg-blue-50 border-b border-gray-200">
          <p className="text-sm text-blue-700">
            📌 Selected block: {blocks.find(b => b.id === selectedBlockId)?.type || 'Unknown'}
          </p>
          <button
            onClick={() => setSelectedBlock(null)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Deselect
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet</p>
            <p className="text-sm">Start a conversation with Indy!</p>
            <p className="text-xs mt-2">
              {selectedBlockId ? '✏️ Editing mode' : '➕ Creation mode'}
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <div className="text-xs font-semibold mb-1 opacity-75">
                  {message.role === 'user' ? 'You' : 'Indy'}
                </div>
                <div className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
              <div className="text-xs font-semibold mb-1 opacity-75">Indy</div>
              <div className="text-sm">
                <span className="inline-flex items-center">
                  Thinking
                  <span className="ml-1 animate-pulse">...</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        
        {/* Input Field */}
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              selectedBlockId 
                ? "Describe how to update this block..." 
                : `Describe the block you want...`
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        
        {/* Helper Text */}
        <p className="text-xs text-gray-500 mt-2">
          {selectedBlockId 
            ? "💡 Tip: Describe changes like 'make the title more engaging' or 'change button to green'"
            : "💡 Tip: Try 'Create a hero section for a tech startup'"}
        </p>
      </div>
    </div>
  );
};
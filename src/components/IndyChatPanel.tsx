import { useState } from 'react';
import { runIndyAction, applyIndyAction } from '../indy';
import { useBlocksStore } from '../stores/blocksStore';
import { useIndyChatStore } from '../stores/indyChatStore';

/**
 * IndyChatPanel - A floating chat assistant for interacting with Indy agents
 * 
 * Features:
 * - Floating button that opens panel from the right
 * - Visible on every page in view mode
 * - Input field bound to store state
 * - Message history display
 * - Integration with runIndyAction() function
 * - Block selection and update support using shared blockStore
 */
export const IndyChatPanel: React.FC = () => {
  const {
    messages,
    input,
    addMessage,
    setInput,
    clearMessages
  } = useIndyChatStore();

  // Blocks store for managing blocks on the page (shared with canvas renderer)
  const { 
    blocks, 
    selectedBlockId, 
    addBlock, 
    updateBlock,
    setSelectedBlock,
    deleteBlock
  } = useBlocksStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

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
    
    try {
      // Determine context based on selected block
      const selectedBlock = selectedBlockId ? blocks.find(b => b.id === selectedBlockId) : null;
      const blockType = selectedBlock?.blockType || 'hero'; // Default to hero if no block selected
      
      const context = selectedBlock ? {
        blocks: [{
          blockType: selectedBlock.blockType,
          props: selectedBlock.blockData,
          id: selectedBlock.id
        }]
      } : undefined;
      
      console.log(`🔧 UI: Running Indy action with context (${Date.now() - startTime}ms):`, { blockType, context });
      
      // Call Indy with the user message and context
      const result = await runIndyAction(userMessage, blockType, context);
      
      console.log(`🤖 UI: Indy result received (${Date.now() - startTime}ms):`, result);
      
      // Apply the result to the blocks store
      if (result.success && result.action) {
        const success = applyIndyAction(result.action, { 
          addBlock, 
          updateBlock: (id: string, props: any) => {
            const { getBlockIndex } = useBlocksStore.getState();
            const index = getBlockIndex(id);
            if (index !== -1) {
              updateBlock(index, props);
            }
          },
          removeBlock: (id: string) => {
            const { getBlockIndex } = useBlocksStore.getState();
            const index = getBlockIndex(id);
            if (index !== -1) {
              deleteBlock(index);
            }
          }
        });
        
        if (success) {
          // Generate appropriate success message based on action type
          switch (result.action.type) {
            case 'ADD_BLOCK':
              addMessage('assistant', `✅ Created new ${result.action.blockType} block!`);
              // Auto-select the newly created block
              if (result.action.blockId) {
                setSelectedBlock(result.action.blockId);
              }
              break;
            case 'UPDATE_BLOCK':
              addMessage('assistant', `✅ Updated the ${result.action.blockType} block!`);
              break;
            case 'REPLACE_BLOCK':
              addMessage('assistant', `✅ Replaced content in the ${result.action.blockType} block!`);
              break;
            default:
              addMessage('assistant', 'Block updated successfully!');
          }
        } else {
          addMessage('assistant', 'Failed to apply changes to the block.');
        }
        
        console.log(`✅ UI: Block action applied successfully (${Date.now() - startTime}ms)`);
      } else {
        // Add error message to chat
        addMessage('assistant', result.error || 'Sorry, I encountered an error. Please try again.');
        console.error(`❌ UI: Indy action failed (${Date.now() - startTime}ms):`, result.error);
      }
      
    } catch (error) {
      console.error(`💥 UI: Error in handleSend (${Date.now() - startTime}ms):`, error);
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
      console.log(`🏁 UI: handleSend completed (${Date.now() - startTime}ms)`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isGenerating = isLoading;
  const selectedBlock = selectedBlockId ? blocks.find(b => b.id === selectedBlockId) : null;

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
            isPanelOpen 
              ? 'bg-gray-600 hover:bg-gray-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
          aria-label="Open Indy Assistant"
        >
          {isPanelOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </button>
        
        {/* Notification Badge */}
        {!isPanelOpen && messages.length > 0 && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {messages.length > 9 ? '9+' : messages.length}
          </div>
        )}
      </div>

      {/* Slide-out Panel */}
      <div className={`fixed inset-y-0 right-0 z-40 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isPanelOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Indy Assistant</h3>
              <p className="text-xs text-gray-600">
                {selectedBlock ? `Editing ${selectedBlock.blockType} block` : 'Create & edit blocks'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPanelOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Block Context Info */}
        {selectedBlock && (
          <div className="p-3 bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-yellow-800">
                Selected: {selectedBlock.blockType} block
              </span>
              <button
                onClick={() => setSelectedBlock(null)}
                className="ml-auto p-1 hover:bg-yellow-100 rounded text-yellow-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Describe changes to update this block
            </p>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-600 text-sm">
                Hi! I'm Indy, your AI assistant.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                {selectedBlock 
                  ? "Tell me how to update the selected block"
                  : "Tell me what kind of block you'd like to create"}
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
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
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
              disabled={isLoading}
              placeholder={selectedBlock ? "Describe changes..." : "Describe what you want to create..."}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => clearMessages()}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              Clear Chat
            </button>
            {blocks.length > 0 && (
              <button
                onClick={() => setSelectedBlock(null)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
              >
                Deselect Block
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isPanelOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={() => setIsPanelOpen(false)}
        />
      )}
    </>
  );
};
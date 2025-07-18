import React, { useState, useRef, useEffect } from 'react';
import { useBlocksStore } from '../store/blocksStore';
import { createOpenAIClient, isOpenAIConfigured } from '../ai/client';
import { functionDefinitions, type IndyFunctionName } from '../ai/indyFunctions';
import { blockRegistry } from '../blocks';
import { summariseBlockSchemaForAI } from '../blocks/utils/summariseBlockSchemaForAI';

/**
 * Indy Chat Panel Component
 * 
 * Provides a chat interface for users to interact with Indy AI assistant
 * Features:
 * - Real-time chat messaging with Indy
 * - Block context awareness
 * - API-based integration with property agent system
 * - Auto-scrolling chat history
 * - Loading states and error handling
 */

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    action?: any;
    confidence?: number;
  };
}

// Configuration constants
const MAX_CONVERSATION_TURNS = 10; // Maximum number of user/assistant pairs to keep in history

export const IndyChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m Indy, your AI assistant. I can help you update content, adjust layouts, change colors, and more. Just tell me what you\'d like to do!',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { selectedIndex, blocks } = useBlocksStore();
  
  // Chat history for maintaining conversation context
  const [chatHistory, setChatHistory] = useState([
    { role: 'system', content: "You're Indy, a helpful assistant for editing CMS pages." }
  ]);
  
  const selectedBlock = selectedIndex !== null ? blocks[selectedIndex] : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Add user message to UI
    const userMessageObj: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessageObj]);

    try {
      // Check if OpenAI is configured
      if (!isOpenAIConfigured()) {
        throw new Error('OpenAI is not configured. Please set OPENAI_API_KEY environment variable.');
      }

      // Append user message to chat history
      const newHistory = [
        ...chatHistory,
        { role: 'user', content: userMessage }
      ];

      // Add current block context if available
      const contextMessages = [...newHistory];
      if (selectedIndex !== null && blocks[selectedIndex]) {
        const currentBlock = blocks[selectedIndex];
        const blockEntry = blockRegistry[currentBlock.blockType];
        
        if (blockEntry && blockEntry.schema) {
          const blockSummary = summariseBlockSchemaForAI(blockEntry.schema, {
            includeHints: true,
            includeDefaults: true,
            includeEnums: true
          });
          
          const currentDataSummary = JSON.stringify(currentBlock.blockData, null, 2);
          
          contextMessages.push({
            role: 'system',
            content: `Current block is of type "${currentBlock.blockType}".

Schema: ${blockSummary}

Current Data: ${currentDataSummary}

Context: Currently selected block: ${currentBlock.blockType} at index ${selectedIndex}

You can manipulate blocks using the provided functions. When users ask to modify content, use updateBlock. When they want to add new sections, use addBlock. When they want to remove content, use deleteBlock. When they want to save changes, use savePage.`
          });
        }
      } else {
        contextMessages.push({
          role: 'system',
          content: `Context: No block selected. Available blocks: ${blocks.map((b, i) => `${i}: ${b.blockType}`).join(', ')}

You can manipulate blocks using the provided functions. When users ask to modify content, use updateBlock. When they want to add new sections, use addBlock. When they want to remove content, use deleteBlock. When they want to save changes, use savePage.`
        });
      }

      // Call OpenAI with function calling
      const client = await createOpenAIClient();
      const response = await client.chat.completions.create({
        model: "gpt-4-0613",
        messages: contextMessages,
        functions: functionDefinitions,
        function_call: "auto",
        temperature: 0.7,
        max_tokens: 1000
      });

      const assistantMessage = response.choices[0].message;
      let reply: string;

      // Handle function call or regular message
      if (assistantMessage.function_call) {
        const functionName = assistantMessage.function_call.name as IndyFunctionName;
        const args = JSON.parse(assistantMessage.function_call.arguments || '{}');
        
        // Execute the function
        reply = await executeFunction(functionName, args);
      } else {
        reply = assistantMessage.content || "I'm not sure how to help with that.";
      }

      // Update chat history with assistant response
      // Prevent token overload by trimming old conversation pairs
      setChatHistory(prev => {
        const updatedHistory = [
          ...newHistory,
          { role: 'assistant', content: reply }
        ];
        
        return trimChatHistory(updatedHistory, MAX_CONVERSATION_TURNS);
      });
      
      // Add assistant response to UI
      const assistantMessageObj: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: reply,
        timestamp: new Date(),
        metadata: {
          confidence: 0.9
        }
      };
      setMessages(prev => [...prev, assistantMessageObj]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          errorMessage = 'Rate limit exceeded. Please try again in a moment.';
        } else if (error.message.includes('insufficient_quota')) {
          errorMessage = 'API quota exceeded. Please check your OpenAI billing.';
        } else if (error.message.includes('invalid_api_key')) {
          errorMessage = 'Invalid API key. Please check your OpenAI configuration.';
        } else {
          errorMessage = error.message;
        }
      }
      
      const errorMessageObj: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ Error: ${errorMessage}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChatHistory = () => {
    setChatHistory([
      { role: 'system', content: "You're Indy, a helpful assistant for editing CMS pages." }
    ]);
    setMessages([
      {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Chat history cleared! I\'m ready to help you with your CMS pages.',
        timestamp: new Date()
      }
    ]);
  };

  // Helper function to trim chat history and prevent token overload
  const trimChatHistory = (history: Array<{ role: string; content: string }>, maxTurns: number = MAX_CONVERSATION_TURNS) => {
    // If we exceed the limit, trim oldest user/assistant pairs (keep system message)
    if (history.length > maxTurns * 2 + 1) { // +1 for system message
      const systemMessage = history[0]; // Always keep system message
      const trimmed = history.slice(-(maxTurns * 2)); // Keep last N turns (user+assistant pairs)
      const result = [systemMessage, ...trimmed];
      
      console.log(`🧹 Trimmed chat history: ${history.length} → ${result.length} messages (keeping last ${maxTurns} turns)`);
      return result;
    }
    
    return history;
  };

  const executeFunction = async (functionName: IndyFunctionName, args: any): Promise<string> => {
    const { addBlock, updateBlock, deleteBlock } = useBlocksStore.getState();

    switch (functionName) {
      case 'updateBlock':
        const { index, updates } = args;
        
        if (index < 0 || index >= blocks.length) {
          return `❌ Invalid block index ${index}. Available blocks: 0-${blocks.length - 1}`;
        }
        
        updateBlock(index, updates);
        return `✅ Updated block ${index} (${blocks[index].blockType}).`;

      case 'addBlock':
        const { type, props, position } = args;
        
        const blockId = addBlock(type, props);
        const newIndex = blocks.length; // Will be added at the end
        
        return `✅ Added new ${type} block at position ${newIndex}.`;

      case 'deleteBlock':
        const { index: deleteIndex } = args;
        
        if (deleteIndex < 0 || deleteIndex >= blocks.length) {
          return `❌ Invalid block index ${deleteIndex}. Available blocks: 0-${blocks.length - 1}`;
        }
        
        const deletedBlockType = blocks[deleteIndex].blockType;
        deleteBlock(deleteIndex);
        
        return `🗑️ Deleted ${deletedBlockType} block at index ${deleteIndex}.`;

      case 'savePage':
        return await savePageToDatabase();

      default:
        return `⚠️ Unknown function: ${functionName}`;
    }
  };

  const savePageToDatabase = async (): Promise<string> => {
    try {
      // Get current entry context from URL
      const currentPath = window.location.pathname;
      const pathParts = currentPath.split('/');
      
      // Extract site and entry slugs from URL (assuming /edit/siteSlug/entrySlug format)
      if (pathParts.length < 4 || pathParts[1] !== 'edit') {
        return '⚠️ Unable to determine page context for saving.';
      }
      
      const siteSlug = pathParts[2];
      const entrySlug = pathParts[3];
      
      // Prepare payload
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
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">I</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Indy AI</h3>
              <p className="text-sm text-gray-600">Your intelligent design assistant</p>
            </div>
          </div>
          
          <button
            onClick={clearChatHistory}
            className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-white rounded-md transition-colors"
            title="Clear chat history"
          >
            Clear
          </button>
        </div>
        
        {selectedBlock && (
          <div className="mt-3 px-3 py-2 bg-white rounded-md border border-blue-200">
            <p className="text-xs text-blue-700">
              <span className="font-medium">Editing:</span> {selectedBlock.blockType} block
            </p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
                {message.metadata?.confidence && (
                  <span className="ml-2">
                    ({Math.round(message.metadata.confidence * 100)}% confidence)
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <p className="text-sm">Indy is thinking...</p>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Indy to make changes... (e.g., 'make this full width', 'change the title to...', 'add more padding')"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              !inputValue.trim() || isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};


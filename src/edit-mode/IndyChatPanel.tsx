import React, { useState, useRef, useEffect } from 'react';
import { useBlocksStore } from '../store/blocksStore';
import { setNestedValue } from '../blocks/shared/property-mappings';

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
  const { selectedIndex, blocks, updateBlock } = useBlocksStore();
  
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

    // Add user message
    const userMessageObj: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessageObj]);

    try {
      // Call the API instead of running the action directly
      const response = await fetch('/api/indy/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: userMessage,
          blockId: selectedBlock?.id,
          blockType: selectedBlock?.blockType,
          blockData: selectedBlock?.blockData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process request');
      }

      const result = await response.json();
      
      let assistantMessage: string;
      let confidence: number = 0;

      if (result.success) {
        const action = result.action;
        
        if (action.type === 'PROPERTY_UPDATE') {
          // Handle property updates
          const changes = action.propertyChanges || [];
          if (changes.length === 1) {
            const change = changes[0];
            assistantMessage = `✅ Updated ${getPropertyDisplayName(change.property)} to "${change.newValue}"`;
            confidence = change.intent?.confidence || 0.9;
          } else {
            assistantMessage = `✅ Updated ${changes.length} properties successfully`;
            confidence = 0.9;
          }
          
          // Apply the property changes to the blockStore for live preview
          if (result.action.data && selectedBlock && selectedIndex !== null) {
            // Apply the changes to get updated block data
            let updatedBlockData = JSON.parse(JSON.stringify(selectedBlock.blockData));
            for (const change of changes) {
              setNestedValue(updatedBlockData, change.property, change.newValue);
            }
            
            updateBlock(selectedIndex, updatedBlockData);
          }
        } else {
          // Handle content updates
          assistantMessage = '✅ Content updated successfully!';
          confidence = 0.8;
        }
      } else {
        assistantMessage = '❌ Sorry, I couldn\'t complete that request. Please try rephrasing or be more specific.';
      }

      // Add assistant response
      const assistantMessageObj: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: assistantMessage,
        timestamp: new Date(),
        metadata: {
          action: result.action,
          confidence
        }
      };
      setMessages(prev => [...prev, assistantMessageObj]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">I</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Indy AI</h3>
            <p className="text-sm text-gray-600">Your intelligent design assistant</p>
          </div>
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

/**
 * Get display name for property
 */
function getPropertyDisplayName(property: string): string {
  const parts = property.split('.');
  const lastPart = parts[parts.length - 1];
  
  const displayNames: Record<string, string> = {
    'blockWidth': 'block width',
    'height': 'block height',
    'contentWidth': 'content width',
    'textAlignment': 'text alignment',
    'top': 'top spacing',
    'bottom': 'bottom spacing',
    'left': 'left spacing',
    'right': 'right spacing',
    'color': 'background color',
    'gradient': 'background gradient'
  };
  
  return displayNames[lastPart] || lastPart;
}
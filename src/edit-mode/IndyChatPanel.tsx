import React, { useRef, useEffect } from 'react';
import { useIndyChat } from './hooks/useIndyChat';
import { IndyChatHeader } from './components/IndyChatHeader';
import { IndyMessage } from './components/IndyMessage';
import { IndyChatInput } from './components/IndyChatInput';

/**
 * Indy Chat Panel - Clean Conversational UI Component
 * 
 * This component focuses purely on conversational UI concerns:
 * - Rendering chat messages
 * - Managing scroll behavior
 * - Handling user interactions
 * - Delegating all logic to custom hook and sub-components
 * 
 * All business logic, API calls, and state management is handled by:
 * - useIndyChat hook
 * - IndyChatHeader component
 * - IndyMessage component
 * - IndyChatInput component
 */
export const IndyChatPanel: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    messages, 
    isLoading, 
    config, 
    sendMessage, 
    clearHistory, 
    updateConfig 
  } = useIndyChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle follow-up question clicks
  const handleFollowUpClick = (question: string) => {
    sendMessage(question);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <IndyChatHeader
        config={config}
        onConfigChange={updateConfig}
        onClearHistory={clearHistory}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <IndyMessage
            key={message.id}
            message={message}
            onFollowUpClick={handleFollowUpClick}
          />
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm">Indy is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <IndyChatInput
        onSendMessage={sendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};


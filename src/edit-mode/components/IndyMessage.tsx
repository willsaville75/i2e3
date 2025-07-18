import React from 'react';
import { IndyMessageMetadata } from './IndyMessageMetadata';
import type { ChatMessage } from '../hooks/useIndyChat';

interface IndyMessageProps {
  message: ChatMessage;
  onFollowUpClick: (question: string) => void;
}

export const IndyMessage: React.FC<IndyMessageProps> = ({ message, onFollowUpClick }) => {
  return (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        message.type === 'user' 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        <p className="text-sm">{message.content}</p>
        
        {/* Enhanced Message Metadata */}
        {message.metadata && message.type === 'assistant' && (
          <IndyMessageMetadata 
            metadata={message.metadata}
            onFollowUpClick={onFollowUpClick}
          />
        )}
      </div>
    </div>
  );
}; 
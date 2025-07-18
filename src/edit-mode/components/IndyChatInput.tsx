import React, { useState } from 'react';
import { useBlocksStore } from '../../store/blocksStore';

interface IndyChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const IndyChatInput: React.FC<IndyChatInputProps> = ({ 
  onSendMessage, 
  isLoading 
}) => {
  const [inputValue, setInputValue] = useState('');
  const { selectedIndex, blocks } = useBlocksStore();

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;
    
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask Indy anything... I'm super intelligent and context-aware!"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !inputValue.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      
      {/* Context indicator */}
      {selectedIndex !== null && (
        <div className="mt-2 text-xs text-gray-600">
          Currently editing: {blocks[selectedIndex]?.blockType} block
        </div>
      )}
    </div>
  );
}; 
import React from 'react';
import { motion } from 'framer-motion';
import { ChatContent } from './ChatContent';
import { ChatInput } from './ChatInput';
import { useIndyChat } from '../hooks/useIndyChat';

interface ChatBubblePopupProps {
  onClose: () => void;
  onExpand: () => void;
}

export const ChatBubblePopup: React.FC<ChatBubblePopupProps> = ({ 
  onClose, 
  onExpand 
}) => {
  const { sendMessage, isLoading } = useIndyChat();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        opacity: { duration: 0.2 }
      }}
      className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-xl border border-gray-200 z-[9999] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <span className="font-medium text-sm">Indy AI Assistant</span>
        </div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={onExpand}
            className="hover:bg-white/20 p-1 rounded text-white/80 hover:text-white"
            title="Expand to sidebar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          <button 
            onClick={onClose}
            className="hover:bg-white/20 p-1 rounded text-white/80 hover:text-white"
            title="Close chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        <ChatContent />
      </div>

      {/* Input */}
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
    </motion.div>
  );
}; 
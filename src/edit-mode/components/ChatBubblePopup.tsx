import React from 'react';
import { motion } from 'framer-motion';
import { ChatContent } from './ChatContent';
import { ChatInput } from './ChatInput';
import { useIndyChat } from '../hooks/useIndyChat';
import { ChatBubbleOvalLeftEllipsisIcon, ArrowsPointingOutIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
            <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4" />
          </div>
          <span className="font-medium text-sm">Indy AI Assistant</span>
        </div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={onExpand}
            className="hover:bg-white/20 p-1 rounded text-white/80 hover:text-white"
            title="Expand to sidebar"
          >
            <ArrowsPointingOutIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="hover:bg-white/20 p-1 rounded text-white/80 hover:text-white"
            title="Close chat"
          >
            <XMarkIcon className="w-4 h-4" />
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
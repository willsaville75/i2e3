import React from 'react';
import { motion } from 'framer-motion';
import { ChatContent } from './ChatContent';
import { ChatInput } from './ChatInput';
import { useIndyChat } from '../hooks/useIndyChat';
import { ChatBubbleOvalLeftEllipsisIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ChatSidebarProps {
  onClose: () => void;
  onMinimize: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  onClose, 
  onMinimize 
}) => {
  const { sendMessage, isLoading } = useIndyChat();

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        opacity: { duration: 0.2 }
      }}
      className="fixed top-16 bottom-4 right-4 w-[450px] bg-white shadow-xl rounded-2xl overflow-hidden z-[9999] flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold">Indy AI Assistant</h2>
            <p className="text-xs text-white/80">Your content creation partner</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onMinimize}
            className="hover:bg-white/20 p-2 rounded text-white/80 hover:text-white"
            title="Minimize to bubble"
          >
            <MinusIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded text-white/80 hover:text-white"
            title="Close chat"
          >
            <XMarkIcon className="w-5 h-5" />
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
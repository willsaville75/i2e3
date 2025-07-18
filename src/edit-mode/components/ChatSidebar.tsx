import React from 'react';
import { motion } from 'framer-motion';
import { ChatContent } from './ChatContent';
import { ChatInput } from './ChatInput';
import { useIndyChat } from '../hooks/useIndyChat';

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
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-y-0 right-0 w-[450px] bg-white shadow-xl border-l border-gray-200 z-[9999] flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
            </svg>
          </button>
          <button 
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded text-white/80 hover:text-white"
            title="Close chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
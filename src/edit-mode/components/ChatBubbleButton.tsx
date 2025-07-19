import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface ChatBubbleButtonProps {
  onClick: () => void;
  hasNewMessages?: boolean;
}

export const ChatBubbleButton: React.FC<ChatBubbleButtonProps> = ({ 
  onClick, 
  hasNewMessages = false 
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <motion.button
        onClick={onClick}
        className="relative w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center justify-center group ring-2 ring-purple-400/30 ring-offset-2 ring-offset-transparent"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Notification badge */}
        {hasNewMessages && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center z-10">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
        
        {/* Sparkles icon */}
        <SparklesIcon 
          className="w-8 h-8 text-white relative z-10" 
        />
      </motion.button>
    </div>
  );
}; 
import React from 'react';
import { motion } from 'framer-motion';

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
        
        {/* Custom Sparkles outline icon */}
        <svg 
          className="w-8 h-8 text-white relative z-10" 
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
          />
        </svg>
      </motion.button>
    </div>
  );
}; 
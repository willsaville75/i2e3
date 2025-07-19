import React from 'react';
import { ChatMessage } from '../../store/indyChatStore';
import { motion } from 'framer-motion';
import { getIcon } from '../../blocks/shared/icons';
import type { IconTokenPath } from '../../blocks/shared/icons';

interface IndyMessageProps {
  message: ChatMessage;
  isLatest?: boolean;
}

export const IndyMessage: React.FC<IndyMessageProps> = ({ message, isLatest }) => {
  const isUser = message.role === 'user';
  const metadata = message.metadata;
  const status = metadata?.status;
  
  // Get icon based on status
  const getStatusIcon = () => {
    if (!metadata?.icon) return null;
    const IconComponent = getIcon(metadata.icon as IconTokenPath);
    if (!IconComponent) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          rotate: status === 'processing' || status === 'streaming' ? 360 : 0
        }}
        transition={{ 
          duration: status === 'processing' || status === 'streaming' ? 2 : 0.3,
          repeat: status === 'processing' || status === 'streaming' ? Infinity : 0,
          ease: "linear"
        }}
        className="mr-2"
      >
        {React.createElement(IconComponent as any, { className: "w-5 h-5 text-purple-500" })}
      </motion.div>
    );
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`
          max-w-[80%] p-4 rounded-lg
          ${isUser 
            ? 'bg-purple-600 text-white' 
            : 'bg-zinc-700 text-zinc-100'
          }
          ${status === 'streaming' ? 'border-2 border-purple-500 border-opacity-50' : ''}
        `}
      >
        {/* Status indicator for AI messages */}
        {!isUser && status && (
          <div className="flex items-center mb-2 text-sm text-zinc-400">
            {getStatusIcon()}
            <span className="capitalize">{status}</span>
            {metadata?.agent && (
              <span className="ml-2 text-xs">• {metadata.agent}</span>
            )}
          </div>
        )}
        
        {/* Message content */}
        <div className="prose prose-invert max-w-none">
          {message.content.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < message.content.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
        
        {/* Timing info */}
        {metadata?.timing && (
          <div className="mt-2 text-xs text-zinc-400">
            Completed in {(metadata.timing.totalMs / 1000).toFixed(1)}s
          </div>
        )}
        
        {/* Streaming indicator */}
        {status === 'streaming' && isLatest && (
          <motion.div
            className="mt-2 flex space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-purple-400 rounded-full"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}; 
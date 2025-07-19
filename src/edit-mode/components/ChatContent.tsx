import React, { useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getContentType } from '../../utils/markdownUtils';
import { useIndyChat } from '../hooks/useIndyChat';
import { useVoiceIntegration } from './useVoiceIntegration';
import { motion } from 'framer-motion';
import { getIcon } from '../../blocks/shared/icons';
import type { IconTokenPath } from '../../blocks/shared/icons';

export const ChatContent: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    messages, 
    isLoading, 
    sendMessage
  } = useIndyChat();

  const { toggleMessageAudio } = useVoiceIntegration();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle follow-up question clicks
  const handleFollowUpClick = (question: string) => {
    sendMessage(question);
  };

  // Helper function to check if a message has completed actions
  const hasCompletedActions = (message: any) => {
    return message.type === 'assistant' && 
           message.metadata?.action;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Messages Area - Scrollable */}
      <div className="flex-1 p-3 overflow-y-auto overflow-x-hidden">
        <div className="space-y-3">
          {messages.map((message, index) => {
            const isUser = message.type === 'user';
            const hasActions = hasCompletedActions(message);
            const status = message.metadata?.status;
            const isLatest = index === messages.length - 1;
            
            // Get status icon
            const getStatusIcon = () => {
              if (!message.metadata?.icon) return null;
              const IconComponent = getIcon(message.metadata.icon as IconTokenPath);
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
                  className="inline-block mr-2"
                >
                  {React.createElement(IconComponent as any, { className: "w-4 h-4 text-purple-500" })}
                </motion.div>
              );
            };
            
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`${isUser ? 'ml-auto' : ''} max-w-[85%]`}
              >
                <div
                  className={`rounded-2xl px-4 py-2 relative group ${
                    isUser
                      ? 'bg-purple-100 ml-auto'
                      : hasActions
                      ? 'bg-green-50 border border-green-200'
                      : status === 'streaming'
                      ? 'bg-purple-50 border border-purple-300'
                      : 'bg-gray-100'
                  }`}
                >
                  {/* Status indicator for streaming messages */}
                  {!isUser && status && (
                    <div className="flex items-center mb-2 text-xs text-gray-600">
                      {getStatusIcon()}
                      <span className="capitalize">{status}</span>
                      {message.metadata?.agent && (
                        <span className="ml-2">• {message.metadata.agent}</span>
                      )}
                    </div>
                  )}
                  
                  {(() => {
                    // Safety check: ensure content is a string
                    let content: string = message.content;
                    if (typeof content !== 'string') {
                      console.warn('Message content is not a string:', content);
                      if (content && typeof content === 'object') {
                        // If it's an object, try to extract meaningful text
                        const contentObj = content as any;
                        if (contentObj.success !== undefined) {
                          content = contentObj.success ? (contentObj.message || 'Action completed') : (`Error: ${contentObj.error || 'Unknown error'}`);
                        } else {
                          content = JSON.stringify(content);
                        }
                      } else {
                        content = String(content || 'Empty message');
                      }
                    }
                    
                    // Determine content type: html, markdown, or text
                    const contentType = getContentType(content);
                    
                    switch (contentType) {
                      case 'html':
                        return (
                          <div 
                            className="text-sm break-words whitespace-pre-wrap overflow-wrap-anywhere"
                            dangerouslySetInnerHTML={{ __html: content }}
                          />
                        );
                      
                      case 'markdown':
                        return (
                          <div className="text-sm break-words overflow-wrap-anywhere prose prose-sm max-w-none [&_li>p]:inline [&_li>p]:m-0">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => (
                                  <div className="mb-2 last:mb-0 whitespace-pre-wrap overflow-wrap-anywhere">
                                    {children}
                                  </div>
                                ),
                                code: ({ children, className }) => {
                                  const isInline = !className;
                                  return isInline ? (
                                    <code className="bg-gray-100 text-purple-600 px-1 py-0.5 rounded text-xs font-mono">
                                      {children}
                                    </code>
                                  ) : (
                                    <code className={className}>
                                      {children}
                                    </code>
                                  );
                                },
                                pre: ({ children }) => (
                                  <pre className="bg-gray-100 border border-gray-200 rounded p-2 mb-2 overflow-x-auto">
                                    {children}
                                  </pre>
                                ),
                                a: ({ children, href }) => (
                                  <a 
                                    href={href}
                                    className="text-purple-600 hover:text-purple-700 underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {children}
                                  </a>
                                ),
                                ul: ({ children }) => (
                                  <ul className="list-disc list-inside mb-2 space-y-1">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal list-inside mb-2 space-y-1">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li className="text-sm">
                                    {children}
                                  </li>
                                ),
                                h1: ({ children }) => (
                                  <h1 className="text-lg font-bold mb-2">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-base font-semibold mb-2">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-sm font-semibold mb-1">
                                    {children}
                                  </h3>
                                ),
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-4 border-purple-300 pl-3 italic text-gray-700 mb-2">
                                    {children}
                                  </blockquote>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold">
                                    {children}
                                  </strong>
                                ),
                                em: ({ children }) => (
                                  <em className="italic">
                                    {children}
                                  </em>
                                )
                              }}
                            >
                              {content}
                            </ReactMarkdown>
                          </div>
                        );
                      
                      default:
                        return (
                          <div className="text-sm break-words whitespace-pre-wrap overflow-wrap-anywhere">
                            {content}
                          </div>
                        );
                    }
                  })()}
                  
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
                  
                  {/* Follow-up questions */}
                  {message.metadata?.followUpQuestions && message.metadata.followUpQuestions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Quick questions:</div>
                      {message.metadata.followUpQuestions.map((question: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => handleFollowUpClick(question)}
                          className="block w-full text-left text-xs text-purple-600 hover:text-purple-700 mb-1 hover:bg-purple-50 p-1 rounded"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Speak button for assistant messages */}
                  {!isUser && (
                    <button 
                      className="opacity-0 group-hover:opacity-100 absolute -top-2 -right-2 w-6 h-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
                      onClick={() => toggleMessageAudio(message.content)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.59-.71-1.59-1.59V9.84c0-.88.71-1.59 1.59-1.59h2.24Z" />
                      </svg>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="bg-gray-100 rounded-lg p-3 max-w-xs flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
              <span className="text-sm text-gray-700">Indy is thinking...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}; 
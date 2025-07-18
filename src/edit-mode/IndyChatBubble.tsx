import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatBubbleButton } from './components/ChatBubbleButton';
import { ChatBubblePopup } from './components/ChatBubblePopup';
import { ChatSidebar } from './components/ChatSidebar';

type ChatMode = 'minimized' | 'bubble' | 'sidebar';

interface IndyChatBubbleProps {
  // Props can be added here when needed
}

export const IndyChatBubble: React.FC<IndyChatBubbleProps> = () => {
  const [mode, setMode] = useState<ChatMode>('minimized');
  const [hasNewMessages, setHasNewMessages] = useState(false);

  // Debug logging
  console.log('🎯 IndyChatBubble rendered, mode:', mode);

  useEffect(() => {
    console.log('🎯 IndyChatBubble mounted');
    return () => {
      console.log('🎯 IndyChatBubble unmounted');
    };
  }, []);

  const handleOpenChat = () => {
    console.log('🎯 Opening chat');
    setMode('bubble');
    setHasNewMessages(false);
  };

  const handleCloseChat = () => {
    console.log('🎯 Closing chat');
    setMode('minimized');
  };

  const handleExpandToSidebar = () => {
    console.log('🎯 Expanding to sidebar');
    setMode('sidebar');
  };

  const handleMinimizeToBubble = () => {
    console.log('🎯 Minimizing to bubble');
    setMode('bubble');
  };

  return (
    <>
      {/* Floating Button (always visible when minimized) */}
      {mode === 'minimized' && (
        <ChatBubbleButton 
          onClick={handleOpenChat}
          hasNewMessages={hasNewMessages}
        />
      )}

      {/* Bubble Popup */}
      <AnimatePresence>
        {mode === 'bubble' && (
          <ChatBubblePopup
            onClose={handleCloseChat}
            onExpand={handleExpandToSidebar}
          />
        )}
      </AnimatePresence>

      {/* Full Sidebar */}
      <AnimatePresence>
        {mode === 'sidebar' && (
          <ChatSidebar
            onClose={handleCloseChat}
            onMinimize={handleMinimizeToBubble}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// Export for use in EditLayout
export default IndyChatBubble; 
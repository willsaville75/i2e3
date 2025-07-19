import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatBubbleButton } from './components/ChatBubbleButton';
import { ChatBubblePopup } from './components/ChatBubblePopup';
import { ChatSidebar } from './components/ChatSidebar';
import { useBlocksStore } from '../store/blocksStore';
import { useIndyChat } from './hooks/useIndyChat';
import { useIndyChatStore } from '../store/indyChatStore';
import { runSchemaPresenterAgent } from '../indy/agents/schemaPresenterAgent';

type ChatMode = 'minimized' | 'bubble' | 'sidebar';

interface IndyChatBubbleProps {
  // Props can be added here when needed
}

export const IndyChatBubble: React.FC<IndyChatBubbleProps> = () => {
  const [mode, setMode] = useState<ChatMode>('minimized');
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const { selectedIndex, blocks } = useBlocksStore();
  const { addSystemMessage } = useIndyChat();
  const { setSchemaNavigation } = useIndyChatStore();

  // Debug logging
  console.log('🎯 IndyChatBubble rendered, mode:', mode);

  useEffect(() => {
    console.log('🎯 IndyChatBubble mounted');
    
    // Add welcome message if chat is empty
    const { messages } = useIndyChatStore.getState();
    if (messages.length === 0) {
      addSystemMessage("Hi! I'm Indy, your AI assistant. Click on any block to see what you can change, or just tell me what you'd like to do!");
    }
    
    return () => {
      console.log('🎯 IndyChatBubble unmounted');
    };
  }, [addSystemMessage]);


  // Listen for block selection changes
  useEffect(() => {
    console.log('🎯 Block selection effect - selectedIndex:', selectedIndex, 'lastSelectedIndex:', lastSelectedIndex);
    
    if (selectedIndex !== null && selectedIndex >= 0 && blocks[selectedIndex] && selectedIndex !== lastSelectedIndex) {
      const selectedBlock = blocks[selectedIndex];
      console.log('🎯 Block selected in Indy:', selectedBlock);
      
      // Update last selected index
      setLastSelectedIndex(selectedIndex);
      
      // Get block type
      const blockType = selectedBlock.blockType || 'hero';
      
      // Initialize schema navigation state
      setSchemaNavigation({
        currentPath: [],
        blockType,
        selectedBlockData: selectedBlock.blockData
      });
      
      // Open chat first
      setMode('bubble');
      setHasNewMessages(true);
      
      // Use the schema presenter agent with initial navigation state
      runSchemaPresenterAgent({
        blockType,
        selectedBlock: selectedBlock.blockData,
        navigationPath: []
      }).then(response => {
        // Add the formatted message from the agent
        addSystemMessage(response.message);
      }).catch(error => {
        console.error('Error running schema presenter agent:', error);
        // Fallback message
        addSystemMessage(`I can see you've selected the ${blockType} block. What would you like to change?`);
      });
    }
  }, [selectedIndex, blocks, addSystemMessage, lastSelectedIndex, setSchemaNavigation]);

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
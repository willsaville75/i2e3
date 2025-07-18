import { useState, useCallback, useEffect } from 'react';
import { useBlocksStore } from '../../store/blocksStore';
import { createDefaultBlockData } from '../../ai/indyFunctions';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    action?: any;
    confidence?: number;
    agentUsed?: string;
    classification?: {
      primaryIntent: string;
      reasoning: string;
      strategy?: string;
    };
    explanation?: string;
    proactiveSuggestions?: Array<{
      title: string;
      description: string;
      example: string;
      category: string;
      confidence: number;
    }>;
    contextualTips?: string[];
    actionSummary?: string;
    followUpQuestions?: string[];
  };
}

export interface IndyChatConfig {
  useEnhancedClassification: boolean;
  useSuperIntelligence: boolean;
  sessionId: string;
}

export interface UseIndyChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  config: IndyChatConfig;
  sendMessage: (message: string) => Promise<void>;
  clearHistory: () => void;
  updateConfig: (updates: Partial<IndyChatConfig>) => void;
  setInputValue: (value: string) => void;
}

const SESSION_ID = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Singleton state for chat
let sharedMessages: ChatMessage[] = [
  {
    id: '1',
    type: 'assistant',
    content: 'Hi! I\'m Indy, your super intelligent AI assistant. I can help you update content, adjust layouts, change colors, and more. I learn from our conversations to provide better, more personalized assistance!',
    timestamp: new Date()
  }
];
let sharedIsLoading = false;
let sharedConfig: IndyChatConfig = {
  useEnhancedClassification: false,
  useSuperIntelligence: false,
  sessionId: SESSION_ID
};

// Listeners for state changes
const listeners = new Set<() => void>();

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export const useIndyChat = (): UseIndyChatReturn => {
  const { selectedIndex, blocks } = useBlocksStore();
  
  // Force re-render when shared state changes
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const sendMessage = useCallback(async (userMessage: string) => {
    try {
      console.log('🎯 useIndyChat.sendMessage called with:', userMessage);
      if (!userMessage.trim() || sharedIsLoading) return;

      sharedIsLoading = true;
      notifyListeners(); // Notify listeners to re-render

      // Add user message
      const userMessageObj: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: userMessage,
        timestamp: new Date()
      };
      sharedMessages = [...sharedMessages, userMessageObj];
      notifyListeners(); // Notify listeners to re-render

      try {
        // Prepare API request
        const requestBody = {
          userInput: userMessage,
          sessionId: sharedConfig.sessionId,
          blockId: selectedIndex !== null ? blocks[selectedIndex]?.id : undefined,
          blockType: selectedIndex !== null ? blocks[selectedIndex]?.blockType : undefined,
          blockData: selectedIndex !== null ? blocks[selectedIndex]?.blockData : undefined,
          pageContext: {
            title: document.title,
            totalBlocks: blocks.length,
            route: window.location.pathname
          },
          useEnhancedClassification: sharedConfig.useEnhancedClassification,
          useSuperIntelligence: sharedConfig.useSuperIntelligence
        };

        // Call API
        console.log('📤 Sending request to API:', requestBody);
        const response = await fetch('/api/indy/action', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const result = await response.json();
        console.log('📥 Received response from API:', result);
        
        // Process response
        const { reply, metadata } = processApiResponse(result);
        
        // Handle block updates
        handleBlockUpdates(result);

        // Add assistant response
        const assistantMessageObj: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: reply,
          timestamp: new Date(),
          metadata
        };
        sharedMessages = [...sharedMessages, assistantMessageObj];
        notifyListeners(); // Notify listeners to re-render

      } catch (error) {
        console.error('Error sending message:', error);
        
        const errorMessage = getErrorMessage(error);
        const errorMessageObj: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `❌ Error: ${errorMessage}`,
          timestamp: new Date()
        };
        sharedMessages = [...sharedMessages, errorMessageObj];
        notifyListeners(); // Notify listeners to re-render
      } finally {
        sharedIsLoading = false;
        notifyListeners(); // Notify listeners to re-render
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      const errorMessage = getErrorMessage(error);
      const errorMessageObj: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ Error: ${errorMessage}`,
        timestamp: new Date()
      };
      sharedMessages = [...sharedMessages, errorMessageObj];
      notifyListeners(); // Notify listeners to re-render
    }
  }, [selectedIndex, blocks]);

  const clearHistory = useCallback(() => {
    sharedMessages = [
      {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Chat history cleared! I\'m ready to help you with your CMS pages.',
        timestamp: new Date()
      }
    ];
    notifyListeners(); // Notify listeners to re-render
  }, []);

  const updateConfig = useCallback((updates: Partial<IndyChatConfig>) => {
    sharedConfig = { ...sharedConfig, ...updates };
    notifyListeners(); // Notify listeners to re-render
  }, []);

  const setInputValue = useCallback((_value: string) => {
    // This will be handled by the UI component
    // Included here for interface completeness
  }, []);

  return {
    messages: sharedMessages,
    isLoading: sharedIsLoading,
    config: sharedConfig,
    sendMessage,
    clearHistory,
    updateConfig,
    setInputValue
  };
};

// Helper functions
function processApiResponse(result: any): { reply: string; metadata: ChatMessage['metadata'] } {
  let reply: string;
  let metadata: ChatMessage['metadata'] = {};

  // Defensive programming: ensure result is an object
  if (!result || typeof result !== 'object') {
    console.warn('Invalid API response:', result);
    return { 
      reply: 'Received invalid response from server', 
      metadata: {} 
    };
  }

  // Handle case where result has success/error structure
  if (result.success !== undefined) {
    if (result.success) {
      // Check if this is a block creation/update response
      if (result.action?.type === 'UPDATE_BLOCK' || result.action?.type === 'ADD_BLOCK') {
        reply = result.message || `✅ Successfully ${result.action.type === 'ADD_BLOCK' ? 'created' : 'updated'} the block!`;
        
        // Extract block details for the message if available
        if (result.action.data) {
          const blockType = result.action.blockType || 'block';
          reply = `✅ Successfully ${result.action.type === 'ADD_BLOCK' ? 'created' : 'updated'} a ${blockType}! The content has been added to your page.`;
        }
      } else {
        reply = result.message || 'Action completed successfully';
      }
      
      metadata = {
        confidence: result.confidence,
        agentUsed: result.agentUsed,
        classification: result.classification,
        explanation: result.explanation,
        proactiveSuggestions: result.proactiveSuggestions,
        contextualTips: result.contextualTips,
        actionSummary: result.actionSummary,
        followUpQuestions: result.followUpQuestions,
        action: result.action
      };

      if (result.action?.type === 'CONVERSATION') {
        reply = result.message || 'Conversation response received';
      }
    } else {
      reply = `❌ Error: ${result.error || 'Unknown error occurred'}`;
    }
  } else {
    // Handle case where result doesn't have success/error structure
    console.warn('Unexpected API response structure:', result);
    reply = typeof result === 'string' ? result : 'Received unexpected response format';
  }

  // Ensure reply is always a string
  if (typeof reply !== 'string') {
    console.warn('Reply is not a string:', reply);
    // Try to extract a meaningful message from the object
    if (reply && typeof reply === 'object') {
      const replyObj = reply as any;
      if ('message' in replyObj) {
        reply = String(replyObj.message);
      } else if ('error' in replyObj) {
        reply = `Error: ${String(replyObj.error)}`;
      } else {
        reply = 'Action completed successfully';
      }
    } else {
      reply = 'Unable to process response';
    }
  }

  return { reply, metadata };
}

function handleBlockUpdates(result: any): void {
  if (result.action) {
    if (result.action.type === 'UPDATE_BLOCK') {
      const { updateBlock, getBlockIndex } = useBlocksStore.getState();
      
      // Find block by ID if provided, otherwise use selectedIndex
      let targetIndex = null;
      let blockId = null;
      if (result.action.blockId) {
        targetIndex = getBlockIndex(result.action.blockId);
        blockId = result.action.blockId;
      } else {
        const { selectedIndex, blocks } = useBlocksStore.getState();
        targetIndex = selectedIndex;
        if (targetIndex !== null && targetIndex >= 0 && targetIndex < blocks.length) {
          blockId = blocks[targetIndex].id;
        }
      }
      
      if (targetIndex !== null && targetIndex >= 0 && targetIndex < useBlocksStore.getState().blocks.length) {
        console.log('🔄 Updating block via chat:', {
          blockId: result.action.blockId,
          targetIndex,
          blockData: result.action.data
        });
        updateBlock(targetIndex, result.action.data);
        
        // Dispatch custom event for ripple animation on update
        if (blockId) {
          window.dispatchEvent(new CustomEvent('blockUpdated', { 
            detail: { blockId } 
          }));
        }
      } else {
        console.error('❌ Could not find block to update:', {
          blockId: result.action.blockId,
          targetIndex,
          blocksLength: useBlocksStore.getState().blocks.length
        });
      }
    } else if (result.action.type === 'ADD_BLOCK') {
      console.log('🎨 Adding new block via chat:', {
        blockType: result.action.blockType,
        blockData: result.action.data
      });
      const { addBlock } = useBlocksStore.getState();
      const blockData = result.action.data || createDefaultBlockData(result.action.blockType);
      const newBlockId = addBlock(result.action.blockType, blockData);
      console.log('✅ Block added successfully with ID:', newBlockId);
      
      // Dispatch custom event for ripple animation
      window.dispatchEvent(new CustomEvent('blockCreated', { 
        detail: { blockId: newBlockId } 
      }));
      
      // Smooth scroll to the newly created block
      setTimeout(() => {
        const blockElement = document.querySelector(`[data-block-id="${newBlockId}"]`);
        if (blockElement) {
          blockElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest' 
          });
          
          // Note: Highlight effect is now handled by Framer Motion ripple
        } else {
          // Fallback: scroll to bottom where new blocks are typically added
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 600); // Slightly longer delay to ensure animation has started
    }
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('rate limit')) {
      return 'Rate limit exceeded. Please try again in a moment.';
    } else if (error.message.includes('insufficient_quota')) {
      return 'API quota exceeded. Please check your OpenAI billing.';
    } else if (error.message.includes('invalid_api_key')) {
      return 'Invalid API key. Please check your OpenAI configuration.';
    } else {
      return error.message;
    }
  }
  return 'Unknown error occurred';
} 
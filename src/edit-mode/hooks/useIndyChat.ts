import { useState, useCallback } from 'react';
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

export const useIndyChat = (): UseIndyChatReturn => {
  const { selectedIndex, blocks } = useBlocksStore();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m Indy, your super intelligent AI assistant. I can help you update content, adjust layouts, change colors, and more. I learn from our conversations to provide better, more personalized assistance!',
      timestamp: new Date()
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<IndyChatConfig>({
    useEnhancedClassification: false,  // Disabled for speed - use simple classification
    useSuperIntelligence: false,  // Disabled for speed
    sessionId: SESSION_ID
  });

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    setIsLoading(true);

    // Add user message
    const userMessageObj: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessageObj]);

    try {
      // Prepare API request
      const requestBody = {
        userInput: userMessage,
        sessionId: config.sessionId,
        blockId: selectedIndex !== null ? blocks[selectedIndex]?.id : undefined,
        blockType: selectedIndex !== null ? blocks[selectedIndex]?.blockType : undefined,
        blockData: selectedIndex !== null ? blocks[selectedIndex]?.blockData : undefined,
        pageContext: {
          title: document.title,
          totalBlocks: blocks.length,
          route: window.location.pathname
        },
        useEnhancedClassification: config.useEnhancedClassification,
        useSuperIntelligence: config.useSuperIntelligence
      };

      // Call API
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
      setMessages(prev => [...prev, assistantMessageObj]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = getErrorMessage(error);
      const errorMessageObj: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ Error: ${errorMessage}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, config, selectedIndex, blocks]);

  const clearHistory = useCallback(() => {
    setMessages([
      {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Chat history cleared! I\'m ready to help you with your CMS pages.',
        timestamp: new Date()
      }
    ]);
  }, []);

  const updateConfig = useCallback((updates: Partial<IndyChatConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const setInputValue = useCallback((_value: string) => {
    // This will be handled by the UI component
    // Included here for interface completeness
  }, []);

  return {
    messages,
    isLoading,
    config,
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

  if (result.success) {
    reply = result.message || 'Action completed successfully';
    
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

    if (result.type === 'CONVERSATION') {
      reply = result.message;
    }
  } else {
    reply = `❌ Error: ${result.error}`;
  }

  return { reply, metadata };
}

function handleBlockUpdates(result: any): void {
  if (result.action) {
    if (result.action.type === 'UPDATE_BLOCK') {
      const { blocks, updateBlock, getBlockIndex } = useBlocksStore.getState();
      
      // Find block by ID if provided, otherwise use selectedIndex
      let targetIndex = null;
      if (result.action.blockId) {
        targetIndex = getBlockIndex(result.action.blockId);
      } else {
        const { selectedIndex } = useBlocksStore.getState();
        targetIndex = selectedIndex;
      }
      
      if (targetIndex !== null && targetIndex >= 0 && targetIndex < blocks.length) {
        console.log('🔄 Updating block via chat:', {
          blockId: result.action.blockId,
          targetIndex,
          blockData: result.action.data
        });
        updateBlock(targetIndex, result.action.data);
      } else {
        console.error('❌ Could not find block to update:', {
          blockId: result.action.blockId,
          targetIndex,
          blocksLength: blocks.length
        });
      }
    } else if (result.action.type === 'ADD_BLOCK') {
      const { addBlock } = useBlocksStore.getState();
      const blockData = result.action.data || createDefaultBlockData(result.action.blockType);
      addBlock(result.action.blockType, blockData);
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
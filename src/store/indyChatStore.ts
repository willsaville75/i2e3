import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Message interface for chat messages
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  type?: 'user' | 'assistant'; // For compatibility
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

/**
 * Available agent types for selection
 */
export type AgentType = 'block' | 'page' | 'prompt';

/**
 * Schema navigation state
 */
export interface SchemaNavigationState {
  currentPath: string[];
  blockType?: string;
  selectedBlockData?: any;
}

/**
 * Indy chat store state interface
 */
interface IndyChatState {
  // State
  messages: ChatMessage[];
  input: string;
  selectedAgent: AgentType;
  schemaNavigation: SchemaNavigationState | null;
  isLoading: boolean;
  sessionId: string;
  config: {
    useEnhancedClassification: boolean;
    useSuperIntelligence: boolean;
  };
  
  // Actions
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setInput: (value: string) => void;
  setSelectedAgent: (agent: AgentType) => void;
  clearMessages: () => void;
  setSchemaNavigation: (navigation: SchemaNavigationState | null) => void;
  updateSchemaPath: (path: string[]) => void;
  setIsLoading: (loading: boolean) => void;
  updateConfig: (updates: Partial<IndyChatState['config']>) => void;
}

// Generate session ID
const SESSION_ID = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Zustand store for Indy chat functionality
 * 
 * This store manages:
 * - Chat messages between user and assistant
 * - Current input value
 * - Selected agent type for processing
 * - Schema navigation state for guided tours
 * - Loading state
 * - Configuration settings
 * - Persistence across browser sessions
 */
export const useIndyChatStore = create<IndyChatState>()(
  persist(
    (set) => ({
      // Initial state
      messages: [],
      input: '',
      selectedAgent: 'block' as AgentType,
      schemaNavigation: null,
      isLoading: false,
      sessionId: SESSION_ID,
      config: {
        useEnhancedClassification: false,
        useSuperIntelligence: false,
      },
      
      // Actions
      addMessage: (message: ChatMessage) =>
        set((state) => ({
          messages: [...state.messages, message]
        })),
        
      setMessages: (messages: ChatMessage[]) =>
        set({ messages }),
      
      setInput: (value: string) =>
        set({ input: value }),
      
      setSelectedAgent: (agent: AgentType) =>
        set({ selectedAgent: agent }),
      
      clearMessages: () =>
        set({ messages: [] }),
        
      setSchemaNavigation: (navigation: SchemaNavigationState | null) =>
        set({ schemaNavigation: navigation }),
        
      updateSchemaPath: (path: string[]) =>
        set((state) => ({
          schemaNavigation: state.schemaNavigation 
            ? { ...state.schemaNavigation, currentPath: path }
            : null
        })),
        
      setIsLoading: (loading: boolean) =>
        set({ isLoading: loading }),
        
      updateConfig: (updates: Partial<IndyChatState['config']>) =>
        set((state) => ({
          config: { ...state.config, ...updates }
        }))
    }),
    {
      name: 'indy-chat-store', // Storage key
      partialize: (state) => ({
        messages: state.messages,
        selectedAgent: state.selectedAgent,
        config: state.config,
        sessionId: state.sessionId
        // Note: input, schemaNavigation, and isLoading are not persisted intentionally
      })
    }
  )
); 
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Message interface for chat messages
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Available agent types for selection
 */
export type AgentType = 'block' | 'page' | 'prompt';

/**
 * Indy chat store state interface
 */
interface IndyChatState {
  // State
  messages: ChatMessage[];
  input: string;
  selectedAgent: AgentType;
  
  // Actions
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  setInput: (value: string) => void;
  setSelectedAgent: (agent: AgentType) => void;
  clearMessages: () => void;
}

/**
 * Zustand store for Indy chat functionality
 * 
 * This store manages:
 * - Chat messages between user and assistant
 * - Current input value
 * - Selected agent type for processing
 * - Persistence across browser sessions
 */
export const useIndyChatStore = create<IndyChatState>()(
  persist(
    (set) => ({
      // Initial state
      messages: [],
      input: '',
      selectedAgent: 'block' as AgentType,
      
      // Actions
      addMessage: (role: 'user' | 'assistant', content: string) =>
        set((state) => ({
          messages: [...state.messages, { role, content }]
        })),
      
      setInput: (value: string) =>
        set({ input: value }),
      
      setSelectedAgent: (agent: AgentType) =>
        set({ selectedAgent: agent }),
      
      clearMessages: () =>
        set({ messages: [] })
    }),
    {
      name: 'indy-chat-store', // Storage key
      partialize: (state) => ({
        messages: state.messages,
        selectedAgent: state.selectedAgent
        // Note: input is not persisted intentionally
      })
    }
  )
); 
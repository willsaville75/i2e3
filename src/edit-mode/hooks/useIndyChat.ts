import { useCallback } from 'react';
import { useBlocksStore } from '../../store/blocksStore';
import { useIndyChatStore, ChatMessage } from '../../store/indyChatStore';
import { createDefaultBlockData } from '../../ai/indyFunctions';
import { runSchemaPresenterAgent } from '../../indy/agents/schemaPresenterAgent';

export type { ChatMessage } from '../../store/indyChatStore';

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
  addSystemMessage: (content: string) => void;
}

export const useIndyChat = (): UseIndyChatReturn => {
  const { selectedIndex, blocks } = useBlocksStore();
  const { 
    messages, 
    isLoading, 
    sessionId,
    config,
    schemaNavigation, 
    updateSchemaPath,
    addMessage,
    setIsLoading,
    updateConfig: updateStoreConfig,
    clearMessages
  } = useIndyChatStore();

  const sendMessage = useCallback(async (userMessage: string) => {
    try {
      console.log('🎯 useIndyChat.sendMessage called with:', userMessage);
      if (!userMessage.trim() || isLoading) return;

      setIsLoading(true);

      // Check if we're in schema navigation mode
      if (schemaNavigation && (userMessage.match(/^\d+$/) || userMessage.toLowerCase() === 'back')) {
        console.log('🧭 Schema navigation command detected:', userMessage);
        
        // Add user message to chat
        const navUserMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          type: 'user',
          content: userMessage,
          timestamp: new Date()
        };
        addMessage(navUserMsg);

        try {
          // Call schema presenter agent with navigation
          const response = await runSchemaPresenterAgent({
            blockType: schemaNavigation.blockType || 'hero',
            selectedBlock: schemaNavigation.selectedBlockData,
            navigationPath: schemaNavigation.currentPath,
            userSelection: userMessage
          });

          // Update navigation path if needed
          if (response.navigationState) {
            updateSchemaPath(response.navigationState.currentPath);
          }

          // Add assistant response
          const assistantMessageObj: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            type: 'assistant',
            content: response.message,
            timestamp: new Date()
          };
          addMessage(assistantMessageObj);
        } catch (error) {
          console.error('Error in schema navigation:', error);
          const errorMessageObj: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            type: 'assistant',
            content: '❌ Sorry, I encountered an error navigating the schema. Please try again.',
            timestamp: new Date()
          };
          addMessage(errorMessageObj);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      try {
        // Add user message to chat
        const userMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          type: 'user',
          content: userMessage,
          timestamp: new Date()
        };
        addMessage(userMsg);

        // Check if this is a create operation
        const isCreatingBlock = userMessage.toLowerCase().includes('create') || 
                               userMessage.toLowerCase().includes('add') ||
                               userMessage.toLowerCase().includes('new');
        
        // Prepare API request - don't pass blockId for create operations
        const requestBody = {
          userInput: userMessage,
          sessionId: sessionId,
          blockId: (selectedIndex !== null && !isCreatingBlock) ? blocks[selectedIndex]?.id : undefined,
          blockType: (selectedIndex !== null && !isCreatingBlock) ? blocks[selectedIndex]?.blockType : undefined,
          blockData: (selectedIndex !== null && !isCreatingBlock) ? blocks[selectedIndex]?.blockData : undefined,
          pageContext: {
            title: document.title,
            totalBlocks: blocks.length,
            route: window.location.pathname
          },
          useEnhancedClassification: config.useEnhancedClassification,
          useSuperIntelligence: config.useSuperIntelligence
        };

        // Check if we should use streaming (for create operations)
        const useStreaming = isCreatingBlock;
        
        console.log('🔍 Streaming check:', {
          useStreaming,
          selectedIndex,
          willUseStreaming: useStreaming && !selectedIndex,
          userMessage
        });
        
        if (useStreaming && !selectedIndex) {
          // Use streaming endpoint for block creation
          console.log('🌊 Using streaming endpoint');
          
          // Add initial AI message with loading state
          const aiMessageId = (Date.now() + 1).toString();
          const aiMsg: ChatMessage = {
            id: aiMessageId,
            role: 'assistant',
            type: 'assistant',
            content: 'Thinking...',
            timestamp: new Date(),
            metadata: {
              status: 'thinking',
              icon: 'special.magic'
            }
          };
          addMessage(aiMsg);
          
          const response = await fetch('/api/indy/generate/stream', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userInput: userMessage,
              blockType: requestBody.blockType,
              currentData: requestBody.blockData
            }),
          });

          if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let streamedContent = '';
          let finalResult: any = null;

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    
                    // Update message based on streaming event
                    const updatedMsg = { ...aiMsg };
                    
                    switch (data.type) {
                      case 'connected':
                        updatedMsg.content = 'Connected to AI...';
                        updatedMsg.metadata = { status: 'connected', icon: 'technology.signal' };
                        break;
                        
                      case 'classification':
                        updatedMsg.content = `Using ${data.agent} (${Math.round(data.confidence * 100)}% confidence)`;
                        updatedMsg.metadata = { 
                          status: 'classified', 
                          icon: 'status.verified',
                          agent: data.agent,
                          confidence: data.confidence
                        };
                        break;
                        
                      case 'status':
                        updatedMsg.content = data.message;
                        updatedMsg.metadata = { status: 'processing', icon: 'actions.refresh' };
                        break;
                        
                      case 'blockSelected':
                        updatedMsg.content = `Creating ${data.blockType} block...`;
                        updatedMsg.metadata = { 
                          status: 'generating', 
                          icon: 'layout.stack',
                          blockType: data.blockType
                        };
                        break;
                        
                      case 'chunk':
                        streamedContent += data.content;
                        const preview = streamedContent.length > 100 
                          ? '...' + streamedContent.slice(-100) 
                          : streamedContent;
                        updatedMsg.content = `Generating content...\n\`\`\`json\n${preview}\n\`\`\``;
                        updatedMsg.metadata = { status: 'streaming', icon: 'special.lightning' };
                        break;
                        
                      case 'complete':
                        // The streaming endpoint already sends the complete action
                        if (data.action) {
                          finalResult = {
                            success: true,
                            action: data.action,
                            message: data.action.message || `✅ Created a ${data.action.blockType} block successfully!`,
                            timing: data.timing,
                            agentUsed: 'createAgent'
                          };
                        } else {
                          // Fallback for old format
                          finalResult = {
                            success: true,
                            action: {
                              type: 'ADD_BLOCK',
                              blockType: data.blockType,
                              data: data.blockData
                            },
                            message: `✅ Created a ${data.blockType} block successfully!`,
                            timing: data.timing,
                            agentUsed: 'createAgent'
                          };
                        }
                        
                        updatedMsg.content = `✨ Created a ${data.blockType} block successfully!`;
                        updatedMsg.metadata = { 
                          status: 'complete', 
                          icon: 'status.complete',
                          timing: data.timing
                        };
                        break;
                        
                      case 'error':
                        updatedMsg.content = `❌ Error: ${data.error}`;
                        updatedMsg.metadata = { status: 'error', icon: 'system.error' };
                        throw new Error(data.error);
                    }
                    
                    // Update the message in the store
                    const { updateMessage } = useIndyChatStore.getState();
                    if (updateMessage) {
                      updateMessage(aiMessageId, updatedMsg);
                    } else {
                      // Fallback if updateMessage is not available
                      const { messages, setMessages } = useIndyChatStore.getState();
                      const updatedMessages = messages.map(msg => 
                        msg.id === aiMessageId ? updatedMsg : msg
                      );
                      setMessages(updatedMessages);
                    }
                    
                  } catch (e) {
                    console.error('Failed to parse SSE data:', e);
                  }
                }
              }
            }
          }
          
          // Use the final result from streaming
          if (finalResult) {
            const result = finalResult;
            console.log('📥 Streaming completed with result:', result);
            
            // Process response
            const { reply, metadata } = processApiResponse(result);
            
            // Handle block updates
            handleBlockUpdates(result);
            
            // Update the final message
            const { updateMessage } = useIndyChatStore.getState();
            const finalMsg = {
              ...aiMsg,
              content: reply,
              metadata: { ...metadata, ...aiMsg.metadata }
            };
            if (updateMessage) {
              updateMessage(aiMessageId, finalMsg);
            } else {
              // Fallback
              const { messages, setMessages } = useIndyChatStore.getState();
              const updatedMessages = messages.map(msg => 
                msg.id === aiMessageId ? finalMsg : msg
              );
              setMessages(updatedMessages);
            }
          }
          
          setIsLoading(false);
          return;
        }
        
        // Non-streaming API call (for updates, etc.)
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
          role: 'assistant',
          type: 'assistant',
          content: reply,
          timestamp: new Date(),
          metadata
        };
        addMessage(assistantMessageObj);

      } catch (error) {
        console.error('Error sending message:', error);
        
        const errorMessage = getErrorMessage(error);
        const errorMessageObj: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          type: 'assistant',
          content: `❌ Error: ${errorMessage}`,
          timestamp: new Date()
        };
        addMessage(errorMessageObj);
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      const errorMessage = getErrorMessage(error);
      const errorMessageObj: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        type: 'assistant',
        content: `❌ Error: ${errorMessage}`,
        timestamp: new Date()
      };
      addMessage(errorMessageObj);
      setIsLoading(false);
    }
  }, [selectedIndex, blocks, schemaNavigation, updateSchemaPath, isLoading, sessionId, config, addMessage, setIsLoading]);

  const clearHistory = useCallback(() => {
    clearMessages();
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      type: 'assistant',
      content: 'Chat history cleared! I\'m ready to help you with your CMS pages.',
      timestamp: new Date()
    };
    addMessage(welcomeMessage);
  }, [clearMessages, addMessage]);

  const updateConfig = useCallback((updates: Partial<IndyChatConfig>) => {
    updateStoreConfig(updates);
  }, [updateStoreConfig]);

  const setInputValue = useCallback((_value: string) => {
    // This will be handled by the UI component
    // Included here for interface completeness
  }, []);

  const addSystemMessage = useCallback((content: string) => {
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      type: 'assistant',
      content,
      timestamp: new Date()
    };
    addMessage(systemMessage);
  }, [addMessage]);

  return {
    messages,
    isLoading,
    config: {
      useEnhancedClassification: config.useEnhancedClassification,
      useSuperIntelligence: config.useSuperIntelligence,
      sessionId
    },
    sendMessage,
    clearHistory,
    updateConfig,
    setInputValue,
    addSystemMessage
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
      // Use blockData property (from streaming) or data property (from non-streaming)
      const actionData = result.action.blockData || result.action.data;
      
      console.log('🎨 Adding new block via chat:', {
        blockType: result.action.blockType,
        hasData: !!actionData,
        dataKeys: actionData ? Object.keys(actionData) : [],
        fullData: actionData,
        dataStructure: JSON.stringify(actionData, null, 2)
      });
      
      // Check if the data contains an error
      if (actionData?.success === false) {
        console.error('❌ Block creation failed:', actionData.error);
        return; // Don't add the block if there was an error
      }
      
      const { addBlock } = useBlocksStore.getState();
      const blockData = actionData || createDefaultBlockData(result.action.blockType);
      console.log('📦 Final block data being added:', {
        blockType: result.action.blockType,
        hasCards: !!(blockData.cards),
        cardsLength: blockData.cards?.length,
        blockData
      });
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
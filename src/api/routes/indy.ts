import { Router, type Request, type Response } from 'express';
import { runAgent, classifyIntentToAgent } from '../../indy/agents/orchestrator';
import { classifyIntent } from '../../indy/utils/hybridClassification';

const router: Router = Router();

/**
 * POST /api/indy/generate
 * Generate block content using Indy with efficient AI-driven agent selection
 */
router.post('/generate', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { userInput, blockType, currentData, tokens, canvasContext } = req.body;
    
    // Validate required fields
    if (!userInput) {
      return res.status(400).json({
        error: 'userInput is required'
      });
    }
    console.log(`📥 Request validated (${Date.now() - startTime}ms)`);
    
    // Use hybrid classification: keywords first, AI fallback
    const classification = await classifyIntent(userInput, { currentData, blockType });
    const agentName = classification.agent;
    console.log(`🎯 Agent selected: ${agentName} (${classification.method}, confidence: ${classification.confidence.toFixed(2)}, ${classification.duration}ms) - ${classification.reasoning}`);
    
    // Prepare input for the selected agent
    console.log(`🔧 Preparing agent input (${Date.now() - startTime}ms)`);
    let agentInput;
    
    // Prepare input based on agent type
    if (agentName === 'createAgent') {
      agentInput = {
        blockType,
        intent: userInput,
        tokens: tokens || {}
      };
    } else if (agentName === 'updateAgent') {
      agentInput = {
        blockType,
        currentData,
        intent: userInput,
        tokens: tokens || {}
      };
    } else if (agentName === 'runIndyPageAgent') {
      agentInput = {
        context: {
          blocks: [{ blockType, current: currentData }]
        },
        model: 'gpt-4o-mini',
        goal: userInput
      };
    } else if (agentName === 'runIndyExecutionAgent') {
      agentInput = {
        blockType,
        currentData,
        userInput,
        tokens: tokens || {}
      };
    } else if (agentName === 'runIndyContextAgent') {
      agentInput = {
        blockType,
        props: currentData,
        schema: null,
        aiHints: null,
        canvasContext: canvasContext || null
      };
    } else {
      // Default fallback for any other agents
      agentInput = {
        blockType,
        currentData,
        intent: userInput,
        tokens: tokens || {}
      };
    }
    
    // Execute the selected agent (SINGLE AI CALL)
    console.log(`🚀 Calling agent ${agentName} (${Date.now() - startTime}ms)`);
    const result = await runAgent(agentName, agentInput);
    console.log(`✅ Agent completed (${Date.now() - startTime}ms)`);
    
    // Extract block data based on agent type
    console.log(`🔍 Extracting block data (${Date.now() - startTime}ms)`);
    let blockData;
    if (agentName === 'runIndyContextAgent') {
      blockData = { explanation: result };
    } else if (result.blockData) {
      blockData = result.blockData;
    } else if (result.result) {
      blockData = result.result;
    } else {
      blockData = result;
    }
    
    const responseData: any = {
      success: result.success !== false,
      blockData,
      agentUsed: agentName,
      userInput,
      error: result.error,
      timing: {
        totalMs: Date.now() - startTime
      }
    };
    
    // If this is a block creation from blockOperations, wrap it in an action
    if (agentName === 'createAgent' && result.blockData) {
      // Determine block type from the result or data structure
      let blockType = result.selectedBlockType;
      if (!blockType && blockData) {
        // Try to infer block type from the data structure
        if (blockData.cards) {
          blockType = 'grid';
        } else if (blockData.elements?.button) {
          blockType = 'hero';
        }
      }
      
      responseData.action = {
        type: 'ADD_BLOCK',
        blockType: blockType || 'hero', // Default to hero if can't determine
        data: blockData
      };
      responseData.message = `✅ Successfully created a ${blockType || 'hero'} block!`;
    }
    
    console.log(`📤 Sending response (${Date.now() - startTime}ms)`);
    console.log(`📏 Response size: ${JSON.stringify(responseData).length} chars`);
    
    res.json(responseData);
    console.log(`✅ Response sent successfully (${Date.now() - startTime}ms)`);
    
  } catch (error) {
    console.error('Error in Indy generate:', error);
    res.status(500).json({
      error: 'Failed to generate block content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/indy/generate/stream
 * Stream AI responses in real-time using Server-Sent Events
 */
router.post('/generate/stream', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { userInput, blockType, currentData } = req.body;
    
    // Validate required fields
    if (!userInput) {
      return res.status(400).json({
        error: 'userInput is required'
      });
    }
    
    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Send initial connection event
    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
    
    // Use hybrid classification
    const classification = await classifyIntent(userInput, { currentData, blockType });
    const agentName = classification.agent;
    
    // Send classification event
    res.write(`data: ${JSON.stringify({ 
      type: 'classification',
      agent: agentName,
      confidence: classification.confidence
    })}\n\n`);
    
    // For now, only support streaming for create operations
    if (agentName === 'createAgent') {
      // Import streaming functions
      const { callAIStream } = await import('../../ai/call');
      const { buildOpenAIPromptForBlock } = await import('../../indy/utils/buildOpenAIPromptForBlock');
      const { blockRegistry } = await import('../../blocks');
      const { getFastModel } = await import('../../ai/client');
      
      let selectedBlockType = blockType;
      
      // Step 1: Block selection if needed
      if (!selectedBlockType) {
        res.write(`data: ${JSON.stringify({ 
          type: 'status',
          message: 'Selecting appropriate block type...'
        })}\n\n`);
        
        const selectionPrompt = buildOpenAIPromptForBlock({
          blockType: undefined,
          context: { intent: userInput },
          mode: 'create',
          instructions: userInput
        });
        
        // Use non-streaming for selection (it's quick)
        const { callAI } = await import('../../ai/call');
        const selection = await callAI({
          prompt: selectionPrompt,
          model: getFastModel(),
          maxTokens: 500,
          temperature: 0.3
        });
        
        // Parse the AI response to extract selectedBlockType
        try {
          // Clean up the response - remove markdown code blocks if present
          let cleanedSelection = selection.trim();
          if (cleanedSelection.startsWith('```')) {
            cleanedSelection = cleanedSelection.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          }
          
          const parsed = JSON.parse(cleanedSelection);
          selectedBlockType = parsed.selectedBlockType || parsed.selectedblocktype;
          
          // If AI already generated content, we can skip step 2
          const blockContent = parsed.blockContent || parsed.blockcontent;
          if (blockContent) {
            res.write(`data: ${JSON.stringify({ 
              type: 'blockSelected',
              blockType: selectedBlockType
            })}\n\n`);
            
            res.write(`data: ${JSON.stringify({
              type: 'complete',
              action: {
                type: 'ADD_BLOCK',
                blockType: selectedBlockType,
                blockData: blockContent,
                message: `✅ Successfully created a ${selectedBlockType} block! The content has been added to your page.`
              }
            })}\n\n`);
            
            res.end();
            return;
          }
        } catch (e) {
          console.error('Failed to parse AI selection response:', e);
          // Try to extract block type from the response
          const blockTypeMatch = selection.match(/selectedBlockType["\s:]*["']?(\w+)["']?/i);
          if (blockTypeMatch) {
            selectedBlockType = blockTypeMatch[1].toLowerCase();
          } else {
            selectedBlockType = 'hero'; // Default fallback
          }
        }
        
        res.write(`data: ${JSON.stringify({ 
          type: 'blockSelected',
          blockType: selectedBlockType
        })}\n\n`);
      }
      
      // Step 2: Stream content generation
      res.write(`data: ${JSON.stringify({ 
        type: 'status',
        message: `Generating ${selectedBlockType} block content...`
      })}\n\n`);
      
      console.log('🔍 Looking up block config:', {
        selectedBlockType,
        registryKeys: Object.keys(blockRegistry),
        hasConfig: !!blockRegistry[selectedBlockType]
      });
      
      const blockConfig = blockRegistry[selectedBlockType];
      if (!blockConfig) {
        console.error(`Block type "${selectedBlockType}" not found in registry`);
        res.write(`data: ${JSON.stringify({
          type: 'error',
          message: `Unknown block type: ${selectedBlockType}`
        })}\n\n`);
        res.end();
        return;
      }
      
      const context = {
        blockType: selectedBlockType,
        intent: userInput,
        schema: blockConfig.schema,
        aiHints: blockConfig.aiHints,
        defaults: blockConfig.defaultData
      };
      
      const contentPrompt = buildOpenAIPromptForBlock({
        blockType: selectedBlockType,
        context,
        mode: 'create',
        instructions: userInput
      });
      
      let streamedContent = '';
      
      // Stream the response
      await callAIStream(
        {
          prompt: contentPrompt,
          model: getFastModel(),
          maxTokens: selectedBlockType === 'grid' ? 2000 : 1000,
          temperature: 0.7
        },
        (chunk) => {
          streamedContent += chunk;
          // Send each chunk as it arrives
          res.write(`data: ${JSON.stringify({ 
            type: 'chunk',
            content: chunk
          })}\n\n`);
        }
      );
      
      // Parse the complete response
      try {
        const cleaned = streamedContent
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        const blockData = JSON.parse(cleaned);
        
        // Send the final parsed block data
        res.write(`data: ${JSON.stringify({ 
          type: 'complete',
          action: {
            type: 'ADD_BLOCK',
            blockType: selectedBlockType,
            blockData: blockData,
            message: `✅ Successfully created a ${selectedBlockType} block! The content has been added to your page.`
          },
          timing: { totalMs: Date.now() - startTime }
        })}\n\n`);
      } catch (parseError) {
        res.write(`data: ${JSON.stringify({ 
          type: 'error',
          error: 'Failed to parse AI response'
        })}\n\n`);
      }
    } else {
      // For non-create operations, fall back to regular generation
      res.write(`data: ${JSON.stringify({ 
        type: 'error',
        error: 'Streaming not yet supported for this operation'
      })}\n\n`);
    }
    
    res.end();
    
  } catch (error) {
    console.error('Streaming error:', error);
    res.write(`data: ${JSON.stringify({ 
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })}\n\n`);
    res.end();
  }
});

/**
 * POST /api/indy/action
 * Execute an Indy action using efficient AI-first approach
 */
router.post('/action', async (req: Request, res: Response) => {
  try {
    const { userInput, blockId, blockType: providedBlockType, blockData, currentData, pageContext } = req.body;
    
    console.log('🌐 API /action endpoint called:', {
      userInput,
      blockId,
      providedBlockType,
      hasBlockData: !!blockData,
      hasCurrentData: !!currentData,
      hasPageContext: !!pageContext
    });
    
    // Use blockData if provided, otherwise use currentData for backwards compatibility
    const currentBlockData = blockData || currentData;
    
    if (!userInput) {
      return res.status(400).json({ 
        success: false, 
        error: 'userInput is required' 
      });
    }
    
    // AI-first: Use orchestrator to classify and route efficiently
    console.log('🤖 API: Using AI-first orchestrator approach');
    
    const agentName = await classifyIntentToAgent(userInput);
    console.log(`🤖 Agent selected: ${agentName}`);
    
    // Prepare agent input based on the selected agent
    let agentInput: any = {};
    
    // First check if user is trying to add a block without specifying type
    const blockCreationKeywords = ['add', 'create', 'insert', 'new'];
    const isCreatingBlock = blockCreationKeywords.some(keyword => 
      userInput.toLowerCase().includes(keyword)
    ) && !blockId;
    
    // Let AI determine blockType - single source of truth
    let blockType = providedBlockType;
    
    if (agentName === 'runIndyContextAgent') {
      // Context agent needs exact blockType (or undefined) to handle no selection
      agentInput = {
        blockType: blockType,
        currentData: currentBlockData,
        intent: userInput
      };
    } else if (agentName === 'runIndyPageAgent') {
      agentInput = {
        context: {
          blocks: [{ blockType, current: currentBlockData }]
        },
        model: 'gpt-4o-mini',
        goal: userInput
      };
    } else if (agentName === 'runIndyExecutionAgent') {
      agentInput = {
        command: userInput,
        context: { blockType, currentData: currentBlockData }
      };
    } else if (agentName === 'runIndyPromptAgent') {
      agentInput = {
        query: userInput,
        context: { blockType, currentData: currentBlockData }
      };
    } else if (agentName === 'runIndyConversationAgent') {
      // Conversation agent just needs the user input
      agentInput = {
        userInput: userInput,
        intent: userInput
      };
    } else if (agentName === 'createAgent' && !blockType) {
      // Let AI select the appropriate block type based on user intent
      console.log(`📦 No blockType specified, letting AI select based on user intent`);
      
      agentInput = {
        blockType: undefined, // Explicitly undefined to trigger block selection
        currentData: currentBlockData,
        intent: userInput,
        blockId
      };
    } else {
      // Other agents - only set blockType if one is provided
      agentInput = {
        blockType: blockType,
        currentData: currentBlockData,
        intent: userInput,
        blockId
      };
    }
    
    console.log('📤 Calling agent with input:', {
      agent: agentName,
      blockType: agentInput.blockType,
      hasCurrentData: !!agentInput.currentData,
      intent: agentInput.intent
    });
    
    const result = await runAgent(agentName, agentInput);
    
    // Handle different agent response types
    if (agentName === 'runIndyContextAgent') {
      res.json({
        success: true,
        action: {
          type: 'CONTEXT_EXPLANATION',
          explanation: result
        },
        message: result,
        confidence: 1.0,
        agentUsed: agentName
      });
    } else if (agentName === 'runIndyConversationAgent') {
      // Extract the actual response string from the conversation agent result
      const responseText = typeof result === 'object' && result.response 
        ? result.response 
        : typeof result === 'string' 
          ? result 
          : "I can help you create and update content. What would you like to do?";
      
      res.json({
        success: true,
        action: {
          type: 'CONVERSATION',
          response: responseText
        },
        message: responseText,
        confidence: 1.0,
        agentUsed: agentName
      });
    } else {
      // Check if this is a create/update action based on the agent used
      if (agentName === 'createAgent' || agentName === 'updateAgent') {
        // Check if AI selected a block type (from blockOperations)
        const selectedBlockType = result.selectedBlockType || blockType || agentInput.blockType;
        
        // If creating a block but no type was determined, try to infer from the data
        let finalBlockType = selectedBlockType;
        if (!finalBlockType && result.blockData) {
          // Try to infer block type from the data structure
          if (result.blockData.cards) {
            finalBlockType = 'grid';
          } else if (result.blockData.elements?.button) {
            finalBlockType = 'hero';
          }
        }
        
        // Generate a user-friendly message based on the action
        const actionType = blockId ? 'UPDATE_BLOCK' : 'ADD_BLOCK';
        const actionVerb = blockId ? 'updated' : 'created';
        const blockTypeDisplay = finalBlockType ? `${finalBlockType} block` : 'content';
        
        let message = `✅ Successfully ${actionVerb} your ${blockTypeDisplay}!`;
        
        // Add specific details if available
        if (result.blockData?.elements?.title?.content) {
          message += ` The title "${result.blockData.elements.title.content}" has been set.`;
        }
        
        // Check if the result indicates an error
        if (result.success === false) {
          return res.status(400).json({
            success: false,
            error: result.error || 'Failed to generate block content',
            agentUsed: agentName
          });
        }
        
        // Don't allow creating blocks without a valid type
        if (actionType === 'ADD_BLOCK' && !finalBlockType) {
          return res.status(400).json({
            success: false,
            error: 'Could not determine block type. Please specify the type of block you want to create (e.g., "create a hero block" or "add a grid with cards").',
            agentUsed: agentName
          });
        }
        
        res.json({
          success: true,
          action: {
            type: actionType,
            blockType: finalBlockType,
            blockId,
            data: result.blockData || result
          },
          message,
          confidence: 0.9,
          agentUsed: agentName
        });
      } else {
        // Default conversation response for other cases
        res.json({
          success: true,
          action: {
            type: 'CONVERSATION',
            response: result.response || result
          },
          message: result.response || result,
          confidence: 0.8,
          agentUsed: agentName
        });
      }
    }
    
  } catch (error) {
    console.error('Error in Indy action:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

export default router; 
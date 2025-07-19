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
    
    const responseData = {
      success: result.success !== false,
      blockData,
      agentUsed: agentName,
      userInput,
      error: result.error,
      timing: {
        totalMs: Date.now() - startTime
      }
    };
    
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
 * POST /api/indy/action
 * Execute an Indy action using efficient AI-first approach
 */
router.post('/action', async (req: Request, res: Response) => {
  try {
    const { userInput, blockId, blockType: providedBlockType, blockData, currentData, pageContext, tokens } = req.body;
    
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
    
    // Determine blockType - could be from request or extracted from intent
    let blockType = providedBlockType;
    
    if (!blockType && isCreatingBlock) {
      // Try to extract block type from user input
      const blockTypes = ['hero', 'grid', 'feature', 'testimonial', 'cta'];
      for (const type of blockTypes) {
        if (userInput.toLowerCase().includes(type)) {
          blockType = type;
          console.log(`📦 Extracted blockType '${type}' from user input`);
          break;
        }
      }
    }
    
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
        
        // Generate a user-friendly message based on the action
        const actionType = blockId ? 'UPDATE_BLOCK' : 'ADD_BLOCK';
        const actionVerb = blockId ? 'updated' : 'created';
        const finalBlockType = selectedBlockType || 'block';
        const blockTypeDisplay = finalBlockType ? `${finalBlockType} block` : 'block';
        
        let message = `✅ Successfully ${actionVerb} your ${blockTypeDisplay}!`;
        
        // Add specific details if available
        if (result.blockData?.elements?.title?.content) {
          message += ` The title "${result.blockData.elements.title.content}" has been set.`;
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
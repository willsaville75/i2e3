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
    } else if (agentName === 'runIndyBlockAgent') {
      agentInput = {
        context: {
          blockType,
          current: currentData,
          intent: currentData ? 'update' : 'create'
        },
        model: 'gpt-4o-mini',
        instructions: userInput
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
    const { userInput, blockId, blockType, blockData } = req.body;
    
    if (!userInput) {
      return res.status(400).json({ 
        success: false, 
        error: 'userInput is required' 
      });
    }
    
    // AI-first: Use orchestrator to classify and route efficiently
    console.log('🤖 API: Using AI-first orchestrator approach');
    
    const agentName = classifyIntentToAgent(userInput);
    
    // Prepare agent input based on agent type
    let agentInput;
    if (agentName === 'runIndyContextAgent') {
      // Context agent needs exact blockType (or undefined) to handle no selection
      agentInput = {
        blockType,
        props: blockData,
        schema: null,
        aiHints: null
      };
    } else {
      // Other agents can use default blockType
              agentInput = {
          blockType: blockType || 'hero',
          currentData: blockData,
          intent: userInput,
          blockId
        };
    }
    
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
    } else {
      res.json({
        success: true,
        action: {
          type: blockId ? 'UPDATE_BLOCK' : 'ADD_BLOCK',
          blockType: blockType || 'hero',
          blockId,
          data: result.blockData || result
        },
        message: 'Content updated successfully',
        confidence: 0.9,
        agentUsed: agentName
      });
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
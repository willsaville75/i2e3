import { Router, type Request, type Response } from 'express'
import { runAgent, classifyIntentToAgent } from '../../indy/agents/orchestrator'
import { prepareBlockAIContext } from '../../blocks/utils/prepareBlockAIContext'

const router: Router = Router()

// POST /api/indy/generate - Generate or update a block using Indy
router.post('/generate', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { userInput, blockType, currentData, tokens } = req.body;
    
    // Validate required fields
    if (!userInput || !blockType) {
      return res.status(400).json({
        error: 'userInput and blockType are required'
      });
    }
    console.log(`📥 Request validated (${Date.now() - startTime}ms)`);
    
    // Use AI-driven agent classification instead of hard-coded rules
    const agentName = classifyIntentToAgent(userInput);
    console.log(`🎯 Agent selected: ${agentName} (AI-driven classification) (${Date.now() - startTime}ms)`);
    
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
      // Prepare proper AI context with schema, defaults, and aiHints
      const context = prepareBlockAIContext(
        blockType,
        tokens || { colors: [], spacing: [] },
        currentData ? 'update' : 'create'
      );
      
      agentInput = {
        context: {
          ...context,
          current: currentData // Add current data to the context
        },
        model: 'gpt-4o',
        instructions: userInput
      };
    } else if (agentName === 'runIndyPageAgent') {
      agentInput = {
        context: {
          blocks: [{ blockType, current: currentData }]
        },
        model: 'gpt-4o',
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
        schema: null, // Could be added later if needed
        aiHints: null // Could be added later if needed
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
      // Context agent returns a string, not block data
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
    
    // Add timing around JSON serialization
    const jsonStartTime = Date.now();
    console.log(`🔧 Starting JSON serialization (${Date.now() - startTime}ms)`);
    
    res.json(responseData);
    
    console.log(`📡 JSON serialization completed (${Date.now() - jsonStartTime}ms)`);
    console.log(`✅ Response sent successfully (${Date.now() - startTime}ms)`);
    
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate block content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 
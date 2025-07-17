import { Router, type Request, type Response } from 'express';
import { runIndyPropertyAgent, isPropertyIntent } from '../../indy/agents/runIndyPropertyAgent';
import { classifyPropertyIntent } from '../../indy/utils/classifyPropertyIntent';

const router: Router = Router();

/**
 * POST /api/indy/generate
 * Generate block content using Indy
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { userInput, blockType, currentData, tokens } = req.body;
    
    if (!userInput) {
      return res.status(400).json({ 
        success: false, 
        error: 'userInput is required' 
      });
    }
    
    // TODO: Implement actual AI generation logic here
    // For now, return a simple response
    
    const mockResponse = {
      success: true,
      blockData: {
        elements: {
          title: {
            content: `Updated: ${userInput}`,
            level: 1
          },
          subtitle: {
            content: "This is a mock response from the Indy API"
          }
        }
      }
    };
    
    res.json(mockResponse);
    
  } catch (error) {
    console.error('Error in Indy generate:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * POST /api/indy/test-property-intent
 * Test property intent classification
 */
router.post('/test-property-intent', async (req: Request, res: Response) => {
  try {
    const { userInput } = req.body;
    
    if (!userInput) {
      return res.status(400).json({ 
        success: false, 
        error: 'userInput is required' 
      });
    }
    
    // Test property intent classification
    const intents = classifyPropertyIntent(userInput);
    
    res.json({
      success: true,
      userInput,
      intents,
      isPropertyIntent: intents.length > 0 && intents[0].confidence > 0.6
    });
    
  } catch (error) {
    console.error('Error in property intent test:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * POST /api/indy/action
 * Execute an Indy action (API-only version)
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
    
    // Check if this is a property-related intent
    if (isPropertyIntent(userInput)) {
      if (!blockId || !blockData) {
        return res.status(400).json({
          success: false,
          error: 'blockId and blockData are required for property updates'
        });
      }
      
      console.log('🔧 API: Detected property intent, using property agent');
      
      // Run property agent with provided block data (don't update store)
      const propertyResult = await runIndyPropertyAgent(
        userInput,
        blockId,
        blockData,
        false // Don't update store on server side
      );
      
      if (propertyResult.success) {
        res.json({
          success: true,
          action: {
            type: 'PROPERTY_UPDATE',
            blockType: blockType || 'unknown',
            blockId,
            data: propertyResult.changes,
            propertyChanges: propertyResult.changes
          },
          message: propertyResult.message,
          confidence: propertyResult.confidence
        });
      } else {
        res.status(400).json({
          success: false,
          error: propertyResult.message
        });
      }
    } else {
      // Handle content changes with AI generation
      console.log('📝 API: Using AI generation for content changes');
      
      // For now, return a mock response
      res.json({
        success: true,
        action: {
          type: blockId ? 'UPDATE_BLOCK' : 'ADD_BLOCK',
          blockType: blockType || 'hero',
          blockId,
          data: {
            elements: {
              title: {
                content: `Updated: ${userInput}`,
                level: 1
              }
            }
          }
        },
        message: 'Content updated successfully'
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
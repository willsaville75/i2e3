import { Router, type Request, type Response } from 'express';
import { runIndyAction } from '../../indy/runIndyAction';
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
 * Execute an Indy action
 */
router.post('/action', async (req: Request, res: Response) => {
  try {
    const { userInput, blockId } = req.body;
    
    if (!userInput) {
      return res.status(400).json({ 
        success: false, 
        error: 'userInput is required' 
      });
    }
    
    // Execute the Indy action
    const action = await runIndyAction(userInput, blockId);
    
    res.json({
      success: true,
      action
    });
    
  } catch (error) {
    console.error('Error in Indy action:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

export default router; 
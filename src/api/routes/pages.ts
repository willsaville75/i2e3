import { Router, type Request, type Response } from 'express'
import { blockRegistry } from '../../blocks'

const router: Router = Router()

// GET /api/pages - Get all available block types and their schemas
router.get('/', (_req: Request, res: Response) => {
  try {
    const blocks = Object.keys(blockRegistry).map(blockType => ({
      type: blockType,
      metadata: blockRegistry[blockType].metadata,
      schema: blockRegistry[blockType].schema
    }));
    
    res.json({
      blocks,
      count: blocks.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/pages - Create a new page
router.post('/', (req: Request, res: Response) => {
  try {
    const { title, blocks } = req.body;
    
    // Validate request body
    if (!title || !blocks || !Array.isArray(blocks)) {
      return res.status(400).json({
        error: 'Invalid request body',
        required: {
          title: 'string',
          blocks: 'array of block configurations'
        }
      });
    }
    
    // For now, just return a success response
    res.status(201).json({
      id: Date.now().toString(),
      title,
      blocks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 
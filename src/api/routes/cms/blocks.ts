import { Router, type Request, type Response } from 'express';
import { prisma } from '../../../lib/prisma';

const router: Router = Router();

// GET /api/blocks/:id - Get block by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const block = await prisma.canvasBlock.findUnique({
      where: { id },
      include: {
        entry: {
          include: {
            site: true
          }
        }
      }
    });

    if (!block) {
      return res.status(404).json({ error: 'Block not found' });
    }

    res.json(block);
  } catch (error) {
    console.error('Error fetching block:', error);
    res.status(500).json({ 
      error: 'Failed to fetch block',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 
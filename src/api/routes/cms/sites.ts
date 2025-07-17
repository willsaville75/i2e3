import { Router, type Request, type Response } from 'express';
import { prisma } from '../../../utils/prisma';

const router: Router = Router();

// GET /api/sites - List all sites
router.get('/', async (_req: Request, res: Response) => {
  try {
    const sites = await prisma.site.findMany({
      include: {
        entries: {
          include: {
            blocks: {
              orderBy: { position: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(sites);
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sites',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/sites/:slug - Get site by slug (using domain as slug for now)
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    // First try to find by domain, then by name (case-insensitive)
    const site = await prisma.site.findFirst({
      where: {
        OR: [
          { domain: slug },
          { name: { equals: slug, mode: 'insensitive' } }
        ]
      },
      include: {
        entries: {
          include: {
            blocks: {
              orderBy: { position: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    res.json(site);
  } catch (error) {
    console.error('Error fetching site:', error);
    res.status(500).json({ 
      error: 'Failed to fetch site',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 
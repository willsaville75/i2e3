import { Router, type Request, type Response } from 'express';
import { prisma } from '../../../utils/prisma';

const router: Router = Router();

// GET /api/sites - List all sites (excluding soft-deleted)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const sites = await prisma.site.findMany({
      where: {
        deletedAt: null // Exclude soft-deleted sites
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

// GET /api/sites/:slug - Get site by slug (excluding soft-deleted)
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    // First try to find by domain, then by name (case-insensitive)
    const site = await prisma.site.findFirst({
      where: {
        AND: [
          {
            OR: [
              { domain: slug },
              { name: { equals: slug, mode: 'insensitive' } }
            ]
          },
          { deletedAt: null } // Exclude soft-deleted sites
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

// POST /api/sites - Create a new site
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, domain, settings } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Site name is required' });
    }
    
    // Create the site
    const site = await prisma.site.create({
      data: {
        name,
        description,
        domain,
        settings: settings || {}
      },
      include: {
        entries: true
      }
    });
    
    res.status(201).json(site);
  } catch (error) {
    console.error('Error creating site:', error);
    
    // Handle unique constraint violation for domain
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return res.status(409).json({ 
        error: 'Domain already exists',
        details: 'A site with this domain already exists'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create site',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/sites/:id - Update a site
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, domain, settings } = req.body;
    
    // Check if site exists
    const existingSite = await prisma.site.findUnique({
      where: { id }
    });
    
    if (!existingSite) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    // Update the site
    const updatedSite = await prisma.site.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingSite.name,
        description: description !== undefined ? description : existingSite.description,
        domain: domain !== undefined ? domain : existingSite.domain,
        settings: settings !== undefined ? settings : existingSite.settings,
        updatedAt: new Date()
      },
      include: {
        entries: true
      }
    });
    
    res.json(updatedSite);
  } catch (error) {
    console.error('Error updating site:', error);
    
    // Handle unique constraint violation for domain
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return res.status(409).json({ 
        error: 'Domain already exists',
        details: 'A site with this domain already exists'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to update site',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/sites/:id - Soft delete a site
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if site exists and is not already deleted
    const existingSite = await prisma.site.findFirst({
      where: { 
        id,
        deletedAt: null 
      }
    });
    
    if (!existingSite) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    // Perform soft delete by setting deletedAt timestamp
    await prisma.site.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting site:', error);
    res.status(500).json({ 
      error: 'Failed to delete site',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 
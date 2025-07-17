import { Router, type Request, type Response } from 'express';
import { prisma } from '../../../lib/prisma';
import { EntryStatus } from '../../../generated/prisma';

const router: Router = Router();

// GET /api/entries/:siteSlug/:entrySlug - Get entry by site slug and entry slug
router.get('/:siteSlug/:entrySlug', async (req: Request, res: Response) => {
  try {
    const { siteSlug, entrySlug } = req.params;
    
    // First find the site by slug (domain or name)
    const site = await prisma.site.findFirst({
      where: {
        OR: [
          { domain: siteSlug },
          { name: { equals: siteSlug, mode: 'insensitive' } }
        ]
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // Then find the entry by slug within that site
    const entry = await prisma.entry.findUnique({
      where: {
        siteId_slug: {
          siteId: site.id,
          slug: entrySlug
        }
      },
      include: {
        site: true,
        blocks: {
          orderBy: { position: 'asc' }
        }
      }
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Error fetching entry:', error);
    res.status(500).json({ 
      error: 'Failed to fetch entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/entries/:siteSlug/:entrySlug - Update entry with blocks
router.put('/:siteSlug/:entrySlug', async (req: Request, res: Response) => {
  try {
    const { siteSlug, entrySlug } = req.params;
    const { title, description, blocks } = req.body;
    
    // First find the site by slug (domain or name)
    const site = await prisma.site.findFirst({
      where: {
        OR: [
          { domain: siteSlug },
          { name: { equals: siteSlug, mode: 'insensitive' } }
        ]
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // Find the entry to update
    const existingEntry = await prisma.entry.findUnique({
      where: {
        siteId_slug: {
          siteId: site.id,
          slug: entrySlug
        }
      }
    });

    if (!existingEntry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Update entry and blocks in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the entry
      const updatedEntry = await tx.entry.update({
        where: {
          siteId_slug: {
            siteId: site.id,
            slug: entrySlug
          }
        },
        data: {
          title: title || existingEntry.title,
          description: description !== undefined ? description : existingEntry.description,
          updatedAt: new Date()
        }
      });

      // If blocks are provided, update them
      if (blocks && Array.isArray(blocks)) {
        // Delete existing blocks
        await tx.canvasBlock.deleteMany({
          where: { entryId: existingEntry.id }
        });

        // Create new blocks
        const createdBlocks = [];
        for (const block of blocks) {
          const createdBlock = await tx.canvasBlock.create({
            data: {
              blockType: block.blockType,
              blockData: block.blockData,
              position: block.position,
              styles: block.styles || null,
              entryId: existingEntry.id
            }
          });
          createdBlocks.push(createdBlock);
        }

        return { entry: updatedEntry, blocks: createdBlocks };
      }

      return { entry: updatedEntry, blocks: [] };
    });

    // Return updated entry with blocks
    const updatedEntryWithBlocks = await prisma.entry.findUnique({
      where: {
        siteId_slug: {
          siteId: site.id,
          slug: entrySlug
        }
      },
      include: {
        site: true,
        blocks: {
          orderBy: { position: 'asc' }
        }
      }
    });

    res.json(updatedEntryWithBlocks);
  } catch (error) {
    console.error('Error updating entry:', error);
    res.status(500).json({ 
      error: 'Failed to update entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/entries/:siteSlug - Create new entry in site with optional blocks
router.post('/:siteSlug', async (req: Request, res: Response) => {
  try {
    const { siteSlug } = req.params;
    const { title, slug, description, published, blocks } = req.body;
    
    if (!title || !slug) {
      return res.status(400).json({ error: 'Title and slug are required' });
    }

    // First find the site by slug (domain or name)
    const site = await prisma.site.findFirst({
      where: {
        OR: [
          { domain: siteSlug },
          { name: { equals: siteSlug, mode: 'insensitive' } }
        ]
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // Check if entry with this slug already exists in the site
    const existingEntry = await prisma.entry.findUnique({
      where: {
        siteId_slug: {
          siteId: site.id,
          slug: slug
        }
      }
    });

    if (existingEntry) {
      return res.status(409).json({ error: 'Entry with this slug already exists in the site' });
    }

    // Validate blocks if provided
    if (blocks && Array.isArray(blocks)) {
      for (const block of blocks) {
        if (!block.blockType || !block.blockData || block.position === undefined) {
          return res.status(400).json({ 
            error: 'Each block must have blockType, blockData, and position' 
          });
        }
      }
    }

    // Create the entry with blocks in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the entry
      const entry = await tx.entry.create({
        data: {
          title,
          slug,
          description,
          siteId: site.id,
          status: published ? 'PUBLISHED' : 'DRAFT',
          publishedAt: published ? new Date() : null
        }
      });

      // Create blocks if provided
      if (blocks && Array.isArray(blocks)) {
        await tx.canvasBlock.createMany({
          data: blocks.map((block: any) => ({
            blockType: block.blockType,
            blockData: block.blockData,
            position: block.position,
            entryId: entry.id,
            styles: block.styles || null
          }))
        });
      }

      // Return the entry with all related data
      return await tx.entry.findUnique({
        where: { id: entry.id },
        include: {
          site: true,
          blocks: {
            orderBy: { position: 'asc' }
          }
        }
      });
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating entry:', error);
    res.status(500).json({ 
      error: 'Failed to create entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/entries/:siteSlug - List all entries for a site
router.get('/:siteSlug', async (req: Request, res: Response) => {
  try {
    const { siteSlug } = req.params;
    const { status } = req.query;
    
    // First find the site by slug (domain or name)
    const site = await prisma.site.findFirst({
      where: {
        OR: [
          { domain: siteSlug },
          { name: { equals: siteSlug, mode: 'insensitive' } }
        ]
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // Build where clause for entries
    const where: any = { siteId: site.id };
    if (status) {
      where.status = status as EntryStatus;
    }

    const entries = await prisma.entry.findMany({
      where,
      include: {
        site: true,
        blocks: {
          orderBy: { position: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(entries);
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({ 
      error: 'Failed to fetch entries',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 
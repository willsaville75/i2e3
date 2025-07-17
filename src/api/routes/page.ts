import { Router, type Request, type Response } from 'express'
import { prisma } from '../../lib/prisma'

const router: Router = Router()

// POST /api/page - Create a single entry (page) with its blocks
router.post('/', async (req: Request, res: Response) => {
  try {
    const { siteSlug, title, slug, description, published, blocks } = req.body;
    
    // Validate required fields
    if (!siteSlug || !title || !slug) {
      return res.status(400).json({
        error: 'siteSlug, title, and slug are required'
      });
    }

    // Find the site by slug (domain or name)
    const site = await prisma.site.findFirst({
      where: {
        OR: [
          { domain: { equals: siteSlug, mode: 'insensitive' } },
          { name: { equals: siteSlug, mode: 'insensitive' } }
        ]
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // Check if entry with this slug already exists in the site
    const existingEntry = await prisma.entry.findFirst({
      where: {
        siteId: site.id,
        slug: slug
      }
    });

    if (existingEntry) {
      return res.status(409).json({ error: 'Entry with this slug already exists in the site' });
    }

    // Validate blocks if provided
    if (blocks && Array.isArray(blocks)) {
      for (const block of blocks) {
        if (!block.blockType || !block.blockData) {
          return res.status(400).json({
            error: 'Each block must have blockType and blockData'
          });
        }
      }
    }

    // Create entry and blocks in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the entry
      const entry = await tx.entry.create({
        data: {
          title,
          slug,
          description: description || null,
          status: published ? 'PUBLISHED' : 'DRAFT',
          publishedAt: published ? new Date() : null,
          siteId: site.id
        }
      });

      // Create blocks if provided
      const createdBlocks = [];
      if (blocks && Array.isArray(blocks)) {
        for (let i = 0; i < blocks.length; i++) {
          const block = blocks[i];
          const createdBlock = await tx.canvasBlock.create({
            data: {
              blockType: block.blockType,
              blockData: block.blockData,
              position: block.position !== undefined ? block.position : i + 1,
              styles: block.styles || null,
              entryId: entry.id
            }
          });
          createdBlocks.push(createdBlock);
        }
      }

      return { entry, blocks: createdBlocks };
    });

    // Return the created entry with basic metadata
    res.status(201).json({
      id: result.entry.id,
      title: result.entry.title,
      slug: result.entry.slug,
      description: result.entry.description,
      status: result.entry.status,
      publishedAt: result.entry.publishedAt,
      createdAt: result.entry.createdAt,
      siteId: result.entry.siteId,
      blocksCount: result.blocks.length,
      blocks: result.blocks.map(block => ({
        id: block.id,
        blockType: block.blockType,
        position: block.position
      }))
    });
    
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 
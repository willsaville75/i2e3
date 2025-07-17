import { Router, type Request, type Response } from 'express';
import { CMSService } from '../../services/cms';
import { EntryStatus } from '../../generated/prisma';

const router: Router = Router();

// Site routes
router.post('/sites', async (req: Request, res: Response) => {
  try {
    const { name, description, domain, settings } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Site name is required' });
    }

    const site = await CMSService.createSite({
      name,
      description,
      domain,
      settings
    });

    res.status(201).json(site);
  } catch (error) {
    console.error('Error creating site:', error);
    res.status(500).json({ 
      error: 'Failed to create site',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/sites', async (_req: Request, res: Response) => {
  try {
    const sites = await CMSService.listSites();
    res.json(sites);
  } catch (error) {
    console.error('Error listing sites:', error);
    res.status(500).json({ 
      error: 'Failed to list sites',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/sites/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const site = await CMSService.getSite(id);
    
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    res.json(site);
  } catch (error) {
    console.error('Error getting site:', error);
    res.status(500).json({ 
      error: 'Failed to get site',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.put('/sites/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, domain, settings } = req.body;
    
    const site = await CMSService.updateSite(id, {
      name,
      description,
      domain,
      settings
    });

    res.json(site);
  } catch (error) {
    console.error('Error updating site:', error);
    res.status(500).json({ 
      error: 'Failed to update site',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.delete('/sites/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await CMSService.deleteSite(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting site:', error);
    res.status(500).json({ 
      error: 'Failed to delete site',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Entry routes
router.post('/entries', async (req: Request, res: Response) => {
  try {
    const { title, slug, description, siteId, status, metadata } = req.body;
    
    if (!title || !slug || !siteId) {
      return res.status(400).json({ error: 'Title, slug, and siteId are required' });
    }

    const entry = await CMSService.createEntry({
      title,
      slug,
      description,
      siteId,
      status: status as EntryStatus,
      metadata
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('Error creating entry:', error);
    res.status(500).json({ 
      error: 'Failed to create entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/entries/search', async (req: Request, res: Response) => {
  try {
    const { q: query, siteId } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const entries = await CMSService.searchEntries(query, siteId as string);
    res.json(entries);
  } catch (error) {
    console.error('Error searching entries:', error);
    res.status(500).json({ 
      error: 'Failed to search entries',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/entries', async (req: Request, res: Response) => {
  try {
    const { siteId, status } = req.query;
    
    const entries = await CMSService.listEntries(
      siteId as string,
      status as EntryStatus
    );
    
    res.json(entries);
  } catch (error) {
    console.error('Error listing entries:', error);
    res.status(500).json({ 
      error: 'Failed to list entries',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/entries/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entry = await CMSService.getEntry(id);
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Error getting entry:', error);
    res.status(500).json({ 
      error: 'Failed to get entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.put('/entries/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, slug, description, status, metadata } = req.body;
    
    const entry = await CMSService.updateEntry(id, {
      title,
      slug,
      description,
      status: status as EntryStatus,
      metadata
    });

    res.json(entry);
  } catch (error) {
    console.error('Error updating entry:', error);
    res.status(500).json({ 
      error: 'Failed to update entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/entries/:id/publish', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entry = await CMSService.publishEntry(id);
    res.json(entry);
  } catch (error) {
    console.error('Error publishing entry:', error);
    res.status(500).json({ 
      error: 'Failed to publish entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.delete('/entries/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await CMSService.deleteEntry(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ 
      error: 'Failed to delete entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Canvas Block routes
router.post('/blocks', async (req: Request, res: Response) => {
  try {
    const { blockType, blockData, position, entryId, styles } = req.body;
    
    if (!blockType || !blockData || position === undefined || !entryId) {
      return res.status(400).json({ error: 'blockType, blockData, position, and entryId are required' });
    }

    const block = await CMSService.createCanvasBlock({
      blockType,
      blockData,
      position,
      entryId,
      styles
    });

    res.status(201).json(block);
  } catch (error) {
    console.error('Error creating canvas block:', error);
    res.status(500).json({ 
      error: 'Failed to create canvas block',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/blocks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const block = await CMSService.getCanvasBlock(id);
    
    if (!block) {
      return res.status(404).json({ error: 'Canvas block not found' });
    }

    res.json(block);
  } catch (error) {
    console.error('Error getting canvas block:', error);
    res.status(500).json({ 
      error: 'Failed to get canvas block',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.put('/blocks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { blockType, blockData, position, styles } = req.body;
    
    const block = await CMSService.updateCanvasBlock(id, {
      blockType,
      blockData,
      position,
      styles
    });

    res.json(block);
  } catch (error) {
    console.error('Error updating canvas block:', error);
    res.status(500).json({ 
      error: 'Failed to update canvas block',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.delete('/blocks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await CMSService.deleteCanvasBlock(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting canvas block:', error);
    res.status(500).json({ 
      error: 'Failed to delete canvas block',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/blocks/:id/duplicate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const block = await CMSService.duplicateCanvasBlock(id);
    res.status(201).json(block);
  } catch (error) {
    console.error('Error duplicating canvas block:', error);
    res.status(500).json({ 
      error: 'Failed to duplicate canvas block',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.put('/entries/:entryId/blocks/reorder', async (req: Request, res: Response) => {
  try {
    const { blockIds } = req.body;
    
    if (!Array.isArray(blockIds)) {
      return res.status(400).json({ error: 'blockIds must be an array' });
    }

    await CMSService.reorderCanvasBlocks(blockIds);
    res.status(204).send();
  } catch (error) {
    console.error('Error reordering canvas blocks:', error);
    res.status(500).json({ 
      error: 'Failed to reorder canvas blocks',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Utility routes
router.get('/sites/:siteId/structure', async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const structure = await CMSService.getFullSiteStructure(siteId);
    
    if (!structure) {
      return res.status(404).json({ error: 'Site not found' });
    }

    res.json(structure);
  } catch (error) {
    console.error('Error getting site structure:', error);
    res.status(500).json({ 
      error: 'Failed to get site structure',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/entries/:entryId/stats', async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const stats = await CMSService.getEntryStats(entryId);
    res.json(stats);
  } catch (error) {
    console.error('Error getting entry stats:', error);
    res.status(500).json({ 
      error: 'Failed to get entry stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 
import { prisma } from '../utils/prisma';
import type { Site, Entry, CanvasBlock, EntryStatus, Prisma } from '../generated/prisma';

export class CMSService {
  // Site management
  static async createSite(data: {
    name: string;
    description?: string;
    domain?: string;
    settings?: any;
  }): Promise<Site> {
    return await prisma.site.create({
      data,
      include: {
        entries: true
      }
    });
  }

  static async getSite(id: string): Promise<Site | null> {
    return await prisma.site.findUnique({
      where: { id },
      include: {
        entries: {
          include: {
            blocks: {
              orderBy: { position: 'asc' }
            }
          }
        }
      }
    });
  }

  static async getSiteByDomain(domain: string): Promise<Site | null> {
    return await prisma.site.findUnique({
      where: { domain },
      include: {
        entries: {
          include: {
            blocks: {
              orderBy: { position: 'asc' }
            }
          }
        }
      }
    });
  }

  static async updateSite(id: string, data: Prisma.SiteUpdateInput): Promise<Site> {
    return await prisma.site.update({
      where: { id },
      data,
      include: {
        entries: true
      }
    });
  }

  static async deleteSite(id: string): Promise<void> {
    await prisma.site.delete({
      where: { id }
    });
  }

  static async listSites(): Promise<Site[]> {
    return await prisma.site.findMany({
      include: {
        entries: {
          include: {
            blocks: {
              orderBy: { position: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Entry management
  static async createEntry(data: {
    title: string;
    slug: string;
    description?: string;
    siteId: string;
    status?: EntryStatus;
    metadata?: any;
  }): Promise<Entry> {
    return await prisma.entry.create({
      data,
      include: {
        site: true,
        blocks: {
          orderBy: { position: 'asc' }
        }
      }
    });
  }

  static async getEntry(id: string): Promise<Entry | null> {
    return await prisma.entry.findUnique({
      where: { id },
      include: {
        site: true,
        blocks: {
          orderBy: { position: 'asc' }
        }
      }
    });
  }

  static async getEntryBySlug(siteId: string, slug: string): Promise<Entry | null> {
    return await prisma.entry.findUnique({
      where: {
        siteId_slug: {
          siteId,
          slug
        }
      },
      include: {
        site: true,
        blocks: {
          orderBy: { position: 'asc' }
        }
      }
    });
  }

  static async updateEntry(id: string, data: Prisma.EntryUpdateInput): Promise<Entry> {
    return await prisma.entry.update({
      where: { id },
      data,
      include: {
        site: true,
        blocks: {
          orderBy: { position: 'asc' }
        }
      }
    });
  }

  static async deleteEntry(id: string): Promise<void> {
    await prisma.entry.delete({
      where: { id }
    });
  }

  static async listEntries(siteId?: string, status?: EntryStatus): Promise<Entry[]> {
    const where: any = {};
    if (siteId) where.siteId = siteId;
    if (status) where.status = status;

    return await prisma.entry.findMany({
      where,
      include: {
        site: true,
        blocks: {
          orderBy: { position: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async publishEntry(id: string): Promise<Entry> {
    return await prisma.entry.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date()
      },
      include: {
        site: true,
        blocks: {
          orderBy: { position: 'asc' }
        }
      }
    });
  }

  // Canvas Block management
  static async createCanvasBlock(data: {
    blockType: string;
    blockData: any;
    position: number;
    entryId: string;
    styles?: any;
  }): Promise<CanvasBlock> {
    return await prisma.canvasBlock.create({
      data,
      include: {
        entry: {
          include: {
            site: true
          }
        }
      }
    });
  }

  static async getCanvasBlock(id: string): Promise<CanvasBlock | null> {
    return await prisma.canvasBlock.findUnique({
      where: { id },
      include: {
        entry: {
          include: {
            site: true
          }
        }
      }
    });
  }

  static async updateCanvasBlock(id: string, data: Prisma.CanvasBlockUpdateInput): Promise<CanvasBlock> {
    return await prisma.canvasBlock.update({
      where: { id },
      data,
      include: {
        entry: {
          include: {
            site: true
          }
        }
      }
    });
  }

  static async deleteCanvasBlock(id: string): Promise<void> {
    await prisma.canvasBlock.delete({
      where: { id }
    });
  }

  static async reorderCanvasBlocks(blockIds: string[]): Promise<void> {
    // Update positions in a transaction
    await prisma.$transaction(
      blockIds.map((blockId, index) =>
        prisma.canvasBlock.update({
          where: { id: blockId },
          data: { position: index + 1 }
        })
      )
    );
  }

  static async duplicateCanvasBlock(id: string): Promise<CanvasBlock> {
    const originalBlock = await prisma.canvasBlock.findUnique({
      where: { id }
    });

    if (!originalBlock) {
      throw new Error('Block not found');
    }

    // Find the next available position
    const maxPosition = await prisma.canvasBlock.findFirst({
      where: { entryId: originalBlock.entryId },
      orderBy: { position: 'desc' }
    });

    const newPosition = (maxPosition?.position || 0) + 1;

    return await prisma.canvasBlock.create({
      data: {
        blockType: originalBlock.blockType,
        blockData: originalBlock.blockData as Prisma.InputJsonValue,
        position: newPosition,
        entryId: originalBlock.entryId,
        styles: originalBlock.styles as Prisma.InputJsonValue
      },
      include: {
        entry: {
          include: {
            site: true
          }
        }
      }
    });
  }

  // Utility methods
  static async getFullSiteStructure(siteId: string) {
    return await prisma.site.findUnique({
      where: { id: siteId },
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
  }

  static async searchEntries(query: string, siteId?: string) {
    const where: any = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { slug: { contains: query, mode: 'insensitive' } }
      ]
    };

    if (siteId) {
      where.siteId = siteId;
    }

    return await prisma.entry.findMany({
      where,
      include: {
        site: true,
        blocks: {
          orderBy: { position: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getEntryStats(entryId: string) {
    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
      include: {
        blocks: true
      }
    });

    if (!entry) {
      throw new Error('Entry not found');
    }

    const blockTypeCount = entry.blocks.reduce((acc, block) => {
      acc[block.blockType] = (acc[block.blockType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalBlocks: entry.blocks.length,
      blockTypes: blockTypeCount,
      status: entry.status,
      lastUpdated: entry.updatedAt,
      publishedAt: entry.publishedAt
    };
  }
} 
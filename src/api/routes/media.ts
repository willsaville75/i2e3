import { Router, type Request, type Response } from 'express';
import { prisma } from '../../utils/prisma';
import Replicate from 'replicate';
import fetch from 'node-fetch';
import { v2 as cloudinary } from 'cloudinary';

const router: Router = Router();

// GET /api/media - List media with pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Optional filters
    const resourceType = req.query.resourceType as string;
    const folder = req.query.folder as string;
    const tags = req.query.tags as string;

    // Build where clause
    const where: any = {};
    if (resourceType) {
      where.resourceType = resourceType;
    }
    if (folder) {
      where.folder = folder;
    }
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      where.tags = {
        hasSome: tagArray
      };
    }

    // Get total count for pagination
    const totalCount = await prisma.media.count({ where });

    // Get paginated media
    const media = await prisma.media.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      data: media,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({
      error: 'Failed to fetch media',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/media - Store new media
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      filename,
      originalName,
      mimeType,
      size,
      url,
      publicId,
      alt,
      format,
      resourceType,
      width,
      height,
      duration,
      folder,
      tags
    } = req.body;

    // Validate required fields
    if (!filename || !originalName || !mimeType || !size || !url) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['filename', 'originalName', 'mimeType', 'size', 'url']
      });
    }

    // Validate URL if CLOUDINARY_URL is set
    if (process.env.CLOUDINARY_URL) {
      // Basic validation - check if URL contains cloudinary domain
      const cloudinaryDomain = 'cloudinary.com';
      if (!url.includes(cloudinaryDomain) && !url.startsWith('/')) {
        return res.status(400).json({
          error: 'Invalid media URL',
          details: 'URL must be from Cloudinary or a local path'
        });
      }
    }

    // Create media entry
    const media = await prisma.media.create({
      data: {
        filename,
        originalName,
        mimeType,
        size,
        url,
        publicId,
        alt,
        format,
        resourceType,
        width,
        height,
        duration,
        folder,
        tags: tags || []
      }
    });

    res.status(201).json(media);
  } catch (error) {
    console.error('Error creating media:', error);
    res.status(500).json({
      error: 'Failed to create media',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/media/:id - Delete media by ID
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if media exists
    const media = await prisma.media.findUnique({
      where: { id }
    });

    if (!media) {
      return res.status(404).json({
        error: 'Media not found'
      });
    }

    // Delete media from database
    await prisma.media.delete({
      where: { id }
    });

    // Note: Actual file deletion from Cloudinary should be handled separately
    // This could be done via a webhook or background job
    // For now, we're just removing the database record

    res.json({
      message: 'Media deleted successfully',
      deletedMedia: media
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({
      error: 'Failed to delete media',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/media/generate/image - Generate image using Replicate
router.post('/generate/image', async (req: Request, res: Response) => {
  try {
    const { prompt, model = 'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf' } = req.body;

    // Validate input
    if (!prompt) {
      return res.status(400).json({
        error: 'Missing required field: prompt'
      });
    }

    // Check for Replicate API token
    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({
        error: 'Replicate API token not configured'
      });
    }

    // Initialize Replicate client
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    });

    console.log('🎨 Generating image with prompt:', prompt);

    // Run the model
    const output = await replicate.run(model, {
      input: {
        prompt,
        width: 1024,
        height: 1024,
        num_outputs: 1,
        num_inference_steps: 50,
        guidance_scale: 7.5
      }
    }) as string[];

    if (!output || output.length === 0) {
      throw new Error('No image generated');
    }

    const generatedImageUrl = output[0];
    console.log('🖼️ Image generated:', generatedImageUrl);

    // Configure Cloudinary if not already done
    if (!cloudinary.config().cloud_name) {
      const cloudinaryUrl = process.env.CLOUDINARY_URL;
      if (!cloudinaryUrl) {
        return res.status(500).json({
          error: 'Cloudinary URL not configured'
        });
      }
      
      cloudinary.config(true);
    }

    // Upload to Cloudinary
    console.log('📤 Uploading to Cloudinary...');
    const uploadResult = await cloudinary.uploader.upload(generatedImageUrl, {
      folder: 'ai-generated',
      tags: ['ai-generated', 'replicate'],
      resource_type: 'image'
    });

    // Create media entry
    const media = await prisma.media.create({
      data: {
        filename: uploadResult.public_id,
        originalName: `AI Generated: ${prompt.substring(0, 50)}...`,
        mimeType: 'image/' + (uploadResult.format || 'jpg'),
        size: uploadResult.bytes || 0,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        alt: `AI generated image: ${prompt}`,
        format: uploadResult.format || 'jpg',
        resourceType: 'image',
        width: uploadResult.width,
        height: uploadResult.height,
        folder: 'ai-generated',
        tags: ['ai-generated', 'replicate', ...(req.body.tags || [])]
      }
    });

    res.status(201).json({
      message: 'Image generated successfully',
      media,
      generationDetails: {
        model,
        prompt,
        originalUrl: generatedImageUrl
      }
    });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({
      error: 'Failed to generate image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/media/generate/video - Generate video using RunwayML
router.post('/generate/video', async (req: Request, res: Response) => {
  try {
    const { prompt, duration = 5 } = req.body;

    // Validate input
    if (!prompt) {
      return res.status(400).json({
        error: 'Missing required field: prompt'
      });
    }

    // Check for Runway API key
    if (!process.env.RUNWAY_API_KEY) {
      return res.status(500).json({
        error: 'Runway API key not configured'
      });
    }

    console.log('🎬 Generating video with prompt:', prompt);

    // Call RunwayML API
    const runwayResponse = await fetch('https://api.runwayml.com/v1/generate/video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        duration,
        width: 1280,
        height: 768,
        fps: 24
      })
    });

    if (!runwayResponse.ok) {
      const error = await runwayResponse.text();
      throw new Error(`RunwayML API error: ${error}`);
    }

    const runwayData = await runwayResponse.json() as any;
    
    // Poll for completion (RunwayML typically returns a job ID)
    let videoUrl: string | null = null;
    const jobId = runwayData.id || runwayData.job_id;
    
    if (jobId) {
      // Poll for job completion
      const maxAttempts = 60; // 5 minutes max
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        const statusResponse = await fetch(`https://api.runwayml.com/v1/jobs/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`
          }
        });
        
        const statusData = await statusResponse.json() as any;
        
        if (statusData.status === 'completed' && statusData.output_url) {
          videoUrl = statusData.output_url;
          break;
        } else if (statusData.status === 'failed') {
          throw new Error('Video generation failed');
        }
        
        // Wait 5 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      }
      
      if (!videoUrl) {
        throw new Error('Video generation timed out');
      }
    } else if (runwayData.video_url || runwayData.output_url) {
      videoUrl = runwayData.video_url || runwayData.output_url;
    } else {
      throw new Error('No video URL returned from RunwayML');
    }

    console.log('🎥 Video generated:', videoUrl);

    // Ensure we have a video URL
    if (!videoUrl) {
      throw new Error('No video URL available for upload');
    }

    // Configure Cloudinary if not already done
    if (!cloudinary.config().cloud_name) {
      const cloudinaryUrl = process.env.CLOUDINARY_URL;
      if (!cloudinaryUrl) {
        return res.status(500).json({
          error: 'Cloudinary URL not configured'
        });
      }
      
      cloudinary.config(true);
    }

    // Upload video to Cloudinary
    console.log('📤 Uploading video to Cloudinary...');
    const uploadResult = await cloudinary.uploader.upload(videoUrl, {
      folder: 'ai-generated-videos',
      tags: ['ai-generated', 'runway'],
      resource_type: 'video'
    });

    // Create media entry
    const media = await prisma.media.create({
      data: {
        filename: uploadResult.public_id,
        originalName: `AI Generated Video: ${prompt.substring(0, 50)}...`,
        mimeType: 'video/' + (uploadResult.format || 'mp4'),
        size: uploadResult.bytes || 0,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        alt: `AI generated video: ${prompt}`,
        format: uploadResult.format || 'mp4',
        resourceType: 'video',
        width: uploadResult.width,
        height: uploadResult.height,
        duration: uploadResult.duration || duration,
        folder: 'ai-generated-videos',
        tags: ['ai-generated', 'runway', ...(req.body.tags || [])]
      }
    });

    res.status(201).json({
      message: 'Video generated successfully',
      media,
      generationDetails: {
        prompt,
        duration,
        originalUrl: videoUrl
      }
    });
  } catch (error) {
    console.error('Error generating video:', error);
    res.status(500).json({
      error: 'Failed to generate video',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 
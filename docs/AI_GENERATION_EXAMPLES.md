# AI Media Generation Examples

This guide shows how to use the AI generation endpoints in the I2E Media API.

## Prerequisites

Before using these endpoints, ensure you have:

1. **Environment Variables** set in your `.env` file:
   ```env
   REPLICATE_API_TOKEN=your_replicate_token_here
   RUNWAY_API_KEY=your_runway_api_key_here
   CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
   ```

2. **API Server Running** on port 3002

## Image Generation Examples

### Basic Image Generation
```bash
curl -X POST http://localhost:3002/api/media/generate/image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A serene mountain landscape at sunrise with mist"
  }'
```

### Image with Custom Tags
```bash
curl -X POST http://localhost:3002/api/media/generate/image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A modern office workspace with plants and natural lighting",
    "tags": ["office", "workspace", "interior"]
  }'
```

### Using a Different Model
```bash
curl -X POST http://localhost:3002/api/media/generate/image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cyberpunk city street at night",
    "model": "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    "tags": ["cyberpunk", "city", "night"]
  }'
```

## Video Generation Examples

### Basic Video Generation
```bash
curl -X POST http://localhost:3002/api/media/generate/video \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A butterfly landing on a flower in slow motion"
  }'
```

### Video with Custom Duration
```bash
curl -X POST http://localhost:3002/api/media/generate/video \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Ocean waves crashing on a rocky shore",
    "duration": 10,
    "tags": ["ocean", "nature", "waves"]
  }'
```

## JavaScript/TypeScript Examples

### Generate Image with Fetch API
```javascript
async function generateImage(prompt, tags = []) {
  try {
    const response = await fetch('http://localhost:3002/api/media/generate/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        tags
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error);
    }

    const result = await response.json();
    console.log('Generated image:', result.media.url);
    return result;
  } catch (error) {
    console.error('Failed to generate image:', error);
    throw error;
  }
}

// Usage
generateImage('A cozy coffee shop interior', ['interior', 'coffee'])
  .then(result => {
    console.log('Image saved to database:', result.media.id);
    console.log('Cloudinary URL:', result.media.url);
  });
```

### Generate Video with Progress Monitoring
```javascript
async function generateVideo(prompt, duration = 5) {
  console.log(`Generating ${duration}s video...`);
  
  try {
    const response = await fetch('http://localhost:3002/api/media/generate/video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        duration
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.details || result.error);
    }

    console.log('Video generated successfully!');
    console.log('Video URL:', result.media.url);
    console.log('Duration:', result.media.duration, 'seconds');
    
    return result;
  } catch (error) {
    console.error('Video generation failed:', error);
    throw error;
  }
}

// Usage
generateVideo('A time-lapse of clouds moving across the sky', 8)
  .then(result => {
    // Use the video URL in your application
    const videoElement = document.createElement('video');
    videoElement.src = result.media.url;
    videoElement.controls = true;
    document.body.appendChild(videoElement);
  });
```

## React Component Example

```jsx
import React, { useState } from 'react';

function AIMediaGenerator() {
  const [loading, setLoading] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [error, setError] = useState('');

  const generateMedia = async (type, prompt) => {
    setLoading(true);
    setError('');
    
    try {
      const endpoint = type === 'image' 
        ? '/api/media/generate/image' 
        : '/api/media/generate/video';
        
      const response = await fetch(`http://localhost:3002${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error);
      }

      setMediaUrl(result.media.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={() => generateMedia('image', 'A peaceful zen garden')}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Image'}
      </button>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {mediaUrl && (
        <div>
          <h3>Generated Media:</h3>
          {mediaUrl.includes('/video/') ? (
            <video src={mediaUrl} controls width="100%" />
          ) : (
            <img src={mediaUrl} alt="Generated" style={{ maxWidth: '100%' }} />
          )}
        </div>
      )}
    </div>
  );
}
```

## Common Use Cases

### 1. Generate Hero Images for Pages
```javascript
const heroImage = await generateImage(
  'Modern tech startup office with people collaborating',
  ['hero', 'startup', 'office']
);
// Use heroImage.media.url in your hero block
```

### 2. Create Product Showcase Videos
```javascript
const productVideo = await generateVideo(
  'Sleek smartphone rotating 360 degrees on white background',
  7  // 7 seconds
);
// Use productVideo.media.url in product pages
```

### 3. Batch Generation
```javascript
const prompts = [
  'Sunrise over mountains',
  'City skyline at night',
  'Tropical beach paradise'
];

const images = await Promise.all(
  prompts.map(prompt => generateImage(prompt, ['gallery']))
);

// Now you have an array of generated images for a gallery
```

## Error Handling

Common errors and how to handle them:

1. **Missing API Token**
   ```json
   {
     "error": "Replicate API token not configured"
   }
   ```
   Solution: Add `REPLICATE_API_TOKEN` to your `.env` file

2. **Generation Timeout**
   ```json
   {
     "error": "Failed to generate video",
     "details": "Video generation timed out"
   }
   ```
   Solution: Try a simpler prompt or shorter duration

3. **Cloudinary Upload Failed**
   ```json
   {
     "error": "Failed to generate image",
     "details": "Cloudinary upload failed: ..."
   }
   ```
   Solution: Check your `CLOUDINARY_URL` configuration

## Tips and Best Practices

1. **Prompt Engineering**
   - Be specific and descriptive
   - Include style keywords (e.g., "photorealistic", "illustration", "cinematic")
   - Mention lighting, mood, and composition

2. **Performance**
   - Image generation typically takes 10-30 seconds
   - Video generation can take 1-5 minutes
   - Consider implementing progress indicators in your UI

3. **Cost Management**
   - Each API call consumes credits on Replicate/RunwayML
   - Cache generated media when possible
   - Consider implementing rate limiting

4. **Storage**
   - Generated media is automatically organized in Cloudinary folders
   - Images go to `ai-generated/` folder
   - Videos go to `ai-generated-videos/` folder
   - Use tags for easy filtering and search

5. **Integration with I2E Blocks**
   - Use generated media URLs directly in block props
   - Store media IDs for future reference
   - Leverage the Media API's filtering capabilities 
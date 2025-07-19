# Media API Documentation

The Media API provides endpoints for managing media files in the I2E system. It stores metadata about media files uploaded to Cloudinary or other storage providers.

## Base URL
```
http://localhost:3002/api/media
```

## Endpoints

### 1. List Media - GET /api/media

Returns a paginated list of media files with optional filtering.

**Query Parameters:**
- `page` (number, optional): Page number, default: 1
- `limit` (number, optional): Items per page, default: 20
- `resourceType` (string, optional): Filter by resource type (image, video, raw)
- `folder` (string, optional): Filter by folder path
- `tags` (string, optional): Comma-separated list of tags to filter by

**Example Request:**
```bash
curl -X GET "http://localhost:3002/api/media?page=1&limit=5&resourceType=image"
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "cmd8kjexr0001s7sg1eei75hg",
      "filename": "test-enhanced/ai-image-1752828006695",
      "originalName": "AI Generated: A futuristic cityscape...",
      "mimeType": "image/jpg",
      "size": 127474,
      "url": "https://res.cloudinary.com/dywqgdekw/image/upload/...",
      "publicId": "test-enhanced/ai-image-1752828006695",
      "alt": "AI generated image: A futuristic cityscape",
      "format": "jpg",
      "resourceType": "image",
      "width": 1024,
      "height": 1024,
      "duration": null,
      "folder": "test-enhanced",
      "tags": ["ai-generated", "replicate", "test"],
      "createdAt": "2025-07-18T08:40:08.020Z",
      "updatedAt": "2025-07-18T08:40:08.020Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalCount": 9,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 2. Create Media - POST /api/media

Creates a new media entry in the database.

**Request Body:**
```json
{
  "filename": "test-api-upload",           // Required
  "originalName": "Test API Upload.jpg",   // Required
  "mimeType": "image/jpeg",                // Required
  "size": 123456,                          // Required (in bytes)
  "url": "https://res.cloudinary.com/...", // Required
  "publicId": "test-api-upload",           // Optional
  "alt": "Test upload via API",            // Optional
  "format": "jpg",                         // Optional
  "resourceType": "image",                 // Optional
  "width": 800,                            // Optional
  "height": 600,                           // Optional
  "duration": null,                        // Optional (for videos, in seconds)
  "folder": "api-test",                    // Optional
  "tags": ["test", "api"]                  // Optional
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3002/api/media \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "test-api-upload",
    "originalName": "Test API Upload.jpg",
    "mimeType": "image/jpeg",
    "size": 123456,
    "url": "https://res.cloudinary.com/dywqgdekw/image/upload/test-api-upload.jpg",
    "publicId": "test-api-upload",
    "alt": "Test upload via API",
    "format": "jpg",
    "resourceType": "image",
    "width": 800,
    "height": 600,
    "folder": "api-test",
    "tags": ["test", "api"]
  }'
```

**Example Response:**
```json
{
  "id": "cmd8zwcnm0000s72fm2xryzg1",
  "filename": "test-api-upload",
  "originalName": "Test API Upload.jpg",
  "mimeType": "image/jpeg",
  "size": 123456,
  "url": "https://res.cloudinary.com/dywqgdekw/image/upload/test-api-upload.jpg",
  "publicId": "test-api-upload",
  "alt": "Test upload via API",
  "format": "jpg",
  "resourceType": "image",
  "width": 800,
  "height": 600,
  "duration": null,
  "folder": "api-test",
  "tags": ["test", "api"],
  "createdAt": "2025-07-18T15:50:05.842Z",
  "updatedAt": "2025-07-18T15:50:05.842Z"
}
```

### 3. Delete Media - DELETE /api/media/:id

Deletes a media entry from the database by ID.

**Path Parameters:**
- `id` (string, required): The media ID to delete

**Example Request:**
```bash
curl -X DELETE http://localhost:3002/api/media/cmd8zwcnm0000s72fm2xryzg1
```

**Example Response:**
```json
{
  "message": "Media deleted successfully",
  "deletedMedia": {
    "id": "cmd8zwcnm0000s72fm2xryzg1",
    "filename": "test-api-upload",
    "originalName": "Test API Upload.jpg",
    "mimeType": "image/jpeg",
    "size": 123456,
    "url": "https://res.cloudinary.com/dywqgdekw/image/upload/test-api-upload.jpg",
    "publicId": "test-api-upload",
    "alt": "Test upload via API",
    "format": "jpg",
    "resourceType": "image",
    "width": 800,
    "height": 600,
    "duration": null,
    "folder": "api-test",
    "tags": ["test", "api"],
    "createdAt": "2025-07-18T15:50:05.842Z",
    "updatedAt": "2025-07-18T15:50:05.842Z"
  }
}
```

### 4. Generate Image - POST /api/media/generate/image

Generates an AI image using Replicate (Stable Diffusion) and saves it to Cloudinary.

**Request Body:**
```json
{
  "prompt": "A beautiful sunset over mountains",    // Required
  "model": "stability-ai/stable-diffusion:...",    // Optional (defaults to SD 2.1)
  "tags": ["landscape", "nature"]                   // Optional additional tags
}
```

**Environment Requirements:**
- `REPLICATE_API_TOKEN`: Your Replicate API token
- `CLOUDINARY_URL`: Your Cloudinary connection URL

**Example Request:**
```bash
curl -X POST http://localhost:3002/api/media/generate/image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A futuristic cityscape at night with neon lights",
    "tags": ["futuristic", "city"]
  }'
```

**Example Response:**
```json
{
  "message": "Image generated successfully",
  "media": {
    "id": "cmd8zwcnm0000s72fm2xryzg1",
    "filename": "ai-generated/xyz123",
    "originalName": "AI Generated: A futuristic cityscape at night with neon...",
    "mimeType": "image/jpg",
    "size": 256789,
    "url": "https://res.cloudinary.com/your-cloud/image/upload/ai-generated/xyz123.jpg",
    "publicId": "ai-generated/xyz123",
    "alt": "AI generated image: A futuristic cityscape at night with neon lights",
    "format": "jpg",
    "resourceType": "image",
    "width": 1024,
    "height": 1024,
    "folder": "ai-generated",
    "tags": ["ai-generated", "replicate", "futuristic", "city"],
    "createdAt": "2025-07-18T16:00:00.000Z",
    "updatedAt": "2025-07-18T16:00:00.000Z"
  },
  "generationDetails": {
    "model": "stability-ai/stable-diffusion:...",
    "prompt": "A futuristic cityscape at night with neon lights",
    "originalUrl": "https://replicate.delivery/..."
  }
}
```

### 5. Generate Video - POST /api/media/generate/video

Generates an AI video using RunwayML and saves it to Cloudinary.

**Request Body:**
```json
{
  "prompt": "A cat playing with a ball of yarn",    // Required
  "duration": 5,                                     // Optional (default: 5 seconds)
  "tags": ["animals", "cute"]                        // Optional additional tags
}
```

**Environment Requirements:**
- `RUNWAY_API_KEY`: Your RunwayML API key
- `CLOUDINARY_URL`: Your Cloudinary connection URL

**Example Request:**
```bash
curl -X POST http://localhost:3002/api/media/generate/video \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A peaceful sunset over the ocean with gentle waves",
    "duration": 10,
    "tags": ["nature", "ocean", "sunset"]
  }'
```

**Example Response:**
```json
{
  "message": "Video generated successfully",
  "media": {
    "id": "cmd8zwcnm0000s72fm2xryzg2",
    "filename": "ai-generated-videos/abc456",
    "originalName": "AI Generated Video: A peaceful sunset over the ocean...",
    "mimeType": "video/mp4",
    "size": 5242880,
    "url": "https://res.cloudinary.com/your-cloud/video/upload/ai-generated-videos/abc456.mp4",
    "publicId": "ai-generated-videos/abc456",
    "alt": "AI generated video: A peaceful sunset over the ocean with gentle waves",
    "format": "mp4",
    "resourceType": "video",
    "width": 1280,
    "height": 768,
    "duration": 10,
    "folder": "ai-generated-videos",
    "tags": ["ai-generated", "runway", "nature", "ocean", "sunset"],
    "createdAt": "2025-07-18T16:05:00.000Z",
    "updatedAt": "2025-07-18T16:05:00.000Z"
  },
  "generationDetails": {
    "prompt": "A peaceful sunset over the ocean with gentle waves",
    "duration": 10,
    "originalUrl": "https://runwayml.com/..."
  }
}
```

## Error Responses

### 400 Bad Request
When required fields are missing:
```json
{
  "error": "Missing required fields",
  "required": ["filename", "originalName", "mimeType", "size", "url"]
}
```

When missing prompt for AI generation:
```json
{
  "error": "Missing required field: prompt"
}
```

When URL validation fails (if CLOUDINARY_URL is set):
```json
{
  "error": "Invalid media URL",
  "details": "URL must be from Cloudinary or a local path"
}
```

### 404 Not Found
When trying to delete non-existent media:
```json
{
  "error": "Media not found"
}
```

### 500 Internal Server Error
When database operations fail:
```json
{
  "error": "Failed to fetch media",
  "details": "Error message here"
}
```

When API tokens are not configured:
```json
{
  "error": "Replicate API token not configured"
}
// or
{
  "error": "Runway API key not configured"
}
// or
{
  "error": "Cloudinary URL not configured"
}
```

When AI generation fails:
```json
{
  "error": "Failed to generate image",
  "details": "No image generated"
}
// or
{
  "error": "Failed to generate video",
  "details": "Video generation timed out"
}
```

## Database Schema

The Media model in Prisma includes the following fields:

```prisma
model Media {
  id           String   @id @default(cuid())
  filename     String
  originalName String
  mimeType     String
  size         Int      // File size in bytes
  url          String   // Storage URL (local/cloud)
  publicId     String?  // Cloud storage public ID (for Cloudinary etc)
  alt          String?  // Alt text for accessibility
  format       String?  // File format extension
  resourceType String?  // Type: image, video, raw
  width        Int?     // For images
  height       Int?     // For images
  duration     Int?     // For videos (in seconds)
  folder       String?  // Virtual folder path
  tags         String[] // Searchable tags
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## Implementation Notes

1. **URL Validation**: If the `CLOUDINARY_URL` environment variable is set, the API validates that URLs either contain "cloudinary.com" or start with "/" (for local paths).

2. **File Deletion**: The DELETE endpoint only removes the database record. Actual file deletion from Cloudinary should be handled separately (e.g., via webhook or background job).

3. **Pagination**: The API uses offset-based pagination with `page` and `limit` parameters.

4. **Tag Filtering**: When filtering by tags, the API uses Prisma's `hasSome` operator, which returns media that have at least one of the specified tags.

5. **Error Handling**: All endpoints include proper error handling with descriptive error messages and appropriate HTTP status codes.

6. **AI Image Generation**: 
   - Uses Replicate API with Stable Diffusion model (customizable)
   - Generates 1024x1024 images by default
   - Automatically uploads to Cloudinary and stores metadata
   - Requires `REPLICATE_API_TOKEN` environment variable

7. **AI Video Generation**:
   - Uses RunwayML API for video generation
   - Supports custom duration (default 5 seconds)
   - Polls for job completion (up to 5 minutes)
   - Generates 1280x768 videos at 24fps
   - Requires `RUNWAY_API_KEY` environment variable

8. **Cloudinary Integration**:
   - Both AI endpoints automatically upload generated content to Cloudinary
   - Uses `upload_preset` for simplified uploads (may need configuration in Cloudinary)
   - Organizes content in folders: `ai-generated` for images, `ai-generated-videos` for videos
   - Extracts credentials from `CLOUDINARY_URL` environment variable

## Usage Examples

### Upload an image
```javascript
const mediaData = {
  filename: "product-image-001",
  originalName: "Product Photo.jpg",
  mimeType: "image/jpeg",
  size: 256789,
  url: "https://res.cloudinary.com/your-cloud/image/upload/product-001.jpg",
  publicId: "products/product-001",
  alt: "Product photo showing front view",
  format: "jpg",
  resourceType: "image",
  width: 1200,
  height: 800,
  folder: "products",
  tags: ["product", "catalog", "featured"]
};

const response = await fetch('http://localhost:3002/api/media', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(mediaData)
});
```

### Get images with specific tags
```javascript
const response = await fetch('http://localhost:3002/api/media?tags=featured,product&resourceType=image&limit=10');
const { data, pagination } = await response.json();
```

### Delete a media file
```javascript
const mediaId = 'cmd8zwcnm0000s72fm2xryzg1';
const response = await fetch(`http://localhost:3002/api/media/${mediaId}`, {
  method: 'DELETE'
});
``` 
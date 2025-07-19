# Media API Reference

The Media API provides endpoints for managing media files in the I2E system. It stores metadata about media files uploaded to Cloudinary or local storage.

## Base URL
```
http://localhost:3002/api/media
```

## Endpoints

### 1. List Media (GET /api/media)

Get a paginated list of media files with optional filtering.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `resourceType` (string, optional): Filter by resource type (image, video, raw)
- `folder` (string, optional): Filter by folder path
- `tags` (string, optional): Comma-separated list of tags to filter by

**Example Request:**
```bash
curl -X GET "http://localhost:3002/api/media?page=1&limit=10&resourceType=image&tags=ai-generated,test"
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
      "url": "https://res.cloudinary.com/dywqgdekw/image/upload/v1752828007/test-enhanced/ai-image-1752828006695.jpg",
      "publicId": "test-enhanced/ai-image-1752828006695",
      "alt": "AI generated image: A futuristic cityscape at night with neon lights",
      "format": "jpg",
      "resourceType": "image",
      "width": 1024,
      "height": 1024,
      "duration": null,
      "folder": "test-enhanced",
      "tags": ["ai-generated", "replicate", "test", "futuristic", "city"],
      "createdAt": "2025-07-18T08:40:08.020Z",
      "updatedAt": "2025-07-18T08:40:08.020Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 2. Create Media (POST /api/media)

Store metadata for a new media file.

**Request Body:**
```json
{
  "filename": "test-api-image",              // Required
  "originalName": "Test API Image.jpg",      // Required
  "mimeType": "image/jpeg",                  // Required
  "size": 256789,                            // Required (bytes)
  "url": "https://res.cloudinary.com/...",   // Required
  "publicId": "test-api-image",              // Optional
  "alt": "Test image uploaded via API",      // Optional
  "format": "jpg",                           // Optional
  "resourceType": "image",                   // Optional
  "width": 1920,                             // Optional
  "height": 1080,                            // Optional
  "duration": null,                          // Optional (for videos, in seconds)
  "folder": "api-test",                      // Optional
  "tags": ["api", "test", "demo"]           // Optional
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3002/api/media \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "test-api-image",
    "originalName": "Test API Image.jpg",
    "mimeType": "image/jpeg",
    "size": 256789,
    "url": "https://res.cloudinary.com/dywqgdekw/image/upload/v1234567890/test-api-image.jpg",
    "publicId": "test-api-image",
    "format": "jpg",
    "resourceType": "image",
    "width": 1920,
    "height": 1080,
    "folder": "api-test",
    "tags": ["api", "test", "demo"],
    "alt": "Test image uploaded via API"
  }'
```

**Example Response:**
```json
{
  "id": "cmd8zteq60000s72qj0nbvf82",
  "filename": "test-api-image",
  "originalName": "Test API Image.jpg",
  "mimeType": "image/jpeg",
  "size": 256789,
  "url": "https://res.cloudinary.com/dywqgdekw/image/upload/v1234567890/test-api-image.jpg",
  "publicId": "test-api-image",
  "alt": "Test image uploaded via API",
  "format": "jpg",
  "resourceType": "image",
  "width": 1920,
  "height": 1080,
  "duration": null,
  "folder": "api-test",
  "tags": ["api", "test", "demo"],
  "createdAt": "2025-07-18T15:47:48.558Z",
  "updatedAt": "2025-07-18T15:47:48.558Z"
}
```

### 3. Delete Media (DELETE /api/media/:id)

Delete media metadata by ID.

**Note:** This only removes the database record. Actual file deletion from Cloudinary should be handled separately.

**Example Request:**
```bash
curl -X DELETE http://localhost:3002/api/media/cmd8zteq60000s72qj0nbvf82
```

**Example Response:**
```json
{
  "message": "Media deleted successfully",
  "deletedMedia": {
    "id": "cmd8zteq60000s72qj0nbvf82",
    "filename": "test-api-image",
    "originalName": "Test API Image.jpg",
    "mimeType": "image/jpeg",
    "size": 256789,
    "url": "https://res.cloudinary.com/dywqgdekw/image/upload/v1234567890/test-api-image.jpg",
    "publicId": "test-api-image",
    "alt": "Test image uploaded via API",
    "format": "jpg",
    "resourceType": "image",
    "width": 1920,
    "height": 1080,
    "duration": null,
    "folder": "api-test",
    "tags": ["api", "test", "demo"],
    "createdAt": "2025-07-18T15:47:48.558Z",
    "updatedAt": "2025-07-18T15:47:48.558Z"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields",
  "required": ["filename", "originalName", "mimeType", "size", "url"]
}
```

### 404 Not Found
```json
{
  "error": "Media not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch media",
  "details": "Error message details"
}
```

## Media Model Schema

```typescript
interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;              // File size in bytes
  url: string;               // Storage URL (Cloudinary or local)
  publicId?: string;         // Cloud storage public ID
  alt?: string;              // Alt text for accessibility
  format?: string;           // File format extension
  resourceType?: string;     // Type: image, video, raw
  width?: number;            // For images
  height?: number;           // For images
  duration?: number;         // For videos (in seconds)
  folder?: string;           // Virtual folder path
  tags: string[];            // Searchable tags
  createdAt: Date;
  updatedAt: Date;
}
```

## Notes

1. **URL Validation**: If `CLOUDINARY_URL` environment variable is set, the API validates that URLs contain "cloudinary.com" or start with "/" (for local paths).

2. **Pagination**: The API returns pagination metadata including total count, total pages, and navigation flags.

3. **Tag Filtering**: When filtering by tags, the API uses "hasSome" logic - it returns media that have at least one of the specified tags.

4. **File Deletion**: The DELETE endpoint only removes the database record. Implement a separate process (webhook or background job) to delete the actual file from Cloudinary.

5. **Resource Types**: Common values are "image", "video", and "raw" (for documents, etc.). 
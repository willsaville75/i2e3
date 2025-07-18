# CMS API Reference

## Overview

The I2E CMS API provides endpoints for managing sites, entries, and canvas blocks in a headless CMS architecture. The system uses Prisma with PostgreSQL and supports dynamic site routing with AI-generated content blocks.

### Base URL
```
http://localhost:3002/api
```

### Database Models
- **Site**: Represents an intranet/project
- **Entry**: Represents a page/content entry within a site
- **CanvasBlock**: Represents individual content blocks within an entry
- **Media**: Standalone model for file uploads (future use)

### Data Types
- **Slug**: URL-friendly string identifier (lowercase, hyphens, no spaces)
- **Status**: Enum values: `DRAFT`, `PUBLISHED`, `ARCHIVED`
- **JSON**: Flexible JSON data for block content and metadata
- **DateTime**: ISO 8601 timestamp strings
- **CUID**: Collision-resistant unique identifier

---

## Sites API

### GET /api/sites

Returns all sites with their entries and blocks.

#### Method
```
GET /api/sites
```

#### Description
Retrieves all sites in the system with full nested data including entries and their associated blocks. Results are ordered by creation date (newest first).

#### Parameters
None

#### Sample Request
```bash
curl -X GET "http://localhost:3002/api/sites" \
  -H "Accept: application/json"
```

#### Sample Response
```json
[
  {
    "id": "cmd7i1kq90000s7rtloc994g8",
    "name": "My Test Site",
    "description": "A test site for the CMS",
    "domain": "test.example.com",
    "settings": null,
    "createdAt": "2025-07-17T14:42:30.322Z",
    "updatedAt": "2025-07-17T14:42:30.322Z",
    "entries": [
      {
        "id": "cmd7i1ox50002s7rt48kspdwe",
        "title": "Welcome Page",
        "slug": "welcome",
        "description": "Welcome to our site",
        "status": "PUBLISHED",
        "metadata": null,
        "siteId": "cmd7i1kq90000s7rtloc994g8",
        "createdAt": "2025-07-17T14:42:35.754Z",
        "updatedAt": "2025-07-17T14:42:50.773Z",
        "publishedAt": "2025-07-17T14:42:50.772Z",
        "blocks": [
          {
            "id": "cmd7i1taa0004s7rt6up3b1r7",
            "blockType": "hero",
            "blockData": {
              "elements": {
                "title": {"level": 1, "content": "Welcome to Our Site"},
                "subtitle": {"content": "This is a hero block"}
              }
            },
            "position": 1,
            "styles": null,
            "entryId": "cmd7i1ox50002s7rt48kspdwe",
            "createdAt": "2025-07-17T14:42:41.411Z",
            "updatedAt": "2025-07-17T14:42:41.411Z"
          }
        ]
      }
    ]
  }
]
```

#### Response Fields
- `id`: Unique site identifier (CUID)
- `name`: Human-readable site name
- `description`: Optional site description
- `domain`: Optional domain name for the site
- `settings`: JSON object for site-wide configuration
- `entries`: Array of entry objects with nested blocks
- `createdAt/updatedAt`: ISO 8601 timestamps

---

### GET /api/sites/:slug

Returns a specific site by slug with its entries and blocks.

#### Method
```
GET /api/sites/:slug
```

#### Description
Retrieves a single site by slug (domain or name). The slug can be either the site's domain or its name (case-insensitive). Returns full nested data including entries and blocks.

#### Parameters
- `slug` (path): Site slug - can be domain name or site name

#### Sample Request
```bash
# By domain
curl -X GET "http://localhost:3002/api/sites/test.example.com" \
  -H "Accept: application/json"

# By name (URL encoded)
curl -X GET "http://localhost:3002/api/sites/My%20Test%20Site" \
  -H "Accept: application/json"
```

#### Sample Response
```json
{
  "id": "cmd7i1kq90000s7rtloc994g8",
  "name": "My Test Site",
  "description": "A test site for the CMS",
  "domain": "test.example.com",
  "settings": null,
  "createdAt": "2025-07-17T14:42:30.322Z",
  "updatedAt": "2025-07-17T14:42:30.322Z",
  "entries": [
    {
      "id": "cmd7i1ox50002s7rt48kspdwe",
      "title": "Welcome Page",
      "slug": "welcome",
      "description": "Welcome to our site",
      "status": "PUBLISHED",
      "metadata": null,
      "siteId": "cmd7i1kq90000s7rtloc994g8",
      "createdAt": "2025-07-17T14:42:35.754Z",
      "updatedAt": "2025-07-17T14:42:50.773Z",
      "publishedAt": "2025-07-17T14:42:50.772Z",
      "blocks": [
        {
          "id": "cmd7i1taa0004s7rt6up3b1r7",
          "blockType": "hero",
          "blockData": {
            "elements": {
              "title": {"level": 1, "content": "Welcome to Our Site"},
              "subtitle": {"content": "This is a hero block"}
            }
          },
          "position": 1,
          "styles": null,
          "entryId": "cmd7i1ox50002s7rt48kspdwe",
          "createdAt": "2025-07-17T14:42:41.411Z",
          "updatedAt": "2025-07-17T14:42:41.411Z"
        }
      ]
    }
  ]
}
```

#### Error Responses
```json
// 404 - Site not found
{
  "error": "Site not found"
}
```

---

## Entries API

### GET /api/entries/:siteSlug/:entrySlug

Returns a specific entry with its blocks.

#### Method
```
GET /api/entries/:siteSlug/:entrySlug
```

#### Description
Retrieves a single entry by site slug and entry slug. Blocks are returned ordered by position (ascending). The site slug can be either domain or name.

#### Parameters
- `siteSlug` (path): Site identifier - domain or name
- `entrySlug` (path): Entry slug (unique within site)

#### Sample Request
```bash
curl -X GET "http://localhost:3002/api/entries/test.example.com/welcome" \
  -H "Accept: application/json"
```

#### Sample Response
```json
{
  "id": "cmd7i1ox50002s7rt48kspdwe",
  "title": "Welcome Page",
  "slug": "welcome",
  "description": "Welcome to our site",
  "status": "PUBLISHED",
  "metadata": null,
  "siteId": "cmd7i1kq90000s7rtloc994g8",
  "createdAt": "2025-07-17T14:42:35.754Z",
  "updatedAt": "2025-07-17T14:42:50.773Z",
  "publishedAt": "2025-07-17T14:42:50.772Z",
  "site": {
    "id": "cmd7i1kq90000s7rtloc994g8",
    "name": "My Test Site",
    "description": "A test site for the CMS",
    "domain": "test.example.com",
    "settings": null,
    "createdAt": "2025-07-17T14:42:30.322Z",
    "updatedAt": "2025-07-17T14:42:30.322Z"
  },
  "blocks": [
    {
      "id": "cmd7i1taa0004s7rt6up3b1r7",
      "blockType": "hero",
      "blockData": {
        "elements": {
          "title": {"level": 1, "content": "Welcome to Our Site"},
          "subtitle": {"content": "This is a hero block"}
        }
      },
      "position": 1,
      "styles": null,
      "entryId": "cmd7i1ox50002s7rt48kspdwe",
      "createdAt": "2025-07-17T14:42:41.411Z",
      "updatedAt": "2025-07-17T14:42:41.411Z"
    }
  ]
}
```

#### Response Fields
- `id`: Unique entry identifier (CUID)
- `title`: Entry title
- `slug`: URL-friendly entry identifier (unique within site)
- `description`: Optional entry description
- `status`: Entry status (`DRAFT`, `PUBLISHED`, `ARCHIVED`)
- `metadata`: JSON object for custom metadata
- `site`: Nested site object
- `blocks`: Array of canvas blocks ordered by position
- `publishedAt`: Timestamp when entry was published (null for drafts)

#### Error Responses
```json
// 404 - Site not found
{
  "error": "Site not found"
}

// 404 - Entry not found
{
  "error": "Entry not found"
}
```

---

### POST /api/entries/:siteSlug

Creates a new entry with optional blocks.

#### Method
```
POST /api/entries/:siteSlug
```

#### Description
Creates a new entry within a site. Can optionally create associated blocks in the same request. All operations are performed in a database transaction for consistency.

#### Parameters
- `siteSlug` (path): Site identifier - domain or name

#### Request Body
```json
{
  "title": "string (required)",
  "slug": "string (required)",
  "description": "string (optional)",
  "published": "boolean (optional, default: false)",
  "blocks": [
    {
      "blockType": "string (required)",
      "blockData": "object (required)",
      "position": "number (required)",
      "styles": "object (optional)"
    }
  ]
}
```

#### Sample Request
```bash
curl -X POST "http://localhost:3002/api/entries/test.example.com" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Homepage",
    "slug": "home",
    "description": "Main landing page",
    "published": true,
    "blocks": [
      {
        "blockType": "hero",
        "blockData": {
          "elements": {
            "title": {"content": "Welcome", "level": 1},
            "subtitle": {"content": "This is our homepage"}
          }
        },
        "position": 1
      },
      {
        "blockType": "text",
        "blockData": {
          "content": "This is a text block"
        },
        "position": 2,
        "styles": {
          "textAlign": "center"
        }
      }
    ]
  }'
```

#### Sample Response
```json
{
  "id": "cmd7i9r0e0001s732xo0qr2ex",
  "title": "Homepage",
  "slug": "home",
  "description": "Main landing page",
  "status": "PUBLISHED",
  "metadata": null,
  "siteId": "cmd7i1kq90000s7rtloc994g8",
  "createdAt": "2025-07-17T14:48:51.710Z",
  "updatedAt": "2025-07-17T14:48:51.710Z",
  "publishedAt": "2025-07-17T14:48:51.709Z",
  "site": {
    "id": "cmd7i1kq90000s7rtloc994g8",
    "name": "My Test Site",
    "description": "A test site for the CMS",
    "domain": "test.example.com",
    "settings": null,
    "createdAt": "2025-07-17T14:42:30.322Z",
    "updatedAt": "2025-07-17T14:42:30.322Z"
  },
  "blocks": [
    {
      "id": "cmd7i9r110002s732mc6ykxz2",
      "blockType": "hero",
      "blockData": {
        "elements": {
          "title": {"content": "Welcome", "level": 1},
          "subtitle": {"content": "This is our homepage"}
        }
      },
      "position": 1,
      "styles": null,
      "entryId": "cmd7i9r0e0001s732xo0qr2ex",
      "createdAt": "2025-07-17T14:48:51.733Z",
      "updatedAt": "2025-07-17T14:48:51.733Z"
    },
    {
      "id": "cmd7i9r110003s732mc6ykxz3",
      "blockType": "text",
      "blockData": {
        "content": "This is a text block"
      },
      "position": 2,
      "styles": {
        "textAlign": "center"
      },
      "entryId": "cmd7i9r0e0001s732xo0qr2ex",
      "createdAt": "2025-07-17T14:48:51.733Z",
      "updatedAt": "2025-07-17T14:48:51.733Z"
    }
  ]
}
```

#### Request Body Fields
- `title`: Entry title (required)
- `slug`: URL-friendly identifier, unique within site (required)
- `description`: Optional entry description
- `published`: Boolean flag - true sets status to PUBLISHED with publishedAt timestamp
- `blocks`: Optional array of blocks to create with the entry

#### Block Object Fields
- `blockType`: Type of block (must match block registry)
- `blockData`: JSON object containing block-specific data
- `position`: Numeric position for ordering (required)
- `styles`: Optional JSON object for custom styling

#### Error Responses
```json
// 400 - Missing required fields
{
  "error": "Title and slug are required"
}

// 400 - Invalid block structure
{
  "error": "Each block must have blockType, blockData, and position"
}

// 404 - Site not found
{
  "error": "Site not found"
}

// 409 - Duplicate slug
{
  "error": "Entry with this slug already exists in the site"
}
```

---

## Canvas Blocks API

### GET /api/blocks/:id

Returns a specific canvas block by ID.

#### Method
```
GET /api/blocks/:id
```

#### Description
Retrieves a single canvas block with its associated entry and site information.

#### Parameters
- `id` (path): Block identifier (CUID)

#### Sample Request
```bash
curl -X GET "http://localhost:3002/api/blocks/cmd7i1taa0004s7rt6up3b1r7" \
  -H "Accept: application/json"
```

#### Sample Response
```json
{
  "id": "cmd7i1taa0004s7rt6up3b1r7",
  "blockType": "hero",
  "blockData": {
    "elements": {
      "title": {"level": 1, "content": "Welcome to Our Site"},
      "subtitle": {"content": "This is a hero block"}
    }
  },
  "position": 1,
  "styles": null,
  "entryId": "cmd7i1ox50002s7rt48kspdwe",
  "createdAt": "2025-07-17T14:42:41.411Z",
  "updatedAt": "2025-07-17T14:42:41.411Z",
  "entry": {
    "id": "cmd7i1ox50002s7rt48kspdwe",
    "title": "Welcome Page",
    "slug": "welcome",
    "description": "Welcome to our site",
    "status": "PUBLISHED",
    "metadata": null,
    "siteId": "cmd7i1kq90000s7rtloc994g8",
    "createdAt": "2025-07-17T14:42:35.754Z",
    "updatedAt": "2025-07-17T14:42:50.773Z",
    "publishedAt": "2025-07-17T14:42:50.772Z",
    "site": {
      "id": "cmd7i1kq90000s7rtloc994g8",
      "name": "My Test Site",
      "description": "A test site for the CMS",
      "domain": "test.example.com",
      "settings": null,
      "createdAt": "2025-07-17T14:42:30.322Z",
      "updatedAt": "2025-07-17T14:42:30.322Z"
    }
  }
}
```

#### Error Responses
```json
// 404 - Block not found
{
  "error": "Block not found"
}
```

---

## Data Relationships

### Site → Entries (One-to-Many)
- Each site can have multiple entries
- Entry slugs must be unique within a site
- Deleting a site cascades to delete all entries

### Entry → Blocks (One-to-Many)
- Each entry can have multiple canvas blocks
- Blocks are ordered by position (ascending)
- Deleting an entry cascades to delete all blocks

### Block Types
- Blocks reference components in the block registry
- Currently supported: `hero`
- Unknown block types are handled gracefully in the frontend

---

## Business Rules

### Slug Uniqueness
- **Site slugs**: No uniqueness constraint (can use domain or name)
- **Entry slugs**: Must be unique within each site
- **Block positions**: Must be unique within each entry

### Status Workflow
- **DRAFT**: Default status for new entries
- **PUBLISHED**: Entries visible to public, sets publishedAt timestamp
- **ARCHIVED**: Entries hidden but preserved

### JSON Data Validation
- `blockData`: Must contain valid JSON for the block type
- `metadata`: Flexible JSON object for custom fields
- `settings`: Site-wide configuration object
- `styles`: Block-specific styling overrides

---

## Error Handling

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `409`: Conflict (duplicate slugs)
- `500`: Internal Server Error

### Error Response Format
```json
{
  "error": "Human-readable error message",
  "details": "Additional error details (optional)"
}
```

---

## Implementation Notes

### Current Limitations
- **No Edit APIs**: Update/PUT endpoints not yet implemented
- **No Delete APIs**: DELETE endpoints not yet implemented
- **No Media Management**: Media model exists but no endpoints
- **No Bulk Operations**: Single resource operations only

### Future Enhancements
- Entry update/edit endpoints
- Block reordering API
- Media upload and management
- Bulk operations for entries and blocks
- Entry versioning and history
- Advanced querying and filtering

### Performance Considerations
- All list endpoints include nested data (may need pagination)
- Block positions are enforced at database level
- Transactions ensure data consistency for multi-table operations

---

## Authentication & Authorization

### Current Status
- **No Authentication**: All endpoints are public
- **No Authorization**: No permission checks implemented

### Future Security
- API key authentication
- Role-based access control
- Rate limiting
- Input sanitization and validation

---

## Development & Testing

### Database
- **Engine**: PostgreSQL with Prisma ORM
- **Connection**: Configured via DATABASE_URL environment variable
- **Migrations**: Use `npx prisma migrate dev` for schema changes

### Testing Endpoints
```bash
# Test site listing
curl -X GET "http://localhost:3002/api/sites"

# Test entry creation
curl -X POST "http://localhost:3002/api/entries/test.example.com" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "slug": "test", "published": true}'

# Test entry retrieval
curl -X GET "http://localhost:3002/api/entries/test.example.com/test"
```

### Environment Setup
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start API server
npm run dev:api
```

---

*Last updated: 2025-07-17*
*API Version: 1.0.0* 
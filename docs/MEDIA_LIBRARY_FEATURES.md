# MediaLibrary Component - Full Feature Set

## Overview
The MediaLibrary component is a comprehensive media management interface that integrates with Cloudinary for storage and supports AI-powered media generation.

## Features Implemented

### 1. **Filter by Type**
- **All** - Shows all media items with total count
- **Images** - Filters to show only images with count badge
- **Videos** - Filters to show only videos with count badge
- Visual icons using the token system (icons.content.image, icons.content.video)

### 2. **Search Functionality**
- Real-time search across:
  - Filename
  - Original name
  - Tags
- Clear button to reset search
- Search icon from token system (icons.navigation.search)

### 3. **Add Media Modal**
Two tabs for different upload methods:

#### Upload Tab
- Manual Cloudinary URL input
- Fields:
  - Name (required)
  - Type selector (Image/Video)
  - Cloudinary URL (required)

#### Generate Tab
- AI-powered media generation
- Fields:
  - Name (required)
  - Type selector (Image/Video)
  - Prompt textarea (required)
- Endpoints used:
  - `/api/media/generate/image` - Replicate API
  - `/api/media/generate/video` - RunwayML API

### 4. **Pagination**
- Loads 20 items initially
- "Load More" button for infinite scroll
- Automatically hides when no more items
- Preserves existing items when loading more

### 5. **Media Grid Display**
- Responsive grid layout:
  - 1 column on mobile
  - 2 columns on xs screens
  - 3 columns on sm screens
  - 4 columns on md screens
  - 5 columns on lg+ screens
- Card features:
  - Rounded corners with shadow
  - Hover effects
  - Image previews with lazy loading
  - Video thumbnails with play icon overlay
  - Duration badge for videos
  - File size display
  - Dimensions for images
  - Tag display (up to 3 tags)

### 6. **Delete Functionality**
- Delete button appears on hover
- Confirmation dialog
- Immediate UI update after deletion
- Uses icon token system (icons.content.delete)

### 7. **Loading & Error States**
- Spinner during initial load
- Error message display with details
- Empty state with contextual messaging
- Different empty states for search vs no media

### 8. **Accessibility**
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus states on all inputs and buttons
- Semantic HTML structure
- Screen reader friendly

## Component State Management

```typescript
// Filter and display
const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
const [searchQuery, setSearchQuery] = useState('');

// Modal state
const [showModal, setShowModal] = useState(false);
const [activeTab, setActiveTab] = useState<'upload' | 'generate'>('upload');
const [formData, setFormData] = useState({
  name: '',
  type: 'image' | 'video',
  url: '',
  prompt: ''
});

// Pagination
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
```

## API Integration

### Fetch Media
```javascript
GET /api/media?limit=20&offset=0
```

### Upload Media
```javascript
POST /api/media
{
  filename: string,
  originalName: string,
  mimeType: string,
  url: string,
  resourceType: 'image' | 'video'
}
```

### Generate Image
```javascript
POST /api/media/generate/image
{
  prompt: string,
  name: string
}
```

### Generate Video
```javascript
POST /api/media/generate/video
{
  prompt: string,
  name: string
}
```

### Delete Media
```javascript
DELETE /api/media/:id
```

## Styling Highlights

- **Tailwind CSS** for all styling
- **Responsive design** with mobile-first approach
- **Smooth transitions** on all interactive elements
- **Consistent spacing** using Tailwind's spacing scale
- **Shadow effects** for depth
- **Hover states** for better UX

## Usage

```tsx
import MediaLibrary from './components/MediaLibrary';

function MediaPage() {
  return <MediaLibrary />;
}
```

## Environment Requirements

For AI generation features:
- `REPLICATE_API_TOKEN` - For image generation
- `RUNWAY_API_KEY` - For video generation
- `CLOUDINARY_URL` - For media storage

## Future Enhancements

1. Bulk selection and operations
2. Drag-and-drop upload
3. Media categories/folders
4. Advanced filtering (date, size, etc.)
5. Edit media metadata
6. Share functionality
7. Download original files 
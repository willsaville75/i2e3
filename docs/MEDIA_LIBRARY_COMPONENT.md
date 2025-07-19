# MediaLibrary Component Documentation

A responsive, Tailwind-only media management component for the I2E system.

## Features

- **Grid Layout**: Responsive grid that adapts from 2 columns on mobile to 5 columns on large screens
- **Type Filtering**: Filter by All, Images, or Videos with live counts
- **Search**: Search by filename or tags
- **Thumbnails**: Shows image previews, video previews with duration, and file icons
- **Delete**: Hover to reveal delete button with confirmation
- **File Info**: Shows file size, dimensions, and tags
- **Loading States**: Spinner while fetching data
- **Empty States**: Helpful messages when no media found

## Component Location

```
src/components/MediaLibrary.tsx
```

## Usage

```tsx
import MediaLibrary from '@/components/MediaLibrary';

function MediaPage() {
  return <MediaLibrary />;
}
```

## Tailwind Classes Used

### Layout
- `max-w-7xl mx-auto p-6` - Container with max width and padding
- `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4` - Responsive grid
- `aspect-square` - Square aspect ratio for thumbnails

### Cards
- `bg-white rounded-xl shadow-sm hover:shadow-md` - Card styling with hover effect
- `transition-shadow duration-200` - Smooth shadow transition
- `border border-gray-200` - Subtle border
- `overflow-hidden` - Clip content to rounded corners

### Interactive Elements
- `px-4 py-2 rounded-lg font-medium transition-colors` - Button styling
- `bg-blue-500 text-white` - Active state
- `bg-gray-100 text-gray-700 hover:bg-gray-200` - Inactive state
- `opacity-0 group-hover:opacity-100` - Show on hover

### Typography
- `text-3xl font-bold text-gray-900` - Main heading
- `text-sm font-medium text-gray-900 truncate` - File names
- `text-xs text-gray-500` - Metadata

### Forms
- `border border-gray-300 rounded-lg` - Input border
- `focus:ring-2 focus:ring-blue-500 focus:border-transparent` - Focus state

## Responsive Behavior

### Mobile (< 640px)
- 2 columns grid
- Full width search bar
- Stacked filter buttons

### Tablet (640px - 1024px)
- 3-4 columns grid
- Larger thumbnails
- Side-by-side filter buttons

### Desktop (> 1024px)
- 5 columns grid
- Optimal thumbnail size
- All controls visible

## API Integration

The component fetches media from:
```
GET /api/media?limit=100
```

And deletes media using:
```
DELETE /api/media/:id
```

## Customization

### Changing Grid Columns
```tsx
// Change from 5 to 6 columns on large screens
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
```

### Changing Card Style
```tsx
// More prominent shadow and border
className="... shadow-md hover:shadow-lg border-2 border-gray-300"
```

### Changing Colors
```tsx
// Use different color scheme
className="bg-indigo-500 text-white" // Active filter
className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200" // Inactive
```

## Accessibility

- Proper alt text for images
- Loading states announced
- Keyboard navigation support
- Focus indicators on interactive elements
- Confirmation before delete

## Performance

- Lazy loading images with `loading="lazy"`
- Efficient re-rendering with React hooks
- Debounced search (can be added)
- Pagination support (API ready)

## Example Integration

```tsx
// In a page with upload capability
import MediaLibrary from '@/components/MediaLibrary';
import UploadButton from '@/components/UploadButton';

export default function MediaManager() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Media Manager</h1>
        <UploadButton onUploadComplete={() => window.location.reload()} />
      </div>
      <MediaLibrary />
    </div>
  );
}
```

## Future Enhancements

1. **Bulk Selection**: Select multiple items for bulk delete
2. **Upload Integration**: Drag-and-drop upload directly in the grid
3. **Preview Modal**: Click to open full-size preview
4. **Edit Metadata**: Edit alt text, tags, etc.
5. **Sorting**: Sort by date, size, name
6. **Pagination**: Load more on scroll or with pagination buttons
7. **Copy URL**: Quick copy media URL to clipboard 
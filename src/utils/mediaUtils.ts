/**
 * Media utility functions for the MediaLibrary component
 */

/**
 * Constructs a full Cloudinary URL from a path or returns the URL if already complete
 * @param path - The Cloudinary path or full URL
 * @returns The complete Cloudinary URL
 */
export function getCloudinaryUrl(path: string): string {
  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Extract Cloudinary configuration from environment
  const cloudinaryUrl = process.env.CLOUDINARY_URL || '';
  const matches = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
  
  if (!matches) {
    console.warn('Invalid CLOUDINARY_URL format');
    return path;
  }
  
  const [, _apiKey, _apiSecret, cloudName] = matches;
  
  // Construct the full URL
  // Format: https://res.cloudinary.com/{cloud_name}/{resource_type}/{type}/{path}
  // For simplicity, assuming image/upload as defaults
  return `https://res.cloudinary.com/${cloudName}/image/upload/${path}`;
}

/**
 * Determines the media type from a URL based on file extension or MIME type hints
 * @param url - The media URL to analyze
 * @returns 'image' or 'video'
 */
export function getMediaTypeFromUrl(url: string): 'image' | 'video' {
  // Extract file extension
  const urlPath = url.split('?')[0]; // Remove query parameters
  const extension = urlPath.split('.').pop()?.toLowerCase() || '';
  
  // Video extensions
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'm4v', 'mpg', 'mpeg'];
  
  // Image extensions
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif'];
  
  // Check by extension
  if (videoExtensions.includes(extension)) {
    return 'video';
  }
  
  if (imageExtensions.includes(extension)) {
    return 'image';
  }
  
  // Check for Cloudinary resource type in URL
  if (url.includes('/video/upload/') || url.includes('resource_type=video')) {
    return 'video';
  }
  
  if (url.includes('/image/upload/') || url.includes('resource_type=image')) {
    return 'image';
  }
  
  // Default to image if uncertain
  return 'image';
}

/**
 * Formats file size from bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formats duration from seconds to mm:ss format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
} 
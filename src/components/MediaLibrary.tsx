import React, { useState, useEffect } from 'react';
import { Icon } from './ui/Icon';
import { icons } from '../blocks/shared/icons';
import { formatFileSize, formatDuration } from '../utils/mediaUtils';

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  publicId?: string;
  alt?: string;
  format?: string;
  resourceType?: string;
  width?: number;
  height?: number;
  duration?: number;
  folder?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

type FilterType = 'all' | 'image' | 'video';

export default function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and search state
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'generate'>('upload');
  const [formData, setFormData] = useState({
    name: '',
    type: 'image' as 'image' | 'video',
    url: '',
    prompt: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchMedia();
  }, [page]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/media?limit=${itemsPerPage}&offset=${(page - 1) * itemsPerPage}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (page === 1) {
        setMedia(data.data || []);
      } else {
        setMedia(prev => [...prev, ...(data.data || [])]);
      }
      setHasMore(data.data?.length === itemsPerPage);
    } catch (error) {
      console.error('Failed to fetch media:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch media');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMedia(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete media:', error);
    }
  };

  // Filter and search logic
  const filteredMedia = media.filter(item => {
    if (filter !== 'all' && item.resourceType !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.filename?.toLowerCase().includes(query) ||
        item.originalName?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // Count media types
  const imageCount = media.filter(m => m.resourceType === 'image').length;
  const videoCount = media.filter(m => m.resourceType === 'video').length;

  // Modal handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (activeTab === 'upload') {
        // Manual upload - store the Cloudinary URL
        const response = await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: formData.name,
            originalName: formData.name,
            mimeType: formData.type === 'image' ? 'image/jpeg' : 'video/mp4',
            url: formData.url,
            resourceType: formData.type
          })
        });

        if (!response.ok) throw new Error('Failed to save media');
      } else {
        // Generate with AI
        const endpoint = formData.type === 'image' 
          ? '/api/media/generate/image' 
          : '/api/media/generate/video';
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: formData.prompt,
            name: formData.name
          })
        });

        if (!response.ok) throw new Error('Failed to generate media');
      }

      // Reset form and refresh
      setShowModal(false);
      setFormData({ name: '', type: 'image', url: '', prompt: '' });
      setPage(1);
      await fetchMedia();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to add media. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Media Library</h1>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Icon icon={icons.content.add} size="sm" />
            Add Media
          </button>
        </div>
        <p className="text-gray-600">Manage your images and videos</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({media.length})
        </button>
        <button
          onClick={() => setFilter('image')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            filter === 'image'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Icon icon={icons.content.image} size="sm" />
          Images ({imageCount})
        </button>
        <button
          onClick={() => setFilter('video')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            filter === 'video'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Icon icon={icons.content.video} size="sm" />
          Videos ({videoCount})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Icon 
          icon={icons.navigation.search} 
          size="sm" 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
        />
        <input
          type="text"
          placeholder="Search by name or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <Icon icon={icons.system.close} size="sm" />
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && page === 1 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading media...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Error loading media</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredMedia.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            {filter === 'image' ? (
              <Icon icon={icons.content.image} size="xl" className="text-gray-400" />
            ) : filter === 'video' ? (
              <Icon icon={icons.content.video} size="xl" className="text-gray-400" />
            ) : (
              <Icon icon={icons.content.document} size="xl" className="text-gray-400" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No results found' : `No ${filter === 'all' ? 'media' : filter + 's'} yet`}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'Try adjusting your search' : 'Click "Add Media" to get started'}
          </p>
        </div>
      )}

      {/* Media Grid */}
      {!loading && filteredMedia.length > 0 && (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredMedia.map((item) => (
            <div 
              key={item.id} 
              className="relative group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="aspect-square bg-gray-100 rounded-t-xl overflow-hidden">
                {item.resourceType === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.alt || item.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : item.resourceType === 'video' ? (
                  <div className="relative w-full h-full">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <Icon icon={icons.content.video} size="xl" className="text-white" />
                    </div>
                    {item.duration && (
                      <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(item.duration)}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon icon={icons.content.document} size="xl" className="text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Media details */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate" title={item.originalName || item.filename}>
                  {item.originalName || item.filename}
                </h3>
                <div className="mt-1 text-sm text-gray-500 space-y-1">
                  {item.size && (
                    <p>Size: {formatFileSize(item.size)}</p>
                  )}
                  {item.width && item.height && (
                    <p>Dimensions: {item.width} × {item.height}</p>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(item.id)}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Delete media"
              >
                <Icon icon={icons.content.delete} size="sm" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {!loading && hasMore && filteredMedia.length > 0 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setPage(prev => prev + 1)}
            disabled={loading}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Add Media Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Add Media</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Icon icon={icons.system.close} size="md" />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'upload'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Upload
              </button>
              <button
                onClick={() => setActiveTab('generate')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'generate'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Generate with AI
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Type Field */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>

              {/* Conditional Fields */}
              {activeTab === 'upload' ? (
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                    Cloudinary URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://res.cloudinary.com/..."
                    required
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
                    Prompt <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="prompt"
                    value={formData.prompt}
                    onChange={(e) => handleInputChange('prompt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder={
                      formData.type === 'image' 
                        ? "Describe the image you want to generate..."
                        : "Describe the video you want to generate..."
                    }
                    required
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' : activeTab === 'upload' ? 'Upload' : 'Generate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 
import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { EntryFormModal } from '../../components/EntryFormModal';

interface Entry {
  id: string;
  title: string;
  slug: string;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  publishedAt?: string;
}

interface Site {
  id: string;
  name: string;
  description?: string;
  domain?: string;
  entries: Entry[];
}

/**
 * Site Entries Management Page
 * Manages all entries (pages) within a specific site
 */
export function SiteDetail() {
  const { siteId } = useParams<{ siteId: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  // Fetch site and its entries
  const fetchSite = async () => {
    try {
      setLoading(true);
      // First fetch all sites to find the one with matching ID
      const response = await fetch('/api/sites');
      if (!response.ok) {
        throw new Error('Failed to fetch sites');
      }
      const sites = await response.json();
      const currentSite = sites.find((s: Site) => s.id === siteId);
      
      if (!currentSite) {
        throw new Error('Site not found');
      }
      
      setSite(currentSite);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch site');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSite();
  }, [siteId]);

  // Handle create entry
  const handleCreateEntry = () => {
    setModalMode('create');
    setSelectedEntry(null);
    setIsModalOpen(true);
  };

  // Handle edit entry
  const handleEditEntry = (entry: Entry) => {
    setModalMode('edit');
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleFormSubmit = async (entryData: { title: string; slug: string; description?: string; published?: boolean }) => {
    if (!site) return;

    try {
      const siteSlug = site.domain || site.name.toLowerCase().replace(/\s+/g, '-');
      
      if (modalMode === 'create') {
        const response = await fetch(`/api/entries/${siteSlug}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: entryData.title,
            slug: entryData.slug,
            description: entryData.description,
            published: entryData.published,
            blocks: [] // Start with empty blocks
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create entry');
        }
      } else if (modalMode === 'edit' && selectedEntry) {
        const response = await fetch(`/api/entries/${siteSlug}/${selectedEntry.slug}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: entryData.title,
            description: entryData.description,
            // Note: We're not updating the slug in edit mode
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update entry');
        }
      }

      // Refresh site data
      await fetchSite();
      setIsModalOpen(false);
    } catch (error) {
      throw error; // Let the modal handle the error
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get preview URL for entry
  const getPreviewUrl = (entrySlug: string) => {
    if (!site) return '#';
    const siteSlug = site.domain || site.name.toLowerCase().replace(/\s+/g, '-');
    return `/${siteSlug}/${entrySlug}`;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-8">
          <p className="text-gray-500">Loading site details...</p>
        </div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {error || 'Site not found'}
        </div>
        <Link to="/admin/sites" className="mt-4 inline-block text-blue-600 hover:text-blue-800 underline">
          ← Back to Sites
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Manage Entries for: {site.name}
        </h1>
        <p className="text-gray-600">
          Site ID: {siteId} | Domain: {site.domain || 'Not set'}
        </p>
      </div>

      {/* Navigation breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link 
          to="/admin" 
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Admin
        </Link>
        <span className="mx-2 text-gray-500">/</span>
        <Link 
          to="/admin/sites" 
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Sites
        </Link>
        <span className="mx-2 text-gray-500">/</span>
        <span className="text-gray-700">{site.name}</span>
      </nav>

      {/* Create entry button */}
      <div className="mb-6">
        <button
          onClick={handleCreateEntry}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create New Entry
        </button>
      </div>

      {/* Entries table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Published
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {site.entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No entries found. Create your first page to get started.
                </td>
              </tr>
            ) : (
              site.entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{entry.title}</div>
                    {entry.description && (
                      <div className="text-sm text-gray-500">{entry.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    /{entry.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        entry.status === 'PUBLISHED' 
                          ? 'bg-green-100 text-green-800' 
                          : entry.status === 'ARCHIVED'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(entry.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={getPreviewUrl(entry.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 mr-4"
                    >
                      Preview
                    </Link>
                    <button
                      onClick={() => handleEditEntry(entry)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Entry form modal */}
      <EntryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        entry={modalMode === 'edit' ? {
          id: selectedEntry?.id,
          title: selectedEntry?.title || '',
          slug: selectedEntry?.slug || '',
          description: selectedEntry?.description,
          published: selectedEntry?.status === 'PUBLISHED'
        } : null}
        mode={modalMode}
      />
    </div>
  );
}

export default SiteDetail; 
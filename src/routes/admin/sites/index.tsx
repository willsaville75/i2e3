import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SiteFormModal } from '../../../components/SiteFormModal';

interface Site {
  id: string;
  name: string;
  description?: string;
  domain?: string;
  createdAt: string;
  entries: Array<{ id: string }>;
}

/**
 * Sites Management Page
 * Lists all sites and provides links to manage each site's entries
 */
export function SitesIndex() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  // Fetch sites from API
  const fetchSites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sites');
      if (!response.ok) {
        throw new Error('Failed to fetch sites');
      }
      const data = await response.json();
      setSites(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch sites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  // Handle create site
  const handleCreateSite = () => {
    setModalMode('create');
    setSelectedSite(null);
    setIsModalOpen(true);
  };

  // Handle edit site
  const handleEditSite = (site: Site) => {
    setModalMode('edit');
    setSelectedSite(site);
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleFormSubmit = async (siteData: Partial<Site>) => {
    try {
      const url = modalMode === 'create' ? '/api/sites' : `/api/sites/${siteData.id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(siteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save site');
      }

      // Refresh sites list
      await fetchSites();
      setIsModalOpen(false);
    } catch (error) {
      throw error; // Let the modal handle the error
    }
  };

  // Handle delete site
  const handleDeleteSite = async (siteId: string, siteName: string) => {
    if (!confirm(`Are you sure you want to delete "${siteName}"? This will also delete all pages and content.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/sites/${siteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete site');
      }

      // Refresh sites list
      await fetchSites();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete site');
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Sites Management
        </h1>
        <p className="text-gray-600">
          Manage all sites in the system. Click on a site to manage its pages.
        </p>
      </div>

      {/* Navigation back to admin dashboard */}
      <nav className="mb-6">
        <Link 
          to="/admin" 
          className="text-blue-600 hover:text-blue-800 underline"
        >
          ← Back to Admin Dashboard
        </Link>
      </nav>

      {/* Create site button */}
      <div className="mb-6">
        <button
          onClick={handleCreateSite}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create New Site
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading sites...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Sites table */}
      {!loading && !error && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug/Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entry Count
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
              {sites.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No sites found. Create your first site to get started.
                  </td>
                </tr>
              ) : (
                sites.map((site) => (
                  <tr key={site.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{site.name}</div>
                      {site.description && (
                        <div className="text-sm text-gray-500">{site.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {site.domain || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {site.entries.length} pages
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(site.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/admin/sites/${site.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Manage Entries
                      </Link>
                      <button
                        onClick={() => handleEditSite(site)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSite(site.id, site.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Site form modal */}
      <SiteFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        site={selectedSite}
        mode={modalMode}
      />
    </div>
  );
}

export default SitesIndex; 
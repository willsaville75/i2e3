import { Link } from 'react-router-dom';

/**
 * Admin Dashboard - Main admin entry point
 * This is the index page for the admin section at /admin
 */
export function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Admin Dashboard
      </h1>
      <p className="text-gray-600 mb-8">
        This is the admin dashboard placeholder. Admin functionality will be implemented here.
      </p>

      {/* Admin navigation menu */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Admin Sections
        </h2>
        <nav>
          <ul className="space-y-3">
            <li>
              <Link 
                to="/admin/sites" 
                className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <span className="mr-2">📄</span>
                Sites Management
                <span className="ml-2">→</span>
              </Link>
              <p className="text-sm text-gray-500 ml-6 mt-1">
                Manage all sites and their pages
              </p>
            </li>
            <li>
              <Link 
                to="/admin/media" 
                className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <span className="mr-2">🖼️</span>
                Media Library
                <span className="ml-2">→</span>
              </Link>
              <p className="text-sm text-gray-500 ml-6 mt-1">
                Upload and manage images, videos, and AI-generated content
              </p>
            </li>
            {/* Future admin sections can be added here */}
            <li className="opacity-50">
              <div className="flex items-center text-gray-600">
                <span className="mr-2">👥</span>
                Users & Permissions
                <span className="ml-2 text-xs">(Coming soon)</span>
              </div>
            </li>
            <li className="opacity-50">
              <div className="flex items-center text-gray-600">
                <span className="mr-2">🎨</span>
                Theme & Settings
                <span className="ml-2 text-xs">(Coming soon)</span>
              </div>
            </li>
            <li className="opacity-50">
              <div className="flex items-center text-gray-600">
                <span className="mr-2">📊</span>
                Analytics
                <span className="ml-2 text-xs">(Coming soon)</span>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

// Default export for cleaner route imports
export default AdminDashboard; 
import { Outlet, Link } from 'react-router-dom';

/**
 * AdminLayout provides a wrapper for all admin pages,
 * ensuring they are visually and structurally separate from public pages.
 * Features a sidebar navigation and main content area.
 */
export function AdminLayout() {
  return (
    <div className="admin-layout min-h-screen bg-gray-50">
      {/* Two-column grid layout: sidebar | main content */}
      <div className="grid grid-cols-[250px_1fr] min-h-screen">
        
        {/* Left Sidebar */}
        <aside className="bg-gray-800 text-white">
          <div className="p-6">
            {/* Admin Header */}
            <h2 className="text-2xl font-bold mb-8">Admin</h2>
            
            {/* Navigation placeholder - can be expanded later */}
            <nav className="space-y-2">
              <Link 
                to="/admin" 
                className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                to="/admin/sites" 
                className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Sites
              </Link>
              <Link 
                to="/admin/media" 
                className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Media Library
              </Link>
              {/* Future nav items can be added here */}
              <div className="mt-8 pt-8 border-t border-gray-700">
                <p className="text-xs text-gray-400 px-4">More sections coming soon...</p>
              </div>
            </nav>
          </div>
        </aside>
        
        {/* Main Content Area */}
        <main className="bg-white overflow-auto">
          {/* Render child routes */}
          <Outlet />
        </main>
        
      </div>
    </div>
  );
} 
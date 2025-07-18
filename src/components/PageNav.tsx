import React from 'react';
import { useEditMode } from '../edit-mode';

export const PageNav: React.FC = () => {
  const { entry, toggleEditMode } = useEditMode();

  if (!entry) return null;

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Entry info */}
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold text-gray-900">{entry.title}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>{entry.site.name}</span>
            <span className="text-gray-400">•</span>
            <span>/{entry.slug}</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              entry.status === 'PUBLISHED' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {entry.status === 'PUBLISHED' ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>

        {/* Right side - Edit button */}
        <div className="flex items-center">
          <button
            onClick={() => {
              console.log('🎯 Edit Page button clicked');
              toggleEditMode();
            }}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit Page
          </button>
        </div>
      </div>
    </nav>
  );
}; 
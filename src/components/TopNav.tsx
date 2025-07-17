import React from 'react';
import { useEditMode } from '../edit-mode';

export const TopNav: React.FC = () => {
  const { isEditMode, toggleEditMode, hasUnsavedChanges } = useEditMode();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Logo/Brand */}
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900">I2E Site Builder</h1>
        </div>

        {/* Right side - Edit button */}
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="text-sm text-amber-600 font-medium">
              Unsaved changes
            </span>
          )}
          
          <button
            onClick={toggleEditMode}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isEditMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isEditMode ? 'Exit Edit' : 'Edit Page'}
          </button>
        </div>
      </div>
    </nav>
  );
}; 
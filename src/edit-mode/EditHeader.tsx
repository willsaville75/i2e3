import React from 'react';
import { useEditMode } from './EditModeProvider';

export const EditHeader: React.FC = () => {
  const { entry, toggleEditMode, saveChanges, hasUnsavedChanges, isSaving } = useEditMode();

  if (!entry) return null;

  const handleDone = async () => {
    if (hasUnsavedChanges) {
      await saveChanges();
    }
    toggleEditMode(); // Exit edit mode
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Entry info with edit mode indicator */}
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold text-gray-900">{entry.title}</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">{entry.site.name}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">/{entry.slug}</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Edit Mode
            </span>
            {hasUnsavedChanges && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Unsaved Changes
              </span>
            )}
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleEditMode}
            className="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Preview
          </button>
          
          <button
            onClick={handleDone}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              'Done'
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}; 
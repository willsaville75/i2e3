import React from 'react';
import { useEditMode } from './EditModeProvider';

export const DoneButton: React.FC = () => {
  const { 
    isEditMode, 
    isSaving, 
    hasUnsavedChanges, 
    saveChanges 
  } = useEditMode();

  const handleSave = async () => {
    try {
      await saveChanges();
    } catch (error) {
      // Error handling could be improved with a toast or notification system
      console.error('Save failed:', error);
    }
  };

  // Only show in edit mode
  if (!isEditMode) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button
        onClick={handleSave}
        disabled={!hasUnsavedChanges || isSaving}
        className={`px-6 py-3 rounded-lg font-medium text-white shadow-lg transition-all duration-200 ${
          hasUnsavedChanges && !isSaving
            ? 'bg-green-600 hover:bg-green-700 hover:shadow-xl'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        {isSaving ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Saving...</span>
          </div>
        ) : hasUnsavedChanges ? (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Done</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Saved</span>
          </div>
        )}
      </button>
    </div>
  );
}; 
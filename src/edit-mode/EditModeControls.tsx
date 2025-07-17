import React from 'react';
import { useEditMode } from './EditModeProvider';

export const EditModeControls: React.FC = () => {
  const { 
    isEditMode, 
    isSaving, 
    hasUnsavedChanges, 
    toggleEditMode, 
    saveChanges, 
    discardChanges 
  } = useEditMode();

  const handleSave = async () => {
    try {
      await saveChanges();
    } catch (error) {
      // Error handling could be improved with a toast or notification system
      console.error('Save failed:', error);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {hasUnsavedChanges && (
        <div className="flex items-center gap-2">
          <button
            onClick={discardChanges}
            disabled={isSaving}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      )}
      
      <button
        onClick={toggleEditMode}
        className={`px-3 py-1.5 text-sm border rounded ${
          isEditMode
            ? 'bg-blue-600 text-white border-blue-600'
            : 'border-gray-300 hover:bg-gray-50'
        }`}
      >
        {isEditMode ? 'Exit Edit' : 'Edit'}
      </button>
    </div>
  );
}; 
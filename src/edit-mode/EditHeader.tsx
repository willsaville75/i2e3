import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEditMode } from './EditModeProvider';
import { useIndyChatStore } from '../store/indyChatStore';
import { ComputerDesktopIcon, DeviceTabletIcon, DevicePhoneMobileIcon, ChevronRightIcon, CheckIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

interface EditHeaderProps {
  previewMode?: PreviewMode;
  onPreviewModeChange?: (mode: PreviewMode) => void;
}

export const EditHeader: React.FC<EditHeaderProps> = ({
  previewMode: externalPreviewMode,
  onPreviewModeChange
}) => {
  const { entry, toggleEditMode, saveChanges, hasUnsavedChanges, isSaving } = useEditMode();
  const [internalPreviewMode, setInternalPreviewMode] = useState<PreviewMode>('desktop');
  
  // Use external preview mode if provided, otherwise use internal state
  const previewMode = externalPreviewMode || internalPreviewMode;

  const handlePreviewModeChange = (mode: PreviewMode) => {
    if (onPreviewModeChange) {
      onPreviewModeChange(mode);
    } else {
      setInternalPreviewMode(mode);
    }
  };

  const handleUpdate = async () => {
    try {
      if (hasUnsavedChanges) {
        await saveChanges();
      }
      
      // Clear chat when exiting edit mode
      const { clearMessages, setSchemaNavigation } = useIndyChatStore.getState();
      clearMessages();
      setSchemaNavigation(null); // Also clear navigation state
      
      toggleEditMode(); // Exit edit mode
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const handlePublish = async () => {
    try {
      // First save all changes
      if (hasUnsavedChanges) {
        await saveChanges();
      }
      
      // Then update the entry to published status
      if (entry) {
        const response = await fetch(`/api/entries/${entry.site.name}/${entry.slug}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: entry.title,
            description: entry.description,
            published: true,
            blocks: []
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to publish: ${response.status}`);
        }
      }
      
      // Clear chat when exiting edit mode
      const { clearMessages, setSchemaNavigation } = useIndyChatStore.getState();
      clearMessages();
      setSchemaNavigation(null);
      
      // Exit edit mode
      toggleEditMode();
    } catch (error) {
      console.error('Error publishing entry:', error);
    }
  };

  if (!entry) return null;

  return (
    <div className="h-12 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between px-4 relative z-50" data-testid="edit-header">
      {/* Left Section - Site/Page Info & Controls */}
      <div className="flex items-center space-x-4">
        {/* Site/Page Breadcrumb */}
        <div className="flex items-center space-x-2 text-zinc-300">
          <span className="text-sm font-medium">{entry.site.name}</span>
          <ChevronRightIcon className="w-4 h-4 text-zinc-500" />
          <span className="text-sm">{entry.slug}</span>
          {hasUnsavedChanges && (
            <span className="text-xs bg-yellow-600 text-yellow-100 px-2 py-1 rounded-full">
              Unsaved
            </span>
          )}
        </div>
      </div>

      {/* Right Section - Preview Controls & Actions */}
      <div className="flex items-center space-x-3">
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Update Button */}
          <motion.button
            onClick={handleUpdate}
            disabled={isSaving}
            className="px-3 py-1.5 text-sm bg-zinc-700 text-zinc-300 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:cursor-not-allowed transition-colors rounded-md flex items-center space-x-1.5"
            whileHover={!isSaving ? { scale: 1.02 } : {}}
            whileTap={!isSaving ? { scale: 0.98 } : {}}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b border-zinc-300"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckIcon className="w-3 h-3" />
                <span>Update</span>
              </>
            )}
          </motion.button>

          {/* Publish Button - Only shown when entry is in draft state */}
          {entry && entry.status === 'DRAFT' && (
            <motion.button
              onClick={handlePublish}
              disabled={isSaving}
              className="px-3 py-1.5 text-sm bg-green-700 text-white hover:bg-green-600 disabled:bg-zinc-800 disabled:cursor-not-allowed transition-colors rounded-md flex items-center space-x-1.5"
              whileHover={!isSaving ? { scale: 1.02 } : {}}
              whileTap={!isSaving ? { scale: 0.98 } : {}}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="w-3 h-3" />
                  <span>Publish</span>
                </>
              )}
            </motion.button>
          )}
        </div>

        {/* Device Preview Buttons - Text only, no icons */}
        <div className="flex items-center bg-zinc-700 rounded-lg p-1">
          <motion.button
            onClick={() => handlePreviewModeChange('desktop')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              previewMode === 'desktop' 
                ? 'bg-purple-600 text-white' 
                : 'text-zinc-300 hover:bg-zinc-600'
            }`}
            title="Desktop Preview"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ComputerDesktopIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Desktop</span>
          </motion.button>
          
          <motion.button
            onClick={() => handlePreviewModeChange('tablet')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              previewMode === 'tablet' 
                ? 'bg-purple-600 text-white' 
                : 'text-zinc-300 hover:bg-zinc-600'
            }`}
            title="Tablet Preview"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <DeviceTabletIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Tablet</span>
          </motion.button>
          
          <motion.button
            onClick={() => handlePreviewModeChange('mobile')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              previewMode === 'mobile' 
                ? 'bg-purple-600 text-white' 
                : 'text-zinc-300 hover:bg-zinc-600'
            }`}
            title="Mobile Preview"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <DevicePhoneMobileIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Mobile</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}; 
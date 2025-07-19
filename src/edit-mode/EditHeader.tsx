import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEditMode } from './EditModeProvider';
import { icons } from '../blocks/shared/icons';

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

interface EditHeaderProps {
  previewMode?: PreviewMode;
  onPreviewModeChange?: (mode: PreviewMode) => void;
  isPropsOpen?: boolean;
  onToggleProps?: () => void;
}

export const EditHeader: React.FC<EditHeaderProps> = ({
  previewMode: externalPreviewMode,
  onPreviewModeChange,
  isPropsOpen = false,
  onToggleProps
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
      
      // Exit edit mode
      toggleEditMode();
    } catch (error) {
      console.error('Error publishing entry:', error);
    }
  };

  if (!entry) return null;

  // Icons
  const MenuIcon = icons.navigation.menu;
  const UndoIcon = icons.actions.backward;
  const RedoIcon = icons.actions.forward;
  const ChevronRightIcon = icons.navigation.chevronRight;
  const CheckIcon = icons.status.complete;
  const DesktopIcon = icons.technology.desktop;
  const MobileIcon = icons.technology.mobile;
  const CloudUploadIcon = icons.actions.upload;

  // For now, we'll disable undo/redo since it's not implemented in the blocks store
  const canUndo = false;
  const canRedo = false;
  const undo = () => {};
  const redo = () => {};

  return (
    <div className="h-12 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between px-4 relative z-50" data-testid="edit-header">
      {/* Left Section - Site/Page Info & Controls */}
      <div className="flex items-center space-x-4">
        {/* Properties Panel Toggle */}
        {onToggleProps && (
          <motion.button
            onClick={onToggleProps}
            className={`p-2 rounded-lg transition-colors ${
              isPropsOpen 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
            title="Toggle Properties Panel"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-testid="props-toggle"
          >
            <MenuIcon className="w-5 h-5" />
          </motion.button>
        )}

        {/* History Controls */}
        <div className="flex items-center space-x-1">
          <motion.button
            onClick={undo}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-colors ${
              canUndo 
                ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600' 
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
            title="Undo"
            whileHover={canUndo ? { scale: 1.05 } : {}}
            whileTap={canUndo ? { scale: 0.95 } : {}}
          >
            <UndoIcon className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={redo}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-colors ${
              canRedo 
                ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600' 
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
            title="Redo"
            whileHover={canRedo ? { scale: 1.05 } : {}}
            whileTap={canRedo ? { scale: 0.95 } : {}}
          >
            <RedoIcon className="w-4 h-4" />
          </motion.button>
        </div>

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
                  <CloudUploadIcon className="w-3 h-3" />
                  <span>Publish</span>
                </>
              )}
            </motion.button>
          )}
        </div>

        {/* Device Preview Buttons */}
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
            <DesktopIcon className="w-4 h-4" />
            <span className="text-xs">Desktop</span>
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            <span className="text-xs">Tablet</span>
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
            <MobileIcon className="w-4 h-4" />
            <span className="text-xs">Mobile</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}; 
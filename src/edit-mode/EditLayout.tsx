import { useState } from 'react';
import { useEditMode } from './EditModeProvider';
import { EditHeader } from './EditHeader';
import EditableBlockCanvas from './EditableBlockCanvas';
import { PropertiesPanel } from '../edit-panel';
import { IndyChatBubble } from './IndyChatBubble';
import { useBlocksStore } from '../store/blocksStore';

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

export default function EditLayout() {
  const { isEditMode } = useEditMode(); // Get edit mode state
  const { selectedIndex, setSelectedIndex } = useBlocksStore(); // Get block selection state
  const [isPropsOpen, setIsPropsOpen] = useState(false); // Hidden by default
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');

  console.log('🎯 EditLayout rendered');

  // This component should only be rendered when in edit mode
  // The conditional rendering is handled by the parent (SiteRouter)

  const handleBlockSelect = () => {
    console.log('🎯 Block selected');
    // The new IndyChatBubble will automatically open when a block is selected
    // No need for ref-based communication
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Properties (conditional) */}
      {isPropsOpen && (
        <div className="w-80 border-r border-gray-200 bg-white">
          <PropertiesPanel />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <EditHeader 
          onToggleProps={() => setIsPropsOpen(!isPropsOpen)}
          isPropsOpen={isPropsOpen}
          previewMode={previewMode}
          onPreviewModeChange={setPreviewMode}
        />

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto">
          <EditableBlockCanvas 
            isEditMode={isEditMode}
            selectedIndex={selectedIndex}
            onSelectBlock={(index) => {
              setSelectedIndex(index);
              handleBlockSelect();
            }}
            previewMode={previewMode}
          />
        </div>
      </div>
      
      {/* Hybrid Indy Chat Bubble System */}
      <IndyChatBubble />
    </div>
  );
}; 
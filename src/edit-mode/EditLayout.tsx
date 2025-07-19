import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isPropsOpen, setIsPropsOpen] = useState(false); // Properties panel closed by default
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header - Full width at top */}
      <EditHeader 
        previewMode={previewMode}
        onPreviewModeChange={setPreviewMode}
      />

      {/* Main Content Area - Below header */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel - Properties (slides in from left) */}
        <AnimatePresence>
          {isPropsOpen && (
            <motion.div
              initial={{ x: -336 }}
              animate={{ x: 0 }}
              exit={{ x: -336 }}
              transition={{ 
                duration: 0.3, 
                ease: 'easeInOut'
              }}
              className="w-[21rem] h-full border-r border-gray-200 bg-white shadow-md relative z-40"
            >
              <PropertiesPanel />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto">
          <EditableBlockCanvas 
            isEditMode={isEditMode}
            selectedIndex={selectedIndex}
            onSelectBlock={(index) => {
              setSelectedIndex(index);
              handleBlockSelect();
              // Don't open properties panel - let Indy handle it
            }}
            previewMode={previewMode}
            onToggleProperties={() => setIsPropsOpen(!isPropsOpen)}
          />
        </div>
      </div>
      
      {/* Hybrid Indy Chat Bubble System */}
      <IndyChatBubble />
    </div>
  );
}; 
import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BlockRenderer } from '../components/BlockRenderer';
import { BlockActions } from './BlockActions';
import { BlockAnimationWrapper } from './components/BlockAnimationWrapper';
import { DevicePreview } from './components/DevicePreview';
import { useBlocksStore } from '../store/blocksStore';
import { scrollToBlock } from '../utils/scrollToBlock';

// Professional animation constants
const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.6
};

const EASING_CURVES = {
  easeOut: [0.0, 0.0, 0.2, 1.0] as const,
  easeInOut: [0.4, 0.0, 0.2, 1.0] as const,
  smooth: [0.25, 0.1, 0.25, 1.0] as const,
  spring: { type: "spring" as const, damping: 30, stiffness: 400 }
};

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

interface EditableBlockCanvasProps {
  isEditMode: boolean;
  selectedIndex: number | null;
  onSelectBlock: (index: number) => void;
  previewMode?: PreviewMode;
  onToggleProperties?: () => void;
}

const EditableBlockCanvas: React.FC<EditableBlockCanvasProps> = ({
  isEditMode,
  selectedIndex,
  onSelectBlock,
  previewMode = 'desktop',
  onToggleProperties,
}) => {
  const { blocks } = useBlocksStore();

  // Handle block scrolling
  useEffect(() => {
    const handleNewBlock = (event: CustomEvent<{ blockId: string }>) => {
      console.log('🎨 New block event received:', event.detail.blockId);
      
      // Scroll to the new block
      setTimeout(() => {
        scrollToBlock(event.detail.blockId);
      }, 500);
    };

    window.addEventListener('blockCreated', handleNewBlock as EventListener);
    return () => {
      window.removeEventListener('blockCreated', handleNewBlock as EventListener);
    };
  }, []);

  const handleMoveUp = (index: number) => {
    const { reorderBlocks } = useBlocksStore.getState();
    if (index > 0) {
      reorderBlocks(index, index - 1);
      if (selectedIndex === index) {
        onSelectBlock(index - 1);
      } else if (selectedIndex === index - 1) {
        onSelectBlock(index);
      }
    }
  };

  const handleMoveDown = (index: number) => {
    const { reorderBlocks } = useBlocksStore.getState();
    if (index < blocks.length - 1) {
      reorderBlocks(index, index + 1);
      if (selectedIndex === index) {
        onSelectBlock(index + 1);
      } else if (selectedIndex === index + 1) {
        onSelectBlock(index);
      }
    }
  };

  const handleDeleteBlock = (index: number) => {
    const { deleteBlock } = useBlocksStore.getState();
    deleteBlock(index);
    if (selectedIndex === index) {
      onSelectBlock(Math.max(0, index - 1));
    } else if (selectedIndex !== null && selectedIndex > index) {
      onSelectBlock(selectedIndex - 1);
    }
  };

  // Get responsive container classes based on preview mode
  const getContainerClasses = () => {
    const baseClasses = 'transition-all';
    
    switch (previewMode) {
      case 'mobile':
      case 'tablet':
        return `${baseClasses} bg-white`;
      case 'desktop':
      default:
        return `${baseClasses} bg-transparent`;
    }
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      <div className={`min-h-full ${previewMode !== 'desktop' ? 'py-8' : ''}`}>
        <DevicePreview 
          mode={previewMode} 
        >
          <motion.div 
            className={`${getContainerClasses()}`}
            initial={false}
            animate={{
              opacity: 1
            }}
            transition={{
              duration: ANIMATION_DURATION.fast,
              ease: EASING_CURVES.smooth
            }}
          >
            <AnimatePresence mode="sync">
              {blocks.map((block, index) => {
                const isSelected = selectedIndex === index;
              
                return (
                  <BlockAnimationWrapper
                    key={block.id}
                    blockId={block.id}
                    isSelected={isSelected}
                    isEditMode={isEditMode}
                    onClick={() => {
                      if (isEditMode) {
                        onSelectBlock(index);
                      }
                    }}
                  >
                    {isSelected && isEditMode && (
                      <BlockActions
                        index={index}
                        totalBlocks={blocks.length}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                        onDelete={handleDeleteBlock}
                        onToggleProperties={onToggleProperties ? (index, event) => {
                          event.stopPropagation();
                          onSelectBlock(index);
                          onToggleProperties();
                        } : undefined}
                      />
                    )}
                    
                    <BlockRenderer
                      type={block.blockType}
                      props={block.blockData}
                    />
                  </BlockAnimationWrapper>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </DevicePreview>
      </div>
    </div>
  );
};

export default EditableBlockCanvas; 
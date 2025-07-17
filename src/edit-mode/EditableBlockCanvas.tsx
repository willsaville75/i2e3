import React from 'react';
import { BlockRenderer } from '../components/BlockRenderer';
import { useBlocksStore } from '../store/blocksStore';
import { useEditMode } from './EditModeProvider';

export const EditableBlockCanvas: React.FC = () => {
  const { blocks, selectedIndex, setSelectedIndex, deleteBlock } = useBlocksStore();
  const { isEditMode } = useEditMode();

  const handleDeleteBlock = (index: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent block selection when clicking delete
    if (window.confirm('Are you sure you want to delete this block?')) {
      deleteBlock(index);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-6">
      {blocks.map((block, index) => {
          const isSelected = selectedIndex === index;
          
          return (
            <div
              key={block.id}
              className={`relative transition-all duration-200 ${
                isEditMode ? 'cursor-pointer' : ''
              } ${
                isSelected && isEditMode
                  ? 'ring-2 ring-blue-500 ring-offset-4 rounded-lg'
                  : isEditMode
                  ? 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2 rounded-lg'
                  : ''
              }`}
              onClick={() => {
                if (isEditMode) {
                  setSelectedIndex(isSelected ? null : index);
                }
              }}
            >
              {isSelected && isEditMode && (
                <div className="absolute -top-3 -right-3 flex items-center gap-2 z-10">
                  <div className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                    Selected
                  </div>
                  <button
                    onClick={(e) => handleDeleteBlock(index, e)}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full shadow-lg transition-colors duration-200 flex items-center gap-1"
                    title="Delete block"
                  >
                    <svg 
                      className="w-3 h-3" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
              
              <BlockRenderer
                type={block.blockType}
                props={block.blockData}
              />
              
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600 font-mono">
                  {block.blockType} • Position: {block.position} • Index: {index} • ID: {block.id}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}; 
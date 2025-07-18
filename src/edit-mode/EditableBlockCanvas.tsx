import React from 'react';
import { BlockRenderer } from '../components/BlockRenderer';
import { useBlocksStore } from '../store/blocksStore';
import { useEditMode } from './EditModeProvider';

export const EditableBlockCanvas: React.FC = () => {
  const { blocks, selectedIndex, setSelectedIndex, deleteBlock, reorderBlocks } = useBlocksStore();
  const { isEditMode } = useEditMode();

  const handleDeleteBlock = (index: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent block selection when clicking delete
    if (window.confirm('Are you sure you want to delete this block?')) {
      deleteBlock(index);
    }
  };

  const handleMoveUp = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (index > 0) {
      reorderBlocks(index, index - 1);
      setSelectedIndex(index - 1); // Keep the block selected after moving
    }
  };

  const handleMoveDown = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (index < blocks.length - 1) {
      reorderBlocks(index, index + 1);
      setSelectedIndex(index + 1); // Keep the block selected after moving
    }
  };

  return (
    <div className="space-y-6">
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
                  <div className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-2">
                    <span>Selected</span>
                    <span className="text-blue-200">({index + 1} of {blocks.length})</span>
                  </div>
                  
                  {/* Reorder Controls */}
                  <div className="flex items-center bg-white rounded-full shadow-lg">
                    {/* Move Up Button */}
                    <button
                      onClick={(e) => handleMoveUp(index, e)}
                      disabled={index === 0}
                      className={`${
                        index === 0 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      } p-1 rounded-l-full transition-all duration-200`}
                      title={index === 0 ? "Already at top" : "Move block up"}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l5 5a1 1 0 01-1.414 1.414L11 6.414V16a1 1 0 11-2 0V6.414L5.707 9.707a1 1 0 01-1.414-1.414l5-5A1 1 0 0110 3z" clipRule="evenodd"/>
                      </svg>
                    </button>
                    
                    <div className="w-px h-5 bg-gray-300"></div>
                    
                    {/* Move Down Button */}
                    <button
                      onClick={(e) => handleMoveDown(index, e)}
                      disabled={index === blocks.length - 1}
                      className={`${
                        index === blocks.length - 1
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      } p-1 rounded-r-full transition-all duration-200`}
                      title={index === blocks.length - 1 ? "Already at bottom" : "Move block down"}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 17a1 1 0 01-.707-.293l-5-5a1 1 0 111.414-1.414L9 13.586V4a1 1 0 112 0v9.586l3.293-3.293a1 1 0 111.414 1.414l-5 5A1 1 0 0110 17z" clipRule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                  
                  {/* Delete Button */}
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
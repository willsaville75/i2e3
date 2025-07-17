import React from 'react';
import { useBlocksStore } from '../store/blocksStore';
import { DynamicForm } from './DynamicForm';

// Properties Panel Component
export const PropertiesPanel: React.FC = () => {
  const { selectedIndex, blocks, updateBlock, setSelectedIndex } = useBlocksStore();
  const selectedBlock = selectedIndex !== null ? blocks[selectedIndex] : null;

  const handleUpdateBlock = (updatedBlockData: any) => {
    if (selectedIndex !== null) {
      console.log('🔧 PropertiesPanel updating block:', {
        selectedIndex,
        titleContent: updatedBlockData?.elements?.title?.content,
        fullBlockData: updatedBlockData
      });
      updateBlock(selectedIndex, updatedBlockData);
    }
  };

  const handleInputChange = (path: string, value: any) => {
    if (!selectedBlock) return;
    
    // Deep clone the blockData to prevent mutation issues
    const updatedBlockData = JSON.parse(JSON.stringify(selectedBlock.blockData));
    
    console.log('📝 PropertiesPanel handleInputChange:', {
      path,
      value,
      selectedIndex,
      originalTitle: selectedBlock.blockData?.elements?.title?.content,
      originalBlockData: JSON.stringify(selectedBlock.blockData, null, 2)
    });
    
    // Handle nested path updates including array indices (e.g., "elements.title.content" or "items[0].name")
    const pathParts = path.split('.');
    let current = updatedBlockData;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      
      // Handle array indices like "items[0]"
      if (part.includes('[') && part.includes(']')) {
        const arrayName = part.substring(0, part.indexOf('['));
        const index = parseInt(part.substring(part.indexOf('[') + 1, part.indexOf(']')));
        
        if (!current[arrayName]) {
          current[arrayName] = [];
        }
        if (!current[arrayName][index]) {
          current[arrayName][index] = {};
        }
        current = current[arrayName][index];
      } else {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
    }
    
    const lastPart = pathParts[pathParts.length - 1];
    
    // Handle array indices in the last part
    if (lastPart.includes('[') && lastPart.includes(']')) {
      const arrayName = lastPart.substring(0, lastPart.indexOf('['));
      const index = parseInt(lastPart.substring(lastPart.indexOf('[') + 1, lastPart.indexOf(']')));
      
      if (!current[arrayName]) {
        current[arrayName] = [];
      }
      current[arrayName][index] = value;
    } else {
      current[lastPart] = value;
    }
    
    console.log('📝 PropertiesPanel handleInputChange - final result:', {
      path,
      value,
      updatedTitle: updatedBlockData?.elements?.title?.content,
      updatedBlockData: JSON.stringify(updatedBlockData, null, 2)
    });
    
    handleUpdateBlock(updatedBlockData);
  };

  const handleClearSelection = () => {
    setSelectedIndex(null);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900">Properties Panel</h2>
          {selectedBlock && (
            <button
              onClick={handleClearSelection}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            >
              Clear Selection
            </button>
          )}
        </div>
        
        {/* Current Block Highlight */}
        {selectedBlock && (
          <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-blue-900">
                  {selectedBlock.blockType}
                </span>
                <span className="text-xs text-blue-700 ml-2">
                  Index: {selectedIndex}
                </span>
              </div>
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedBlock ? (
          <div className="space-y-4">
            {/* Block Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Block Information</h3>
              <div className="bg-white rounded-md p-3 border border-gray-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500">Type:</span>
                  <span className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                    {selectedBlock.blockType}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500">Index:</span>
                  <span className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                    {selectedIndex}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500">Position:</span>
                  <span className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                    {selectedBlock.position}
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Form Based on Schema */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Block Properties</h3>
              <DynamicForm
                blockType={selectedBlock.blockType}
                blockData={selectedBlock.blockData}
                onChange={handleInputChange}
              />
            </div>

            {/* Raw JSON View (Collapsible) */}
            <details className="mt-4">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900 flex items-center justify-between p-2 bg-gray-100 rounded-md">
                <span>Raw Block Data</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-2 bg-white rounded-md p-3 border border-gray-200">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(selectedBlock.blockData, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">No block selected</h3>
            <p className="text-xs text-gray-500">Click on a block to view its properties</p>
          </div>
        )}
      </div>
    </div>
  );
}; 
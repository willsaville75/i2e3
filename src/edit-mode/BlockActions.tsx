import React from 'react';
import { ChevronUpIcon, ChevronDownIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

interface BlockActionsProps {
  index: number;
  totalBlocks: number;
  onMoveUp: (index: number, event: React.MouseEvent) => void;
  onMoveDown: (index: number, event: React.MouseEvent) => void;
  onDelete: (index: number, event: React.MouseEvent) => void;
  onToggleProperties?: (index: number, event: React.MouseEvent) => void;
}

export const BlockActions: React.FC<BlockActionsProps> = ({
  index,
  totalBlocks,
  onMoveUp,
  onMoveDown,
  onDelete,
  onToggleProperties
}) => {
  return (
    <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-10">
      <span className="isolate inline-flex rounded-md shadow-sm">
        {/* Move Up Button */}
        <button
          onClick={(e) => onMoveUp(index, e)}
          disabled={index === 0}
          className={`relative inline-flex items-center rounded-l-md bg-white px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-10 transition-colors duration-200 ${
            index === 0 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title={index === 0 ? "Already at top" : "Move block up"}
        >
          <ChevronUpIcon className="h-4 w-4" />
        </button>
        
        {/* Move Down Button */}
        <button
          onClick={(e) => onMoveDown(index, e)}
          disabled={index === totalBlocks - 1}
          className={`relative -ml-px inline-flex items-center bg-white px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-10 transition-colors duration-200 ${
            index === totalBlocks - 1 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title={index === totalBlocks - 1 ? "Already at bottom" : "Move block down"}
        >
          <ChevronDownIcon className="h-4 w-4" />
        </button>
        
        {/* Properties Button */}
        {onToggleProperties && (
          <button
            onClick={(e) => onToggleProperties(index, e)}
            className="relative -ml-px inline-flex items-center bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:text-purple-600 ring-1 ring-inset ring-gray-300 focus:z-10 transition-colors duration-200"
            title="Toggle properties"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        )}
        
        {/* Delete Button */}
        <button
          onClick={(e) => onDelete(index, e)}
          className={`relative -ml-px inline-flex items-center ${onToggleProperties ? '' : 'rounded-r-md'} bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:text-red-600 ring-1 ring-inset ring-gray-300 focus:z-10 transition-colors duration-200 ${!onToggleProperties ? '' : 'rounded-r-md'}`}
          title="Delete block"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </span>
    </div>
  );
}; 
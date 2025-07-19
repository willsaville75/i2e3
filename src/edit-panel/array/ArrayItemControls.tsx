import React from 'react';
import { TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface ArrayItemControlsProps {
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const ArrayItemControls: React.FC<ArrayItemControlsProps> = ({
  onDelete,
  onMoveUp,
  onMoveDown
}) => {
  const handleClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div className="flex items-center space-x-1">
      {onMoveUp && (
        <button
          type="button"
          onClick={(e) => handleClick(e, onMoveUp)}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Move up"
        >
          <ChevronUpIcon className="w-4 h-4" />
        </button>
      )}
      
      {onMoveDown && (
        <button
          type="button"
          onClick={(e) => handleClick(e, onMoveDown)}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Move down"
        >
          <ChevronDownIcon className="w-4 h-4" />
        </button>
      )}
      
      <button
        type="button"
        onClick={(e) => handleClick(e, onDelete)}
        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        title="Delete"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );
}; 
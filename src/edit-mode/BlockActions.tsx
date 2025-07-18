import React from 'react';

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
      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md shadow-sm">
        {/* Move Up Button */}
        <button
          onClick={(e) => onMoveUp(index, e)}
          disabled={index === 0}
          className={`p-2 transition-colors duration-200 ${
            index === 0 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
          title={index === 0 ? "Already at top" : "Move block up"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m18 15-6-6-6 6"/>
          </svg>
        </button>
        
        {/* Separator */}
        <div className="w-px h-4 bg-gray-300"></div>
        
        {/* Move Down Button */}
        <button
          onClick={(e) => onMoveDown(index, e)}
          disabled={index === totalBlocks - 1}
          className={`p-2 transition-colors duration-200 ${
            index === totalBlocks - 1
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
          title={index === totalBlocks - 1 ? "Already at bottom" : "Move block down"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
        
        {/* Separator */}
        <div className="w-px h-4 bg-gray-300"></div>
        
        {/* Properties Button */}
        {onToggleProperties && (
          <>
            <button
              onClick={(e) => onToggleProperties(index, e)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors duration-200"
              title="Toggle properties"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
            
            {/* Separator */}
            <div className="w-px h-4 bg-gray-300"></div>
          </>
        )}
        
        {/* Delete Button */}
        <button
          onClick={(e) => onDelete(index, e)}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
          title="Delete block"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m3 6 3 0"/>
            <path d="m19 6-1 0"/>
            <path d="m8 6 0-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1"/>
            <path d="m10 11 0 6"/>
            <path d="m14 11 0 6"/>
            <path d="m5 6 1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14"/>
          </svg>
        </button>
      </div>
    </div>
  );
}; 
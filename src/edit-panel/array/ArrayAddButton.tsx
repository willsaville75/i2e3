import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

interface ArrayAddButtonProps {
  onClick: () => void;
  label: string;
}

export const ArrayAddButton: React.FC<ArrayAddButtonProps> = ({ onClick, label }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center space-x-2"
    >
      <PlusIcon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}; 
import React from 'react';
import type { IndyChatConfig } from '../hooks/useIndyChat';

interface IndyChatHeaderProps {
  config: IndyChatConfig;
  onConfigChange: (updates: Partial<IndyChatConfig>) => void;
  onClearHistory: () => void;
}

export const IndyChatHeader: React.FC<IndyChatHeaderProps> = ({ 
  config, 
  onConfigChange, 
  onClearHistory 
}) => {
  return (
    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">I</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Indy AI Assistant</h3>
            <p className="text-xs text-gray-600">Super Intelligent • Context-Aware</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onClearHistory}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Clear chat history"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Intelligence Controls */}
      <div className="mt-3 flex items-center space-x-4 text-xs">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.useEnhancedClassification}
            onChange={(e) => onConfigChange({ useEnhancedClassification: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-600">Enhanced Classification</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.useSuperIntelligence}
            onChange={(e) => onConfigChange({ useSuperIntelligence: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-600">Super Intelligence</span>
        </label>
      </div>
    </div>
  );
}; 
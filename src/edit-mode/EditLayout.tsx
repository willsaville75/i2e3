import React, { useState } from 'react';
import { useEditMode } from './EditModeProvider';
import { EditHeader } from './EditHeader';
import { EditableBlockCanvas } from './EditableBlockCanvas';
import { PropertiesPanel } from '../edit-panel';
import { IndyChatPanel } from './IndyChatPanel';

export const EditLayout: React.FC = () => {
  useEditMode(); // Initialize edit mode context
  const [isMobileIndyOpen, setIsMobileIndyOpen] = useState(false);

  // This component should only be rendered when in edit mode
  // The conditional rendering is handled by the parent (SiteRouter)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header above the grid */}
      <EditHeader />
      
      {/* 3-column grid layout - responsive */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_320px] h-[calc(100vh-160px)]">
        {/* Left Column: Properties Panel */}
        <div className="bg-white border-r border-gray-200 overflow-y-auto">
          <PropertiesPanel />
        </div>
        
        {/* Center Column: Canvas - seamless preview */}
        <div className="overflow-y-auto">
          <EditableBlockCanvas />
        </div>
        
        {/* Right Column: Indy Panel - hidden on mobile/tablet */}
        <div className="hidden lg:block bg-white border-l border-gray-200 overflow-y-auto">
          <IndyChatPanel />
        </div>
      </div>
      
      {/* Mobile/Tablet Indy Panel - floating with toggle */}
      <button
        onClick={() => setIsMobileIndyOpen(!isMobileIndyOpen)}
        className="lg:hidden fixed bottom-4 right-4 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg z-50 flex items-center justify-center hover:bg-blue-700 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
      
      {/* Floating Panel */}
      {isMobileIndyOpen && (
        <div className="lg:hidden fixed bottom-20 right-4 w-80 h-96 bg-white border border-gray-200 rounded-lg shadow-lg z-40">
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">AI Assistant</h3>
            <button
              onClick={() => setIsMobileIndyOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="h-[calc(100%-48px)] overflow-y-auto">
            <IndyChatPanel />
          </div>
        </div>
      )}
    </div>
  );
}; 
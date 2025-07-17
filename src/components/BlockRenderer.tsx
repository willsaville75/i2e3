import React from 'react';
import { blockRegistry } from '../blocks';

/**
 * Props for the BlockRenderer component
 */
export interface BlockRendererProps {
  /** The type of block to render (e.g., 'hero', 'feature', etc.) */
  type: string;
  /** The props to pass to the block component */
  props: any;
  /** Optional className for the wrapper */
  className?: string;
  /** Optional callback when block is clicked */
  onClick?: () => void;
}

/**
 * Generic block renderer that dynamically renders blocks from the registry
 * 
 * This component:
 * - Looks up block components from the registry by type
 * - Renders the component with the provided props
 * - Shows a fallback UI for unknown block types
 * - Handles errors gracefully
 */
export const BlockRenderer: React.FC<BlockRendererProps> = ({ 
  type, 
  props, 
  className,
  onClick 
}) => {
  // Look up the block in the registry
  const blockEntry = blockRegistry[type];
  
  // If block type is not found, render fallback
  if (!blockEntry) {
    return (
      <div className={`bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 ${className || ''}`}>
        <div className="flex items-start space-x-3">
          <svg className="w-6 h-6 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Unknown Block Type: "{type}"
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              This block type is not registered in the block registry.
            </p>
            <details className="mt-2">
              <summary className="text-xs text-yellow-600 cursor-pointer hover:text-yellow-800">
                View props
              </summary>
              <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(props, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      </div>
    );
  }
  
  // Extract the component from the registry entry
  const BlockComponent = blockEntry.component;
  
  // Validate that we have a component
  if (!BlockComponent) {
    return (
      <div className={`bg-red-50 border-2 border-red-200 rounded-lg p-6 ${className || ''}`}>
        <div className="flex items-start space-x-3">
          <svg className="w-6 h-6 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Missing Component for "{type}"
            </h3>
            <p className="mt-1 text-sm text-red-700">
              The block is registered but the component is missing.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Render the block component with error boundary
  try {
    return (
      <BlockComponent {...props} className={className} onClick={onClick} />
    );
  } catch (error) {
    // Handle render errors
    console.error(`Error rendering block type "${type}":`, error);
    
    return (
      <div className={`bg-red-50 border-2 border-red-200 rounded-lg p-6 ${className || ''}`}>
        <div className="flex items-start space-x-3">
          <svg className="w-6 h-6 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Error Rendering Block
            </h3>
            <p className="mt-1 text-sm text-red-700">
              Failed to render "{type}" block: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
            <details className="mt-2">
              <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                View details
              </summary>
              <div className="mt-2 space-y-2">
                <pre className="text-xs bg-red-100 p-2 rounded overflow-auto max-h-40">
                  {error instanceof Error ? error.stack : String(error)}
                </pre>
                <pre className="text-xs bg-red-100 p-2 rounded overflow-auto max-h-40">
                  Props: {JSON.stringify(props, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }
};

/**
 * Memoized version of BlockRenderer for performance
 */
export const MemoizedBlockRenderer = React.memo(BlockRenderer);

export default BlockRenderer; 
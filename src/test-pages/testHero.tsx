import React, { useState } from 'react';
import { HeroBlock } from '../blocks/hero/hero-block';
import { HeroProps } from '../blocks/hero/schema';
import { BlockInstance, useBlocksStore } from '../stores/blocksStore';
import { blockRegistry } from '../blocks';
import { BlockRenderer } from '../components/BlockRenderer';

// Type guard to validate if props match HeroProps structure
function isValidHeroProps(props: any): props is HeroProps {
  return (
    props &&
    typeof props === 'object' &&
    props.elements &&
    typeof props.elements === 'object' &&
    props.elements.title &&
    typeof props.elements.title === 'object' &&
    typeof props.elements.title.content === 'string' &&
    props.elements.subtitle &&
    typeof props.elements.subtitle === 'object' &&
    typeof props.elements.subtitle.content === 'string'
  );
}

// Renders all blocks from the store using BlockRenderer
const BlocksFromStore: React.FC = () => {
  const { blocks, selectedBlockId, setSelectedBlock } = useBlocksStore();

  if (blocks.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Blocks</h3>
        <p className="text-gray-600 mb-4">Use the form below to create your first block</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Blocks ({blocks.length})</h2>
        <span className="text-sm text-gray-500">
          Click to select • Selected blocks have a blue outline
        </span>
      </div>
      
      {blocks.map((block: BlockInstance) => {
        const isSelected = block.id === selectedBlockId;
        
        return (
          <div
            key={block.id}
            className={`relative transition-all duration-200 rounded-lg ${
              isSelected 
                ? 'ring-2 ring-blue-500 ring-offset-4' 
                : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
            }`}
          >
            {isSelected && (
              <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs px-3 py-1 rounded-full z-10 shadow-lg">
                Selected
              </div>
            )}
            
            <BlockRenderer
              type={block.type}
              props={block.props}
              onClick={() => setSelectedBlock(isSelected ? null : block.id)}
              className="cursor-pointer"
            />
            
            {/* Debug info for development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600 font-mono">
                ID: {block.id} | Type: {block.type}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Agent types aligned with Indy system
type IntentType = 'create' | 'update' | 'replace';

interface ApiResponse {
  props?: HeroProps;
  success?: boolean;
  error?: string;
  details?: string;
}

export function TestHeroPage() {
  const [userInput, setUserInput] = useState('');
  const [intent, setIntent] = useState<IntentType>('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heroProps, setHeroProps] = useState<HeroProps | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setLoading(true);
    setError(null);

    try {
      let response: Response;
      
      // Use full Indy orchestration route (same as chat panel)
      response = await fetch('/api/indy/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: userInput,
          blockType: 'hero',
          currentData: intent === 'update' ? heroProps : undefined,
          tokens: {}
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.error || errorData.details || `HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Validate the response contains valid props
      const newProps = data.success && (data as any).blockData 
        ? (data as any).blockData 
        : data.props;

      if (!newProps) {
        throw new Error('No block data received from AI');
      }

      if (!isValidHeroProps(newProps)) {
        // Use the default data as fallback
        const fallbackProps = blockRegistry.hero?.defaultData as HeroProps;
        if (fallbackProps) {
          setHeroProps(fallbackProps);
          setError('AI returned invalid data structure. Using default block instead.');
        } else {
          throw new Error('AI returned invalid hero block structure');
        }
      } else {
        setHeroProps(newProps);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setHeroProps(null);
    setError(null);
    setUserInput('');
  };

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Hero Block Generator</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="intent" className="block text-sm font-medium text-gray-700 mb-2">
              Intent Type
            </label>
            <select
              id="intent"
              value={intent}
              onChange={(e) => setIntent(e.target.value as IntentType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="create">Create New</option>
              <option value="update">Update Existing</option>
              <option value="replace">Replace Content</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="userInput" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <input
            type="text"
            id="userInput"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading || !userInput.trim()}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Generating...' : 'Generate Hero Block'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Show current route info */}
        <div className="text-xs text-gray-500">
          Using: /api/indy/generate
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <p className="text-blue-600">Generating hero block...</p>
          </div>
        </div>
      )}

      {/* Block rendered via form */}
      {heroProps && !error && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Generated Hero Block:</h2>
            <span className="text-sm text-gray-500">
              Intent: {intent}
            </span>
          </div>
          <HeroBlock {...heroProps} />
          
          {/* Show the generated props for debugging */}
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
              View Generated Props
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded-md overflow-auto">
              {JSON.stringify(heroProps, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Blocks from store */}
      <BlocksFromStore />
    </div>
  );
} 
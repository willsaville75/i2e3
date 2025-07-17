import React, { useMemo } from 'react';
import { useBlocksStore } from '../store/blocksStore';
import { DynamicFormRenderer } from './DynamicFormRenderer';
import { generateFormConfig } from '../blocks/shared/schema-generator';
import { setNestedValue } from '../blocks/shared/property-mappings';
import { heroSchema } from '../blocks/hero/schema';

/**
 * Properties Panel - Schema-Driven Dynamic Form
 * 
 * This component now uses the schema-driven form system to auto-generate
 * form fields based on block schema definitions
 */
export const PropertiesPanel: React.FC = () => {
  const { selectedIndex, blocks, updateBlock } = useBlocksStore();
  const selectedBlock = selectedIndex !== null ? blocks[selectedIndex] : null;

  // Generate form configuration from schema
  const formSections = useMemo(() => {
    if (!selectedBlock) return [];
    
    // Get schema for the selected block type
    const schema = getSchemaForBlockType(selectedBlock.blockType);
    if (!schema) return [];
    
    // Generate form configuration
    return generateFormConfig(selectedBlock.blockType, schema);
  }, [selectedBlock]);

  const handleFieldChange = (path: string, value: any) => {
    if (!selectedBlock || selectedIndex === null) return;
    
    console.log('🔧 Properties Panel: Field changed', { path, value });
    
    // Create a deep copy of the block data
    const updatedBlockData = JSON.parse(JSON.stringify(selectedBlock.blockData));
    
    // Set the nested value
    setNestedValue(updatedBlockData, path, value);
    
    console.log('🔧 Properties Panel: Updated block data', updatedBlockData);
    
    // Update the block in the store
    updateBlock(selectedIndex, updatedBlockData);
  };

  if (!selectedBlock) {
    return (
      <div className="p-6 text-center text-gray-500">
        <div className="mb-4">
          <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Block Selected</h3>
        <p className="text-sm text-gray-600">
          Select a block to edit its properties
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Properties</h2>
        <p className="text-sm text-gray-600 mt-1">
          Editing {selectedBlock.blockType} block
        </p>
      </div>

      {/* Dynamic Form */}
      <div className="flex-1 overflow-y-auto p-6">
        <DynamicFormRenderer
          sections={formSections}
          blockData={selectedBlock.blockData}
          onChange={handleFieldChange}
        />
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500">
          <p>Changes are saved automatically when you click "Done"</p>
          <p className="mt-1">Block ID: {selectedBlock.id}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Get schema for a specific block type
 */
function getSchemaForBlockType(blockType: string): any {
  switch (blockType) {
    case 'hero':
      return heroSchema;
    default:
      console.warn(`No schema found for block type: ${blockType}`);
      return null;
  }
} 
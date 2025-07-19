import React, { useMemo } from 'react';
import { useBlocksStore } from '../store/blocksStore';
import { DynamicFormRenderer } from './DynamicFormRenderer';
import { generateFormConfig } from '../blocks/shared/schema-generator';
import { setNestedValue } from '../blocks/shared/property-mappings';
import { heroSchema } from '../blocks/hero/schema';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

/**
 * Properties Panel - Schema-Driven Dynamic Form
 * 
 * This component now uses the schema-driven form system to auto-generate
 * form fields based on block schema definitions
 */
export const PropertiesPanel: React.FC = () => {
  const { selectedIndex, blocks, updateBlock } = useBlocksStore();
  const selectedBlock = selectedIndex !== null ? blocks[selectedIndex] : null;
  
  console.log('🔍 PropertiesPanel rendering', { selectedIndex, selectedBlock });

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
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No block selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Select a block to view and edit its properties
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h2 className="text-base font-semibold leading-6 text-gray-900">Properties</h2>
        <p className="mt-1 text-sm text-gray-500">
          Editing {selectedBlock.blockType} block
        </p>
      </div>

      {/* Dynamic Form */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        <DynamicFormRenderer
          sections={formSections}
          blockData={selectedBlock.blockData}
          onChange={handleFieldChange}
        />
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
import React from 'react';
import { blockRegistry } from '../blocks';
import { PropertySection } from './PropertySection';
import { FormField } from './FormField';

// Define section priorities and mappings
const sectionPriorities = {
  'Content Elements': 1,
  'Layout Settings': 2,
  'Background': 3,
  'Settings': 4,
  'Styling': 5
};

const sectionMappings: Record<string, string> = {
  'elements': 'Content Elements',
  'layout': 'Layout Settings',
  'background': 'Background',
  'settings': 'Settings',
  'styles': 'Styling',
  'styling': 'Styling'
};

interface DynamicFormProps {
  blockType: string;
  blockData: any;
  onChange: (path: string, value: any) => void;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ blockType, blockData, onChange }) => {
  const blockEntry = blockRegistry[blockType];
  
  if (!blockEntry) {
    return (
      <div className="text-red-600 text-sm">
        Block type "{blockType}" not found in registry
      </div>
    );
  }

  // Get schema - handle toJSON method if available
  let schema = blockEntry.schema;
  if (schema && typeof schema.toJSON === 'function') {
    schema = schema.toJSON();
  }

  if (!schema || !schema.properties) {
    return (
      <div className="text-gray-600 text-sm">
        No schema properties found for "{blockType}"
      </div>
    );
  }

  // Group properties by section
  const sections: Record<string, any[]> = {};
  
  Object.entries(schema.properties).forEach(([key, property]) => {
    const sectionName = sectionMappings[key] || 'Settings';
    if (!sections[sectionName]) {
      sections[sectionName] = [];
    }
    sections[sectionName].push({ key, property });
  });

  // Sort sections by priority
  const sortedSections = Object.entries(sections).sort(([a], [b]) => {
    const priorityA = sectionPriorities[a as keyof typeof sectionPriorities] || 999;
    const priorityB = sectionPriorities[b as keyof typeof sectionPriorities] || 999;
    return priorityA - priorityB;
  });

  return (
    <div className="space-y-3">
      {sortedSections.map(([sectionName, properties]) => (
        <PropertySection
          key={sectionName}
          title={sectionName}
          defaultExpanded={false}
        >
          {properties.map(({ key, property }) => (
            <FormField
              key={key}
              path={key}
              property={property}
              value={blockData[key]}
              onChange={onChange}
              level={0}
              inSection={true}
            />
          ))}
        </PropertySection>
      ))}
    </div>
  );
}; 
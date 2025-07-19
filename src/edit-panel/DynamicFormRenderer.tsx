import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { FormSection as FormSectionType } from '../blocks/shared/schema-generator';
import { FormSection } from './FormSection';

export interface DynamicFormRendererProps {
  sections: FormSectionType[];
  blockData: any;
  onChange: (path: string, value: any) => void;
  className?: string;
}

/**
 * Dynamic Form Renderer
 * 
 * Renders form fields based on schema-generated configuration
 * Supports conditional fields, validation, and grouped sections
 */
export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  sections,
  blockData,
  onChange,
  className
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    // Initialize with default expanded sections on first render
    const defaultExpanded = sections
      .filter(section => section.defaultExpanded)
      .map(section => section.id);
    return new Set(defaultExpanded);
  });

  // Only update expanded sections if new sections are added (preserve user's manual expansions)
  useEffect(() => {
    const currentSectionIds = new Set(sections.map(s => s.id));
    const defaultExpanded = sections
      .filter(section => section.defaultExpanded)
      .map(section => section.id);
    
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      
      // Remove sections that no longer exist
      for (const sectionId of prev) {
        if (!currentSectionIds.has(sectionId)) {
          newSet.delete(sectionId);
        }
      }
      
      // Add new default expanded sections (only if they weren't manually collapsed)
      for (const sectionId of defaultExpanded) {
        if (!prev.has(sectionId)) {
          newSet.add(sectionId);
        }
      }
      
      return newSet;
    });
  }, [sections]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  return (
    <div className={clsx("space-y-3", className)}>
      {sections.map(section => (
        <FormSection
          key={section.id}
          section={section}
          blockData={blockData}
          onChange={onChange}
          isExpanded={expandedSections.has(section.id)}
          onToggle={() => toggleSection(section.id)}
        />
      ))}
    </div>
  );
}; 
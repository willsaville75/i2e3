/**
 * Dynamic Property Mapping System
 * 
 * This system maps schema properties to actual CSS/styling behavior
 * Eliminates the need for hardcoded property handling in each block
 */

import { spacing, colors, sizing, alignment } from './tokens';

export interface PropertyMapping {
  path: string;                           // Schema path: "layout.blockSettings.blockWidth"
  type: 'className' | 'style' | 'attribute';  // How to apply the value
  target: string;                         // CSS property or class prefix
  transform: (value: any, blockData?: any) => string | null;  // Transform function
  selector?: string;                      // Optional: which element to apply to
  condition?: (value: any, blockData?: any) => boolean;    // Optional: when to apply
}

/**
 * Utility to get nested value from object path
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Utility to set nested value in object path
 */
export function setNestedValue(obj: any, path: string, value: any): any {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  
  target[lastKey] = value;
  return obj;
}

/**
 * Hero Block Property Mappings
 * Maps schema properties to actual styling behavior
 */
export const HERO_PROPERTY_MAPPINGS: PropertyMapping[] = [
  // Block Width (Full Width Toggle)
  {
    path: 'layout.blockSettings.blockWidth',
    type: 'className',
    target: 'max-width',
    transform: (value: boolean) => value ? 'max-w-none' : 'max-w-7xl',
    selector: 'content'
  },
  
  // Block Height
  {
    path: 'layout.blockSettings.height',
    type: 'className', 
    target: 'height',
    transform: (value: string) => {
      const heightMap = {
        'auto': 'min-h-auto',
        'screen': 'min-h-screen',
        'half': 'min-h-[50vh]',
        'third': 'min-h-[33vh]',
        'quarter': 'min-h-[25vh]'
      };
      return heightMap[value as keyof typeof heightMap] || 'min-h-screen';
    },
    selector: 'section'
  },
  
  // Block Margins
  {
    path: 'layout.blockSettings.margin.top',
    type: 'className',
    target: 'margin-top',
    transform: (value: string) => {
      return spacing.margin.top[value as keyof typeof spacing.margin.top] || null;
    },
    selector: 'section'
  },
  {
    path: 'layout.blockSettings.margin.bottom',
    type: 'className',
    target: 'margin-bottom', 
    transform: (value: string) => {
      return spacing.margin.bottom[value as keyof typeof spacing.margin.bottom] || null;
    },
    selector: 'section'
  },
  
  // Content Padding - using spacing.map for consistent values
  {
    path: 'layout.contentSettings.padding.top',
    type: 'className',
    target: 'padding-top',
    transform: (value: string) => {
      const paddingValue = spacing.map[value as keyof typeof spacing.map];
      return paddingValue ? `pt-${paddingValue}` : null;
    },
    selector: 'content'
  },
  {
    path: 'layout.contentSettings.padding.bottom',
    type: 'className',
    target: 'padding-bottom',
    transform: (value: string) => {
      const paddingValue = spacing.map[value as keyof typeof spacing.map];
      return paddingValue ? `pb-${paddingValue}` : null;
    },
    selector: 'content'
  },
  {
    path: 'layout.contentSettings.padding.left',
    type: 'className',
    target: 'padding-left',
    transform: (value: string) => {
      const paddingValue = spacing.map[value as keyof typeof spacing.map];
      return paddingValue ? `pl-${paddingValue}` : null;
    },
    selector: 'content'
  },
  {
    path: 'layout.contentSettings.padding.right',
    type: 'className',
    target: 'padding-right',
    transform: (value: string) => {
      const paddingValue = spacing.map[value as keyof typeof spacing.map];
      return paddingValue ? `pr-${paddingValue}` : null;
    },
    selector: 'content'
  },
  
  // Content Width
  {
    path: 'layout.contentSettings.contentWidth',
    type: 'className',
    target: 'content-width',
    transform: (value: string) => {
      const widthMap = {
        'narrow': 'max-w-4xl',
        'wide': 'max-w-7xl', 
        'full': 'max-w-none'
      };
      return widthMap[value as keyof typeof widthMap] || 'max-w-7xl';
    },
    selector: 'content'
  },
  
  // Text Alignment
  {
    path: 'layout.contentSettings.textAlignment',
    type: 'className',
    target: 'text-align',
    transform: (value: string) => {
      return alignment.text[value as keyof typeof alignment.text] || null;
    },
    selector: 'content'
  },
  
  // Background Color
  {
    path: 'background.color',
    type: 'className',
    target: 'background-color',
    transform: (value: string, blockData?: any) => {
      if (blockData?.background?.type !== 'color') return null;
      
      const colorScheme = value || 'blue';
      const intensity = blockData?.background?.colorIntensity || 'medium';
      
      return colors.scheme[colorScheme as keyof typeof colors.scheme]?.[colors.intensity[intensity as keyof typeof colors.intensity]] 
             || colors.scheme.blue['500'];
    },
    selector: 'section',
    condition: (value: any, blockData?: any) => blockData?.background?.type === 'color'
  },
  
  // Background Gradient
  {
    path: 'background.gradient',
    type: 'style',
    target: 'background',
    transform: (value: string, blockData?: any) => {
      if (blockData?.background?.type !== 'gradient') return null;
      
      // This will be handled by the gradient system
      return null; // Special case - handled separately
    },
    selector: 'section',
    condition: (value: any, blockData?: any) => blockData?.background?.type === 'gradient'
  }
];

/**
 * Apply property mappings to generate CSS classes and styles
 */
export function applyPropertyMappings(
  blockData: any,
  mappings: PropertyMapping[]
): {
  sectionClasses: string[];
  contentClasses: string[];
  sectionStyles: React.CSSProperties;
  contentStyles: React.CSSProperties;
} {
  const result = {
    sectionClasses: [] as string[],
    contentClasses: [] as string[],
    sectionStyles: {} as React.CSSProperties,
    contentStyles: {} as React.CSSProperties
  };
  
  mappings.forEach(mapping => {
    const value = getNestedValue(blockData, mapping.path);
    
    if (value === undefined) return;
    
    // Check condition if provided
    if (mapping.condition && !mapping.condition(value, blockData)) return;
    
    // Transform the value
    const transformed = mapping.transform(value, blockData);
    if (!transformed) return;
    
    // Apply based on type and selector
    const targetClasses = mapping.selector === 'content' ? result.contentClasses : result.sectionClasses;
    const targetStyles = mapping.selector === 'content' ? result.contentStyles : result.sectionStyles;
    
    if (mapping.type === 'className') {
      targetClasses.push(transformed);
    } else if (mapping.type === 'style') {
      // Convert CSS property name to camelCase for React styles
      const styleProp = mapping.target.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      targetStyles[styleProp as keyof React.CSSProperties] = transformed as any;
    }
  });
  
  return result;
}

/**
 * Get property mappings for a specific block type
 */
export function getPropertyMappings(blockType: string): PropertyMapping[] {
  switch (blockType) {
    case 'hero':
      return HERO_PROPERTY_MAPPINGS;
    default:
      return [];
  }
} 
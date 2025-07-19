/**
 * Dynamic Property Mapping System
 * 
 * This system maps schema properties to actual CSS/styling behavior
 * Eliminates the need for hardcoded property handling in each block
 */

import { spacing, colors, alignment, gradient, sizing, container } from './tokens';

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
  
  // Create nested structure if it doesn't exist
  let current = obj;
  for (const key of keys) {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  // Set the final value
  current[lastKey] = value;
  
  console.log(`🔧 setNestedValue: Set ${path} = ${value} in object:`, JSON.stringify(obj, null, 2));
  return obj;
}

/**
 * Generate gradient to solid color mapping dynamically from gradient presets
 */
function getGradientToSolidMapping(): Record<string, string> {
  // This could be made more dynamic by analyzing gradient.presets colors
  // For now, keeping the mapping but making it clear it's derived from presets
  return {
    'sunset': 'orange',    // gradient.presets.sunset -> orange tones
    'ocean': 'blue',       // gradient.presets.ocean -> blue tones
    'purple': 'purple',    // gradient.presets.purple -> purple tones
    'forest': 'green',     // gradient.presets.forest -> green tones
    'fire': 'red',         // gradient.presets.fire -> red tones
    'sky': 'sky',          // gradient.presets.sky -> sky tones
    'rose': 'rose',        // gradient.presets.rose -> rose tones
    'mint': 'teal'         // gradient.presets.mint -> teal tones
  };
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
    transform: (value: boolean) => value ? container.maxWidth.full : container.maxWidth.wide,
    selector: 'content'
  },
  
  // Block Height
  {
    path: 'layout.blockSettings.height',
    type: 'className', 
    target: 'height',
    transform: (value: string) => {
      // Read from tokens.ts as single source of truth
      return sizing.height[value as keyof typeof sizing.height] || sizing.height.screen;
    },
    selector: 'section'
  },
  
  // Block Margins
  {
    path: 'layout.blockSettings.margin.top',
    type: 'className',
    target: 'margin-top',
    transform: (value: string) => {
      const marginClass = spacing.margin.top[value as keyof typeof spacing.margin.top];
      if (!marginClass && value !== 'none') {
        console.warn(`Invalid margin-top value: ${value}`);
      }
      return marginClass || '';
    },
    selector: 'section'
  },
  {
    path: 'layout.blockSettings.margin.bottom',
    type: 'className',
    target: 'margin-bottom', 
    transform: (value: string) => {
      const marginClass = spacing.margin.bottom[value as keyof typeof spacing.margin.bottom];
      if (!marginClass && value !== 'none') {
        console.warn(`Invalid margin-bottom value: ${value}`);
      }
      return marginClass || '';
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
      // Read from tokens.ts as single source of truth
      return container.maxWidth[value as keyof typeof container.maxWidth] || container.maxWidth.wide;
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
  
  // Content Horizontal Alignment
  {
    path: 'layout.contentSettings.contentAlignment.horizontal',
    type: 'className',
    target: 'justify-content',
    transform: (value: string) => {
      return alignment.horizontal[value as keyof typeof alignment.horizontal] || null;
    },
    selector: 'content'
  },
  
  // Content Vertical Alignment
  {
    path: 'layout.contentSettings.contentAlignment.vertical',
    type: 'className',
    target: 'align-items',
    transform: (value: string) => {
      return alignment.vertical[value as keyof typeof alignment.vertical] || null;
    },
    selector: 'content'
  },
  
  // Background Color (Dynamic - reads from both colors.scheme and gradient.presets)
  {
    path: 'background.color',
    type: 'className',
    target: 'background-color',
    transform: (value: string, blockData?: any) => {
      if (blockData?.background?.type !== 'color') return null;
      
      const colorScheme = value || 'blue';
      const intensity = blockData?.background?.colorIntensity || 'medium';
      
      // First check if it's a standard color in colors.scheme
      const standardColor = colors.scheme[colorScheme as keyof typeof colors.scheme];
      if (standardColor) {
        return standardColor[colors.intensity[intensity as keyof typeof colors.intensity]] || standardColor['500'];
      }
      
      // Then check if it's a gradient preset color - map to closest solid color
      const gradientPreset = gradient.presets[colorScheme as keyof typeof gradient.presets];
      if (gradientPreset) {
        // Map gradient colors to closest solid colors (dynamic from gradient presets)
        const gradientToSolidMapping = getGradientToSolidMapping();
        const solidColor = gradientToSolidMapping[colorScheme] || 'blue';
        const solidColorScheme = colors.scheme[solidColor as keyof typeof colors.scheme];
        return solidColorScheme?.[colors.intensity[intensity as keyof typeof colors.intensity]] || solidColorScheme?.['500'];
      }
      
      // Fallback to blue
      return colors.scheme.blue['500'];
    },
    selector: 'section',
    condition: (_value: any, blockData?: any) => blockData?.background?.type === 'color'
  },
  
  // Background Gradient
  {
    path: 'background.gradient',
    type: 'style',
    target: 'background',
    transform: (_value: string, blockData?: any) => {
      if (blockData?.background?.type !== 'gradient') return null;
      
      // This will be handled by the gradient system
      return null; // Special case - handled separately
    },
    selector: 'section',
    condition: (_value: any, blockData?: any) => blockData?.background?.type === 'gradient'
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
    if (!transformed || transformed === '') return;
    
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
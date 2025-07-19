/**
 * Schema-Driven Form Generator
 * 
 * This system auto-generates form fields from schema definitions
 * Eliminates hardcoded form fields and makes the props panel fully dynamic
 */

import { PropertyMapping, getPropertyMappings } from './property-mappings';

export interface FormFieldConfig {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'color' | 'textarea' | 'slider' | 'group';
  path: string;                    // Property path in block data
  defaultValue?: any;
  options?: SelectOption[];        // For select fields
  min?: number;                    // For number/slider fields
  max?: number;                    // For number/slider fields
  step?: number;                   // For number/slider fields
  placeholder?: string;            // For text fields
  description?: string;            // Field description
  validation?: ValidationRule[];   // Validation rules
  conditional?: ConditionalRule;   // Show/hide based on other fields
  group?: string;                  // Group name for organization
  order?: number;                  // Display order
}

export interface SelectOption {
  value: any;
  label: string;
  description?: string;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export interface ConditionalRule {
  field: string;                   // Field path to check
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;                      // Value to compare against
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormFieldConfig[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

/**
 * Generate form configuration from block schema
 */
export function generateFormConfig(blockType: string, schema: any): FormSection[] {
  const sections: FormSection[] = [];
  
  // Get property mappings for this block type
  const propertyMappings = getPropertyMappings(blockType);
  
  // Generate layout section
  const layoutSection = generateLayoutSection(schema, propertyMappings);
  if (layoutSection.fields.length > 0) {
    sections.push(layoutSection);
  }
  
  // Generate content section
  const contentSection = generateContentSection(schema);
  if (contentSection.fields.length > 0) {
    sections.push(contentSection);
  }
  
  // Generate background section
  const backgroundSection = generateBackgroundSection(schema);
  if (backgroundSection.fields.length > 0) {
    sections.push(backgroundSection);
  }
  
  return sections;
}

/**
 * Generate layout section from schema
 */
function generateLayoutSection(schema: any, _propertyMappings: PropertyMapping[]): FormSection {
  const fields: FormFieldConfig[] = [];
  
  // Block Settings
  if (schema.properties?.layout?.properties?.blockSettings) {
    const blockSettings = schema.properties.layout.properties.blockSettings.properties;
    
    // Block Width
    if (blockSettings.blockWidth) {
      fields.push({
        id: 'blockWidth',
        label: 'Full Width',
        type: 'boolean',
        path: 'layout.blockSettings.blockWidth',
        defaultValue: false,
        description: 'Make block span full width of container',
        group: 'Block Settings',
        order: 1
      });
    }
    
    // Block Height
    if (blockSettings.height) {
      const heightOptions = blockSettings.height.enum || ['auto', 'quarter', 'half', 'screen'];
      fields.push({
        id: 'height',
        label: 'Block Height',
        type: 'select',
        path: 'layout.blockSettings.height',
        defaultValue: 'screen',
        options: heightOptions.map((value: string) => ({
          value,
          label: formatHeightLabel(value)
        })),
        group: 'Block Settings',
        order: 2
      });
    }
    
    // Block Margins
    if (blockSettings.margin) {
      fields.push(
        {
          id: 'marginTop',
          label: 'Top Margin',
          type: 'select',
          path: 'layout.blockSettings.margin.top',
          defaultValue: 'lg',
          options: getSpacingOptions(),
          group: 'Block Margins',
          order: 10
        },
        {
          id: 'marginBottom',
          label: 'Bottom Margin',
          type: 'select',
          path: 'layout.blockSettings.margin.bottom',
          defaultValue: 'lg',
          options: getSpacingOptions(),
          group: 'Block Margins',
          order: 11
        }
      );
    }
  }
  
  // Content Settings
  if (schema.properties?.layout?.properties?.contentSettings) {
    const contentSettings = schema.properties.layout.properties.contentSettings.properties;
    
    // Content Width
    if (contentSettings.contentWidth) {
      const widthOptions = contentSettings.contentWidth.enum || ['narrow', 'wide', 'full'];
      fields.push({
        id: 'contentWidth',
        label: 'Content Width',
        type: 'select',
        path: 'layout.contentSettings.contentWidth',
        defaultValue: 'wide',
        options: widthOptions.map((value: string) => ({
          value,
          label: formatWidthLabel(value)
        })),
        group: 'Content Settings',
        order: 20
      });
    }
    
    // Text Alignment
    if (contentSettings.textAlignment) {
      const alignmentOptions = contentSettings.textAlignment.enum || ['left', 'center', 'right'];
      fields.push({
        id: 'textAlignment',
        label: 'Text Alignment',
        type: 'select',
        path: 'layout.contentSettings.textAlignment',
        defaultValue: 'center',
        options: alignmentOptions.map((value: string) => ({
          value,
          label: formatAlignmentLabel(value)
        })),
        group: 'Content Settings',
        order: 21
      });
    }
    
    // Content Padding
    if (contentSettings.padding) {
      fields.push(
        {
          id: 'paddingTop',
          label: 'Top Padding',
          type: 'select',
          path: 'layout.contentSettings.padding.top',
          defaultValue: '2xl',
          options: getSpacingOptions(),
          group: 'Content Padding',
          order: 30
        },
        {
          id: 'paddingBottom',
          label: 'Bottom Padding',
          type: 'select',
          path: 'layout.contentSettings.padding.bottom',
          defaultValue: '2xl',
          options: getSpacingOptions(),
          group: 'Content Padding',
          order: 31
        },
        {
          id: 'paddingLeft',
          label: 'Left Padding',
          type: 'select',
          path: 'layout.contentSettings.padding.left',
          defaultValue: 'md',
          options: getSpacingOptions(),
          group: 'Content Padding',
          order: 32
        },
        {
          id: 'paddingRight',
          label: 'Right Padding',
          type: 'select',
          path: 'layout.contentSettings.padding.right',
          defaultValue: 'md',
          options: getSpacingOptions(),
          group: 'Content Padding',
          order: 33
        }
      );
    }
  }
  
  return {
    id: 'layout',
    title: 'Layout & Spacing',
    description: 'Control block dimensions, spacing, and alignment',
    fields: fields.sort((a, b) => (a.order || 0) - (b.order || 0)),
    collapsible: true,
    defaultExpanded: false
  };
}

/**
 * Generate content section from schema
 */
function generateContentSection(schema: any): FormSection {
  const fields: FormFieldConfig[] = [];
  
  if (schema.properties?.elements) {
    const elements = schema.properties.elements.properties;
    
    // Title element
    if (elements.title) {
      fields.push({
        id: 'titleContent',
        label: 'Title Text',
        type: 'text',
        path: 'elements.title.content',
        defaultValue: 'Welcome to Our Platform',
        placeholder: 'Enter title text...',
        group: 'Title',
        order: 1
      });
      
      if (elements.title.properties?.level) {
        fields.push({
          id: 'titleLevel',
          label: 'Title Level',
          type: 'select',
          path: 'elements.title.level',
          defaultValue: 1,
          options: [
            { value: 1, label: 'H1 (Largest)' },
            { value: 2, label: 'H2 (Large)' },
            { value: 3, label: 'H3 (Medium)' },
            { value: 4, label: 'H4 (Small)' },
            { value: 5, label: 'H5 (Smaller)' },
            { value: 6, label: 'H6 (Smallest)' }
          ],
          group: 'Title',
          order: 2
        });
      }
    }
    
    // Subtitle element
    if (elements.subtitle) {
      fields.push({
        id: 'subtitleContent',
        label: 'Subtitle Text',
        type: 'textarea',
        path: 'elements.subtitle.content',
        defaultValue: 'Discover amazing features and capabilities',
        placeholder: 'Enter subtitle text...',
        group: 'Subtitle',
        order: 10
      });
    }
    
    // Button element
    if (elements.button) {
      fields.push(
        {
          id: 'buttonText',
          label: 'Button Text',
          type: 'text',
          path: 'elements.button.text',
          defaultValue: 'Get Started',
          placeholder: 'Enter button text...',
          group: 'Button',
          order: 20
        },
        {
          id: 'buttonHref',
          label: 'Button Link',
          type: 'text',
          path: 'elements.button.href',
          defaultValue: '#',
          placeholder: 'Enter URL or path...',
          group: 'Button',
          order: 21
        }
      );
      
      if (elements.button.properties?.variant) {
        fields.push({
          id: 'buttonVariant',
          label: 'Button Style',
          type: 'select',
          path: 'elements.button.variant',
          defaultValue: 'primary',
          options: [
            { value: 'primary', label: 'Primary' },
            { value: 'secondary', label: 'Secondary' },
            { value: 'outline', label: 'Outline' },
            { value: 'ghost', label: 'Ghost' }
          ],
          group: 'Button',
          order: 22
        });
      }
      
      if (elements.button.properties?.size) {
        fields.push({
          id: 'buttonSize',
          label: 'Button Size',
          type: 'select',
          path: 'elements.button.size',
          defaultValue: 'lg',
          options: [
            { value: 'sm', label: 'Small' },
            { value: 'md', label: 'Medium' },
            { value: 'lg', label: 'Large' },
            { value: 'xl', label: 'Extra Large' }
          ],
          group: 'Button',
          order: 23
        });
      }
    }
  }
  
  return {
    id: 'content',
    title: 'Content',
    description: 'Edit text content and elements',
    fields: fields.sort((a, b) => (a.order || 0) - (b.order || 0)),
    collapsible: true,
    defaultExpanded: false
  };
}

/**
 * Generate background section from schema
 */
function generateBackgroundSection(schema: any): FormSection {
  const fields: FormFieldConfig[] = [];
  
  if (schema.properties?.background) {
    const background = schema.properties.background.properties;
    
    // Background Type
    if (background.type) {
      const typeOptions = background.type.enum || ['color', 'gradient', 'image', 'video'];
      fields.push({
        id: 'backgroundType',
        label: 'Background Type',
        type: 'select',
        path: 'background.type',
        defaultValue: 'color',
        options: typeOptions.map((value: string) => ({
          value,
          label: formatBackgroundTypeLabel(value)
        })),
        group: 'Background',
        order: 1
      });
    }
    
    // Background Color
    if (background.color) {
      fields.push({
        id: 'backgroundColor',
        label: 'Background Color',
        type: 'select',
        path: 'background.color',
        defaultValue: 'blue',
        options: getColorOptions(),
        group: 'Background',
        order: 2,
        conditional: {
          field: 'background.type',
          operator: 'equals',
          value: 'color'
        }
      });
    }
    
    // Color Intensity
    if (background.colorIntensity) {
      fields.push({
        id: 'colorIntensity',
        label: 'Color Intensity',
        type: 'select',
        path: 'background.colorIntensity',
        defaultValue: 'medium',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'medium', label: 'Medium' },
          { value: 'dark', label: 'Dark' }
        ],
        group: 'Background',
        order: 3,
        conditional: {
          field: 'background.type',
          operator: 'equals',
          value: 'color'
        }
      });
    }
    
    // Background Gradient
    if (background.gradient) {
      fields.push({
        id: 'backgroundGradient',
        label: 'Gradient Style',
        type: 'select',
        path: 'background.gradient',
        defaultValue: 'sunset',
        options: getGradientOptions(),
        group: 'Background',
        order: 4,
        conditional: {
          field: 'background.type',
          operator: 'equals',
          value: 'gradient'
        }
      });
    }
    
    // Background Image
    if (background.image) {
      const imageProps = background.image.properties;
      
      // Image URL
      if (imageProps?.url) {
        fields.push({
          id: 'backgroundImageUrl',
          label: 'Image URL',
          type: 'text',
          path: 'background.image.url',
          placeholder: 'Enter image URL...',
          group: 'Image Settings',
          order: 10,
          conditional: {
            field: 'background.type',
            operator: 'equals',
            value: 'image'
          }
        });
      }
      
      // Mobile Image URL
      if (imageProps?.mobileUrl) {
        fields.push({
          id: 'backgroundImageMobileUrl',
          label: 'Mobile Image URL',
          type: 'text',
          path: 'background.image.mobileUrl',
          placeholder: 'Enter mobile image URL (optional)...',
          group: 'Image Settings',
          order: 11,
          conditional: {
            field: 'background.type',
            operator: 'equals',
            value: 'image'
          }
        });
      }
      
      // Image Position
      if (imageProps?.position) {
        fields.push({
          id: 'backgroundImagePosition',
          label: 'Image Position',
          type: 'select',
          path: 'background.image.position',
          defaultValue: 'center',
          options: [
            { value: 'center', label: 'Center' },
            { value: 'top', label: 'Top' },
            { value: 'bottom', label: 'Bottom' },
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' }
          ],
          group: 'Image Settings',
          order: 12,
          conditional: {
            field: 'background.type',
            operator: 'equals',
            value: 'image'
          }
        });
      }
      
      // Image Size
      if (imageProps?.size) {
        fields.push({
          id: 'backgroundImageSize',
          label: 'Image Size',
          type: 'select',
          path: 'background.image.size',
          defaultValue: 'cover',
          options: [
            { value: 'cover', label: 'Cover (Fill Container)' },
            { value: 'contain', label: 'Contain (Fit Inside)' },
            { value: 'auto', label: 'Auto (Original Size)' }
          ],
          group: 'Image Settings',
          order: 13,
          conditional: {
            field: 'background.type',
            operator: 'equals',
            value: 'image'
          }
        });
      }
    }
    
    // Background Video
    if (background.video) {
      const videoProps = background.video.properties;
      
      // Video URL
      if (videoProps?.url) {
        fields.push({
          id: 'backgroundVideoUrl',
          label: 'Video URL',
          type: 'text',
          path: 'background.video.url',
          placeholder: 'Enter video URL (MP4)...',
          group: 'Video Settings',
          order: 20,
          conditional: {
            field: 'background.type',
            operator: 'equals',
            value: 'video'
          }
        });
      }
      
      // Video Poster
      if (videoProps?.poster) {
        fields.push({
          id: 'backgroundVideoPoster',
          label: 'Video Poster Image',
          type: 'text',
          path: 'background.video.poster',
          placeholder: 'Enter poster image URL (optional)...',
          group: 'Video Settings',
          order: 21,
          conditional: {
            field: 'background.type',
            operator: 'equals',
            value: 'video'
          }
        });
      }
    }
    
    // Background Overlay
    if (background.overlay) {
      const overlayProps = background.overlay.properties;
      
      // Overlay Enabled
      if (overlayProps?.enabled) {
        fields.push({
          id: 'overlayEnabled',
          label: 'Enable Overlay',
          type: 'boolean',
          path: 'background.overlay.enabled',
          defaultValue: false,
          description: 'Add a color overlay on top of the background',
          group: 'Overlay Settings',
          order: 30,
          conditional: {
            field: 'background.type',
            operator: 'not_equals',
            value: 'color'
          }
        });
      }
      
      // Overlay Color
      if (overlayProps?.color) {
        fields.push({
          id: 'overlayColor',
          label: 'Overlay Color',
          type: 'text',
          path: 'background.overlay.color',
          defaultValue: '#000000',
          placeholder: '#000000',
          group: 'Overlay Settings',
          order: 31,
          conditional: {
            field: 'background.overlay.enabled',
            operator: 'equals',
            value: true
          }
        });
      }
      
      // Overlay Opacity
      if (overlayProps?.opacity) {
        fields.push({
          id: 'overlayOpacity',
          label: 'Overlay Opacity',
          type: 'slider',
          path: 'background.overlay.opacity',
          defaultValue: 0.5,
          min: 0,
          max: 1,
          step: 0.1,
          group: 'Overlay Settings',
          order: 32,
          conditional: {
            field: 'background.overlay.enabled',
            operator: 'equals',
            value: true
          }
        });
      }
      
      // Overlay Blur
      if (overlayProps?.blur) {
        fields.push({
          id: 'overlayBlur',
          label: 'Enable Blur',
          type: 'boolean',
          path: 'background.overlay.blur',
          defaultValue: false,
          description: 'Apply a blur effect to the background',
          group: 'Overlay Settings',
          order: 33,
          conditional: {
            field: 'background.overlay.enabled',
            operator: 'equals',
            value: true
          }
        });
      }
    }
  }
  
  return {
    id: 'background',
    title: 'Background',
    description: 'Configure background colors, gradients, and images',
    fields: fields.sort((a, b) => (a.order || 0) - (b.order || 0)),
    collapsible: true,
    defaultExpanded: false
  };
}

/**
 * Helper functions for formatting labels and options
 */
function formatHeightLabel(value: string): string {
  const labels: Record<string, string> = {
    'auto': 'Auto (Content Height)',
    'quarter': '25% of Viewport',
    'half': '50% of Viewport',
    'screen': 'Full Viewport Height'
  };
  return labels[value] || value;
}

function formatWidthLabel(value: string): string {
  const labels: Record<string, string> = {
    'narrow': 'Narrow (1200px max)',
    'wide': 'Wide (1600px max)',
    'full': 'Full Width'
  };
  return labels[value] || value;
}

function formatAlignmentLabel(value: string): string {
  const labels: Record<string, string> = {
    'left': 'Left Aligned',
    'center': 'Center Aligned',
    'right': 'Right Aligned'
  };
  return labels[value] || value;
}

function formatBackgroundTypeLabel(value: string): string {
  const labels: Record<string, string> = {
    'color': 'Solid Color',
    'gradient': 'Gradient',
    'image': 'Image',
    'video': 'Video'
  };
  return labels[value] || value;
}

function getSpacingOptions(): SelectOption[] {
  return [
    { value: 'none', label: 'None' },
    { value: 'xs', label: 'Extra Small' },
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
    { value: 'xl', label: 'Extra Large' },
    { value: '2xl', label: '2X Large' }
  ];
}

function getColorOptions(): SelectOption[] {
  return [
    { value: 'blue', label: 'Blue' },
    { value: 'red', label: 'Red' },
    { value: 'green', label: 'Green' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'purple', label: 'Purple' },
    { value: 'pink', label: 'Pink' },
    { value: 'gray', label: 'Gray' },
    { value: 'neutral', label: 'Neutral' }
  ];
}

function getGradientOptions(): SelectOption[] {
  return [
    { value: 'sunset', label: 'Sunset' },
    { value: 'ocean', label: 'Ocean' },
    { value: 'purple', label: 'Purple' },
    { value: 'forest', label: 'Forest' },
    { value: 'fire', label: 'Fire' },
    { value: 'sky', label: 'Sky' },
    { value: 'rose', label: 'Rose' },
    { value: 'mint', label: 'Mint' }
  ];
} 
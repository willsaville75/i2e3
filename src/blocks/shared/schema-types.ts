/**
 * TypeScript-first schema type definitions
 * This is the single source of truth for all schema types
 * 
 * UI Component Mapping:
 * - string -> Input component from '@/components/ui'
 * - string with enum -> Select component from '@/components/ui'  
 * - string with maxLength > 100 -> Textarea component from '@/components/ui'
 * - number -> Input component with type="number" from '@/components/ui'
 * - number with enum -> Select component from '@/components/ui'
 * - boolean -> Checkbox component from '@/components/ui'
 * - color properties -> Color picker + Input component from '@/components/ui'
 * - slider type -> HTML range input (custom implementation)
 * 
 * All components follow consistent Tailwind patterns with:
 * - Indigo accent colors for focus states
 * - Consistent border and shadow styling
 * - Proper accessibility attributes
 */

// Removed unused imports - spacing and gradient are used in type definitions below

// Base schema property types
export interface SchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  title?: string
  description?: string
  default?: any
  enum?: any[]
  required?: boolean
}

export interface StringProperty extends SchemaProperty {
  type: 'string'
  minLength?: number
  maxLength?: number
  pattern?: string
  format?: string
}

export interface NumberProperty extends SchemaProperty {
  type: 'number'
  minimum?: number
  maximum?: number
  multipleOf?: number
}

export interface BooleanProperty extends SchemaProperty {
  type: 'boolean'
}

export interface ObjectProperty extends SchemaProperty {
  type: 'object'
  properties?: Record<string, AnyProperty>
  additionalProperties?: boolean
}

export interface ArrayProperty extends SchemaProperty {
  type: 'array'
  items?: AnyProperty
  minItems?: number
  maxItems?: number
}

// Union type for all property types
export type AnyProperty = StringProperty | NumberProperty | BooleanProperty | ObjectProperty | ArrayProperty

// UI Component type mapping for form generation
export interface UIComponentMapping {
  string: 'Input' | 'Textarea' | 'Select'
  number: 'Input' | 'Select' | 'Slider'
  boolean: 'Checkbox' | 'Switch'
  color: 'ColorPicker'
  object: 'FieldGroup'
  array: 'ArrayField'
}

// Helper to determine which UI component to use
export function getUIComponent(property: AnyProperty): keyof UIComponentMapping {
  if (property.type === 'string') {
    if (property.enum) return 'Select' as any
    if ((property as StringProperty).maxLength && (property as StringProperty).maxLength! > 100) return 'Textarea' as any
    return 'Input' as any
  }
  if (property.type === 'number') {
    if (property.enum) return 'Select' as any
    return 'Input' as any
  }
  if (property.type === 'boolean') return 'Checkbox' as any
  if (property.type === 'object') return 'FieldGroup' as any
  if (property.type === 'array') return 'ArrayField' as any
  return 'Input' as any
}

// Layout Schema Interface
export interface LayoutSchema {
  blockSettings?: {
    blockWidth?: boolean
    height?: 'auto' | 'screen' | 'half' | 'third' | 'quarter'
    margin?: {
      top?: string
      bottom?: string
    }
  }
  contentSettings?: {
    contentAlignment?: {
      horizontal?: 'left' | 'center' | 'right'
      vertical?: 'top' | 'center' | 'bottom'
    }
    textAlignment?: 'left' | 'center' | 'right' | 'justify'
    contentWidth?: 'narrow' | 'wide' | 'full'
    padding?: {
      top?: string
      bottom?: string
      left?: string
      right?: string
    }
  }
}

// Background Schema Interface
export interface BackgroundSchema {
  type?: 'color' | 'gradient' | 'image' | 'video'
  color?: string
  colorIntensity?: string
  gradient?: string
  image?: {
    url?: string
    mobileUrl?: string
    position?: string
    size?: string
  }
  video?: {
    url?: string
    poster?: string
  }
  overlay?: {
    enabled?: boolean
    color?: string
    opacity?: number
    blur?: boolean
  }
}

// Block schema builder
export interface BlockSchema<T = any> {
  id: string
  title: string
  description: string
  properties: T
  required?: string[]
  aiExample?: any
  aiInstructions?: {
    propertyPaths?: Record<string, string>
    hints?: string[]
    layout_hints?: string[]
    colorMappings?: Record<string, string>
  }
}

export function createBlockSchema<T extends Record<string, any>>(schema: BlockSchema<T>): BlockSchema<T> {
  return schema;
}

// Schema property builders
export const schemaProperties = {
  string: (config: Partial<StringProperty> = {}): StringProperty => ({
    type: 'string',
    ...config
  }),
  
  number: (config: Partial<NumberProperty> = {}): NumberProperty => ({
    type: 'number',
    ...config
  }),
  
  boolean: (config: Partial<BooleanProperty> = {}): BooleanProperty => ({
    type: 'boolean',
    ...config
  }),
  
  object: (properties: Record<string, AnyProperty> = {}, config: Partial<ObjectProperty> = {}): ObjectProperty => ({
    type: 'object',
    properties,
    ...config
  }),
  
  array: (items: AnyProperty, config: Partial<ArrayProperty> = {}): ArrayProperty => ({
    type: 'array',
    items,
    ...config
  }),
  
  // Layout schema builder
  layout: (): ObjectProperty => ({
    type: 'object',
    title: 'Layout Settings',
    description: 'Layout and spacing configuration',
    properties: {
      blockSettings: {
        type: 'object',
        title: 'Block Settings',
        properties: {
          blockWidth: {
            type: 'boolean',
            title: 'Apply Full Width',
            default: false
          },
          height: {
            type: 'string',
            title: 'Block Height',
            enum: ['auto', 'screen', 'half', 'third', 'quarter'],
            default: 'auto'
          },
          margin: {
            type: 'object',
            title: 'Block Margin',
            properties: {
              top: {
                type: 'string',
                title: 'Top Margin',
                enum: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
                default: 'lg'
              },
              bottom: {
                type: 'string',
                title: 'Bottom Margin',
                enum: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
                default: 'lg'
              }
            }
          }
        }
      },
      contentSettings: {
        type: 'object',
        title: 'Content Settings',
        properties: {
          contentAlignment: {
            type: 'object',
            title: 'Content Alignment',
            properties: {
              horizontal: {
                type: 'string',
                title: 'Horizontal Alignment',
                enum: ['left', 'center', 'right'],
                default: 'center'
              },
              vertical: {
                type: 'string',
                title: 'Vertical Alignment',
                enum: ['top', 'center', 'bottom'],
                default: 'center'
              }
            }
          },
          textAlignment: {
            type: 'string',
            title: 'Text Alignment',
            enum: ['left', 'center', 'right', 'justify'],
            default: 'center'
          },
          contentWidth: {
            type: 'string',
            title: 'Content Width',
            enum: ['narrow', 'wide', 'full'],
            default: 'wide'
          },
          padding: {
            type: 'object',
            title: 'Content Padding',
            properties: {
              top: {
                type: 'string',
                title: 'Top Padding',
                enum: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
                default: 'lg'
              },
              bottom: {
                type: 'string',
                title: 'Bottom Padding',
                enum: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
                default: 'lg'
              },
              left: {
                type: 'string',
                title: 'Left Padding',
                enum: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
                default: 'md'
              },
              right: {
                type: 'string',
                title: 'Right Padding',
                enum: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
                default: 'md'
              }
            }
          }
        }
      }
    }
  }),
  
  // Background schema builder
  background: (): ObjectProperty => ({
    type: 'object',
    title: 'Background Settings',
    description: 'Background styling options',
    properties: {
      type: {
        type: 'string',
        title: 'Background Type',
        enum: ['color', 'gradient', 'image', 'video'],
        default: 'color'
      },
      color: {
        type: 'string',
        title: 'Background Color',
        enum: ['blue', 'red', 'green', 'yellow', 'purple', 'pink', 'gray', 'black', 'white'],
        default: 'blue'
      },
      colorIntensity: {
        type: 'string',
        title: 'Color Intensity',
        enum: ['light', 'medium', 'dark'],
        default: 'medium'
      },
      gradient: {
        type: 'string',
        title: 'Gradient Preset',
        enum: ['sunset', 'ocean', 'purple', 'forest', 'fire', 'sky', 'rose', 'mint'],
        default: 'sunset'
      },
      image: {
        type: 'object',
        title: 'Image Settings',
        properties: {
          url: {
            type: 'string',
            title: 'Image URL'
          },
          mobileUrl: {
            type: 'string',
            title: 'Mobile Image URL'
          },
          position: {
            type: 'string',
            title: 'Image Position',
            enum: ['center', 'top', 'bottom', 'left', 'right'],
            default: 'center'
          },
          size: {
            type: 'string',
            title: 'Image Size',
            enum: ['cover', 'contain', 'auto'],
            default: 'cover'
          }
        }
      },
      video: {
        type: 'object',
        title: 'Video Settings',
        properties: {
          url: {
            type: 'string',
            title: 'Video URL'
          },
          poster: {
            type: 'string',
            title: 'Poster Image URL'
          }
        }
      },
      overlay: {
        type: 'object',
        title: 'Overlay Settings',
        properties: {
          enabled: {
            type: 'boolean',
            title: 'Enable Overlay',
            default: false
          },
          color: {
            type: 'string',
            title: 'Overlay Color',
            default: '#000000'
          },
          opacity: {
            type: 'number',
            title: 'Overlay Opacity',
            minimum: 0,
            maximum: 1,
            default: 0.5
          },
          blur: {
            type: 'boolean',
            title: 'Enable Blur',
            default: false
          }
        }
      }
    }
  })
}; 
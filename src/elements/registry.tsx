import { ElementDefinition, ElementRegistry } from './types'

// Import elements
import * as buttonElement from './button/index'
import * as textElement from './text/index'
import * as titleElement from './title/index'
import * as imageElement from './image/index'
import * as iconElement from './icon/index'
import * as avatarElement from './avatar/index'
import * as badgeElement from './badge/index'
import * as linkElement from './link/index'
import * as textareaElement from './textarea/index'
import * as cardElement from './card/index'
import * as videoElement from './video/index'

export const elementRegistry: ElementRegistry = {}

// Register elements
const elementModules = {
  button: buttonElement,
  text: textElement,
  title: titleElement,
  image: imageElement,
  icon: iconElement,
  avatar: avatarElement,
  badge: badgeElement,
  link: linkElement,
  textarea: textareaElement,
  card: cardElement,
  video: videoElement,
}

// Build registry
Object.entries(elementModules).forEach(([type, module]) => {
  const elementDefinition: ElementDefinition = {
    type,
    name: module.metadata.name,
    description: module.metadata.description,
    component: module.component,
    schema: module.schema,
    defaultProps: getDefaultPropsFromSchema(module.schema),
  }
  
  elementRegistry[type] = elementDefinition
})

// Helper function to extract default props from schema
function getDefaultPropsFromSchema(schema: any): Record<string, any> {
  const defaults: Record<string, any> = {}
  
  if (schema.properties) {
    Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
      if (prop.default !== undefined) {
        defaults[key] = prop.default
      }
    })
  }
  
  return defaults
}

// Helper functions
export const getElementDefinition = (type: string): ElementDefinition | undefined => {
  return elementRegistry[type]
}

export const getAllElements = (): ElementDefinition[] => {
  return Object.values(elementRegistry)
}

export const getElementTypes = (): string[] => {
  return Object.keys(elementRegistry)
}

// Export for use in AI system
export const getElementRegistryForAI = () => {
  return Object.entries(elementRegistry).reduce((acc, [type, definition]) => {
    acc[type] = {
      name: definition.name,
      description: definition.description,
      schema: definition.schema,
      defaultProps: definition.defaultProps,
    }
    return acc
  }, {} as Record<string, any>)
}

// // console.log(`✅ Element registry loaded with ${Object.keys(elementRegistry).length} elements:`, Object.keys(elementRegistry)) 
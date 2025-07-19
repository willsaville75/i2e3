/**
 * Responsive Container System
 * 
 * This ensures all blocks have consistent responsive behavior
 * using tokens from the design system
 */

import { spacing, container, sizing } from './tokens';

export interface ResponsiveContainerOptions {
  fullWidth?: boolean
  contentWidth?: 'narrow' | 'wide' | 'full'
  padding?: boolean
}

/**
 * Get responsive container classes that ensure consistent widths
 * across all breakpoints while allowing full-width option
 */
export function getResponsiveContainerClasses(options: ResponsiveContainerOptions = {}): string {
  const { fullWidth = false, contentWidth = 'wide', padding = true } = options
  
  // If full width is requested, return simple full width
  if (fullWidth || contentWidth === 'full') {
    return padding ? `w-full ${spacing.padding.responsive.base} ${spacing.padding.responsive.sm} ${spacing.padding.responsive.lg}` : 'w-full'
  }
  
  // Get max-width based on content width using container tokens
  const maxWidthClass = contentWidth === 'narrow' 
    ? container.maxWidth.narrow 
    : container.maxWidth.wide
  
  // Return max-width container without padding
  return `w-full ${maxWidthClass} mx-auto`.trim()
}

/**
 * Get padding classes for inner content
 * Use this INSIDE the max-width container
 */
export function getResponsivePaddingClasses(): string {
  return `${spacing.padding.responsive.base} ${spacing.padding.responsive.sm} ${spacing.padding.responsive.lg}`
}

/**
 * Get the outer wrapper classes for a block
 * This ensures the block takes full viewport width but content is constrained
 */
export function getBlockWrapperClasses(options: ResponsiveContainerOptions = {}): string {
  const { fullWidth = false } = options
  
  if (fullWidth) {
    return 'w-full'
  }
  
  return 'w-full'
}

/**
 * Get height classes based on height token
 */
export function getHeightClasses(height: string): string {
  // Use sizing tokens for heights
  if (height in sizing.height) {
    return sizing.height[height as keyof typeof sizing.height]
  }
  
  // Default fallback
  return sizing.height.auto
}

/**
 * Get alignment classes for content
 */
export function getAlignmentClasses(horizontal: string, vertical: string): string {
  const horizontalClass = horizontal === 'center' ? 'justify-center' : 
                         horizontal === 'right' ? 'justify-end' : 'justify-start'
  
  const verticalClass = vertical === 'center' ? 'items-center' : 
                       vertical === 'bottom' ? 'items-end' : 'items-start'
  
  return `flex ${horizontalClass} ${verticalClass}`
}

/**
 * Get text alignment classes
 */
export function getTextAlignmentClasses(alignment: string): string {
  switch (alignment) {
    case 'center':
      return 'text-center'
    case 'right':
      return 'text-right'
    case 'justify':
      return 'text-justify'
    default:
      return 'text-left'
  }
} 
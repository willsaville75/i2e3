/**
 * Responsive Container System
 * 
 * This ensures all blocks have consistent responsive behavior
 * using tokens from the design system
 */

// No imports needed for this utility

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
    return padding ? 'w-full px-4 sm:px-6 lg:px-8' : 'w-full'
  }
  
  // Get max-width based on content width
  const maxWidthClass = contentWidth === 'narrow' ? 'max-w-4xl' : 'max-w-7xl'
  
  // Return max-width container without padding
  return `w-full ${maxWidthClass} mx-auto`.trim()
}

/**
 * Get padding classes for inner content
 * Use this INSIDE the max-width container
 */
export function getResponsivePaddingClasses(): string {
  return 'px-4 sm:px-6 lg:px-8'
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
  switch (height) {
    case 'screen':
      return 'min-h-screen'
    case 'half':
      return 'min-h-[50vh]'
    case 'third':
      return 'min-h-[33vh]'
    case 'quarter':
      return 'min-h-[25vh]'
    default:
      return 'min-h-auto'
  }
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
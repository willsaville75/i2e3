import React, { useState } from 'react'
import clsx from 'clsx'
import { ImagePlaceholder, getImageWithFallback, isValidImageUrl, DEFAULT_PLACEHOLDER_IMAGE } from '@/utils/imagePlaceholder'

interface ImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  loading?: 'lazy' | 'eager'
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  aspectRatio?: '1:1' | '4:3' | '16:9' | '3:2' | '2:3' | 'auto'
  placeholder?: 'blur' | 'skeleton' | 'icon'
  fallbackSrc?: string
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  objectFit = 'cover',
  rounded = 'none',
  shadow = 'none',
  aspectRatio = 'auto',
  placeholder = 'skeleton',
  fallbackSrc,
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  
  // Use placeholder if src is not valid
  const validSrc = getImageWithFallback(src, fallbackSrc || DEFAULT_PLACEHOLDER_IMAGE)
  const [currentSrc, setCurrentSrc] = useState(validSrc)
  
  // Update currentSrc when src prop changes
  React.useEffect(() => {
    const newValidSrc = getImageWithFallback(src, fallbackSrc || DEFAULT_PLACEHOLDER_IMAGE)
    if (newValidSrc !== currentSrc) {
      setCurrentSrc(newValidSrc)
      setIsLoading(true)
      setHasError(false)
    }
  }, [src, fallbackSrc, currentSrc])

  const objectFitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down',
  }

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }

  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  }

  const aspectRatioClasses = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video',
    '3:2': 'aspect-[3/2]',
    '2:3': 'aspect-[2/3]',
    'auto': '',
  }
  
  // If no valid src at all, just show the placeholder component
  if (!isValidImageUrl(src) && !fallbackSrc) {
    // For placeholder, we want it to fill its container
    // Apply rounding and shadow but filter out img-specific classes
    const filteredClassName = className
      .split(' ')
      .filter(cls => 
        !cls.includes('object-') && 
        cls !== 'block' &&
        !cls.includes('size-')
      )
      .join(' ')
    
    const placeholderClasses = clsx(
      roundedClasses[rounded],
      shadowClasses[shadow],
      filteredClassName
    )
    
    return (
      <ImagePlaceholder 
        className={placeholderClasses}
      />
    )
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    
    // Try fallback image if provided
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setHasError(false)
      return
    }
    
    // Use beautiful placeholder as final fallback
    const placeholderSrc = getBeautifulPlaceholder(width, height, alt)
    if (currentSrc !== placeholderSrc) {
      setCurrentSrc(placeholderSrc)
      setHasError(false)
    }
  }

  const getBeautifulPlaceholder = (w?: number, h?: number, altText?: string) => {
    const defaultWidth = w || 600
    const defaultHeight = h || 400
    
    // Use a beautiful gradient placeholder with subtle patterns
    const colors = [
      'e0e7ff/f3f4f6', // Blue to gray
      'fef3c7/f9fafb', // Yellow to white
      'f3e8ff/f9fafb', // Purple to white
      'ecfdf5/f9fafb', // Green to white
      'fef2f2/f9fafb', // Red to white
    ]
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    const text = altText ? encodeURIComponent(altText.slice(0, 20)) : 'IMAGE'
    
    return `https://via.placeholder.com/${defaultWidth}x${defaultHeight}/${randomColor}?text=${text}`
  }

  const renderPlaceholder = () => {
    if (placeholder === 'skeleton') {
      return (
        <div className={clsx(
          'animate-pulse bg-gradient-to-r from-gray-200 to-gray-300',
          aspectRatioClasses[aspectRatio],
          roundedClasses[rounded],
          'flex items-center justify-center'
        )}>
          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2H4zm16 2v8.59l-3.29-3.29a1 1 0 00-1.42 0L10 16.59l-2.29-2.3a1 1 0 00-1.42 0L4 17.59V6h16zM8 10a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </div>
      )
    }
    
    if (placeholder === 'icon') {
      return (
        <div className={clsx(
          'bg-gray-100 border-2 border-dashed border-gray-300',
          aspectRatioClasses[aspectRatio],
          roundedClasses[rounded],
          'flex items-center justify-center text-gray-400'
        )}>
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2H4zm16 2v8.59l-3.29-3.29a1 1 0 00-1.42 0L10 16.59l-2.29-2.3a1 1 0 00-1.42 0L4 17.59V6h16zM8 10a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            <p className="text-sm">Image</p>
          </div>
        </div>
      )
    }
    
    return null
  }

  const imageClasses = clsx(
    'transition-opacity duration-300',
    objectFitClasses[objectFit],
    roundedClasses[rounded],
    shadowClasses[shadow],
    aspectRatioClasses[aspectRatio],
    isLoading && 'opacity-0',
    !isLoading && 'opacity-100',
    className
  )

  const containerClasses = clsx(
    'relative overflow-hidden',
    aspectRatioClasses[aspectRatio],
    roundedClasses[rounded]
  )

  return (
    <div className={containerClasses}>
      {/* Loading placeholder */}
      {isLoading && renderPlaceholder()}
      
      {/* Error state */}
      {hasError && !isLoading && (
        <div className={clsx(
          'bg-gray-100 border-2 border-dashed border-gray-300',
          aspectRatioClasses[aspectRatio],
          roundedClasses[rounded],
          'flex items-center justify-center text-gray-400'
        )}>
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <p className="text-xs">Failed to load</p>
          </div>
        </div>
      )}
      
      {/* Actual image */}
      <img
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        className={imageClasses}
        onLoad={handleLoad}
        onError={handleError}
        style={aspectRatio === 'auto' ? { width, height } : undefined}
      />
    </div>
  )
}

export default Image 
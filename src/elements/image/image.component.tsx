import React, { useState } from 'react'
import clsx from 'clsx'
import { image, borders, shadows } from '../../blocks/shared/tokens'

// Simple placeholder component
const ImagePlaceholder: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('bg-gray-200 flex items-center justify-center', className)}>
    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2H4zm16 2v8.59l-3.29-3.29a1 1 0 00-1.42 0L10 16.59l-2.29-2.3a1 1 0 00-1.42 0L4 17.59V6h16zM8 10a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
  </div>
)

// Simple image validation
const isValidImageUrl = (url: string): boolean => {
  return Boolean(url && url.length > 0 && (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/')))
}

// Simple fallback handler
const getImageWithFallback = (src: string, fallback?: string): string => {
  return isValidImageUrl(src) ? src : fallback || ''
}

const DEFAULT_PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDIyNVYxNzVIMTc1VjEyNVoiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+'

interface ImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  loading?: 'lazy' | 'eager'
  objectFit?: keyof typeof image.size
  rounded?: keyof typeof borders.radius
  shadow?: keyof typeof shadows
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
  // placeholder = 'skeleton', // Available for future use
  fallbackSrc,
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [, setHasError] = useState(false) // hasError available for future use
  
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
      borders.radius[rounded],
      shadows[shadow],
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
      setIsLoading(true)
      setHasError(false)
    }
  }

  const imageClasses = clsx(
    'transition-opacity duration-300',
    image.size[objectFit],
    borders.radius[rounded],
    shadows[shadow],
    aspectRatioClasses[aspectRatio],
    isLoading ? 'opacity-0' : 'opacity-100',
    className
  )

  return (
    <div className="relative">
      {/* Show placeholder while loading */}
      {isLoading && (
        <div className={clsx(
          'absolute inset-0',
          borders.radius[rounded],
          shadows[shadow],
          aspectRatioClasses[aspectRatio]
        )}>
          <ImagePlaceholder />
        </div>
      )}
      
      {/* Main image */}
      <img
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        className={imageClasses}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          ...(width && { width }),
          ...(height && { height }),
        }}
      />
    </div>
  )
}

export default Image 
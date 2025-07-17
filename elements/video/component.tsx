import React, { useState, useRef } from 'react'
import clsx from 'clsx'

export interface VideoProps {
  src: string
  poster?: string
  width?: number
  height?: number
  className?: string
  controls?: boolean
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  aspectRatio?: '1:1' | '4:3' | '16:9' | '3:2' | '2:3' | 'auto'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  placeholder?: 'skeleton' | 'icon'
  fallbackMessage?: string
}

export const Video: React.FC<VideoProps> = ({
  src,
  poster,
  width,
  height,
  className = '',
  controls = true,
  autoplay = false,
  loop = false,
  muted = false,
  preload = 'metadata',
  aspectRatio = '16:9',
  rounded = 'lg',
  shadow = 'md',
  placeholder = 'skeleton',
  fallbackMessage = 'Your browser does not support the video tag.',
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Fallback: stop loading after 3 seconds if video hasn't loaded
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false)
      }
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [isLoading, src])

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
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

  const handleLoadedData = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleCanPlay = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleLoadStart = () => {
    // Video load started
  }

  const handleError = (e: any) => {
    setIsLoading(false)
    setHasError(true)
  }

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
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
          <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
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
            <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <p className="text-sm">Video</p>
          </div>
        </div>
      )
    }
    
    return null
  }

  const renderError = () => (
    <div className={clsx(
      'bg-red-50 border-2 border-dashed border-red-200',
      aspectRatioClasses[aspectRatio],
      roundedClasses[rounded],
      'flex items-center justify-center text-red-400'
    )}>
      <div className="text-center">
        <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        <p className="text-sm">{fallbackMessage}</p>
      </div>
    </div>
  )

  const renderCustomControls = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity">
      <button
        onClick={togglePlayPause}
        className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-3 transition-all"
      >
        {isPlaying ? (
          <svg className="w-8 h-8 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        ) : (
          <svg className="w-8 h-8 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>
    </div>
  )

  const videoClasses = clsx(
    'w-full h-full object-cover transition-opacity duration-300',
    roundedClasses[rounded],
    isLoading && 'opacity-0',
    !isLoading && 'opacity-100'
  )

  const containerClasses = clsx(
    'relative overflow-hidden',
    aspectRatioClasses[aspectRatio],
    roundedClasses[rounded],
    shadowClasses[shadow],
    className
  )

  return (
    <div className={containerClasses}>
      {/* Loading placeholder */}
      {isLoading && renderPlaceholder()}
      
      {/* Error state */}
      {hasError && !isLoading && renderError()}
      
      {/* Video element */}
      {!hasError && (
        <>
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            width={width}
            height={height}
            controls={controls}
            autoPlay={autoplay}
            loop={loop}
            muted={muted}
            preload={preload}
            className={videoClasses}
            onLoadStart={handleLoadStart}
            onLoadedData={handleLoadedData}
            onCanPlay={handleCanPlay}
            onError={handleError}
            onPlay={handlePlay}
            onPause={handlePause}
            style={aspectRatio === 'auto' ? { width, height } : undefined}
          />
          
          {/* Custom play/pause overlay (only if controls are disabled) */}
          {!controls && renderCustomControls()}
        </>
      )}
    </div>
  )
}

export default Video 
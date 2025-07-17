import React, { useMemo } from 'react';
import clsx from 'clsx';
import { PropertyMapping, applyPropertyMappings } from './property-mappings';
import { createGradientStyle } from './tokens';

export interface PropertyRendererProps {
  blockData: any;
  mappings: PropertyMapping[];
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Universal Property Renderer
 * 
 * This component replaces hardcoded property handling by dynamically
 * applying property mappings to generate CSS classes and styles
 */
export const PropertyRenderer: React.FC<PropertyRendererProps> = ({
  blockData,
  mappings,
  children,
  className,
  style
}) => {
  // Apply property mappings to generate classes and styles
  const { sectionClasses, contentClasses, sectionStyles, contentStyles } = useMemo(() => {
    return applyPropertyMappings(blockData, mappings);
  }, [blockData, mappings]);

  // Handle special cases like gradients
  const gradientStyle = useMemo(() => {
    if (blockData.background?.type === 'gradient' && blockData.background?.gradient) {
      return createGradientStyle({ preset: blockData.background.gradient });
    }
    return {};
  }, [blockData.background]);

  // Combine all section styles
  const combinedSectionStyles = {
    ...sectionStyles,
    ...gradientStyle,
    ...style
  };

  return (
    <section
      className={clsx(
        'relative flex items-center justify-center',
        ...sectionClasses,
        className
      )}
      style={combinedSectionStyles}
    >
      {/* Background Video */}
      {blockData.background?.type === 'video' && blockData.background?.video?.url && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster={blockData.background.video.poster}
        >
          <source src={blockData.background.video.url} type="video/mp4" />
        </video>
      )}
      
      {/* Background Overlay */}
      {blockData.background?.overlay?.enabled && (
        <div
          className={clsx(
            'absolute inset-0',
            blockData.background.overlay.blur && 'backdrop-blur-sm'
          )}
          style={{
            backgroundColor: blockData.background.overlay.color || 'rgba(0,0,0,0.5)',
            opacity: blockData.background.overlay.opacity || 0.5
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Content Container */}
      <div
        className={clsx(
          'relative z-10 w-full mx-auto',
          ...contentClasses
        )}
        style={contentStyles}
      >
        {children}
      </div>
    </section>
  );
}; 
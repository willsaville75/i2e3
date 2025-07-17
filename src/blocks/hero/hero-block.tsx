import React from 'react';
import clsx from 'clsx';
import { HeroProps } from './schema';
import { getResponsiveContainerClasses } from '../shared/responsiveContainer';
import { 
  colors,
  spacing,
  sizing,
  alignment,
  typography,
  image,
  gradient,
  createGradientStyle
} from '../shared/tokens';
import { ElementRenderer } from '../../components/ElementRenderer';

export const HeroBlock: React.FC<HeroProps> = ({
  elements = {},
  layout = {},
  background = {}
}) => {
  // Extract layout settings
  const contentSettings = layout.contentSettings || {};
  const blockSettings = layout.blockSettings || {};
  
  // Container and spacing settings
  const contentWidth = contentSettings.contentWidth;
  const textAlignment = contentSettings.textAlignment;
  
  // Content alignment
  const contentAlignment = contentSettings.contentAlignment || {};
  const horizontalAlign = contentAlignment.horizontal;
  const verticalAlign = contentAlignment.vertical;
  
  // Padding settings
  const contentPadding = contentSettings.padding || {};
  const topPadding = contentPadding.top;
  const bottomPadding = contentPadding.bottom;
  
  // Margin settings
  const marginTop = blockSettings.margin?.top;
  const marginBottom = blockSettings.margin?.bottom;
  
  // Height setting
  const height = blockSettings.height;
  
  // Get background class using token system
  const getBackgroundClass = () => {
    if (!background || !background.type) {
      return colors.scheme.neutral['900']; // Default dark background for hero
    }
    
    if (background.type !== 'color') {
      return ''; // No background color for image/video/gradient
    }
    
    const { color, colorIntensity = 'dark' } = background;
    
    // If no color specified, default to dark gray
    if (!color) {
      return colors.scheme.neutral['900'];
    }
    
    // Map intensity using centralized token
    const mappedIntensity = colors.intensity[colorIntensity as keyof typeof colors.intensity];
    
    // Use color scheme for class lookup
    const colorClass = colors.scheme[color as keyof typeof colors.scheme]?.[mappedIntensity];
    if (colorClass) {
      return colorClass;
    }
    // Fallback to neutral dark
    return colors.scheme.neutral['800'];
  };
  
  // Get background style using shared gradient utilities
  const getBackgroundStyle = () => {
    if (background?.type === 'gradient') {
      // Handle schema-compliant format: background.gradient object with fromColor/toColor
      if (background.gradient && typeof background.gradient === 'object' && background.gradient.fromColor) {
        return createGradientStyle({
          type: 'linear',
          direction: (background.gradient.direction && background.gradient.direction in gradient.direction) 
            ? background.gradient.direction as keyof typeof gradient.direction 
            : 'to-r',
          fromColor: background.gradient.fromColor,
          toColor: background.gradient.toColor
        });
      }
      
      // Handle AI-generated format: background.gradient with preset name (string)
      if (background.gradient && typeof background.gradient === 'string' && background.gradient in gradient.presets) {
        return createGradientStyle({
          type: 'linear',
          preset: background.gradient as keyof typeof gradient.presets
        });
      }
    }
    return {};
  };
  
  // Render background media
  const renderBackgroundMedia = () => {
    if (background?.type === 'video' && background.video?.url) {
      return (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={background.video.url}
          poster={background.video.poster}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          data-testid="hero-background-video"
        />
      );
    }
    
    if (background?.type === 'image' && background.image?.url) {
      const position = background.image.position ? image.position[background.image.position as keyof typeof image.position] : undefined;
      const size = background.image.size ? image.size[background.image.size as keyof typeof image.size] : undefined;
      
      return (
        <img
          className={`absolute inset-0 w-full h-full ${size} ${position}`}
          src={background.image.url}
          alt=""
          aria-hidden="true"
        />
      );
    }
    
    return null;
  };
  
  // Render overlay using token system
  const renderOverlay = () => {
    if (!background?.overlay?.enabled || (background.type !== 'image' && background.type !== 'video')) {
      return null;
    }
    
    const overlayColor = background.overlay.color;
    const opacity = background.overlay.opacity;
    const blur = background.overlay.blur !== false;
    
    // Use token system for overlay colors
    const getOverlayColor = () => {
      switch (overlayColor) {
        case 'black':
          return `bg-black/${opacity}`;
        case 'white':
          return `bg-white/${opacity}`;
        case 'neutral':
          return colors.scheme.neutral['900'] + `/${opacity}`;
        case 'primary':
          return colors.scheme.blue['900'] + `/${opacity}`;
        default:
          return `bg-black/${opacity}`;
      }
    };
    
    return (
      <div
        className={clsx(
          'absolute inset-0',
          getOverlayColor(),
          blur && 'backdrop-blur-sm'
        )}
        aria-hidden="true"
      />
    );
  };
  
  // Use token system for text alignment
  const getTextAlignClass = () => textAlignment ? alignment.text[textAlignment as keyof typeof alignment.text] : undefined;
  
  // Get text color using token system
  const getTextColorClass = (color?: string) => {
    // First check if it's a semantic color from typography.color
    if (color && color in typography.color) {
      return typography.color[color as keyof typeof typography.color];
    }
    
    // If no color or not a semantic color, use default based on background
    const backgroundType = background?.type;
    const backgroundColorIntensity = background?.colorIntensity;
    
    // For dark backgrounds, use white text
    if (backgroundType === 'color' && backgroundColorIntensity === 'dark') {
      return typography.color.inverse;
    }
    if (backgroundType === 'image' || backgroundType === 'video') {
      return typography.color.inverse;
    }
    
    // For light backgrounds, use appropriate text color
    return typography.color.primary;
  };

  // Button size mapping - removed unused variable

  // Get responsive container classes
  const containerClasses = getResponsiveContainerClasses({
    fullWidth: blockSettings.blockWidth,
    contentWidth: contentWidth as "narrow" | "wide" | "full" | undefined
  });

  return (
    <section className={clsx(
      'hero-block relative',
      getBackgroundClass(),
      height && sizing.height[height as keyof typeof sizing.height],
      'flex',
      horizontalAlign && alignment.horizontal[horizontalAlign as keyof typeof alignment.horizontal],
      verticalAlign && alignment.vertical[verticalAlign as keyof typeof alignment.vertical],
      marginTop && spacing.margin.top[marginTop as keyof typeof spacing.margin.top],
      marginBottom && spacing.margin.bottom[marginBottom as keyof typeof spacing.margin.bottom],
      containerClasses
    )}
      style={getBackgroundStyle()}
    >
      {/* Background media (image/video) */}
      {renderBackgroundMedia()}
      
      {/* Overlay */}
      {renderOverlay()}
      
      {/* Content container */}
      <div className={clsx('relative z-10 w-full', containerClasses)}>
        <div className={clsx(
          'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
          topPadding && `py-${spacing.map[topPadding as keyof typeof spacing.map]}`,
          bottomPadding && `sm:py-${spacing.map[bottomPadding as keyof typeof spacing.map]}`,
          getTextAlignClass()
        )}>
          {/* Title */}
          {elements.title?.content && (
            <ElementRenderer
              element={{
                type: 'title',
                props: {
                  content: elements.title.content,
                  level: elements.title.level,
                  size: 'text-4xl md:text-6xl',
                  weight: 'font-extrabold',
                  color: getTextColorClass('white'),
                  className: 'mb-4'
                }
              }}
            />
          )}
          
          {/* Subtitle */}
          {elements.subtitle?.content && (
            <ElementRenderer
              element={{
                type: 'text',
                props: {
                  content: elements.subtitle.content,
                  size: 'text-xl md:text-2xl',
                  weight: 'font-medium',
                  color: getTextColorClass('white'),
                  className: 'mb-8'
                }
              }}
            />
          )}
          
          {/* Button */}
          {elements.button?.text && elements.button?.href && (
            <ElementRenderer
              element={{
                type: 'button',
                props: {
                  text: elements.button.text,
                  href: elements.button.href,
                  variant: elements.button.variant,
                  size: elements.button.size
                }
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
};

HeroBlock.displayName = 'HeroBlock';

export default HeroBlock; 
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
  
  // Content alignment - available for future use
  // const contentAlignment = contentSettings.contentAlignment || {};
  // const horizontalAlign = contentAlignment.horizontal;
  // const verticalAlign = contentAlignment.vertical;
  
  // Padding settings
  const contentPadding = contentSettings.padding || {};
  const topPadding = contentPadding.top;
  const bottomPadding = contentPadding.bottom;
  const leftPadding = contentPadding.left;
  const rightPadding = contentPadding.right;
  
  // Margin settings
  const marginTop = blockSettings.margin?.top;
  const marginBottom = blockSettings.margin?.bottom;
  
  // Get responsive container classes
  const containerClasses = getResponsiveContainerClasses({
    contentWidth: contentWidth as 'narrow' | 'wide' | 'full' | undefined
  });
  
  // Get background style and class
  const getBackgroundStyle = () => {
    if (background.type === 'gradient') {
      const gradientType = background.gradient || 'sunset';
      return createGradientStyle({ preset: gradientType as keyof typeof gradient.presets });
    }
    
    if (background.type === 'image' && background.image?.url) {
      return {
        backgroundImage: `url(${background.image.url})`,
        backgroundSize: image.size[background.image.size as keyof typeof image.size] || image.size.cover,
        backgroundPosition: image.position[background.image.position as keyof typeof image.position] || image.position.center,
        backgroundRepeat: 'no-repeat'
      };
    }
    
    return {};
  };

  const getBackgroundClass = () => {
    if (background.type === 'color') {
      const colorScheme = background.color || 'blue';
      const intensity = background.colorIntensity || 'medium';
      return colors.scheme[colorScheme as keyof typeof colors.scheme]?.[colors.intensity[intensity as keyof typeof colors.intensity]] || colors.scheme.blue['500'];
    }
    
    return '';
  };

  // Background overlay component
  const BackgroundOverlay = () => {
    if (!background.overlay?.enabled) return null;
    
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
    
    // For light backgrounds, use primary text
    return typography.color.primary;
  };

  // Get proper hero title size using token system
  const getHeroTitleSize = (): keyof typeof typography.size => {
    // Hero titles should be large - use 5xl for desktop, 4xl for mobile
    return '5xl';
  };

  // Get proper hero subtitle size using token system
  const getHeroSubtitleSize = (): keyof typeof typography.size => {
    // Hero subtitles should be medium-large - use xl
    return 'xl';
  };

  // Get proper spacing using token system
  const getTitleBottomMargin = (): keyof typeof spacing.margin.bottom => {
    return 'md';
  };

  const getSubtitleBottomMargin = (): keyof typeof spacing.margin.bottom => {
    return 'lg';
  };

  return (
    <section 
      className={clsx(
        'relative flex items-center justify-center',
        sizing.height[blockSettings.height as keyof typeof sizing.height] || sizing.height.screen,
        marginTop && spacing.margin.top[marginTop as keyof typeof spacing.margin.top],
        marginBottom && spacing.margin.bottom[marginBottom as keyof typeof spacing.margin.bottom],
        getBackgroundClass()
      )}
      style={getBackgroundStyle()}
    >
      {/* Background Video */}
      {background.type === 'video' && background.video?.url && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster={background.video.poster}
        >
          <source src={background.video.url} type="video/mp4" />
        </video>
      )}
      
      {/* Background Overlay */}
      <BackgroundOverlay />
      
      {/* Content */}
      <div className={clsx(
        'relative z-10 w-full max-w-4xl mx-auto',
        containerClasses,
        spacing.padding.responsive.base,
        spacing.padding.responsive.sm,
        spacing.padding.responsive.lg,
        topPadding && `pt-${spacing.map[topPadding as keyof typeof spacing.map]}`,
        bottomPadding && `pb-${spacing.map[bottomPadding as keyof typeof spacing.map]}`,
        leftPadding && `pl-${spacing.map[leftPadding as keyof typeof spacing.map]}`,
        rightPadding && `pr-${spacing.map[rightPadding as keyof typeof spacing.map]}`,
        textAlignment && alignment.text[textAlignment as keyof typeof alignment.text]
      )}>
        {/* Title */}
          {elements.title?.content && (
            <ElementRenderer
              element={{
                type: 'title',
                props: {
                  content: elements.title.content,
                  level: elements.title.level,
                  size: getHeroTitleSize(),
                  weight: 'extrabold',
                  color: getTextColorClass(),
                  align: textAlignment as keyof typeof alignment.text || 'center'
                }
              }}
              className={spacing.margin.bottom[getTitleBottomMargin()]}
            />
          )}
          
          {/* Subtitle */}
          {elements.subtitle?.content && (
            <ElementRenderer
              element={{
                type: 'text',
                props: {
                  content: elements.subtitle.content,
                  size: getHeroSubtitleSize(),
                  weight: 'medium',
                  color: getTextColorClass(),
                  align: textAlignment as keyof typeof alignment.text || 'center'
                }
              }}
              className={spacing.margin.bottom[getSubtitleBottomMargin()]}
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
                  variant: elements.button.variant || 'primary',
                  size: elements.button.size || 'lg'
                }
              }}
            />
          )}
      </div>
    </section>
  );
};

HeroBlock.displayName = 'HeroBlock';

export default HeroBlock; 
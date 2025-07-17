import React from 'react';
import { HeroProps } from './schema';
import { PropertyRenderer } from '../shared/PropertyRenderer';
import { getPropertyMappings } from '../shared/property-mappings';
import { ElementRenderer } from '../../components/ElementRenderer';
import { spacing, typography, alignment } from '../shared/tokens';

export const HeroBlock: React.FC<HeroProps> = (props) => {
  const { elements } = props;
  
  // Get dynamic property mappings for hero block
  const mappings = getPropertyMappings('hero');
  
  // Extract text alignment for elements
  const textAlignment = props.layout?.contentSettings?.textAlignment || 'center';
  
  // Get text color based on background
  const getTextColorClass = (color?: string) => {
    if (color && color in typography.color) {
      return typography.color[color as keyof typeof typography.color];
    }
    
    const backgroundType = props.background?.type;
    const backgroundColorIntensity = props.background?.colorIntensity;
    
    if (backgroundType === 'color' && backgroundColorIntensity === 'dark') {
      return typography.color.inverse;
    }
    if (backgroundType === 'image' || backgroundType === 'video') {
      return typography.color.inverse;
    }
    
    return typography.color.primary;
  };

  return (
    <PropertyRenderer blockData={props} mappings={mappings}>
      {/* Title */}
      {elements?.title?.content && (
        <ElementRenderer
          element={{
            type: 'title',
            props: {
              content: elements.title.content,
              level: elements.title.level,
              size: '5xl',
              weight: 'extrabold',
              color: getTextColorClass(),
              align: textAlignment as keyof typeof alignment.text || 'center'
            }
          }}
          className={spacing.margin.bottom.md}
        />
      )}
      
      {/* Subtitle */}
      {elements?.subtitle?.content && (
        <ElementRenderer
          element={{
            type: 'text',
            props: {
              content: elements.subtitle.content,
              size: 'xl',
              weight: 'medium',
              color: getTextColorClass(),
              align: textAlignment as keyof typeof alignment.text || 'center'
            }
          }}
          className={spacing.margin.bottom.lg}
        />
      )}
      
      {/* Button */}
      {elements?.button?.text && elements?.button?.href && (
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
    </PropertyRenderer>
  );
};

HeroBlock.displayName = 'HeroBlock';

export default HeroBlock; 
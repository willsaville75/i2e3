import React from 'react';
import { GridProps, CardProps } from './schema';
import { PropertyRenderer } from '../shared/PropertyRenderer';
import { getPropertyMappings } from '../shared/property-mappings';
import { ElementRenderer } from '../../components/ElementRenderer';
import { spacing, typography, alignment } from '../shared/tokens';

interface GridBlockProps extends GridProps {
  blockId?: string;
}

export const GridBlock: React.FC<GridBlockProps> = (props) => {
  const { elements, layout, cards = [] } = props;
  
  // Get dynamic property mappings for grid block
  const mappings = getPropertyMappings('grid');
  
  // Extract grid settings with defaults
  const gridSettings = layout?.grid || {
    columns: { desktop: 3, tablet: 2, mobile: 1 },
    gap: 'lg',
    alignItems: 'stretch'
  };
  
  // Map gap sizes to Tailwind classes
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-12'
  };
  
  // Get text alignment
  const textAlignment = layout?.contentSettings?.textAlignment || 'center';
  
  // Get text color based on background
  const getTextColorClass = (color?: string) => {
    if (color && color in typography.color) {
      return typography.color[color as keyof typeof typography.color];
    }
    return typography.color.primary;
  };

  return (
    <PropertyRenderer blockData={props} mappings={mappings}>
      <div className="w-full">
        {/* Section Title */}
        {elements?.sectionTitle?.content && (
          <ElementRenderer
            element={{
              type: 'title',
              props: {
                content: elements.sectionTitle.content,
                level: elements.sectionTitle.level || 2,
                weight: 'bold',
                color: getTextColorClass(),
                align: textAlignment as keyof typeof alignment.text || 'center'
              }
            }}
          />
        )}
        
        {/* Section Subtitle */}
        {elements?.sectionSubtitle?.content && (
          <ElementRenderer
            element={{
              type: 'text',
              props: {
                content: elements.sectionSubtitle.content,
                size: 'lg',
                color: getTextColorClass(),
                align: textAlignment as keyof typeof alignment.text || 'center',
                className: 'mt-4 mb-8'
              }
            }}
          />
        )}
        
        {/* Grid Container */}
        <div className={`
          grid
          grid-cols-${gridSettings.columns.mobile || 1}
          md:grid-cols-${gridSettings.columns.tablet || 2}
          lg:grid-cols-${gridSettings.columns.desktop || 3}
          ${gapClasses[gridSettings.gap as keyof typeof gapClasses] || gapClasses.lg}
          items-${gridSettings.alignItems || 'stretch'}
        `}>
          {cards.map((card) => (
            <CardComponent key={card.id} card={card} />
          ))}
        </div>
      </div>
    </PropertyRenderer>
  );
};

// Card component - like a mini hero block
interface CardComponentProps {
  card: CardProps;
}

function CardComponent({ card }: CardComponentProps) {
  const { elements, layout, background, appearance } = card;
  
  // Default layout values
  const cardLayout = {
    cardType: layout?.cardType || 'custom',
    padding: layout?.padding || 'md',
    alignment: layout?.alignment || 'left'
  };

  // Map padding to Tailwind classes
  const paddingClasses: Record<string, string> = {
    'none': 'p-0',
    'sm': 'p-4',
    'md': 'p-6',
    'lg': 'p-8',
    'xl': 'p-10'
  };

  // Map alignment to Tailwind classes
  const alignmentClasses: Record<string, string> = {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right'
  };

  // Build appearance classes
  const appearanceClasses: string[] = [];
  if (appearance?.shadow) {
    const shadowMap: Record<string, string> = {
      'none': '',
      'sm': 'shadow-sm',
      'md': 'shadow-md',
      'lg': 'shadow-lg',
      'xl': 'shadow-xl'
    };
    if (shadowMap[appearance.shadow]) {
      appearanceClasses.push(shadowMap[appearance.shadow]);
    }
  }
  
  if (appearance?.borderRadius) {
    const radiusMap: Record<string, string> = {
      'none': '',
      'sm': 'rounded-sm',
      'md': 'rounded-md',
      'lg': 'rounded-lg',
      'xl': 'rounded-xl',
      'full': 'rounded-full'
    };
    if (radiusMap[appearance.borderRadius]) {
      appearanceClasses.push(radiusMap[appearance.borderRadius]);
    }
  }

  if (appearance?.borderWidth && appearance.borderWidth !== 'none') {
    const borderMap: Record<string, string> = {
      'thin': 'border',
      'medium': 'border-2',
      'thick': 'border-4'
    };
    if (borderMap[appearance.borderWidth]) {
      appearanceClasses.push(borderMap[appearance.borderWidth]);
      if (appearance.borderColor) {
        appearanceClasses.push(`border-${appearance.borderColor}`);
      }
    }
  }

  // Build background styles
  let backgroundStyles: React.CSSProperties = {};
  if (background) {
    if (background.type === 'color') {
      const colorClass = `bg-${background.color}-${background.colorIntensity || '500'}`;
      appearanceClasses.push(colorClass);
    } else if (background.type === 'image' && background.image) {
      backgroundStyles = {
        backgroundImage: `url(${background.image.url})`,
        backgroundSize: background.image.size || 'cover',
        backgroundPosition: background.image.position || 'center'
      };
    }
  } else {
    appearanceClasses.push('bg-white');
  }

  const cardClasses = [
    'card',
    paddingClasses[cardLayout.padding],
    alignmentClasses[cardLayout.alignment],
    ...appearanceClasses
  ].join(' ');

  return (
    <div className={cardClasses} style={backgroundStyles}>
      {/* Card Header - Avatar, Icon, Title, Subtitle */}
      {elements && (
        (elements.icon?.name || elements.avatar?.src || elements.title?.content || elements.subtitle?.content) && (
          <div className="card-header mb-4">
            {/* Avatar or Icon */}
            {elements.avatar?.src && (
              <div className={`mb-4 ${cardLayout.alignment === 'center' ? 'mx-auto' : cardLayout.alignment === 'right' ? 'ml-auto' : ''} w-24 h-24`}>
                <ElementRenderer
                  element={{
                    type: 'image',
                    props: {
                      ...elements.avatar,
                      className: 'w-full h-full rounded-full object-cover'
                    }
                  }}
                />
              </div>
            )}
            
            {elements.icon?.name && !elements.avatar?.src && (
              <div className={`mb-4 ${cardLayout.alignment === 'center' ? 'mx-auto' : cardLayout.alignment === 'right' ? 'ml-auto' : ''} w-fit`}>
                <ElementRenderer
                  element={{
                    type: 'icon',
                    props: elements.icon
                  }}
                />
              </div>
            )}
            
            {/* Title */}
            {elements.title?.content && (
              <ElementRenderer
                element={{
                  type: 'title',
                  props: {
                    content: elements.title.content,
                    level: elements.title.level || 3,
                    weight: 'semibold',
                    align: cardLayout.alignment as keyof typeof alignment.text
                  }
                }}
                className="mb-2"
              />
            )}
            
            {/* Subtitle */}
            {elements.subtitle?.content && (
              <ElementRenderer
                element={{
                  type: 'text',
                  props: {
                    content: elements.subtitle.content,
                    color: 'secondary',
                    align: cardLayout.alignment as keyof typeof alignment.text
                  }
                }}
              />
            )}
          </div>
        )
      )}
      
      {/* Card Content - Description, Image */}
      {elements && (elements.description?.content || elements.image?.src) && (
        <div className="card-content mb-4">
          {elements.image?.src && (
            <ElementRenderer
              element={{
                type: 'image',
                props: {
                  ...elements.image,
                  className: 'w-full mb-4 rounded-md'
                }
              }}
            />
          )}
          
          {elements.description?.content && (
            <ElementRenderer
              element={{
                type: 'text',
                props: {
                  content: elements.description.content,
                  align: cardLayout.alignment as keyof typeof alignment.text
                }
              }}
            />
          )}
        </div>
      )}
      
      {/* Card Actions */}
      {elements && (elements.primaryAction?.text || elements.secondaryAction?.text) && (
        <div className={`card-actions mt-4 flex gap-4 ${
          cardLayout.alignment === 'center' ? 'justify-center' : 
          cardLayout.alignment === 'right' ? 'justify-end' : 
          'justify-start'
        }`}>
          {elements.primaryAction?.text && (
            <ElementRenderer
              element={{
                type: 'button',
                props: {
                  ...elements.primaryAction,
                  variant: elements.primaryAction.variant || 'primary',
                  size: elements.primaryAction.size || 'md'
                }
              }}
            />
          )}
          
          {elements.secondaryAction?.text && (
            <ElementRenderer
              element={{
                type: 'button',
                props: {
                  ...elements.secondaryAction,
                  variant: elements.secondaryAction.variant || 'outline',
                  size: elements.secondaryAction.size || 'md'
                }
              }}
            />
          )}
        </div>
      )}
    </div>
  );
} 
import React from 'react';
import { GridProps, CardProps } from './schema';
import { PropertyRenderer } from '../shared/PropertyRenderer';
import { getPropertyMappings } from '../shared/property-mappings';
import { ElementRenderer } from '../../components/ElementRenderer';
import { getResponsiveContainerClasses, getResponsivePaddingClasses } from '../shared/responsiveContainer';
import { alignment } from '../shared/tokens';

interface GridBlockProps extends GridProps {
  blockId?: string;
}

export function GridBlock(props: GridBlockProps) {
  const { elements, layout, cards } = props;
  
  // Get dynamic property mappings for grid block
  const mappings = getPropertyMappings('grid');
  
  // Extract grid settings with defaults
  const gridSettings = layout.grid || {
    columns: { desktop: 3, tablet: 2, mobile: 1 },
    gap: 'lg',
    alignItems: 'stretch'
  };

  // Map gap sizes to Tailwind classes
  const gapClasses: Record<string, string> = {
    'none': 'gap-0',
    'sm': 'gap-2',
    'md': 'gap-4',
    'lg': 'gap-6',
    'xl': 'gap-8',
    '2xl': 'gap-10'
  };

  // Map align items to Tailwind classes
  const alignClasses: Record<string, string> = {
    'stretch': 'items-stretch',
    'start': 'items-start',
    'center': 'items-center',
    'end': 'items-end'
  };

  // Get container classes
  const containerClasses = getResponsiveContainerClasses({
    contentWidth: layout.contentSettings?.contentWidth || 'wide',
    fullWidth: layout.blockSettings?.blockWidth || false
  });
  
  const paddingClasses = getResponsivePaddingClasses();

  return (
    <PropertyRenderer blockData={props} mappings={mappings}>
      <div className={containerClasses}>
        <div className={paddingClasses}>
          {/* Section Header */}
          {elements && (elements.sectionTitle || elements.sectionSubtitle) && (
            <div className="grid-header mb-8 md:mb-12">
              {elements.sectionTitle && (
                <ElementRenderer
                  element={{
                    type: 'title',
                    props: {
                      content: elements.sectionTitle.content,
                      level: elements.sectionTitle.level,
                      weight: 'bold',
                      align: layout.contentSettings?.textAlignment || 'center'
                    }
                  }}
                />
              )}
              {elements.sectionSubtitle && (
                <ElementRenderer
                  element={{
                    type: 'text',
                    props: {
                      content: elements.sectionSubtitle.content,
                      size: 'lg',
                      color: 'secondary',
                      align: layout.contentSettings?.textAlignment || 'center'
                    }
                  }}
                  className="mt-4"
                />
              )}
            </div>
          )}
          
          {/* Grid of Cards */}
          <div className={`grid grid-cols-${gridSettings.columns.mobile} md:grid-cols-${gridSettings.columns.tablet} lg:grid-cols-${gridSettings.columns.desktop} ${gapClasses[gridSettings.gap]} ${alignClasses[gridSettings.alignItems]}`}>
            {cards.map((card) => (
              <Card 
                key={card.id} 
                data={card}
              />
            ))}
          </div>
        </div>
      </div>
    </PropertyRenderer>
  );
}

// Card component - like a mini hero block
interface CardComponentProps {
  data: CardProps;
}

function Card({ data }: CardComponentProps) {
  const { elements, layout, background, appearance } = data;
  
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
      {/* Card Header - Avatar/Icon, Title, Subtitle */}
      {elements && (elements.icon || elements.avatar || elements.title || elements.subtitle) && (
        <div className="card-header mb-4">
          {/* Avatar or Icon */}
          {elements.avatar && (
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
          
          {elements.icon && !elements.avatar && (
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
          {elements.title && (
            <ElementRenderer
              element={{
                type: 'title',
                props: {
                  content: elements.title.content,
                  level: elements.title.level,
                  weight: 'semibold',
                  align: cardLayout.alignment as keyof typeof alignment.text
                }
              }}
              className="mb-2"
            />
          )}
          
          {/* Subtitle */}
          {elements.subtitle && (
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
      )}
      
      {/* Card Content - Description, Image */}
      {elements && (elements.description || elements.image) && (
        <div className="card-content mb-4">
          {elements.image && (
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
          
          {elements.description && (
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
      
      {/* Card Footer - Actions */}
      {elements && (elements.primaryAction || elements.secondaryAction) && (
        <div className={`card-footer mt-4 flex gap-2 ${cardLayout.alignment === 'center' ? 'justify-center' : cardLayout.alignment === 'right' ? 'justify-end' : ''}`}>
          {elements.primaryAction && (
            <ElementRenderer
              element={{
                type: 'button',
                props: elements.primaryAction
              }}
            />
          )}
          
          {elements.secondaryAction && (
            <ElementRenderer
              element={{
                type: 'button',
                props: elements.secondaryAction
              }}
            />
          )}
        </div>
      )}
    </div>
  );
} 
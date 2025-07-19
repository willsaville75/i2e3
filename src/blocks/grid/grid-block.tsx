import React from 'react';
import { GridProps, CardProps } from './schema';
import { PropertyRenderer } from '../shared/PropertyRenderer';
import { getPropertyMappings } from '../shared/property-mappings';
import { ElementRenderer } from '../../components/ElementRenderer';
import { 
  spacing, 
  typography, 
  alignment, 
  shadows, 
  borders, 
  colors,
  sizing,
  image as imageTokens,
  gradient,
  createGradientStyle,
  createTailwindGradient
} from '../shared/tokens';
import {
  getResponsiveContainerClasses,
  getResponsivePaddingClasses,
  getBlockWrapperClasses,
  getTextAlignmentClasses
} from '../shared/responsiveContainer';

interface GridBlockProps extends GridProps {
  blockId?: string;
}

export const GridBlock: React.FC<GridBlockProps> = (props) => {
  const { elements, layout, cards = [] } = props;
  
  // Debug logging
  console.log('GridBlock props:', {
    hasElements: !!elements,
    hasLayout: !!layout,
    cardsLength: cards.length,
    cards: cards,
    firstCardElements: cards[0]?.elements,
    firstCard: cards[0],
    cardStructure: cards.map(c => ({
      id: c?.id,
      hasElements: !!c?.elements,
      elementKeys: c?.elements ? Object.keys(c.elements) : []
    }))
  });
  
  // Get dynamic property mappings for grid block
  const mappings = getPropertyMappings('grid');
  
  // Extract grid settings with defaults
  const gridSettings = layout?.grid || {
    columns: { desktop: 3, tablet: 2, mobile: 1 },
    gap: 'lg',
    alignItems: 'stretch'
  };
  
  // Map gap sizes using spacing tokens
  const gapClasses = {
    none: 'gap-0',
    sm: `gap-${spacing.map.sm}`,
    md: `gap-${spacing.map.md}`,
    lg: `gap-${spacing.map.lg}`,
    xl: `gap-${spacing.map.xl}`,
    '2xl': `gap-${spacing.map['2xl']}`
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
      <div className={getBlockWrapperClasses({ fullWidth: layout?.blockSettings?.blockWidth })}>
        <div className={getResponsiveContainerClasses({ 
          fullWidth: layout?.blockSettings?.blockWidth,
          contentWidth: layout?.contentSettings?.contentWidth || 'wide',
          padding: false
        })}>
          <div className={getResponsivePaddingClasses()}>
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
                    className: `${spacing.margin.top.sm} ${spacing.margin.bottom.lg}`
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
  
  // Debug logging
  console.log('CardComponent rendering:', {
    cardId: card.id,
    card: card,
    hasElements: !!elements,
    elementKeys: elements ? Object.keys(elements) : [],
    titleContent: elements?.title?.content,
    subtitleContent: elements?.subtitle?.content,
    descriptionContent: elements?.description?.content
  });
  
  // Default layout values
  const cardLayout = {
    cardType: layout?.cardType || 'custom',
    padding: layout?.padding || 'md',
    alignment: layout?.alignment || 'left'
  };

  // Map padding using spacing tokens
  const paddingClasses: Record<string, string> = {
    'none': 'p-0',
    'sm': `p-${spacing.map.sm}`,
    'md': `p-${spacing.map.md}`,
    'lg': `p-${spacing.map.lg}`,
    'xl': `p-${spacing.map.xl}`
  };

  // Use text alignment from responsiveContainer
  const textAlignmentClass = getTextAlignmentClasses(cardLayout.alignment);

  // Build appearance classes using tokens
  const appearanceClasses: string[] = [];
  
  // Use shadow tokens
  if (appearance?.shadow && appearance.shadow in shadows) {
    appearanceClasses.push(shadows[appearance.shadow as keyof typeof shadows]);
  }
  
  // Use border radius tokens
  if (appearance?.borderRadius && appearance.borderRadius in borders.radius) {
    appearanceClasses.push(borders.radius[appearance.borderRadius as keyof typeof borders.radius]);
  }

  // Handle borders with tokens
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

  // Build background styles using tokens
  let backgroundStyles: React.CSSProperties = {};
  let backgroundClasses: string[] = [];
  
  if (background) {
    if (background.type === 'color' && background.color) {
      // Use color tokens
      const colorScheme = background.color as keyof typeof colors.scheme;
      const intensity = background.colorIntensity || 'medium';
      const intensityValue = colors.intensity[intensity as keyof typeof colors.intensity] || '500';
      
      if (colorScheme in colors.scheme) {
        const colorMap = colors.scheme[colorScheme];
        const colorClass = colorMap[intensityValue as keyof typeof colorMap];
        if (colorClass) {
          backgroundClasses.push(colorClass);
        }
      }
    } else if (background.type === 'gradient' && background.gradient) {
      // Use gradient tokens
      if (background.gradient in gradient.presets) {
        backgroundStyles = createGradientStyle({
          preset: background.gradient as keyof typeof gradient.presets
        });
      }
    } else if (background.type === 'image' && background.image) {
      // Use image tokens for positioning
      backgroundStyles = {
        backgroundImage: `url(${background.image.url})`,
        backgroundSize: background.image.size || 'cover',
        backgroundPosition: background.image.position || 'center'
      };
    }
  } else {
    backgroundClasses.push(colors.scheme.white['50']);
  }

  const cardClasses = [
    'card',
    paddingClasses[cardLayout.padding],
    textAlignmentClass,
    ...appearanceClasses,
    ...backgroundClasses
  ].join(' ');

  return (
    <div className={cardClasses} style={backgroundStyles}>
      {/* Avatar */}
      {elements?.avatar?.src && (
        <div className={`flex justify-center ${spacing.margin.bottom.md}`}>
          <img 
            src={elements.avatar.src} 
            alt={elements.avatar.alt || ''} 
            className={`w-${sizing.general.lg} h-${sizing.general.lg} ${borders.radius.full} object-cover`}
          />
        </div>
      )}
      
      {/* Title */}
      {elements?.title?.content && (
        <h3 className={`${typography.size.lg} ${typography.weight.semibold} ${spacing.margin.bottom.sm}`}>
          {elements.title.content}
        </h3>
      )}
      
      {/* Subtitle */}
      {elements?.subtitle?.content && (
        <p className={`${typography.color.secondary} ${spacing.margin.bottom.md}`}>
          {elements.subtitle.content}
        </p>
      )}
      
      {/* Description */}
      {elements?.description?.content && (
        <p className={typography.color.primary}>
          {elements.description.content}
        </p>
      )}
    </div>
  );
} 
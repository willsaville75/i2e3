import { createBlockSchema, schemaProperties, LayoutSchema, BackgroundSchema } from '../shared/schema-types';

// Card Props interface
export interface CardProps {
  id: string;
  elements?: {
    icon?: {
      name: string;
      size?: 'sm' | 'md' | 'lg' | 'xl';
    };
    avatar?: {
      src: string;
      alt: string;
    };
    title?: {
      content: string;
      level: 1 | 2 | 3 | 4 | 5 | 6;
    };
    subtitle?: {
      content: string;
    };
    description?: {
      content: string;
    };
    image?: {
      src: string;
      alt: string;
    };
    primaryAction?: {
      text: string;
      href: string;
      variant?: 'primary' | 'secondary' | 'outline';
      size?: 'sm' | 'md' | 'lg';
    };
    secondaryAction?: {
      text: string;
      href: string;
      variant?: 'primary' | 'secondary' | 'outline';
      size?: 'sm' | 'md' | 'lg';
    };
  };
  layout?: {
    cardType?: 'profile' | 'stat' | 'content' | 'icon' | 'custom';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    alignment?: 'left' | 'center' | 'right';
  };
  background?: BackgroundSchema;
  appearance?: {
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    borderWidth?: 'none' | 'thin' | 'medium' | 'thick';
    borderColor?: string;
  };
}

// Grid Props interface
export interface GridProps {
  elements?: {
    sectionTitle?: {
      content: string;
      level: 1 | 2 | 3 | 4 | 5 | 6;
    };
    sectionSubtitle?: {
      content: string;
    };
  };
  layout: LayoutSchema & {
    grid?: {
      columns: {
        desktop: number;
        tablet: number;
        mobile: number;
      };
      gap: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
      alignItems: 'stretch' | 'start' | 'center' | 'end';
    };
  };
  cards: CardProps[];
  background: BackgroundSchema;
}

// Create the grid schema
export const gridSchema = createBlockSchema({
  id: 'grid-block',
  title: 'Grid Block',
  description: 'A flexible grid layout for cards and content',
  
  properties: {
    elements: schemaProperties.object({
      sectionTitle: schemaProperties.object({
        content: schemaProperties.string({
          title: 'Section Title',
          default: 'Our Team'
        }),
        level: schemaProperties.number({
          title: 'Heading Level',
          enum: [1, 2, 3, 4, 5, 6],
          default: 2
        })
      }, {
        title: 'Section Title',
        description: 'Main heading for the grid section'
      }),
      
      sectionSubtitle: schemaProperties.object({
        content: schemaProperties.string({
          title: 'Section Subtitle',
          default: 'Meet the people behind our success'
        })
      }, {
        title: 'Section Subtitle',
        description: 'Supporting text for the section'
      })
    }, {
      title: 'Section Header',
      description: 'Optional header elements for the grid'
    }),
    
    layout: schemaProperties.object({
      ...schemaProperties.layout().properties,
      grid: schemaProperties.object({
        columns: schemaProperties.object({
          desktop: schemaProperties.number({
            title: 'Desktop Columns',
            minimum: 1,
            maximum: 6,
            default: 3
          }),
          tablet: schemaProperties.number({
            title: 'Tablet Columns',
            minimum: 1,
            maximum: 4,
            default: 2
          }),
          mobile: schemaProperties.number({
            title: 'Mobile Columns',
            minimum: 1,
            maximum: 2,
            default: 1
          })
        }, {
          title: 'Column Configuration',
          description: 'Number of columns per breakpoint'
        }),
        gap: schemaProperties.string({
          title: 'Grid Gap',
          enum: ['none', 'sm', 'md', 'lg', 'xl', '2xl'],
          default: 'lg'
        }),
        alignItems: schemaProperties.string({
          title: 'Align Items',
          enum: ['stretch', 'start', 'center', 'end'],
          default: 'stretch'
        })
      }, {
        title: 'Grid Settings',
        description: 'Configure grid layout'
      })
    }, {
      title: 'Layout',
      description: 'Grid and container layout settings'
    }),
    
    cards: schemaProperties.array(
      schemaProperties.object({
        id: schemaProperties.string({
          title: 'Card ID',
          default: 'card-1'
        }),
        elements: schemaProperties.object({
          icon: schemaProperties.object({
            name: schemaProperties.string({
              title: 'Icon Name',
              default: 'UserIcon'
            }),
            size: schemaProperties.string({
              title: 'Icon Size',
              enum: ['sm', 'md', 'lg', 'xl'],
              default: 'md'
            })
          }),
          avatar: schemaProperties.object({
            src: schemaProperties.string({
              title: 'Avatar Image URL',
              default: 'https://via.placeholder.com/150'
            }),
            alt: schemaProperties.string({
              title: 'Avatar Alt Text',
              default: 'Team member'
            })
          }),
          title: schemaProperties.object({
            content: schemaProperties.string({
              title: 'Title',
              default: 'Card Title'
            }),
            level: schemaProperties.number({
              title: 'Heading Level',
              enum: [1, 2, 3, 4, 5, 6],
              default: 3
            })
          }),
          subtitle: schemaProperties.object({
            content: schemaProperties.string({
              title: 'Subtitle',
              default: 'Card subtitle'
            })
          }),
          description: schemaProperties.object({
            content: schemaProperties.string({
              title: 'Description',
              default: 'Card description text'
            })
          }),
          image: schemaProperties.object({
            src: schemaProperties.string({
              title: 'Image URL',
              default: 'https://via.placeholder.com/300x200'
            }),
            alt: schemaProperties.string({
              title: 'Image Alt Text',
              default: 'Card image'
            })
          }),
          primaryAction: schemaProperties.object({
            text: schemaProperties.string({
              title: 'Button Text',
              default: 'Learn More'
            }),
            href: schemaProperties.string({
              title: 'Button Link',
              default: '#'
            }),
            variant: schemaProperties.string({
              title: 'Button Variant',
              enum: ['primary', 'secondary', 'outline'],
              default: 'primary'
            }),
            size: schemaProperties.string({
              title: 'Button Size',
              enum: ['sm', 'md', 'lg'],
              default: 'md'
            })
          }),
          secondaryAction: schemaProperties.object({
            text: schemaProperties.string({
              title: 'Button Text',
              default: 'Cancel'
            }),
            href: schemaProperties.string({
              title: 'Button Link',
              default: '#'
            }),
            variant: schemaProperties.string({
              title: 'Button Variant',
              enum: ['primary', 'secondary', 'outline'],
              default: 'outline'
            }),
            size: schemaProperties.string({
              title: 'Button Size',
              enum: ['sm', 'md', 'lg'],
              default: 'md'
            })
          })
        }),
        layout: schemaProperties.object({
          cardType: schemaProperties.string({
            title: 'Card Type',
            enum: ['profile', 'stat', 'content', 'icon', 'custom'],
            default: 'custom'
          }),
          padding: schemaProperties.string({
            title: 'Padding',
            enum: ['none', 'sm', 'md', 'lg', 'xl'],
            default: 'md'
          }),
          alignment: schemaProperties.string({
            title: 'Alignment',
            enum: ['left', 'center', 'right'],
            default: 'left'
          })
        }),
        background: schemaProperties.background(),
        appearance: schemaProperties.object({
          shadow: schemaProperties.string({
            title: 'Shadow',
            enum: ['none', 'sm', 'md', 'lg', 'xl'],
            default: 'md'
          }),
          borderRadius: schemaProperties.string({
            title: 'Border Radius',
            enum: ['none', 'sm', 'md', 'lg', 'xl', 'full'],
            default: 'lg'
          }),
          borderWidth: schemaProperties.string({
            title: 'Border Width',
            enum: ['none', 'thin', 'medium', 'thick'],
            default: 'none'
          }),
          borderColor: schemaProperties.string({
            title: 'Border Color',
            default: 'gray-300'
          })
        })
      }),
      {
        title: 'Cards',
        description: 'Grid items'
      }
    ),
    
    background: schemaProperties.background()
  }
});

// Default data
export const gridDefaultData: GridProps = {
  elements: {
    sectionTitle: {
      content: 'Our Team',
      level: 2,
    },
    sectionSubtitle: {
      content: 'Meet the people behind our success',
    },
  },
  layout: {
    blockSettings: {
      height: 'auto',
      margin: { top: 'xl', bottom: 'xl' },
    },
    contentSettings: {
      contentAlignment: { horizontal: 'center', vertical: 'top' },
      textAlignment: 'center',
      contentWidth: 'wide',
      padding: { top: 'xl', bottom: 'xl', left: 'lg', right: 'lg' },
    },
    grid: {
      columns: { desktop: 3, tablet: 2, mobile: 1 },
      gap: 'lg',
      alignItems: 'stretch',
    },
  },
  cards: [
    {
      id: 'card-1',
      elements: {
        avatar: {
          src: 'https://via.placeholder.com/150',
          alt: 'Team member',
        },
        title: {
          content: 'John Doe',
          level: 3,
        },
        subtitle: {
          content: 'CEO & Founder',
        },
        description: {
          content: 'Leading our vision with over 15 years of industry experience.',
        },
      },
      layout: {
        cardType: 'profile',
        padding: 'lg',
        alignment: 'center',
      },
      appearance: {
        shadow: 'md',
        borderRadius: 'lg',
      },
    },
    {
      id: 'card-2',
      elements: {
        avatar: {
          src: 'https://via.placeholder.com/150',
          alt: 'Team member',
        },
        title: {
          content: 'Jane Smith',
          level: 3,
        },
        subtitle: {
          content: 'CTO',
        },
        description: {
          content: 'Driving innovation and technical excellence across all projects.',
        },
      },
      layout: {
        cardType: 'profile',
        padding: 'lg',
        alignment: 'center',
      },
      appearance: {
        shadow: 'md',
        borderRadius: 'lg',
      },
    },
    {
      id: 'card-3',
      elements: {
        avatar: {
          src: 'https://via.placeholder.com/150',
          alt: 'Team member',
        },
        title: {
          content: 'Mike Johnson',
          level: 3,
        },
        subtitle: {
          content: 'Head of Design',
        },
        description: {
          content: 'Creating beautiful and intuitive experiences for our users.',
        },
      },
      layout: {
        cardType: 'profile',
        padding: 'lg',
        alignment: 'center',
      },
      appearance: {
        shadow: 'md',
        borderRadius: 'lg',
      },
    },
  ],
  background: {
    type: 'color',
    color: 'gray',
    colorIntensity: 'light',
  },
}; 
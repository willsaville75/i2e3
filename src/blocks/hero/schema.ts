import { createBlockSchema, schemaProperties, LayoutSchema, BackgroundSchema } from '../shared/schema-types'

// Hero Props interface
export interface HeroProps {
  elements: {
    title: {
      content: string;
      level: 1 | 2 | 3 | 4 | 5 | 6;
    };
    subtitle: {
      content: string;
    };
    button?: {
      text: string;
      href: string;
      variant: 'primary' | 'secondary' | 'outline';
      size: 'sm' | 'md' | 'lg';
    };
  };
  layout: LayoutSchema;
  background: BackgroundSchema;
}

// Create the schema using TypeScript
export const heroSchema = createBlockSchema({
  id: 'hero-block',
  title: 'Hero Block',
  description: 'A hero section with title, subtitle, and call-to-action',
  
  properties: {
    elements: schemaProperties.object({
      title: schemaProperties.object({
        content: schemaProperties.string({
          title: 'Title Content',
          default: 'Welcome to Our Platform'
        }),
        level: schemaProperties.number({
          title: 'Heading Level',
          description: 'HTML heading level (1-6)',
          enum: [1, 2, 3, 4, 5, 6],
          default: 1
        })
      }, {
        title: 'Title',
        description: 'Main hero heading'
      }),
      
      subtitle: schemaProperties.object({
        content: schemaProperties.string({
          title: 'Subtitle Content',
          default: 'Build something amazing today'
        })
      }, {
        title: 'Subtitle',
        description: 'Supporting text below title'
      }),
      
      button: schemaProperties.object({
        text: schemaProperties.string({
          title: 'Button Text',
          default: 'Get Started'
        }),
        href: schemaProperties.string({
          title: 'Button Link',
          default: '/get-started'
        }),
        variant: schemaProperties.string({
          title: 'Button Style',
          enum: ['primary', 'secondary', 'outline'],
          default: 'primary'
        }),
        size: schemaProperties.string({
          title: 'Button Size',
          enum: ['sm', 'md', 'lg'],
          default: 'lg'
        })
      }, {
        title: 'Call to Action Button',
        description: 'Optional CTA button'
      })
    }, {
      title: 'Content Elements',
      description: 'Hero content configuration'
    }),
    
    layout: schemaProperties.layout(),
    background: schemaProperties.background()
  },
  
  required: ['elements']
})

// Default data for the hero block - pure data only
export const heroDefaultData: HeroProps = {
  elements: {
    title: {
      content: "",
      level: 1
    },
    subtitle: {
      content: ""
    },
    button: {
      text: "",
      href: "#",
      variant: "primary",
      size: "lg"
    }
  },
  layout: {
    blockSettings: {
      height: "screen",
      margin: { top: "lg", bottom: "lg" }
    },
    contentSettings: {
      contentAlignment: { horizontal: "center", vertical: "center" },
      textAlignment: "center",
      contentWidth: "wide",
      padding: { top: "2xl", bottom: "2xl" }
    }
  },
  background: {
    type: "color",
    color: "blue",
    colorIntensity: "medium"
  }
}; 
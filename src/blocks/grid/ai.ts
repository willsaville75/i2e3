// AI hints for grid block generation
export const gridAIHints = {
  description: "A grid block displays multiple items in a responsive grid layout. Perfect for showcasing team members, features, statistics, portfolio items, or any collection of related content.",
  usageContext: {
    purpose: "Display collections of similar items in an organized, scannable format",
    placement: "Any section of a page where multiple items need equal visual weight",
    goals: [
      "Showcase multiple items efficiently",
      "Create visual hierarchy through grouping",
      "Enable easy comparison between items"
    ]
  },
  contentPatterns: {
    team: {
      cardType: 'profile',
      suggestedCards: 3,
      maxCards: 6,
      elements: ['avatar', 'title', 'subtitle', 'description'],
      exampleContent: {
        title: 'Team member name',
        subtitle: 'Job title or role',
        description: 'Brief bio or expertise'
      }
    },
    features: {
      cardType: 'icon',
      suggestedCards: 4,
      maxCards: 6,
      elements: ['icon', 'title', 'description'],
      exampleContent: {
        title: 'Feature name',
        description: 'Benefit or explanation'
      }
    },
    stats: {
      cardType: 'stat',
      suggestedCards: 3,
      maxCards: 4,
      elements: ['icon', 'title', 'subtitle'],
      exampleContent: {
        title: 'Number or metric',
        subtitle: 'What it represents'
      }
    },
    services: {
      cardType: 'content',
      suggestedCards: 3,
      maxCards: 6,
      elements: ['icon', 'title', 'description', 'primaryAction'],
      exampleContent: {
        title: 'Service name',
        description: 'Service details',
        primaryAction: { text: 'Learn More' }
      }
    },
    portfolio: {
      cardType: 'content',
      suggestedCards: 3,
      maxCards: 9,
      elements: ['image', 'title', 'subtitle', 'primaryAction'],
      exampleContent: {
        title: 'Project name',
        subtitle: 'Category or type',
        primaryAction: { text: 'View Project' }
      }
    }
  },
  layoutGuidance: {
    columns: {
      desktop: {
        min: 2,
        max: 4,
        recommended: 3
      },
      tablet: {
        min: 1,
        max: 3,
        recommended: 2
      },
      mobile: {
        min: 1,
        max: 2,
        recommended: 1
      }
    },
    gap: {
      tight: 'sm',
      normal: 'md',
      comfortable: 'lg',
      spacious: 'xl'
    }
  },
  contentGuidelines: {
    consistency: "Keep card content structure consistent within a grid",
    brevity: "Use concise text - cards should be scannable",
    balance: "Aim for similar content length across cards to maintain visual balance",
    hierarchy: "Use clear visual hierarchy within each card"
  }
}; 
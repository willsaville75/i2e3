// Hero AI metadata for prompt generation
export const heroAIMetadata = {
  description: `A hero section is the prominent area at the top of a webpage that captures visitor attention and communicates the main value proposition. It typically includes a compelling headline, supporting text, and a call-to-action button.`,
  
  usageContext: {
    purpose: 'First impression and conversion optimization',
    placement: 'Top of landing pages, homepages, or product pages',
    goals: ['Capture attention', 'Communicate value proposition', 'Drive conversions']
  },
  
  contentHints: {
    headline: {
      characteristics: ['Clear', 'Benefit-focused', 'Emotional', 'Concise'],
      lengthGuideline: '3-8 words for maximum impact'
    },
    
    subheadline: {
      characteristics: ['Explanatory', 'Supportive', 'Detailed', 'Persuasive'],
      lengthGuideline: '10-20 words to provide context without overwhelming'
    },
    
    ctaButton: {
      characteristics: ['Action-oriented', 'Urgent', 'Clear', 'Benefit-focused'],
      lengthGuideline: '1-3 words for buttons'
    }
  },
  
  layoutGuidance: {
    structure: {
      recommended: 'Centered vertical layout with clear hierarchy',
      alternatives: ['Left-aligned with right image', 'Split-screen layout']
    },
    
    typography: {
      hierarchy: {
        headline: 'Largest, boldest text (h1, 2xl-6xl)',
        subheadline: 'Medium size, regular weight (p, lg-xl)',
        button: 'Medium size, semi-bold (lg-xl)'
      }
    }
  }
};

export type HeroAIMetadata = typeof heroAIMetadata 
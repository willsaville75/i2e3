// Hero block metadata
export const heroMetadata = {
  name: "Hero Section",
  description: "Large banner section with title, subtitle, and call-to-action button",
  category: "marketing",
  icon: "layout",
  tags: ["hero", "banner", "landing", "marketing", "cta"],
  version: "1.0.0",
  author: "I2E System",
  isAIGenerated: false,
  hints: {
    usage: "Best used as the first section of a landing page or homepage",
    performance: "Optimize images for web and consider lazy loading for background videos",
    accessibility: "Ensure sufficient color contrast and provide alt text for background images"
  }
};

// AI hints for hero block generation
export const heroAIHints = {
  description: "A hero section is the prominent area at the top of a webpage that captures visitor attention and communicates the main value proposition. It typically includes a compelling headline, supporting text, and a call-to-action button.",
  usageContext: {
    purpose: "First impression and conversion optimization",
    placement: "Top of landing pages, homepages, or product pages",
    goals: [
      "Capture attention",
      "Communicate value proposition", 
      "Drive conversions"
    ]
  },
  contentHints: {
    headline: {
      characteristics: [
        "Clear",
        "Benefit-focused",
        "Emotional",
        "Concise"
      ],
      examples: [
        "Transform Your Workflow in Minutes",
        "The Future of [Industry] is Here",
        "Unlock Your Team's Potential"
      ],
      lengthGuideline: "3-8 words for maximum impact"
    },
    subheadline: {
      characteristics: [
        "Explanatory",
        "Supportive",
        "Detailed",
        "Persuasive"
      ],
      examples: [
        "Join thousands of satisfied customers who have revolutionized their business",
        "Discover the features that will transform your daily operations"
      ],
      lengthGuideline: "10-20 words to provide context without overwhelming"
    },
    ctaButton: {
      characteristics: [
        "Action-oriented",
        "Urgent",
        "Clear",
        "Benefit-focused"
      ],
      examples: [
        "Start Free Trial",
        "Get Started Today",
        "Download Now"
      ],
      lengthGuideline: "1-3 words for buttons"
    }
  },
  layoutGuidance: {
    structure: {
      recommended: "Centered vertical layout with clear hierarchy",
      alternatives: [
        "Left-aligned with right image",
        "Split-screen layout"
      ]
    },
    typography: {
      hierarchy: {
        headline: "Largest, boldest text (h1, 2xl-6xl)",
        subheadline: "Medium size, regular weight (p, lg-xl)",
        button: "Medium size, semi-bold (lg-xl)"
      }
    }
  }
}; 
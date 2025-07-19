// AI hints for grid block generation
export const gridAIHints = {
  contentPatterns: [
    'For team grids, use profile cards with name in title.content, role in subtitle.content, and bio in description.content',
    'Only include elements that have actual content - do not include empty objects',
    'For primaryAction, include both text and href properties',
    'For avatar images, use src and alt properties (NOT url)'
  ],
  structureGuidelines: [
    'Default to 3 columns on desktop, 2 on tablet, 1 on mobile',
    'Use consistent card types within a grid',
    'ALWAYS include all top-level properties: elements, layout, cards, background'
  ],
  propertyNotes: {
    cards: 'Array of card objects. Each element should have content, not empty objects.',
    important: 'Do NOT include empty objects like "icon": {} or "avatar": {}. Only include elements with actual values.',
    avatar: 'Use { src: "image-url", alt: "description" } NOT { url: "..." }',
    structure: 'Response must have: elements (with sectionTitle), layout (with grid settings), cards (array), background'
  },
  minimalExample: `{
    "elements": {
      "sectionTitle": {
        "content": "Our Team",
        "level": 2
      },
      "sectionSubtitle": {
        "content": "Meet the people behind our success"
      }
    },
    "layout": {
      "blockSettings": {
        "blockWidth": false,
        "height": "auto",
        "margin": { "top": "lg", "bottom": "lg" }
      },
      "contentSettings": {
        "textAlignment": "center",
        "contentWidth": "wide",
        "padding": { "top": "lg", "bottom": "lg", "left": "md", "right": "md" }
      },
      "grid": {
        "columns": { "desktop": 3, "tablet": 2, "mobile": 1 },
        "gap": "lg",
        "alignItems": "stretch"
      }
    },
    "cards": [
      {
        "id": "card-1",
        "elements": {
          "avatar": {
            "src": "https://example.com/john.jpg",
            "alt": "John Doe"
          },
          "title": {
            "content": "John Doe"
          },
          "subtitle": {
            "content": "CEO"
          },
          "description": {
            "content": "Leading our vision with 10+ years experience"
          },
          "primaryAction": {
            "text": "View Profile",
            "href": "#"
          }
        },
        "layout": {
          "cardType": "profile",
          "padding": "md",
          "alignment": "center"
        }
      }
    ],
    "background": {
      "type": "color",
      "color": "white",
      "colorIntensity": "light"
    }
  }`
}; 
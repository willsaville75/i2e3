// AI hints for grid block generation
export const gridAIHints = {
  contentPatterns: [
    'For team grids, map: name→title.content, role→subtitle.content, bio→description.content',
    'NEVER use simplified structures like {name, position, image, bio}',
    'ALWAYS use the nested structure: {id, elements: {title: {content}, subtitle: {content}, ...}}',
    'For avatar images, use src and alt properties (NOT url or image)'
  ],
  structureGuidelines: [
    'Default to 3 columns on desktop, 2 on tablet, 1 on mobile',
    'Each card MUST have: id, elements (object), layout (object)',
    'ALWAYS include all top-level properties: elements, layout, cards, background'
  ],
  propertyNotes: {
    cards: 'Array of card objects with EXACT structure: {id, elements, layout, background, appearance}',
    important: 'Do NOT use simplified structures. Each card needs nested objects.',
    critical: 'NEVER use {name, position, image} - ALWAYS use {elements: {title: {content}, subtitle: {content}}}',
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
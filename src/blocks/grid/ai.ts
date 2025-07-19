// AI hints for grid block generation
export const gridAIHints = {
  contentPatterns: [
    'For team grids, use profile cards with avatar, name (title), position (subtitle), and bio (description)',
    'Keep it simple - only include the fields that make sense for the content'
  ],
  structureGuidelines: [
    'Default to 3 columns on desktop, 2 on tablet, 1 on mobile',
    'Use consistent card types within a grid'
  ],
  propertyNotes: {
    cards: 'Array of card objects. Start simple with just id and basic elements.',
    example: 'For a team grid, each card needs: id, elements.title.content (name), elements.subtitle.content (role), elements.description.content (bio)'
  },
  minimalExample: `{
    "elements": {
      "sectionTitle": {
        "content": "Our Team"
      }
    },
    "cards": [
      {
        "id": "card-1",
        "elements": {
          "title": {
            "content": "John Doe"
          },
          "subtitle": {
            "content": "CEO"
          },
          "description": {
            "content": "Leading our vision"
          }
        }
      }
    ]
  }`
}; 
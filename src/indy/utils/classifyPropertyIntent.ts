/**
 * Property Intent Classification System
 * 
 * This system classifies user intents into specific property changes
 * Enables Indy to understand requests like "make this full width" or "add more padding"
 */

export interface PropertyIntent {
  type: 'layout' | 'background' | 'content' | 'spacing' | 'alignment';
  action: 'set' | 'increase' | 'decrease' | 'toggle' | 'reset';
  property: string;                    // Property path: "layout.blockSettings.blockWidth"
  value?: any;                        // Target value
  modifier?: 'slight' | 'moderate' | 'significant';  // For increase/decrease actions
  confidence: number;                 // 0-1 confidence score
}

/**
 * Layout Intent Patterns
 */
const LAYOUT_PATTERNS = [
  // Full Width / Block Width
  {
    patterns: [
      /full.?width/i,
      /edge.?to.?edge/i,
      /stretch.?across/i,
      /no.?max.?width/i,
      /remove.?width.?limit/i,
      /expand.?width/i
    ],
    intent: {
      type: 'layout' as const,
      action: 'set' as const,
      property: 'layout.blockSettings.blockWidth',
      value: true
    }
  },
  {
    patterns: [
      /narrow.?width/i,
      /constrain.?width/i,
      /contained.?width/i,
      /normal.?width/i,
      /limit.?width/i
    ],
    intent: {
      type: 'layout' as const,
      action: 'set' as const,
      property: 'layout.blockSettings.blockWidth',
      value: false
    }
  },
  
  // Content Width
  {
    patterns: [
      /content.?width.?narrow/i,
      /narrow.?content/i,
      /tight.?content/i
    ],
    intent: {
      type: 'layout' as const,
      action: 'set' as const,
      property: 'layout.contentSettings.contentWidth',
      value: 'narrow'
    }
  },
  {
    patterns: [
      /content.?width.?wide/i,
      /wide.?content/i,
      /broader.?content/i
    ],
    intent: {
      type: 'layout' as const,
      action: 'set' as const,
      property: 'layout.contentSettings.contentWidth',
      value: 'wide'
    }
  },
  {
    patterns: [
      /content.?width.?full/i,
      /full.?content/i,
      /content.?edge.?to.?edge/i
    ],
    intent: {
      type: 'layout' as const,
      action: 'set' as const,
      property: 'layout.contentSettings.contentWidth',
      value: 'full'
    }
  },
  
  // Height
  {
    patterns: [
      /full.?height/i,
      /screen.?height/i,
      /viewport.?height/i,
      /tall.?section/i
    ],
    intent: {
      type: 'layout' as const,
      action: 'set' as const,
      property: 'layout.blockSettings.height',
      value: 'screen'
    }
  },
  {
    patterns: [
      /half.?height/i,
      /medium.?height/i,
      /shorter.?section/i
    ],
    intent: {
      type: 'layout' as const,
      action: 'set' as const,
      property: 'layout.blockSettings.height',
      value: 'half'
    }
  },
  {
    patterns: [
      /quarter.?height/i,
      /short.?section/i,
      /compact.?height/i
    ],
    intent: {
      type: 'layout' as const,
      action: 'set' as const,
      property: 'layout.blockSettings.height',
      value: 'quarter'
    }
  },
  {
    patterns: [
      /auto.?height/i,
      /content.?height/i,
      /natural.?height/i
    ],
    intent: {
      type: 'layout' as const,
      action: 'set' as const,
      property: 'layout.blockSettings.height',
      value: 'auto'
    }
  }
];

/**
 * Spacing Intent Patterns
 */
const SPACING_PATTERNS = [
  // Padding
  {
    patterns: [
      /more.?padding/i,
      /increase.?padding/i,
      /add.?padding/i,
      /bigger.?padding/i
    ],
    intent: {
      type: 'spacing' as const,
      action: 'increase' as const,
      property: 'layout.contentSettings.padding'
    }
  },
  {
    patterns: [
      /less.?padding/i,
      /reduce.?padding/i,
      /decrease.?padding/i,
      /smaller.?padding/i
    ],
    intent: {
      type: 'spacing' as const,
      action: 'decrease' as const,
      property: 'layout.contentSettings.padding'
    }
  },
  {
    patterns: [
      /no.?padding/i,
      /remove.?padding/i,
      /zero.?padding/i
    ],
    intent: {
      type: 'spacing' as const,
      action: 'set' as const,
      property: 'layout.contentSettings.padding',
      value: 'none'
    }
  },
  
  // Margins
  {
    patterns: [
      /more.?margin/i,
      /increase.?margin/i,
      /add.?margin/i,
      /more.?space.?above/i,
      /more.?space.?below/i
    ],
    intent: {
      type: 'spacing' as const,
      action: 'increase' as const,
      property: 'layout.blockSettings.margin'
    }
  },
  {
    patterns: [
      /less.?margin/i,
      /reduce.?margin/i,
      /decrease.?margin/i,
      /less.?space/i
    ],
    intent: {
      type: 'spacing' as const,
      action: 'decrease' as const,
      property: 'layout.blockSettings.margin'
    }
  },
  {
    patterns: [
      /no.?margin/i,
      /remove.?margin/i,
      /zero.?margin/i,
      /no.?space/i
    ],
    intent: {
      type: 'spacing' as const,
      action: 'set' as const,
      property: 'layout.blockSettings.margin',
      value: 'none'
    }
  }
];

/**
 * Alignment Intent Patterns
 */
const ALIGNMENT_PATTERNS = [
  {
    patterns: [
      /center.?align/i,
      /align.?center/i,
      /centered.?text/i,
      /center.?content/i
    ],
    intent: {
      type: 'alignment' as const,
      action: 'set' as const,
      property: 'layout.contentSettings.textAlignment',
      value: 'center'
    }
  },
  {
    patterns: [
      /left.?align/i,
      /align.?left/i,
      /left.?text/i
    ],
    intent: {
      type: 'alignment' as const,
      action: 'set' as const,
      property: 'layout.contentSettings.textAlignment',
      value: 'left'
    }
  },
  {
    patterns: [
      /right.?align/i,
      /align.?right/i,
      /right.?text/i
    ],
    intent: {
      type: 'alignment' as const,
      action: 'set' as const,
      property: 'layout.contentSettings.textAlignment',
      value: 'right'
    }
  }
];

/**
 * Background Intent Patterns
 */
const BACKGROUND_PATTERNS = [
  {
    patterns: [
      /blue.?background/i,
      /make.?blue/i,
      /color.?blue/i
    ],
    intent: {
      type: 'background' as const,
      action: 'set' as const,
      property: 'background.color',
      value: 'blue'
    }
  },
  {
    patterns: [
      /red.?background/i,
      /make.?red/i,
      /color.?red/i
    ],
    intent: {
      type: 'background' as const,
      action: 'set' as const,
      property: 'background.color',
      value: 'red'
    }
  },
  {
    patterns: [
      /green.?background/i,
      /make.?green/i,
      /color.?green/i
    ],
    intent: {
      type: 'background' as const,
      action: 'set' as const,
      property: 'background.color',
      value: 'green'
    }
  },
  {
    patterns: [
      /gradient.?background/i,
      /make.?gradient/i,
      /add.?gradient/i,
      /sunset.?gradient/i
    ],
    intent: {
      type: 'background' as const,
      action: 'set' as const,
      property: 'background.gradient',
      value: 'sunset'
    }
  }
];

/**
 * All intent patterns combined
 */
const ALL_PATTERNS = [
  ...LAYOUT_PATTERNS,
  ...SPACING_PATTERNS,
  ...ALIGNMENT_PATTERNS,
  ...BACKGROUND_PATTERNS
];

/**
 * Extract modifier intensity from user input
 */
function extractModifier(input: string): 'slight' | 'moderate' | 'significant' {
  const significant = /much|lot|way|significantly|dramatically|massive/i;
  const slight = /little|bit|slightly|small|minor/i;
  
  if (significant.test(input)) return 'significant';
  if (slight.test(input)) return 'slight';
  return 'moderate';
}

/**
 * Classify user intent into property changes
 */
export function classifyPropertyIntent(userInput: string): PropertyIntent[] {
  const intents: PropertyIntent[] = [];
  const input = userInput.toLowerCase();
  
  // Check each pattern
  for (const pattern of ALL_PATTERNS) {
    for (const regex of pattern.patterns) {
      const match = regex.exec(input);
      if (match) {
        const intent: PropertyIntent = {
          ...pattern.intent,
          confidence: 0.8 // Base confidence
        };
        
        // Add modifier for increase/decrease actions
        if (intent.action === 'increase' || intent.action === 'decrease') {
          intent.modifier = extractModifier(input);
        }
        
        // Boost confidence for exact matches
        if (match[0].length > 8) {
          intent.confidence = Math.min(0.95, intent.confidence + 0.1);
        }
        
        intents.push(intent);
      }
    }
  }
  
  // Remove duplicates and sort by confidence
  const uniqueIntents = intents.filter((intent, index, array) => 
    array.findIndex(i => i.property === intent.property && i.action === intent.action) === index
  );
  
  return uniqueIntents.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Convert property intent to actual property updates
 */
export function convertIntentToPropertyUpdate(intent: PropertyIntent, currentValue: any): any {
  switch (intent.action) {
    case 'set':
      return intent.value;
      
    case 'toggle':
      return !currentValue;
      
    case 'increase':
      return increaseSpacingValue(currentValue, intent.modifier);
      
    case 'decrease':
      return decreaseSpacingValue(currentValue, intent.modifier);
      
    case 'reset':
      return undefined;
      
    default:
      return intent.value;
  }
}

/**
 * Increase spacing value based on modifier
 */
function increaseSpacingValue(currentValue: any, modifier: 'slight' | 'moderate' | 'significant' = 'moderate'): string {
  const spacingLevels = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const current = typeof currentValue === 'string' ? currentValue : 'md';
  const currentIndex = spacingLevels.indexOf(current);
  
  let increment = 1;
  if (modifier === 'slight') increment = 1;
  if (modifier === 'moderate') increment = 2;
  if (modifier === 'significant') increment = 3;
  
  const newIndex = Math.min(spacingLevels.length - 1, currentIndex + increment);
  return spacingLevels[newIndex];
}

/**
 * Decrease spacing value based on modifier
 */
function decreaseSpacingValue(currentValue: any, modifier: 'slight' | 'moderate' | 'significant' = 'moderate'): string {
  const spacingLevels = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const current = typeof currentValue === 'string' ? currentValue : 'md';
  const currentIndex = spacingLevels.indexOf(current);
  
  let decrement = 1;
  if (modifier === 'slight') decrement = 1;
  if (modifier === 'moderate') decrement = 2;
  if (modifier === 'significant') decrement = 3;
  
  const newIndex = Math.max(0, currentIndex - decrement);
  return spacingLevels[newIndex];
} 
/**
 * Extracts the target path from a user's intent message for block updates
 * 
 * This function analyzes natural language to determine which part of a block
 * the user wants to update (e.g., title, button, background, etc.)
 * 
 * @param intent - The user's natural language intent/message
 * @param blockType - The type of block being updated
 * @returns Dot-separated path to the target property, or null if no specific target
 */
export function extractTargetFromIntent(intent: string, blockType: string): string | null {
  const lowerIntent = intent.toLowerCase();
  
  // Hero block specific mappings
  if (blockType === 'hero') {
    // Title/heading related
    if (lowerIntent.match(/\b(title|heading|headline|h1)\b/)) {
      return 'elements.title';
    }
    
    // Subtitle related
    if (lowerIntent.match(/\b(subtitle|subheading|tagline|description)\b/)) {
      return 'elements.subtitle';
    }
    
    // Button/CTA related
    if (lowerIntent.match(/\b(button|cta|call.to.action|link)\b/)) {
      // More specific button properties
      if (lowerIntent.match(/\b(text|label|copy)\b/)) {
        return 'elements.button.text';
      }
      if (lowerIntent.match(/\b(color|style|variant)\b/)) {
        return 'elements.button.variant';
      }
      if (lowerIntent.match(/\b(size)\b/)) {
        return 'elements.button.size';
      }
      if (lowerIntent.match(/\b(href|url|link|destination)\b/)) {
        return 'elements.button.href';
      }
      return 'elements.button';
    }
    
    // Background related
    if (lowerIntent.match(/\b(background|bg|backdrop)\b/)) {
      // Check for background type changes (return full background for replacement)
      if (lowerIntent.match(/\b(change|replace|switch|to)\b.*\b(image|picture|photo)\b/) ||
          lowerIntent.match(/\b(change|replace|switch|to)\b.*\b(video|clip|footage)\b/) ||
          lowerIntent.match(/\b(change|replace|switch|to)\b.*\b(gradient)\b/) ||
          lowerIntent.match(/\b(change|replace|switch|to)\b.*\b(color|colour)\b/)) {
        return 'background';
      }
      
      // Specific property updates (for minor tweaks, not type changes)
      if (lowerIntent.match(/\b(color|colour)\b/) && !lowerIntent.match(/\b(change|replace|switch|to)\b/)) {
        return 'background.color';
      }
      if (lowerIntent.match(/\b(image|picture|photo)\b/) && !lowerIntent.match(/\b(change|replace|switch|to)\b/)) {
        return 'background.image';
      }
      if (lowerIntent.match(/\b(gradient)\b/) && !lowerIntent.match(/\b(change|replace|switch|to)\b/)) {
        return 'background.gradient';
      }
      return 'background';
    }
    
    // Layout related
    if (lowerIntent.match(/\b(layout|spacing|padding|margin|alignment)\b/)) {
      if (lowerIntent.match(/\b(height)\b/)) {
        return 'layout.blockSettings.height';
      }
      if (lowerIntent.match(/\b(margin)\b/)) {
        return 'layout.blockSettings.margin';
      }
      if (lowerIntent.match(/\b(padding)\b/)) {
        return 'layout.contentSettings.padding';
      }
      if (lowerIntent.match(/\b(align|alignment)\b/)) {
        if (lowerIntent.match(/\b(text)\b/)) {
          return 'layout.contentSettings.textAlignment';
        }
        return 'layout.contentSettings.contentAlignment';
      }
      if (lowerIntent.match(/\b(width)\b/)) {
        return 'layout.contentSettings.contentWidth';
      }
      return 'layout';
    }
  }
  
  // Text alignment specific pattern (needs to be before generic patterns)
  if (lowerIntent.match(/\b(align|alignment)\b/) && 
      (lowerIntent.match(/\b(left|center|right|justify)\b/) || lowerIntent.match(/\b(text)\b/))) {
    return 'layout.contentSettings.textAlignment';
  }
  
  // Generic patterns that work across block types
  if (lowerIntent.match(/\b(content|text|copy)\b/) && !lowerIntent.match(/\b(button|cta)\b/)) {
    // Try to be more specific based on context
    if (lowerIntent.match(/\b(main|primary|title|heading)\b/)) {
      return 'elements.title';
    }
    if (lowerIntent.match(/\b(sub|secondary|supporting)\b/)) {
      return 'elements.subtitle';
    }
  }
  
  // Style/appearance changes that affect the whole block
  if (lowerIntent.match(/\b(style|appearance|design|theme)\b/) && 
      !lowerIntent.match(/\b(title|subtitle|button|background|layout)\b/)) {
    return null; // Full block update needed
  }
  
  // If user mentions multiple specific elements, return null for full update
  const elementCount = [
    lowerIntent.match(/\b(title|heading)\b/),
    lowerIntent.match(/\b(subtitle|subheading)\b/),
    lowerIntent.match(/\b(button|cta)\b/),
    lowerIntent.match(/\b(background|bg)\b/),
    lowerIntent.match(/\b(layout|spacing)\b/)
  ].filter(Boolean).length;
  
  if (elementCount > 1) {
    return null; // Multiple elements mentioned, do full update
  }
  
  // Default to null for full block update
  return null;
}

/**
 * Extracts multiple target paths from a complex intent
 * 
 * @param intent - The user's natural language intent/message
 * @param blockType - The type of block being updated
 * @returns Array of dot-separated paths, or empty array for full update
 */
export function extractTargetsFromIntent(intent: string, blockType: string): string[] {
  const targets: string[] = [];
  const lowerIntent = intent.toLowerCase();
  
  if (blockType === 'hero') {
    if (lowerIntent.match(/\b(title|heading|headline)\b/)) {
      targets.push('elements.title');
    }
    if (lowerIntent.match(/\b(subtitle|subheading|tagline)\b/)) {
      targets.push('elements.subtitle');
    }
    if (lowerIntent.match(/\b(button|cta|call.to.action)\b/)) {
      targets.push('elements.button');
    }
    if (lowerIntent.match(/\b(background|bg|backdrop)\b/)) {
      targets.push('background');
    }
    if (lowerIntent.match(/\b(layout|spacing|padding|margin|alignment)\b/)) {
      targets.push('layout');
    }
  }
  
  return targets;
} 
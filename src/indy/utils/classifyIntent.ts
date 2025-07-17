// Intent classification utility
export type BlockIntent = 'create' | 'update' | 'replace';

export interface ClassifyIntentInput {
  userInput: string;
  currentData?: any;
}

export interface ClassifyIntentOutput {
  intent: BlockIntent;
  confidence: number;
  reasoning: string;
}

export function classifyIntent(input: ClassifyIntentInput): ClassifyIntentOutput {
  const { userInput, currentData } = input;
  
  // Convert to lowercase for analysis
  const text = userInput.toLowerCase();
  
  // Keywords for different intents
  const createKeywords = ['create', 'new', 'add', 'make', 'generate', 'build'];
  const updateKeywords = ['update', 'change', 'modify', 'edit', 'adjust', 'fix'];
  const replaceKeywords = ['replace', 'swap', 'substitute', 'completely change'];
  
  // Check for replace intent first (most specific)
  const replaceMatches = replaceKeywords.filter(keyword => text.includes(keyword));
  if (replaceMatches.length > 0) {
    return {
      intent: 'replace',
      confidence: 0.9,
      reasoning: `Found replace keywords: ${replaceMatches.join(', ')}`
    };
  }
  
  // Check for update intent
  const updateMatches = updateKeywords.filter(keyword => text.includes(keyword));
  if (updateMatches.length > 0 && currentData) {
    return {
      intent: 'update',
      confidence: 0.8,
      reasoning: `Found update keywords: ${updateMatches.join(', ')} with existing data`
    };
  }
  
  // Check for create intent
  const createMatches = createKeywords.filter(keyword => text.includes(keyword));
  if (createMatches.length > 0) {
    return {
      intent: 'create',
      confidence: 0.8,
      reasoning: `Found create keywords: ${createMatches.join(', ')}`
    };
  }
  
  // Default logic based on data presence
  if (!currentData) {
    return {
      intent: 'create',
      confidence: 0.6,
      reasoning: 'No existing data found, defaulting to create'
    };
  }
  
  // If we have data but no clear intent, assume update
  return {
    intent: 'update',
    confidence: 0.5,
    reasoning: 'Existing data found with ambiguous intent, defaulting to update'
  };
} 
/**
 * Indy Property Agent
 * 
 * This agent handles property-specific updates using the intent classification system
 * It bridges the gap between user intent and actual property changes
 * 
 * IMPORTANT: Uses blockStore as single source of truth when called from frontend
 * When called from API, returns updated data for frontend to apply
 */

import { classifyIntentToAgent } from './orchestrator';
import { getNestedValue, setNestedValue } from '../../blocks/shared/property-mappings';

export interface PropertyAgentResult {
  success: boolean;
  changes: PropertyChange[];
  message: string;
  confidence: number;
  updatedBlockData?: any; // For API calls
}

export interface PropertyChange {
  property: string;
  oldValue: any;
  newValue: any;
  intent: PropertyIntent;
}

/**
 * Run the property agent to handle property-specific updates
 * 
 * IMPORTANT: This updates the blockStore immediately when called from frontend
 * When called from API, returns updated data for frontend to apply
 */
export async function runIndyPropertyAgent(
  userInput: string,
  blockId: string,
  currentBlockData: any,
  updateStore: boolean = true
): Promise<PropertyAgentResult> {
  try {
    console.log('🔧 Property Agent: Analyzing user input:', userInput);
    
    // Classify the user intent
    const intents = classifyPropertyIntent(userInput);
    
    if (intents.length === 0) {
      return {
        success: false,
        changes: [],
        message: 'I couldn\'t understand what property changes you want to make.',
        confidence: 0
      };
    }
    
    console.log('🔧 Property Agent: Found intents:', intents);
    
    // Apply the highest confidence intent
    const primaryIntent = intents[0];
    const changes: PropertyChange[] = [];
    
    // Handle different property types
    if (primaryIntent.property.includes('padding') || primaryIntent.property.includes('margin')) {
      // Handle spacing properties (padding/margin)
      const spacingChanges = await handleSpacingProperty(primaryIntent, currentBlockData);
      changes.push(...spacingChanges);
    } else {
      // Handle single property
      const change = await handleSingleProperty(primaryIntent, currentBlockData);
      if (change) {
        changes.push(change);
      }
    }
    
    if (changes.length === 0) {
      return {
        success: false,
        changes: [],
        message: 'I couldn\'t apply the requested property changes.',
        confidence: primaryIntent.confidence
      };
    }
    
    // Apply changes to the block data
    const updatedBlockData = applyPropertyChanges(currentBlockData, changes);
    
    if (updateStore) {
      // Update the blockStore (when called from frontend)
      const { useBlocksStore } = await import('../../store/blocksStore');
      const { updateBlock, getBlockIndex } = useBlocksStore.getState();
      const blockIndex = getBlockIndex(blockId);
      
      if (blockIndex !== -1) {
        updateBlock(blockIndex, updatedBlockData);
        console.log('✅ Property Agent: Successfully updated block in store');
      } else {
        throw new Error(`Block with id ${blockId} not found in store`);
      }
    }
    
    // Generate success message
    const message = generateSuccessMessage(changes, primaryIntent);
    
    return {
      success: true,
      changes,
      message,
      confidence: primaryIntent.confidence,
      updatedBlockData // Return data for API calls
    };
    
  } catch (error) {
    console.error('❌ Property Agent error:', error);
    return {
      success: false,
      changes: [],
      message: 'An error occurred while processing your property changes.',
      confidence: 0
    };
  }
}

/**
 * Handle spacing properties (padding/margin) which affect all directions
 */
async function handleSpacingProperty(intent: PropertyIntent, blockData: any): Promise<PropertyChange[]> {
  const changes: PropertyChange[] = [];
  const baseProperty = intent.property;
  
  // For spacing, we need to handle all directions
  const directions = ['top', 'bottom', 'left', 'right'];
  
  for (const direction of directions) {
    const fullProperty = `${baseProperty}.${direction}`;
    const currentValue = getNestedValue(blockData, fullProperty);
    const newValue = convertIntentToPropertyUpdate(intent, currentValue);
    
    if (newValue !== currentValue) {
      changes.push({
        property: fullProperty,
        oldValue: currentValue,
        newValue,
        intent
      });
    }
  }
  
  return changes;
}

/**
 * Handle single property changes
 */
async function handleSingleProperty(intent: PropertyIntent, blockData: any): Promise<PropertyChange | null> {
  const currentValue = getNestedValue(blockData, intent.property);
  const newValue = convertIntentToPropertyUpdate(intent, currentValue);
  
  if (newValue === currentValue) {
    return null; // No change needed
  }
  
  return {
    property: intent.property,
    oldValue: currentValue,
    newValue,
    intent
  };
}

/**
 * Apply property changes to block data
 */
function applyPropertyChanges(blockData: any, changes: PropertyChange[]): any {
  const updatedData = JSON.parse(JSON.stringify(blockData)); // Deep clone
  
  for (const change of changes) {
    setNestedValue(updatedData, change.property, change.newValue);
  }
  
  return updatedData;
}

/**
 * Generate success message based on changes
 */
function generateSuccessMessage(changes: PropertyChange[], intent: PropertyIntent): string {
  if (changes.length === 1) {
    const change = changes[0];
    return `✅ Updated ${getPropertyDisplayName(change.property)} to ${change.newValue}`;
  }
  
  if (intent.type === 'spacing') {
    const action = intent.action === 'increase' ? 'increased' : 
                   intent.action === 'decrease' ? 'decreased' : 'updated';
    const property = intent.property.includes('padding') ? 'padding' : 'margin';
    return `✅ ${action.charAt(0).toUpperCase() + action.slice(1)} ${property} for all sides`;
  }
  
  return `✅ Updated ${changes.length} properties`;
}

/**
 * Get display name for property
 */
function getPropertyDisplayName(property: string): string {
  const parts = property.split('.');
  const lastPart = parts[parts.length - 1];
  
  const displayNames: Record<string, string> = {
    'blockWidth': 'block width',
    'height': 'block height',
    'contentWidth': 'content width',
    'textAlignment': 'text alignment',
    'top': 'top spacing',
    'bottom': 'bottom spacing',
    'left': 'left spacing',
    'right': 'right spacing',
    'color': 'background color',
    'gradient': 'background gradient'
  };
  
  return displayNames[lastPart] || lastPart;
}

/**
 * Check if user input is property-related
 */
export function isPropertyIntent(userInput: string): boolean {
  const intents = classifyPropertyIntent(userInput);
  return intents.length > 0 && intents[0].confidence > 0.6;
} 
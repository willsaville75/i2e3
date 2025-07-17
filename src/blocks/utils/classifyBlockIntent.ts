import { deepEqual } from '../../utils/deepEqual';

/**
 * Input for block intent classification
 */
export interface ClassifyBlockIntentInput {
  /** Current block data (optional) */
  current?: any;
  /** Default block data for this type */
  defaultData: any;
  /** Schema summary from summariseBlockSchemaForAI() */
  schemaSummary: string;
}

/**
 * Result of block intent classification
 */
export interface BlockIntentResult {
  /** The classified intent */
  intent: 'create' | 'update' | 'replace';
  /** Human-readable reason for the classification */
  reason: string;
}

/**
 * Analyzes differences between current and default data to provide detailed reasoning
 * @param current - Current block data
 * @param defaultData - Default block data
 * @returns Array of difference descriptions
 */
function analyzeDifferences(current: any, defaultData: any): string[] {
  const differences: string[] = [];

  // Check major sections that commonly differ
  const sectionsToCheck = ['elements', 'layout', 'background', 'content', 'style'];

  for (const section of sectionsToCheck) {
    if (current[section] && defaultData[section]) {
      if (!deepEqual(current[section], defaultData[section])) {
        differences.push(section);
      }
    } else if (current[section] && !defaultData[section]) {
      differences.push(`${section} (added)`);
    } else if (!current[section] && defaultData[section]) {
      differences.push(`${section} (removed)`);
    }
  }

  // Check for any other top-level differences
  const allCurrentKeys = Object.keys(current || {});
  
  for (const key of allCurrentKeys) {
    if (!sectionsToCheck.includes(key) && !deepEqual(current[key], defaultData[key])) {
      if (!differences.some(diff => diff.startsWith(key))) {
        differences.push(key);
      }
    }
  }

  return differences;
}

/**
 * Classifies the intent for a block operation based on current vs default data
 * 
 * This function helps AI agents understand whether they should:
 * - CREATE: Generate entirely new block content
 * - UPDATE: Modify existing block content
 * - REPLACE: Suggest completely new content for unchanged blocks
 * 
 * @param input - Object containing current data, default data, and schema summary
 * @returns Classification result with intent and reasoning
 */
export function classifyBlockIntent(input: ClassifyBlockIntentInput): BlockIntentResult {
  const { current, defaultData } = input;

  // Case 1: No current data provided - this is a new block creation
  if (!current) {
    return {
      intent: 'create',
      reason: 'No existing block data provided - creating new block from defaults'
    };
  }

  // Case 2: Current data is identical to default - suggest replacement
  if (deepEqual(current, defaultData)) {
    return {
      intent: 'replace',
      reason: 'Block content is identical to defaults - AI may suggest entirely new content to improve engagement'
    };
  }

  // Case 3: Current data has differences from default - update existing content
  const differences = analyzeDifferences(current, defaultData);
  
  if (differences.length > 0) {
    const diffList = differences.length <= 3 
      ? differences.join(', ')
      : `${differences.slice(0, 3).join(', ')} and ${differences.length - 3} more`;
    
    return {
      intent: 'update',
      reason: `Partial changes detected in existing block data (modified: ${diffList}) - updating existing content`
    };
  }

  // Fallback case - treat as update if we can't determine exact differences
  return {
    intent: 'update',
    reason: 'Existing block data detected with potential modifications - updating existing content'
  };
}

/**
 * Utility function to quickly check if a block should be created from scratch
 * @param current - Current block data
 * @returns true if block should be created, false if updated/replaced
 */
export function shouldCreateBlock(current: any): boolean {
  return !current;
}

/**
 * Utility function to quickly check if a block should be completely replaced
 * @param current - Current block data
 * @param defaultData - Default block data
 * @returns true if block should be replaced, false if updated/created
 */
export function shouldReplaceBlock(current: any, defaultData: any): boolean {
  return current && deepEqual(current, defaultData);
} 
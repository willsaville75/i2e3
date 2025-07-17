import { classifyBlockIntent } from '../../blocks/utils/classifyBlockIntent';

/**
 * Input configuration for the Indy decision engine
 */
export interface DecisionEngineInput {
  /** Mode of operation - single block or entire page */
  mode: 'block' | 'page';
  /** Context data from prepareBlockAIContext or preparePageAIContext */
  context: any;
  /** Optional conversation history for context-aware decisions */
  messages?: string[];
  /** Optional schema summary for enhanced decision making */
  schemaSummary?: string;
}

/**
 * Individual decision made by the engine
 */
export interface Decision {
  /** The action to take */
  action: 'create' | 'update' | 'replace' | 'clarify';
  /** Target of the action (blockType or 'page') */
  target: string;
  /** Human-readable reason for this decision */
  reason: string;
}

/**
 * Complete output from the decision engine
 */
export interface DecisionEngineOutput {
  /** Array of decisions made by the engine */
  actions: Decision[];
  /** Optional summary of the decision process */
  summary?: string;
}

/**
 * Runs the Indy decision engine to determine appropriate actions for blocks or pages
 * 
 * This engine analyzes the current state of blocks compared to their defaults and
 * determines whether to create new content, update existing content, replace unchanged
 * content, or request clarification from the user.
 * 
 * @param input - Configuration and context for the decision engine
 * @returns Array of decisions with actions and reasoning
 */
export function runIndyDecisionEngine(input: DecisionEngineInput): DecisionEngineOutput {
  const { mode, context, schemaSummary } = input;

  const actions: Decision[] = [];

  if (mode === 'block') {
    // Handle single block decision making
    const { blockType, current, defaults } = context;
    const summary = schemaSummary || '[schema summary omitted]';
    
    if (!current) {
      actions.push({ 
        action: 'create', 
        target: blockType, 
        reason: 'No existing data found - creating new block from defaults' 
      });
    } else {
      const result = classifyBlockIntent({
        current,
        defaultData: defaults,
        schemaSummary: summary,
      });
      
      // Map intent to action (they're the same in this case)
      actions.push({ 
        action: result.intent as 'create' | 'update' | 'replace', 
        target: blockType, 
        reason: result.reason 
      });
    }
  }

  if (mode === 'page') {
    // Handle page-level decision making with multiple blocks
    const { blocks } = context;
    
    if (!blocks || !Array.isArray(blocks)) {
      actions.push({
        action: 'clarify',
        target: 'page',
        reason: 'Invalid or missing blocks data in page context'
      });
    } else {
      for (const block of blocks) {
        const { blockType, current, defaultData, schemaSummary: blockSchemaSummary } = block;
        
        if (!blockType) {
          actions.push({
            action: 'clarify',
            target: 'unknown',
            reason: 'Block missing blockType identifier'
          });
          continue;
        }
        
        if (!current) {
          actions.push({ 
            action: 'create', 
            target: blockType, 
            reason: 'No existing data found for this block' 
          });
        } else {
          const result = classifyBlockIntent({
            current,
            defaultData: defaultData || {},
            schemaSummary: blockSchemaSummary || schemaSummary || '[schema summary omitted]',
          });
          
          actions.push({ 
            action: result.intent as 'create' | 'update' | 'replace', 
            target: blockType, 
            reason: result.reason 
          });
        }
      }
    }
  }

  // Generate summary based on actions taken
  const actionCounts = actions.reduce((acc, action) => {
    acc[action.action] = (acc[action.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const actionSummaryParts = Object.entries(actionCounts).map(([action, count]) => 
    `${count} ${action}${count > 1 ? 's' : ''}`
  );

  return {
    actions,
    summary: `Indy determined ${actions.length} action(s) for this ${mode}: ${actionSummaryParts.join(', ')}`,
  };
} 
/**
 * Context agent for explaining block purpose and current state
 * 
 * This agent analyzes a block's context and provides a friendly natural language
 * summary that explains what the block is, its current values, and design intent.
 */

export interface ContextAgentInput {
  blockType: string;
  props: any;
  schema?: any;
  aiHints?: {
    description?: string;
    [key: string]: any;
  };
}

/**
 * Runs the context agent to generate a friendly block summary
 * 
 * @param input - Block context information
 * @returns Markdown-formatted string explaining the block
 */
export default async function run(input: ContextAgentInput): Promise<string> {
  const { blockType, props, schema, aiHints } = input;
  
  // Generate block overview
  const overview = generateBlockOverview(blockType, props);
  
  // Generate current values summary
  const currentValues = generateCurrentValues(props);
  
  // Generate design intent if available
  const designIntent = generateDesignIntent(aiHints);
  
  // Combine into markdown format
  const sections = [
    `### Block Overview`,
    overview,
    ``,
    `### Current Values`,
    currentValues
  ];
  
  if (designIntent) {
    sections.push(``, `### Design Intent`, designIntent);
  }
  
  return sections.join('\n');
}

/**
 * Generates a friendly overview of what the block is and does
 */
function generateBlockOverview(blockType: string, props: any): string {
  const blockName = blockType.charAt(0).toUpperCase() + blockType.slice(1);
  
  if (blockType === 'hero') {
    const hasTitle = props?.elements?.title?.content;
    const hasSubtitle = props?.elements?.subtitle?.content;
    const hasButton = props?.elements?.button?.text;
    
    const components = [];
    if (hasTitle) components.push('title');
    if (hasSubtitle) components.push('subtitle');
    if (hasButton) components.push('button');
    
    const componentText = components.length > 0 
      ? ` with ${components.join(', ')}`
      : '';
    
    return `This is a ${blockName.toLowerCase()} block${componentText}. Hero blocks are designed to capture attention and communicate your main message prominently on the page.`;
  }
  
  // Generic fallback for other block types
  return `This is a ${blockName.toLowerCase()} block. It contains structured content that can be customized for your needs.`;
}

/**
 * Generates a summary of current prop values in readable form
 */
function generateCurrentValues(props: any): string {
  if (!props || typeof props !== 'object') {
    return '- No content configured yet';
  }
  
  const values = [];
  
  // Handle hero block structure
  if (props.elements) {
    const { title, subtitle, button } = props.elements;
    
    if (title?.content) {
      values.push(`- **Title**: "${title.content}" (heading level ${title.level || 1})`);
    } else {
      values.push(`- **Title**: *Not set*`);
    }
    
    if (subtitle?.content) {
      values.push(`- **Subtitle**: "${subtitle.content}"`);
    } else {
      values.push(`- **Subtitle**: *Not set*`);
    }
    
    if (button?.text) {
      const href = button.href ? ` → ${button.href}` : '';
      const variant = button.variant ? ` (${button.variant})` : '';
      values.push(`- **Button**: "${button.text}"${href}${variant}`);
    } else {
      values.push(`- **Button**: *Not set*`);
    }
  }
  
  // Handle layout settings
  if (props.layout) {
    const { blockSettings, contentSettings } = props.layout;
    
    if (blockSettings?.height) {
      values.push(`- **Height**: ${blockSettings.height}`);
    }
    
    if (contentSettings?.textAlignment) {
      values.push(`- **Text Alignment**: ${contentSettings.textAlignment}`);
    }
  }
  
  // Handle background
  if (props.background) {
    const { type, color, colorIntensity } = props.background;
    if (type === 'color' && color) {
      const intensity = colorIntensity ? ` (${colorIntensity})` : '';
      values.push(`- **Background**: ${color}${intensity}`);
    } else if (type) {
      values.push(`- **Background**: ${type}`);
    }
  }
  
  return values.length > 0 ? values.join('\n') : '- No values configured';
}

/**
 * Generates design intent explanation from AI hints
 */
function generateDesignIntent(aiHints?: { description?: string; [key: string]: any }): string | null {
  if (!aiHints?.description) {
    return null;
  }
  
  return aiHints.description;
}

/**
 * Identifies missing or incomplete fields
 */
function identifyMissingFields(props: any, blockType: string): string[] {
  const missing = [];
  
  if (blockType === 'hero') {
    if (!props?.elements?.title?.content) missing.push('title');
    if (!props?.elements?.subtitle?.content) missing.push('subtitle');
    if (!props?.elements?.button?.text) missing.push('button text');
    if (!props?.elements?.button?.href) missing.push('button link');
  }
  
  return missing;
} 
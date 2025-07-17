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
  const { blockType, props, aiHints } = input;
  
  // Handle case where no block is selected
  if (!blockType) {
    return `### No Block Selected

Please select a block first, then I can tell you about its context, current values, and design intent.

To select a block, click on any block in the canvas on the left side of the screen.`;
  }
  
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
  if (!blockType) {
    return 'No block type provided';
  }
  
  const blockName = blockType.charAt(0).toUpperCase() + blockType.slice(1);
  
  if (blockType === 'hero') {
    const hasTitle = props?.content?.title;
    const hasSubtitle = props?.content?.subtitle;
    const hasButton = props?.content?.buttonText;
    
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
  if (props.content) {
    const { title, subtitle, buttonText, buttonUrl } = props.content;
    
    if (title) {
      values.push(`- **Title**: "${title}"`);
    } else {
      values.push(`- **Title**: *Not set*`);
    }
    
    if (subtitle) {
      values.push(`- **Subtitle**: "${subtitle}"`);
    } else {
      values.push(`- **Subtitle**: *Not set*`);
    }
    
    if (buttonText) {
      const href = buttonUrl ? ` → ${buttonUrl}` : '';
      values.push(`- **Button**: "${buttonText}"${href}`);
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

 
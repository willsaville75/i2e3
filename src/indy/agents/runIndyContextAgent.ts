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
  // Canvas context
  canvasContext?: {
    totalBlocks: number;
    blockTypes: string[];
    currentBlockIndex?: number;
    pageTitle?: string;
    pageDescription?: string;
  };
}

/**
 * Runs the context agent to generate a friendly block summary
 * 
 * @param input - Block context information
 * @returns Markdown-formatted string explaining the block
 */
export default async function run(input: ContextAgentInput): Promise<string> {
  const { blockType, props, aiHints, canvasContext } = input;
  
  // Handle case where no block is selected
  if (!blockType && !canvasContext) {
    return `### No Block Selected

Please select a block first, then I can tell you about its context, current values, and design intent.

To select a block, click on any block in the canvas on the left side of the screen.`;
  }
  
  // If we have canvas context but no specific block, show canvas overview
  if (!blockType && canvasContext) {
    return generateCanvasOverview(canvasContext);
  }
  
  // Generate canvas context if available
  const canvasOverview = canvasContext ? generateCanvasContext(canvasContext, blockType) : '';
  
  // Generate block overview
  const overview = generateBlockOverview(blockType, props);
  
  // Generate current values summary
  const currentValues = generateCurrentValues(props);
  
  // Generate design intent if available
  const designIntent = generateDesignIntent(aiHints);
  
  // Combine into markdown format
  const sections = [
    canvasOverview,
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
 * Generates a summary of current prop values and what can be changed
 */
function generateCurrentValues(props: any): string {
  if (!props || typeof props !== 'object') {
    return '- No content configured yet';
  }
  
  const values = [];
  
  // Handle hero block structure
  if (props.elements) {
    const { title, subtitle, button } = props.elements;
    
    values.push(`**📝 Content Properties:**`);
    // Handle both {content: "text"} and direct string formats
    const titleText = typeof title === 'string' ? title : title?.content;
    if (titleText) {
      values.push(`- **Title**: "${titleText}" *(say: "change title to...")*`);
    } else {
      values.push(`- **Title**: *Not set* *(say: "set title to...")*`);
    }
    
    if (subtitle?.content) {
      values.push(`- **Subtitle**: "${subtitle.content}" *(say: "change subtitle to...")*`);
    } else {
      values.push(`- **Subtitle**: *Not set* *(say: "add subtitle...")*`);
    }
    
    if (button?.text) {
      const href = button.href ? ` → ${button.href}` : '';
      values.push(`- **Button**: "${button.text}"${href} *(say: "change button to...")*`);
    } else {
      values.push(`- **Button**: *Not set* *(say: "add button...")*`);
    }
  }
  
  // Handle layout settings
  if (props.layout) {
    const { blockSettings, contentSettings } = props.layout;
    
    values.push(`\n**🎨 Layout Properties:**`);
    if (blockSettings?.height) {
      values.push(`- **Height**: ${blockSettings.height} *(say: "make this full height" or "make this auto height")*`);
    }
    
    if (contentSettings?.textAlignment) {
      values.push(`- **Text Alignment**: ${contentSettings.textAlignment} *(say: "center align" or "left align")*`);
    }
    
    if (contentSettings?.contentAlignment) {
      const h = contentSettings.contentAlignment.horizontal || 'center';
      const v = contentSettings.contentAlignment.vertical || 'center';
      values.push(`- **Content Position**: ${h} ${v} *(say: "align content left" or "align content top")*`);
    }
  }
  
  // Handle background
  if (props.background) {
    const { type, color, colorIntensity } = props.background;
    values.push(`\n**🎨 Background Properties:**`);
    if (type === 'color' && color) {
      const intensity = colorIntensity ? ` (${colorIntensity})` : '';
      values.push(`- **Background**: ${color}${intensity} *(say: "change background to red" or "make background darker")*`);
    } else if (type) {
      values.push(`- **Background**: ${type} *(say: "change background to...")*`);
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
 * Generate canvas overview when no specific block is selected
 */
function generateCanvasOverview(context: any): string {
  const { totalBlocks, blockTypes, pageTitle, pageDescription } = context;
  
  const sections = [
    `### Canvas Overview`,
    pageTitle ? `**Page**: ${pageTitle}` : '',
    pageDescription ? `*${pageDescription}*` : '',
    '',
    `**Total Blocks**: ${totalBlocks || 0}`,
    ''
  ];
  
  if (blockTypes && blockTypes.length > 0) {
    sections.push(`**Block Types on Canvas**:`);
    const typeCounts = blockTypes.reduce((acc: any, type: string) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(typeCounts).forEach(([type, count]) => {
      const countNum = count as number;
      sections.push(`- ${countNum}x ${type} block${countNum > 1 ? 's' : ''}`);
    });
  } else {
    sections.push(`*No blocks on canvas yet. Try saying "create a hero block" to get started!*`);
  }
  
  return sections.filter(s => s).join('\n');
}

/**
 * Generate canvas context for a specific block
 */
function generateCanvasContext(context: any, blockType: string): string {
  const { totalBlocks, currentBlockIndex, blockTypes } = context;
  
  if (!context || totalBlocks === 0) return '';
  
  const position = currentBlockIndex !== undefined ? `${currentBlockIndex + 1} of ${totalBlocks}` : `one of ${totalBlocks}`;
  const otherBlocks = blockTypes ? blockTypes.filter((t: string) => t !== blockType) : [];
  
  const sections = [
    `### Canvas Context`,
    `This ${blockType} block is ${position} blocks on the canvas.`,
    ''
  ];
  
  if (otherBlocks.length > 0) {
    const uniqueTypes = [...new Set(otherBlocks)];
    sections.push(`**Other blocks on canvas**: ${uniqueTypes.join(', ')}`);
    sections.push(`*Tip: You can say "tell me about the canvas" to see all blocks*`);
  }
  
  sections.push('', '---', '');
  
  return sections.join('\n');
}

 
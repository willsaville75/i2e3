import { blockRegistry } from '../../blocks';

export interface SchemaPresenterRequest {
  blockType: string;
  selectedBlock?: any;
  navigationPath?: string[]; // Track current navigation path
  userSelection?: string; // User's selection (number or 'back')
}

export interface SchemaPresenterResponse {
  message: string;
  sections: {
    name: string;
    properties: Array<{
      path: string;
      title: string;
      type: string;
      options?: string[];
      currentValue?: any;
    }>;
  }[];
  navigationState?: {
    currentPath: string[];
    availableOptions: Array<{
      index: number;
      label: string;
      path: string;
      isSection: boolean;
    }>;
  };
}

/**
 * Schema Presenter Agent - Guided Navigation Version
 * Presents block schema information one level at a time with numbered navigation
 */
export async function runSchemaPresenterAgent(
  request: SchemaPresenterRequest
): Promise<SchemaPresenterResponse> {
  const { blockType, selectedBlock, navigationPath = [], userSelection } = request;
  
  const blockEntry = blockRegistry[blockType];
  if (!blockEntry?.schema) {
    throw new Error(`Block type "${blockType}" not found in registry`);
  }

  // Helper to get value from nested path
  const getValueFromPath = (obj: any, path: string): any => {
    if (!obj) return undefined;
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Helper to get schema object at current navigation level
  const getSchemaAtPath = (schema: any, path: string[]): any => {
    let current = schema;
    for (const segment of path) {
      if (current.properties && current.properties[segment]) {
        current = current.properties[segment];
      } else {
        return null;
      }
    }
    return current;
  };

  // Process user selection to update navigation path
  let currentPath = [...navigationPath];
  if (userSelection) {
    if (userSelection.toLowerCase() === 'back' && currentPath.length > 0) {
      currentPath.pop();
    } else {
      const selectionNum = parseInt(userSelection);
      if (!isNaN(selectionNum)) {
        // We'll validate and use this selection below
      }
    }
  }

  // Get current schema level
  const currentSchema = getSchemaAtPath(blockEntry.schema, currentPath);
  if (!currentSchema) {
    return {
      message: "I couldn't find that section. Let me show you the main options again.",
      sections: [],
      navigationState: {
        currentPath: [],
        availableOptions: []
      }
    };
  }

  // Build available options at current level
  const availableOptions: any[] = [];
  let optionIndex = 1;

  if (currentSchema.properties) {
    // Standard section order for root level
    const sectionOrder = currentPath.length === 0 
      ? ['layout', 'elements', 'background'] 
      : Object.keys(currentSchema.properties);
    
    const sectionNames: Record<string, string> = {
      layout: 'Layout & Spacing',
      elements: 'Content',
      background: 'Background'
    };

    sectionOrder.forEach(key => {
      if (currentSchema.properties[key]) {
        const prop = currentSchema.properties[key];
        const hasNestedProperties = prop.properties && Object.keys(prop.properties).length > 0;
        
        availableOptions.push({
          index: optionIndex++,
          label: sectionNames[key] || prop.title || key,
          path: key,
          isSection: hasNestedProperties,
          type: prop.type,
          enum: prop.enum,
          currentValue: getValueFromPath(selectedBlock, [...currentPath, key].join('.'))
        });
      }
    });

    // Add any other properties not in sectionOrder
    Object.keys(currentSchema.properties).forEach(key => {
      if (!sectionOrder.includes(key)) {
        const prop = currentSchema.properties[key];
        const hasNestedProperties = prop.properties && Object.keys(prop.properties).length > 0;
        
        availableOptions.push({
          index: optionIndex++,
          label: prop.title || key,
          path: key,
          isSection: hasNestedProperties,
          type: prop.type,
          enum: prop.enum,
          currentValue: getValueFromPath(selectedBlock, [...currentPath, key].join('.'))
        });
      }
    });
  }

  // Process user selection if it's a number
  if (userSelection && !isNaN(parseInt(userSelection))) {
    const selectionNum = parseInt(userSelection);
    const selectedOption = availableOptions.find(opt => opt.index === selectionNum);
    
    if (selectedOption && selectedOption.isSection) {
      currentPath.push(selectedOption.path);
      // Recursive call with updated path
      return runSchemaPresenterAgent({
        ...request,
        navigationPath: currentPath,
        userSelection: undefined
      });
    }
  }

  // Build the message
  let message = '';
  
  if (currentPath.length === 0) {
    message = `I can see you've selected the ${blockType} block. What would you like to change?\n\n`;
  } else {
    const breadcrumb = currentPath.map((segment, index) => {
      const parentSchema = getSchemaAtPath(blockEntry.schema, currentPath.slice(0, index));
      const title = parentSchema?.properties?.[segment]?.title || segment;
      return title;
    }).join(' > ');
    
    message = `**${breadcrumb}**\n\n`;
  }

  // List available options
  availableOptions.forEach(option => {
    message += `**${option.index}.** ${option.label}`;
    
    // Add property details for leaf properties
    if (!option.isSection) {
      if (option.currentValue !== undefined) {
        message += ` (current: ${JSON.stringify(option.currentValue)})`;
      }
      
      if (option.enum) {
        message += `\n   Options: ${option.enum.join(', ')}`;
      } else if (option.type) {
        message += ` - ${option.type}`;
      }
    }
    
    message += '\n';
  });

  message += '\n';
  
  if (currentPath.length > 0) {
    message += `Type a number to select an option, or type **'back'** to go back.`;
  } else {
    message += `Type a number to explore that section.`;
  }

  // Build sections data for the current level
  const sections: SchemaPresenterResponse['sections'] = [];
  if (currentSchema.properties) {
    const currentSection = {
      name: currentPath.length > 0 ? currentPath[currentPath.length - 1] : 'root',
      properties: availableOptions
        .filter(opt => !opt.isSection)
        .map(opt => ({
          path: [...currentPath, opt.path].join('.'),
          title: opt.label,
          type: opt.type || 'string',
          options: opt.enum,
          currentValue: opt.currentValue
        }))
    };
    
    if (currentSection.properties.length > 0) {
      sections.push(currentSection);
    }
  }

  return {
    message,
    sections,
    navigationState: {
      currentPath,
      availableOptions: availableOptions.map(opt => ({
        index: opt.index,
        label: opt.label,
        path: opt.path,
        isSection: opt.isSection
      }))
    }
  };
} 
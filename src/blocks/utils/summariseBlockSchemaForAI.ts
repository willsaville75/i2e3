/**
 * Options for schema summarization
 */
export interface SummariseSchemaOptions {
  /** Include AI hints in the summary */
  includeHints?: boolean;
  /** Maximum depth to traverse nested objects */
  maxDepth?: number;
  /** Include default values in the summary */
  includeDefaults?: boolean;
  /** Include enum values in the summary */
  includeEnums?: boolean;
}

/**
 * Recursively processes schema properties to extract field information
 */
function processSchemaProperties(
  properties: any,
  path: string = '',
  depth: number = 0,
  maxDepth: number = 10,
  options: { includeDefaults: boolean; includeEnums: boolean } = { includeDefaults: true, includeEnums: true }
): string[] {
  if (!properties || typeof properties !== 'object' || depth >= maxDepth) {
    return [];
  }

  const fields: string[] = [];

  for (const [key, value] of Object.entries(properties)) {
    if (!value || typeof value !== 'object') continue;

    const currentPath = path ? `${path}.${key}` : key;
    const fieldInfo = value as any;

    if (fieldInfo.type === 'object' && fieldInfo.properties) {
      // Always add the object field to show it exists
      let objectDescription = `- ${currentPath}: object`;
      if (fieldInfo.title) {
        objectDescription += ` (${fieldInfo.title})`;
      }
      if (fieldInfo.description) {
        objectDescription += ` - ${fieldInfo.description}`;
      }
      fields.push(objectDescription);
      
      // Recursively process nested objects
      const nestedFields = processSchemaProperties(
        fieldInfo.properties,
        currentPath,
        depth + 1,
        maxDepth,
        options
      );
      fields.push(...nestedFields);
    } else if (fieldInfo.type === 'array') {
      // Handle arrays more clearly
      let arrayDescription = `- ${currentPath}: array`;
      
      // Add title if available
      if (fieldInfo.title) {
        arrayDescription += ` (${fieldInfo.title})`;
      }
      
      // Add description if available
      if (fieldInfo.description) {
        arrayDescription += ` - ${fieldInfo.description}`;
      }
      
      fields.push(arrayDescription);
      
      // If array has object items with properties, show the structure
      if (fieldInfo.items?.type === 'object' && fieldInfo.items.properties) {
        fields.push(`  Each ${key} item has:`);
        const itemFields = processSchemaProperties(
          fieldInfo.items.properties,
          `${currentPath}[]`,  // Use proper path notation for array items
          depth + 1,
          maxDepth,
          options
        );
        // Don't add extra indentation, the path already includes it
        fields.push(...itemFields.map(field => `  ${field}`));
      } else if (fieldInfo.items?.type) {
        fields.push(`  - Each item is: ${fieldInfo.items.type}`);
      }
    } else if (fieldInfo.type) {
      // Process leaf field
      fields.push(formatFieldInfo(currentPath, fieldInfo, options));
    }
  }

  return fields;
}

/**
 * Formats individual field information
 */
function formatFieldInfo(path: string, fieldInfo: any, options: { includeDefaults: boolean; includeEnums: boolean }): string {
  let result = `- ${path}: ${fieldInfo.type}`;

  // Add enum values
  if (options.includeEnums && fieldInfo.enum && Array.isArray(fieldInfo.enum)) {
    if (fieldInfo.enum.length <= 6) {
      result += ` (enum: ${fieldInfo.enum.join(', ')})`;
    } else {
      result += ` (enum: ${fieldInfo.enum.slice(0, 6).join(', ')}, ...)`;
    }
  }

  // Add default value
  if (options.includeDefaults && fieldInfo.default !== undefined) {
    const defaultValue = typeof fieldInfo.default === 'string' 
      ? `"${fieldInfo.default}"` 
      : fieldInfo.default;
    result += ` (default: ${defaultValue})`;
  }

  // Add description if available
  if (fieldInfo.description) {
    result += ` - ${fieldInfo.description}`;
  }

  return result;
}

/**
 * Extracts hints from AI metadata
 */
function extractHints(schema: any): string[] {
  const hints: string[] = [];

  if (schema.layoutGuidance) {
    if (schema.layoutGuidance.structure?.recommended) {
      hints.push(`- Recommended layout: ${schema.layoutGuidance.structure.recommended}`);
    }
    
    if (schema.layoutGuidance.typography?.hierarchy) {
      const hierarchy = schema.layoutGuidance.typography.hierarchy;
      const hierarchyEntries = Object.entries(hierarchy);
      if (hierarchyEntries.length > 0) {
        hints.push(`- Typography hierarchy: ${hierarchyEntries.map(([key, value]) => `${key} (${value})`).join(', ')}`);
      }
    }
  }

  if (schema.contentHints) {
    const contentHints = Object.entries(schema.contentHints);
    for (const [element, hints_data] of contentHints) {
      const hintsData = hints_data as any;
      if (hintsData.lengthGuideline) {
        hints.push(`- ${element} length: ${hintsData.lengthGuideline}`);
      }
      if (hintsData.characteristics && Array.isArray(hintsData.characteristics)) {
        hints.push(`- ${element} style: ${hintsData.characteristics.join(', ')}`);
      }
    }
  }

  return hints;
}

/**
 * Generates a simple example JSON structure from schema properties
 */
function generateExampleStructure(properties: any, depth: number = 0): string {
  if (!properties || typeof properties !== 'object' || depth > 3) {
    return '{}';
  }

  const indent = '  '.repeat(depth);
  const lines: string[] = ['{'];

  const entries = Object.entries(properties);
  entries.forEach(([key, value], index) => {
    const fieldInfo = value as any;
    const isLast = index === entries.length - 1;
    const comma = isLast ? '' : ',';

    if (fieldInfo.type === 'object' && fieldInfo.properties) {
      lines.push(`${indent}  "${key}": ${generateExampleStructure(fieldInfo.properties, depth + 1)}${comma}`);
    } else if (fieldInfo.type === 'array') {
      if (fieldInfo.items?.properties) {
        // Array of objects
        lines.push(`${indent}  "${key}": [`);
        lines.push(`${indent}    ${generateExampleStructure(fieldInfo.items.properties, depth + 2)}`);
        lines.push(`${indent}  ]${comma}`);
      } else {
        // Simple array
        lines.push(`${indent}  "${key}": []${comma}`);
      }
    } else if (fieldInfo.type === 'string') {
      const example = fieldInfo.default || (fieldInfo.enum ? fieldInfo.enum[0] : "...");
      lines.push(`${indent}  "${key}": "${example}"${comma}`);
    } else if (fieldInfo.type === 'number') {
      const example = fieldInfo.default || (fieldInfo.enum ? fieldInfo.enum[0] : 0);
      lines.push(`${indent}  "${key}": ${example}${comma}`);
    } else if (fieldInfo.type === 'boolean') {
      const example = fieldInfo.default || false;
      lines.push(`${indent}  "${key}": ${example}${comma}`);
    } else {
      lines.push(`${indent}  "${key}": null${comma}`);
    }
  });

  lines.push(`${indent}}`);
  return lines.join('\n');
}

/**
 * Summarizes a block schema for AI consumption
 * 
 * @param schema - The block schema object to summarize
 * @param opts - Optional configuration for the summary
 * @returns A clean string summary of the schema
 */
export function summariseBlockSchemaForAI(
  schema: any,
  opts: SummariseSchemaOptions = {}
): string {
  const {
    includeHints = false,
    maxDepth = 10,
    includeDefaults = true,
    includeEnums = true
  } = opts;

  if (!schema || typeof schema !== 'object') {
    return 'Invalid schema provided';
  }

  const lines: string[] = [];

  // Add title
  if (schema.title) {
    lines.push(`**${schema.title}**`);
  } else if (schema.id) {
    lines.push(`**${schema.id}**`);
  } else {
    lines.push('**Block Schema**');
  }

  // Add description
  if (schema.description) {
    lines.push(`${schema.description}`);
    lines.push(''); // Empty line for spacing
  }

  // Process properties
  if (schema.properties) {
    
    const fields = processSchemaProperties(schema.properties, '', 0, maxDepth, { includeDefaults, includeEnums });
    
    if (fields.length > 0) {
      lines.push(...fields);
    } else {
      lines.push('- No configurable properties');
    }
  } else {
    lines.push('- No properties defined');
  }

  // Add hints if requested
  if (includeHints) {
    const hints = extractHints(schema);
    if (hints.length > 0) {
      lines.push(''); // Empty line for spacing
      lines.push('**AI Hints:**');
      lines.push(...hints);
    }
  }

  // Add example structure
  lines.push('');
  lines.push('**Expected JSON Structure:**');
  const exampleStructure = generateExampleStructure(schema.properties);
  lines.push(exampleStructure);
  
  return lines.join('\n');
}

/**
 * Summarizes design tokens for AI consumption
 * 
 * @param tokens - The tokens object to summarize
 * @returns A clean string summary of available tokens
 */
export function summariseTokensForAI(tokens: any): string {
  if (!tokens || typeof tokens !== 'object') {
    return 'No tokens available';
  }

  const lines: string[] = ['**Available Tokens:**'];

  // Process colors
  if (tokens.colors && Array.isArray(tokens.colors)) {
    if (tokens.colors.length <= 10) {
      lines.push(`- Colors: ${tokens.colors.join(', ')}`);
    } else {
      lines.push(`- Colors: ${tokens.colors.slice(0, 10).join(', ')}, ... (${tokens.colors.length} total)`);
    }
  }

  // Process spacing
  if (tokens.spacing && Array.isArray(tokens.spacing)) {
    if (tokens.spacing.length <= 10) {
      lines.push(`- Spacing: ${tokens.spacing.join(', ')}`);
    } else {
      lines.push(`- Spacing: ${tokens.spacing.slice(0, 10).join(', ')}, ... (${tokens.spacing.length} total)`);
    }
  }

  // Process gradient directions
  if (tokens.gradientDirections && Array.isArray(tokens.gradientDirections)) {
    lines.push(`- Gradient Directions: ${tokens.gradientDirections.join(', ')}`);
  }

  // Process any other token categories
  const processedKeys = new Set(['colors', 'spacing', 'gradientDirections']);
  for (const [key, value] of Object.entries(tokens)) {
    if (processedKeys.has(key)) continue;

    if (Array.isArray(value)) {
      if (value.length <= 8) {
        lines.push(`- ${key}: ${value.join(', ')}`);
      } else {
        lines.push(`- ${key}: ${value.slice(0, 8).join(', ')}, ... (${value.length} total)`);
      }
    } else if (typeof value === 'object' && value !== null) {
      const subKeys = Object.keys(value);
      if (subKeys.length <= 5) {
        lines.push(`- ${key}: ${subKeys.join(', ')}`);
      } else {
        lines.push(`- ${key}: ${subKeys.slice(0, 5).join(', ')}, ... (${subKeys.length} total)`);
      }
    }
  }

  if (lines.length === 1) {
    lines.push('- No tokens available');
  }

  return lines.join('\n');
} 
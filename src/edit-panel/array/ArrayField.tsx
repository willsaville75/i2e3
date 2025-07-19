import React, { useState } from 'react';
import { ArrayItem } from './ArrayItem';
import { ArrayAddButton } from './ArrayAddButton';
import { FieldConfig } from '../fieldRenderers';

interface ArrayFieldProps {
  label: string;
  value: any[];
  onChange: (value: any[]) => void;
  fieldConfig: FieldConfig;
  path: string[];
}

export const ArrayField: React.FC<ArrayFieldProps> = ({
  label,
  value = [],
  onChange,
  fieldConfig,
  path
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const handleAddItem = () => {
    // Create a new item based on the schema
    const newItem = createDefaultItem(fieldConfig);
    onChange([...value, newItem]);
    // Auto-expand the new item
    setExpandedItems(new Set([...expandedItems, value.length]));
  };

  const handleUpdateItem = (index: number, updatedItem: any) => {
    const newValue = [...value];
    newValue[index] = updatedItem;
    onChange(newValue);
  };

  const handleDeleteItem = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
    // Update expanded items
    const newExpanded = new Set<number>();
    expandedItems.forEach(i => {
      if (i < index) newExpanded.add(i);
      else if (i > index) newExpanded.add(i - 1);
    });
    setExpandedItems(newExpanded);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === value.length - 1)
    ) {
      return;
    }

    const newValue = [...value];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newValue[index], newValue[newIndex]] = [newValue[newIndex], newValue[index]];
    onChange(newValue);

    // Update expanded items to follow the moved item
    const newExpanded = new Set<number>();
    expandedItems.forEach(i => {
      if (i === index) newExpanded.add(newIndex);
      else if (i === newIndex) newExpanded.add(index);
      else newExpanded.add(i);
    });
    setExpandedItems(newExpanded);
  };

  const toggleItemExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs text-gray-500">{value.length} items</span>
      </div>

      <div className="space-y-2">
        {value.map((item, index) => (
          <ArrayItem
            key={`${path.join('.')}-${index}`}
            item={item}
            index={index}
            isExpanded={expandedItems.has(index)}
            onToggleExpanded={() => toggleItemExpanded(index)}
            onUpdate={(updatedItem) => handleUpdateItem(index, updatedItem)}
            onDelete={() => handleDeleteItem(index)}
            onMove={(direction) => handleMoveItem(index, direction)}
            canMoveUp={index > 0}
            canMoveDown={index < value.length - 1}
            fieldConfig={fieldConfig}
            path={[...path, index.toString()]}
          />
        ))}
      </div>

      <ArrayAddButton onClick={handleAddItem} label={`Add ${fieldConfig.itemLabel || 'Item'}`} />
    </div>
  );
};

// Helper function to create default item based on schema
function createDefaultItem(fieldConfig: FieldConfig): any {
  if (fieldConfig.itemSchema) {
    const item: any = {};
    
    // For grid cards, we need the specific structure
    if (fieldConfig.itemType === 'card') {
      return {
        id: `card-${Date.now()}`,
        elements: {
          title: { content: 'New Card Title' },
          subtitle: { content: 'Card subtitle' },
          description: { content: 'Card description' },
          avatar: { src: '', alt: 'Avatar' },
          image: { src: '', alt: 'Card image' },
          primaryAction: {
            text: 'Learn More',
            href: '#',
            variant: 'primary',
            size: 'md'
          }
        },
        layout: {
          cardType: 'custom',
          padding: 'md',
          alignment: 'left'
        },
        appearance: {
          shadow: 'md',
          borderRadius: 'md',
          borderWidth: 'none',
          borderColor: 'gray'
        },
        background: {
          type: 'color',
          color: 'white',
          colorIntensity: 'light'
        }
      };
    }

    // Generic object creation
    Object.entries(fieldConfig.itemSchema).forEach(([key, config]: [string, any]) => {
      if (config.defaultValue !== undefined) {
        item[key] = config.defaultValue;
      } else if (config.type === 'string') {
        item[key] = '';
      } else if (config.type === 'number') {
        item[key] = 0;
      } else if (config.type === 'boolean') {
        item[key] = false;
      } else if (config.type === 'object') {
        item[key] = {};
      }
    });
    
    return item;
  }
  
  return {};
} 
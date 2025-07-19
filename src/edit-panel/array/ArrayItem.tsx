import React from 'react';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ArrayItemControls } from './ArrayItemControls';
import { FormSection } from '../FormSection';

interface ArrayItemProps {
  item: any;
  index: number;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onUpdate: (updatedItem: any) => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  fieldConfig: any;
  path: string[];
}

export const ArrayItem: React.FC<ArrayItemProps> = ({
  item,
  index,
  isExpanded,
  onToggleExpanded,
  onUpdate,
  onDelete,
  onMove,
  canMoveUp,
  canMoveDown,
  fieldConfig,
  path
}) => {
  const getItemTitle = () => {
    // Try to get a meaningful title from the item
    if (fieldConfig.itemType === 'card' && item.elements?.title?.content) {
      return item.elements.title.content;
    }
    if (item.title) return item.title;
    if (item.name) return item.name;
    return `${fieldConfig.itemLabel || 'Item'} ${index + 1}`;
  };

  const handleFieldChange = (fieldPath: string[], value: any) => {
    // Update nested field in the item
    const updatedItem = { ...item };
    let current = updatedItem;
    
    for (let i = 0; i < fieldPath.length - 1; i++) {
      if (!current[fieldPath[i]]) {
        current[fieldPath[i]] = {};
      }
      current = current[fieldPath[i]];
    }
    
    current[fieldPath[fieldPath.length - 1]] = value;
    onUpdate(updatedItem);
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between p-3 cursor-pointer" onClick={onToggleExpanded}>
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronDownIcon className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronUpIcon className="w-4 h-4 text-gray-500" />
          )}
          <span className="text-sm font-medium text-gray-700">{getItemTitle()}</span>
        </div>
        
        <ArrayItemControls
          onDelete={onDelete}
          onMoveUp={canMoveUp ? () => onMove('up') : undefined}
          onMoveDown={canMoveDown ? () => onMove('down') : undefined}
        />
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-100">
          {fieldConfig.itemType === 'card' ? (
            // Special rendering for card items
            <div className="space-y-4 mt-3">
              {/* Elements section */}
              <div>
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Content</h4>
                <div className="space-y-3">
                  <FormSection
                    fields={[
                      {
                        key: 'elements.title.content',
                        label: 'Title',
                        type: 'string',
                        value: item.elements?.title?.content || '',
                        onChange: (value) => handleFieldChange(['elements', 'title', 'content'], value)
                      },
                      {
                        key: 'elements.subtitle.content',
                        label: 'Subtitle',
                        type: 'string',
                        value: item.elements?.subtitle?.content || '',
                        onChange: (value) => handleFieldChange(['elements', 'subtitle', 'content'], value)
                      },
                      {
                        key: 'elements.description.content',
                        label: 'Description',
                        type: 'textarea',
                        value: item.elements?.description?.content || '',
                        onChange: (value) => handleFieldChange(['elements', 'description', 'content'], value)
                      }
                    ]}
                    path={path}
                    blockData={item}
                    onChange={() => {}}
                  />
                </div>
              </div>

              {/* Media section */}
              <div>
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Media</h4>
                <div className="space-y-3">
                  {/* Avatar fields */}
                  <h5 className="text-xs font-medium text-gray-500">Avatar</h5>
                  <FormSection
                    fields={[
                      {
                        key: 'elements.avatar.src',
                        label: 'Avatar URL',
                        type: 'string',
                        value: item.elements?.avatar?.src || '',
                        onChange: (value) => handleFieldChange(['elements', 'avatar', 'src'], value)
                      },
                      {
                        key: 'elements.avatar.alt',
                        label: 'Avatar Alt Text',
                        type: 'string',
                        value: item.elements?.avatar?.alt || '',
                        onChange: (value) => handleFieldChange(['elements', 'avatar', 'alt'], value)
                      }
                    ]}
                    path={path}
                    blockData={item}
                    onChange={() => {}}
                  />
                  
                  {/* Image fields */}
                  <h5 className="text-xs font-medium text-gray-500 mt-3">Image</h5>
                  <FormSection
                    fields={[
                      {
                        key: 'elements.image.src',
                        label: 'Image URL',
                        type: 'string',
                        value: item.elements?.image?.src || '',
                        onChange: (value) => handleFieldChange(['elements', 'image', 'src'], value)
                      },
                      {
                        key: 'elements.image.alt',
                        label: 'Image Alt Text',
                        type: 'string',
                        value: item.elements?.image?.alt || '',
                        onChange: (value) => handleFieldChange(['elements', 'image', 'alt'], value)
                      }
                    ]}
                    path={path}
                    blockData={item}
                    onChange={() => {}}
                  />
                </div>
              </div>

              {/* Actions section */}
              <div>
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Actions</h4>
                <div className="space-y-3">
                  {/* Primary Action */}
                  <h5 className="text-xs font-medium text-gray-500">Primary Action</h5>
                  <FormSection
                    fields={[
                      {
                        key: 'elements.primaryAction.text',
                        label: 'Button Text',
                        type: 'string',
                        value: item.elements?.primaryAction?.text || '',
                        onChange: (value) => handleFieldChange(['elements', 'primaryAction', 'text'], value)
                      },
                      {
                        key: 'elements.primaryAction.href',
                        label: 'Button Link',
                        type: 'string',
                        value: item.elements?.primaryAction?.href || '',
                        onChange: (value) => handleFieldChange(['elements', 'primaryAction', 'href'], value)
                      },
                      {
                        key: 'elements.primaryAction.variant',
                        label: 'Button Style',
                        type: 'select',
                        value: item.elements?.primaryAction?.variant || 'primary',
                        options: [
                          { value: 'primary', label: 'Primary' },
                          { value: 'secondary', label: 'Secondary' },
                          { value: 'outline', label: 'Outline' }
                        ],
                        onChange: (value) => handleFieldChange(['elements', 'primaryAction', 'variant'], value)
                      }
                    ]}
                    path={path}
                    blockData={item}
                    onChange={() => {}}
                  />
                </div>
              </div>

              {/* Layout section */}
              <div>
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Layout</h4>
                <div className="space-y-3">
                  <FormSection
                    fields={[
                      {
                        key: 'layout.cardType',
                        label: 'Card Type',
                        type: 'select',
                        value: item.layout?.cardType || 'custom',
                        options: [
                          { value: 'custom', label: 'Custom' },
                          { value: 'profile', label: 'Profile' },
                          { value: 'feature', label: 'Feature' },
                          { value: 'stat', label: 'Statistic' }
                        ],
                        onChange: (value) => handleFieldChange(['layout', 'cardType'], value)
                      },
                      {
                        key: 'layout.alignment',
                        label: 'Alignment',
                        type: 'select',
                        value: item.layout?.alignment || 'left',
                        options: [
                          { value: 'left', label: 'Left' },
                          { value: 'center', label: 'Center' },
                          { value: 'right', label: 'Right' }
                        ],
                        onChange: (value) => handleFieldChange(['layout', 'alignment'], value)
                      },
                      {
                        key: 'layout.padding',
                        label: 'Padding',
                        type: 'select',
                        value: item.layout?.padding || 'md',
                        options: [
                          { value: 'none', label: 'None' },
                          { value: 'sm', label: 'Small' },
                          { value: 'md', label: 'Medium' },
                          { value: 'lg', label: 'Large' },
                          { value: 'xl', label: 'Extra Large' }
                        ],
                        onChange: (value) => handleFieldChange(['layout', 'padding'], value)
                      }
                    ]}
                    path={path}
                    blockData={item}
                    onChange={() => {}}
                  />
                </div>
              </div>

              {/* Appearance section */}
              <div>
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Appearance</h4>
                <div className="space-y-3">
                  <FormSection
                    fields={[
                      {
                        key: 'appearance.shadow',
                        label: 'Shadow',
                        type: 'select',
                        value: item.appearance?.shadow || 'md',
                        options: [
                          { value: 'none', label: 'None' },
                          { value: 'sm', label: 'Small' },
                          { value: 'md', label: 'Medium' },
                          { value: 'lg', label: 'Large' },
                          { value: 'xl', label: 'Extra Large' }
                        ],
                        onChange: (value) => handleFieldChange(['appearance', 'shadow'], value)
                      },
                      {
                        key: 'appearance.borderRadius',
                        label: 'Border Radius',
                        type: 'select',
                        value: item.appearance?.borderRadius || 'md',
                        options: [
                          { value: 'none', label: 'None' },
                          { value: 'sm', label: 'Small' },
                          { value: 'md', label: 'Medium' },
                          { value: 'lg', label: 'Large' },
                          { value: 'xl', label: 'Extra Large' },
                          { value: 'full', label: 'Full' }
                        ],
                        onChange: (value) => handleFieldChange(['appearance', 'borderRadius'], value)
                      },
                      {
                        key: 'appearance.borderWidth',
                        label: 'Border Width',
                        type: 'select',
                        value: item.appearance?.borderWidth || 'none',
                        options: [
                          { value: 'none', label: 'None' },
                          { value: 'thin', label: 'Thin' },
                          { value: 'medium', label: 'Medium' },
                          { value: 'thick', label: 'Thick' }
                        ],
                        onChange: (value) => handleFieldChange(['appearance', 'borderWidth'], value)
                      }
                    ]}
                    path={path}
                    blockData={item}
                    onChange={() => {}}
                  />
                </div>
              </div>

              {/* Background section */}
              <div>
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Background</h4>
                <div className="space-y-3">
                  <FormSection
                    fields={[
                      {
                        key: 'background.type',
                        label: 'Background Type',
                        type: 'select',
                        value: item.background?.type || 'color',
                        options: [
                          { value: 'color', label: 'Solid Color' },
                          { value: 'gradient', label: 'Gradient' },
                          { value: 'image', label: 'Image' }
                        ],
                        onChange: (value) => handleFieldChange(['background', 'type'], value)
                      },
                      {
                        key: 'background.color',
                        label: 'Color',
                        type: 'select',
                        value: item.background?.color || 'white',
                        options: [
                          { value: 'white', label: 'White' },
                          { value: 'gray', label: 'Gray' },
                          { value: 'blue', label: 'Blue' },
                          { value: 'green', label: 'Green' },
                          { value: 'red', label: 'Red' },
                          { value: 'yellow', label: 'Yellow' },
                          { value: 'purple', label: 'Purple' }
                        ],
                        onChange: (value) => handleFieldChange(['background', 'color'], value)
                      }
                    ]}
                    path={path}
                    blockData={item}
                    onChange={() => {}}
                  />
                </div>
              </div>
            </div>
          ) : (
            // Generic rendering for other array items
            <div className="mt-3">
              <FormSection
                fields={Object.entries(fieldConfig.itemSchema || {}).map(([key, config]: [string, any]) => ({
                  key,
                  label: config.label || key,
                  type: config.type,
                  value: item[key],
                  options: config.options,
                  onChange: (value) => handleFieldChange([key], value)
                }))}
                path={path}
                blockData={item}
                onChange={() => {}}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 
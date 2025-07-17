import React, { useState } from 'react';

interface FormFieldProps {
  path: string;
  property: any;
  value: any;
  onChange: (path: string, value: any) => void;
  level?: number;
  inSection?: boolean;
}

// Updated FormField component with reduced indentation for sections
export const FormField: React.FC<FormFieldProps> = ({ 
  path, 
  property, 
  value, 
  onChange, 
  level = 0, 
  inSection = false 
}) => {
  // Reduce indentation when inside a section
  const indent = inSection ? level * 8 : level * 12;
  
  if (!property) return null;

  const handleChange = (newValue: any) => {
    onChange(path, newValue);
  };

  // String fields
  if (property.type === 'string') {
    if (property.enum) {
      // Enum string -> select
      return (
        <div className="space-y-1" style={{ marginLeft: `${indent}px` }}>
          <label className="block text-xs font-medium text-gray-700">
            {property.title || path}
          </label>
          {property.description && (
            <p className="text-xs text-gray-500">{property.description}</p>
          )}
          <select
            value={value !== undefined ? value : (property.default || '')}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {property.enum.map((option: any) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    } else {
      // Regular string -> text input or textarea
      const isLongText = property.maxLength && property.maxLength > 100;
      return (
        <div className="space-y-1" style={{ marginLeft: `${indent}px` }}>
          <label className="block text-xs font-medium text-gray-700">
            {property.title || path}
          </label>
          {property.description && (
            <p className="text-xs text-gray-500">{property.description}</p>
          )}
          {isLongText ? (
            <textarea
              value={value !== undefined ? value : (property.default || '')}
              onChange={(e) => handleChange(e.target.value)}
              rows={3}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          ) : (
                      <input
            type="text"
            value={value !== undefined ? value : (property.default || '')}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          )}
        </div>
      );
    }
  }

  // Number fields
  if (property.type === 'number') {
    if (property.enum) {
      // Enum number -> select
      return (
        <div className="space-y-1" style={{ marginLeft: `${indent}px` }}>
          <label className="block text-xs font-medium text-gray-700">
            {property.title || path}
          </label>
          {property.description && (
            <p className="text-xs text-gray-500">{property.description}</p>
          )}
          <select
            value={value !== undefined ? value : (property.default || '')}
            onChange={(e) => handleChange(parseInt(e.target.value))}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {property.enum.map((option: number) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    } else {
      // Regular number -> number input
      return (
        <div className="space-y-1" style={{ marginLeft: `${indent}px` }}>
          <label className="block text-xs font-medium text-gray-700">
            {property.title || path}
          </label>
          {property.description && (
            <p className="text-xs text-gray-500">{property.description}</p>
          )}
          <input
            type="number"
            value={value !== undefined ? value : (property.default || '')}
            onChange={(e) => handleChange(parseInt(e.target.value))}
            min={property.minimum}
            max={property.maximum}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      );
    }
  }

  // Boolean fields
  if (property.type === 'boolean') {
    return (
      <div className="space-y-1" style={{ marginLeft: `${indent}px` }}>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={value !== undefined ? value : property.default || false}
            onChange={(e) => handleChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            {property.title || path}
          </span>
        </label>
        {property.description && (
          <p className="text-xs text-gray-500 ml-7">{property.description}</p>
        )}
      </div>
    );
  }

  // Object fields - only show collapsible if not in a section (to avoid double nesting)
  if (property.type === 'object' && property.properties) {
    if (inSection || level > 0) {
      // For nested objects or objects already in sections, show inline
      return (
        <div className="space-y-3" style={{ marginLeft: `${indent}px` }}>
          <div className="text-xs font-medium text-gray-700 border-b border-gray-200 pb-1">
            {property.title || path}
          </div>
          {property.description && (
            <p className="text-xs text-gray-500 -mt-2">{property.description}</p>
          )}
          {Object.entries(property.properties).map(([key, subProperty]) => (
            <FormField
              key={key}
              path={`${path}.${key}`}
              property={subProperty}
              value={value?.[key]}
              onChange={onChange}
              level={level + 1}
              inSection={inSection}
            />
          ))}
        </div>
      );
    } else {
      // Top-level objects become collapsible sections
      const [isExpanded, setIsExpanded] = useState(false);
      
      return (
        <div className="space-y-2" style={{ marginLeft: `${indent}px` }}>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>{property.title || path}</span>
          </button>
          {property.description && (
            <p className="text-xs text-gray-500">{property.description}</p>
          )}
          
          {isExpanded && (
            <div className="space-y-3 border-l-2 border-gray-200 pl-4">
              {Object.entries(property.properties).map(([key, subProperty]) => (
                <FormField
                  key={key}
                  path={`${path}.${key}`}
                  property={subProperty}
                  value={value?.[key]}
                  onChange={onChange}
                  level={level + 1}
                  inSection={inSection}
                />
              ))}
            </div>
          )}
        </div>
      );
    }
  }

  // Array fields
  if (property.type === 'array' && property.items) {
    const arrayValue = value || [];
    
    const handleArrayChange = (index: number, newValue: any) => {
      const newArray = [...arrayValue];
      newArray[index] = newValue;
      handleChange(newArray);
    };

    const handleAddItem = () => {
      const defaultValue = property.items.default || 
        (property.items.type === 'string' ? '' : 
         property.items.type === 'number' ? 0 : 
         property.items.type === 'boolean' ? false : 
         property.items.type === 'object' ? {} : null);
      handleChange([...arrayValue, defaultValue]);
    };

    const handleRemoveItem = (index: number) => {
      const newArray = arrayValue.filter((_: any, i: number) => i !== index);
      handleChange(newArray);
    };

    const handleMoveUp = (index: number) => {
      if (index === 0) return;
      const newArray = [...arrayValue];
      [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]];
      handleChange(newArray);
    };

    const handleMoveDown = (index: number) => {
      if (index === arrayValue.length - 1) return;
      const newArray = [...arrayValue];
      [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
      handleChange(newArray);
    };

    return (
      <div className="space-y-3" style={{ marginLeft: `${indent}px` }}>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            {property.title || path}
            {arrayValue.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">({arrayValue.length} items)</span>
            )}
          </label>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors"
          >
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Item
          </button>
        </div>
        {property.description && (
          <p className="text-xs text-gray-500">{property.description}</p>
        )}
        
        {arrayValue.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-md">
            <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm text-gray-500">No items yet</p>
            <p className="text-xs text-gray-400">Click "Add Item" to create the first item</p>
          </div>
        ) : (
          <div className="space-y-2">
            {arrayValue.map((item: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-md bg-white">
                {/* Item Header with Controls */}
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-600">
                      Item {index + 1}
                    </span>
                    {property.items.type === 'object' && property.items.properties && (
                      <span className="text-xs text-gray-500">
                        ({Object.keys(property.items.properties).length} fields)
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {/* Move Up Button */}
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    
                    {/* Move Down Button */}
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === arrayValue.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Delete item"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Item Content */}
                <div className="p-3">
                  <FormField
                    path={`${path}[${index}]`}
                    property={property.items}
                    value={item}
                    onChange={(_, newValue) => handleArrayChange(index, newValue)}
                    level={level + 1}
                    inSection={inSection}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Fallback for unknown types
  return (
    <div className="space-y-1" style={{ marginLeft: `${indent}px` }}>
      <label className="block text-xs font-medium text-gray-700">
        {property.title || path} (unknown type: {property.type})
      </label>
      <input
        type="text"
        value={JSON.stringify(value !== undefined ? value : (property.default || ''))}
        onChange={(e) => {
          try {
            handleChange(JSON.parse(e.target.value));
          } catch {
            handleChange(e.target.value);
          }
        }}
        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}; 
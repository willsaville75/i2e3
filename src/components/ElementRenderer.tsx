import React from 'react';
import { ElementInstance } from '../elements/types';
import { elementRegistry } from '../elements/registry';

interface ElementRendererProps {
  element: ElementInstance;
  className?: string;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({ 
  element, 
  className = '' 
}) => {
  if (!element || !element.type || !element.props) {
    return null;
  }

  const elementDefinition = elementRegistry[element.type];
  
  if (!elementDefinition) {
    return null;
  }

  const Component = elementDefinition.component;

  const mergedProps = {
    ...element.props,
    className: `${element.props.className || ''} ${className}`.trim()
  };

  return <Component {...mergedProps} />;
};

export default ElementRenderer; 
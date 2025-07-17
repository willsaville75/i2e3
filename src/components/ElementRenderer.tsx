import React from 'react';
import { ElementInstance } from '../../elements/types';

// Import elements directly for now (until we can properly import the registry)
import { Title } from '../../elements/title/title.component';
import { Text } from '../../elements/text/text.component';
import { Button } from '../../elements/button/button.component';

interface ElementRendererProps {
  element: ElementInstance;
  className?: string;
}

// Element registry mapping (temporary until we can import the full registry)
const elementComponents = {
  title: Title,
  text: Text,
  button: Button,
  // Add more elements as needed
};

export const ElementRenderer: React.FC<ElementRendererProps> = ({ 
  element, 
  className = '' 
}) => {
  if (!element || !element.type || !element.props) {
    return null;
  }

  const Component = elementComponents[element.type as keyof typeof elementComponents];
  
  if (!Component) {
    console.warn(`Element type "${element.type}" not found in registry`);
    return <div className={className}>Unknown element: {element.type}</div>;
  }

  // Merge className props properly
  const mergedProps = {
    ...element.props,
    className: `${element.props.className || ''} ${className}`.trim()
  };

  return <Component {...(mergedProps as any)} />;
};

export default ElementRenderer; 
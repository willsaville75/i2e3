import React from 'react';

export interface ElementDefinition {
  type: string;
  name: string;
  description: string;
  component: React.ComponentType<any>;
  schema: any;
  defaultProps: Record<string, any>;
}

export interface ElementRegistry {
  [key: string]: ElementDefinition;
}

export interface ElementProps {
  [key: string]: any;
}

export interface ElementInstance {
  type: string;
  props: ElementProps;
} 
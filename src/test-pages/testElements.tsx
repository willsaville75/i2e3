import React from 'react';
import { ElementRenderer } from '../components/ElementRenderer';
import { ElementInstance } from '../../elements/types';

export function TestElementsPage() {
  // Test elements with different configurations
  const testElements: ElementInstance[] = [
    {
      type: 'title',
      props: {
        content: 'Title Element Test',
        level: 1,
        size: '4xl',
        weight: 'bold',
        color: 'text-blue-600',
        align: 'center'
      }
    },
    {
      type: 'title',
      props: {
        content: 'Subtitle Element Test',
        level: 2,
        size: '2xl',
        weight: 'medium',
        color: 'text-gray-700',
        align: 'center'
      }
    },
    {
      type: 'text',
      props: {
        content: 'This is a text element test with various styling options.',
        size: 'lg',
        weight: 'normal',
        color: 'text-gray-600',
        align: 'center',
        className: 'mb-4'
      }
    },
    {
      type: 'text',
      props: {
        content: 'This text has different styling to show versatility.',
        size: 'base',
        weight: 'medium',
        color: 'text-green-600',
        align: 'left',
        className: 'mb-6'
      }
    },
    {
      type: 'button',
      props: {
        text: 'Primary Button',
        href: '#primary',
        variant: 'primary',
        size: 'lg',
        className: 'mr-4 mb-4'
      }
    },
    {
      type: 'button',
      props: {
        text: 'Secondary Button',
        href: '#secondary',
        variant: 'secondary',
        size: 'md',
        className: 'mr-4 mb-4'
      }
    },
    {
      type: 'button',
      props: {
        text: 'Outline Button',
        href: '#outline',
        variant: 'outline',
        size: 'sm',
        className: 'mb-4'
      }
    }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Elements Registry Test</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Individual Element Tests</h2>
        
        <div className="space-y-6">
          {testElements.map((element, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-4">
              <div className="text-sm text-gray-500 mb-2">
                Element Type: <code className="bg-gray-100 px-2 py-1 rounded">{element.type}</code>
              </div>
              <ElementRenderer element={element} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Hero Block Simulation</h2>
        <div className="text-center">
          <ElementRenderer 
            element={{
              type: 'title',
              props: {
                content: 'Welcome to Our Platform',
                level: 1,
                size: '4xl',
                weight: 'extrabold',
                color: 'text-gray-900',
                align: 'center',
                className: 'mb-4'
              }
            }}
          />
          <ElementRenderer 
            element={{
              type: 'text',
              props: {
                content: 'Experience the power of our integrated elements system.',
                size: 'xl',
                weight: 'medium',
                color: 'text-gray-600',
                align: 'center',
                className: 'mb-8'
              }
            }}
          />
          <ElementRenderer 
            element={{
              type: 'button',
              props: {
                text: 'Get Started',
                href: '#get-started',
                variant: 'primary',
                size: 'lg'
              }
            }}
          />
        </div>
      </div>
    </div>
  );
} 
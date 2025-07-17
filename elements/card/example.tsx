import React from 'react';
import { Card } from './component';

// Example usage of the Card component

export const CardExamples = () => {
  return (
    <div className="space-y-6 p-8">
      <h2 className="text-2xl font-bold mb-4">Card Component Examples</h2>
      
      {/* Simple card without sections */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Simple Card</h3>
        <Card>
          This is a simple card with just body content. It uses the default padding.
        </Card>
      </div>

      {/* Card with all three sections */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Card with Header, Body, and Footer</h3>
        <Card
          header={
            <div>
              <h4 className="text-lg font-medium">Card Title</h4>
              <p className="text-sm text-gray-500">Card subtitle or description</p>
            </div>
          }
          footer={
            <div className="flex justify-between items-center">
              <button className="text-sm text-blue-600 hover:text-blue-800">
                Cancel
              </button>
              <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Save
              </button>
            </div>
          }
        >
          <p>This is the main content of the card. It goes in the body section.</p>
          <p className="mt-2">The card automatically adds dividers between sections.</p>
        </Card>
      </div>

      {/* Card with only header and body */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Card with Header and Body</h3>
        <Card
          header={<h4 className="text-lg font-medium">Settings</h4>}
          variant="elevated"
        >
          <div className="space-y-4">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Enable notifications</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Show preview</span>
            </label>
          </div>
        </Card>
      </div>

      {/* Card with custom styling */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Card with Custom Styling</h3>
        <Card
          header={
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium">Custom Styled Card</h4>
              <span className="text-sm text-gray-500">Status: Active</span>
            </div>
          }
          footer={
            <div className="text-center text-sm text-gray-500">
              Last updated: 2 hours ago
            </div>
          }
          variant="outlined"
          hoverable
          headerClassName="bg-gray-50"
          footerClassName="bg-gray-50"
        >
          <p>This card has custom styling applied to the header and footer sections.</p>
        </Card>
      </div>
    </div>
  );
}; 
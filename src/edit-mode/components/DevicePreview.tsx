import React from 'react';
import { DeviceFrame } from './DeviceFrame';

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

interface DevicePreviewProps {
  children: React.ReactNode;
  mode: PreviewMode;
}

export const DevicePreview: React.FC<DevicePreviewProps> = ({ children, mode }) => {
  // Desktop mode - no frame
  if (mode === 'desktop') {
    return (
      <div className="w-full h-full overflow-y-auto">
        {children}
      </div>
    );
  }

  // Mobile and Tablet modes - use DeviceFrame
  return (
    <DeviceFrame device={mode}>
      {children}
    </DeviceFrame>
  );
}; 
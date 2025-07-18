import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileFrame } from './MobileFrame';
import { TabletFrame } from './TabletFrame';

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

interface DevicePreviewProps {
  previewMode: PreviewMode;
  children: React.ReactNode;
  animationDuration: number;
  easingCurve: readonly number[] | string;
}

export const DevicePreview: React.FC<DevicePreviewProps> = ({
  previewMode,
  children,
  animationDuration,
  easingCurve
}) => {
  const renderDeviceFrame = () => {
    switch (previewMode) {
      case 'mobile':
        return <MobileFrame>{children}</MobileFrame>;
      case 'tablet':
        return <TabletFrame>{children}</TabletFrame>;
      case 'desktop':
        return <>{children}</>;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={previewMode}
        className="relative"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{
          duration: animationDuration,
          ease: easingCurve as any
        }}
      >
        {renderDeviceFrame()}
      </motion.div>
    </AnimatePresence>
  );
}; 
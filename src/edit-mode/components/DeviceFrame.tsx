import React from 'react';
import { motion } from 'framer-motion';
import { WifiIcon, SignalIcon } from '@heroicons/react/24/outline';
import { Battery50Icon } from '@heroicons/react/24/solid';

type DeviceType = 'mobile' | 'tablet';

interface DeviceFrameProps {
  children: React.ReactNode;
  device: DeviceType;
}

const deviceConfigs = {
  mobile: {
    width: 'w-[375px]',
    height: 'h-[812px]',
    bgColor: 'bg-gray-900',
    borderRadius: 'rounded-[3rem]',
    padding: 'p-3',
    screenRadius: 'rounded-[2.5rem]',
    statusBarHeight: 'h-11',
    statusBarPadding: 'pt-3',
    contentPadding: 'pt-11 pb-6',
    hasNotch: true,
    hasHomeIndicator: true,
  },
  tablet: {
    width: 'w-[768px]',
    height: 'h-[1024px]',
    bgColor: 'bg-gray-800',
    borderRadius: 'rounded-[2rem]',
    padding: 'p-6',
    screenRadius: 'rounded-[1rem]',
    statusBarHeight: 'h-8',
    statusBarPadding: 'pt-2',
    contentPadding: 'pt-8',
    hasNotch: false,
    hasHomeIndicator: false,
  },
};

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children, device }) => {
  const config = deviceConfigs[device];

  return (
    <motion.div 
      className="relative mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`relative mx-auto ${config.width} ${config.height} ${config.bgColor} ${config.borderRadius} ${config.padding} shadow-2xl`}>
        {/* Screen Notch (Mobile only) */}
        {config.hasNotch && (
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-full z-20" />
        )}
        
        {/* Screen */}
        <div className={`relative w-full h-full bg-white overflow-hidden ${config.screenRadius}`}>
          {/* Status Bar */}
          <div className={`absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur ${config.statusBarHeight}`}>
            <div className={`flex items-center justify-between px-6 text-xs ${config.statusBarPadding}`}>
              <span className="font-medium">9:41 AM</span>
              <div className="flex items-center gap-1">
                {/* Signal Bars */}
                <SignalIcon className="w-3 h-3" />
                {/* WiFi Icon */}
                <WifiIcon className="w-3 h-3" />
                {/* Battery Icon */}
                <Battery50Icon className="w-4 h-3" />
              </div>
            </div>
          </div>
          
          {/* Content Area */}
          <div className={`absolute inset-0 ${config.contentPadding} overflow-y-auto`}>
            {children}
          </div>
          
          {/* Home Indicator (Mobile only) */}
          {config.hasHomeIndicator && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-900 rounded-full z-20" />
          )}
        </div>
      </div>
    </motion.div>
  );
}; 
import React from 'react';
import { motion } from 'framer-motion';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  return (
    <div className="relative mx-auto w-[375px] h-[812px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
      {/* Screen Notch */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-full z-20" />
      
      {/* Screen */}
      <div className="relative w-full h-full bg-white overflow-hidden rounded-[2.5rem]">
        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-900 rounded-full z-20" />
        
        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur h-11 pt-3">
          <div className="flex items-center justify-between px-6 text-xs">
            <span className="font-medium">9:41 AM</span>
            <div className="flex items-center gap-1">
              {/* Signal Icon */}
              <svg className="w-4 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2 17h20v2H2zm1.15-4.05L4 11.47l.85 1.48 1.3-.75-.85-1.48H7v-1.5H2v1.5h2.15L3 10.72zm6.7-.75l1.48.85 1.48-.85-.85-1.48H14v-1.5h-5v1.5h2.05l-.85 1.48zM23 9.22h-7v1.5h2.05l-.85 1.48 1.48.85 1.48-.85-.85-1.48H23v-1.5z"/>
              </svg>
              {/* WiFi Icon */}
              <svg className="w-4 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 9l2-2v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7l2 2V2h-4v2.17A3 3 0 0 0 16 3a3 3 0 0 0-3 3 3 3 0 0 0-3-3 3 3 0 0 0-2.83 2H3V2H1v7z"/>
              </svg>
              {/* Battery Icon */}
              <svg className="w-6 h-3" fill="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="7" width="20" height="10" rx="2" ry="2"/>
                <path d="M22 9v6"/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="w-full h-full overflow-y-auto pt-11 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}; 
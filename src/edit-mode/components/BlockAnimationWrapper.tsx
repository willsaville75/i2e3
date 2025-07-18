import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface BlockAnimationWrapperProps {
  children: React.ReactNode;
  blockId: string;
  isSelected: boolean;
  isEditMode: boolean;
  onClick: () => void;
}

export const BlockAnimationWrapper: React.FC<BlockAnimationWrapperProps> = ({
  children,
  blockId,
  isSelected,
  isEditMode,
  onClick
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<'create' | 'update' | null>(null);

  useEffect(() => {
    const handleBlockCreated = (event: CustomEvent<{ blockId: string }>) => {
      if (event.detail.blockId === blockId) {
        setAnimationType('create');
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 2000);
      }
    };

    const handleBlockUpdated = (event: CustomEvent<{ blockId: string }>) => {
      if (event.detail.blockId === blockId) {
        setAnimationType('update');
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1500);
      }
    };

    window.addEventListener('blockCreated', handleBlockCreated as EventListener);
    window.addEventListener('blockUpdated', handleBlockUpdated as EventListener);

    return () => {
      window.removeEventListener('blockCreated', handleBlockCreated as EventListener);
      window.removeEventListener('blockUpdated', handleBlockUpdated as EventListener);
    };
  }, [blockId]);

  return (
    <motion.div
      layout
      initial={false}
      animate={isAnimating && animationType === 'create' ? {
        opacity: [0, 1],
        y: [20, 0],
        scale: [0.95, 1]
      } : {}}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }}
      data-block-id={blockId}
      className={`relative transition-all duration-200 ${
        isEditMode ? 'cursor-pointer' : ''
      } ${
        isSelected && isEditMode
          ? 'ring-2 ring-gray-300 rounded-lg'
          : ''
      }`}
      onClick={onClick}
    >
      {/* Shimmer overlay for updates */}
      {isAnimating && animationType === 'update' && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 1.2,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            style={{
              filter: 'blur(20px)',
            }}
          />
        </motion.div>
      )}

      {/* Pulse effect for creates */}
      {isAnimating && animationType === 'create' && (
        <>
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-lg border-2 border-purple-500 z-20"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [1, 1.05, 1.1],
            }}
            transition={{
              duration: 1.5,
              times: [0, 0.5, 1],
              ease: "easeOut"
            }}
          />
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-lg bg-purple-500/20 z-10"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 1,
              ease: "easeOut"
            }}
          />
        </>
      )}

      {children}
    </motion.div>
  );
}; 
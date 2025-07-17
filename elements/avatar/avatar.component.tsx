import React from 'react';

interface AvatarProps {
  text: string;
  backgroundColor?: string;
  textColor?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  text,
  backgroundColor = 'bg-gray-500',
  textColor = 'text-white',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-24 h-24 text-base',
  };

  const finalClassName = `flex items-center justify-center rounded-l-md font-medium ${backgroundColor} ${textColor} ${sizeClasses[size]} ${className}`.trim();

  return (
    <div className={finalClassName}>
      {text}
    </div>
  );
}; 
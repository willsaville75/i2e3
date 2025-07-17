import React from 'react';
import * as HeroIcons from '@heroicons/react/24/outline';

interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

// Convert kebab-case to PascalCase for icon names
const formatIconName = (name: string): string => {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Icon';
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color = 'currentColor',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  // Format the icon name to match Heroicons naming convention
  const iconName = formatIconName(name);
  const IconComponent = HeroIcons[iconName as keyof typeof HeroIcons] as React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;

  if (!IconComponent) {
    console.warn(`Icon "${name}" (${iconName}) not found in Heroicons`);
    // Return a default icon or null
    const DefaultIcon = HeroIcons.QuestionMarkCircleIcon;
    return (
      <DefaultIcon
        className={`${sizeClasses[size]} ${className}`.trim()}
        style={{ color }}
      />
    );
  }

  return (
    <IconComponent
      className={`${sizeClasses[size]} ${className}`.trim()}
      style={{ color }}
    />
  );
}; 
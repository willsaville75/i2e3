import React from 'react';

interface LinkProps {
  text: string;
  href: string;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  underline?: boolean;
  className?: string;
}

export const Link: React.FC<LinkProps> = ({
  text,
  href,
  variant = 'primary',
  size = 'md',
  underline = false,
  className = '',
}) => {
  const baseClasses = 'transition-colors';
  
  const variantClasses = {
    default: 'text-blue-600',
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const underlineClass = underline ? 'underline' : '';

  const finalClassName = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${underlineClass} ${className}`.trim();

  return (
    <a href={href} className={finalClassName}>
      {text}
    </a>
  );
}; 
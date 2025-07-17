import React from 'react';
import clsx from 'clsx';

export interface CardProps {
  header?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  hoverable?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  header,
  children,
  footer,
  variant = 'default',
  padding = 'md',
  rounded = 'lg',
  shadow = 'sm',
  border = true,
  hoverable = false,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  onClick,
}) => {
  // Base classes for the card container
  const baseClasses = 'overflow-hidden';
  
  // Variant classes
  const variantClasses = {
    default: 'bg-white',
    outlined: 'bg-white border-2 border-gray-200',
    elevated: 'bg-white shadow-lg',
    filled: 'bg-gray-50',
  };

  // Rounded classes
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  // Shadow classes
  const shadowClasses = {
    none: '',
    sm: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  // Padding classes for sections when using custom padding
  const paddingClasses = {
    none: '',
    sm: 'px-3 py-2 sm:px-4',
    md: 'px-4 py-5 sm:px-6',
    lg: 'px-6 py-6 sm:px-8',
    xl: 'px-8 py-8 sm:px-10',
  };

  // Determine if we're using the sectioned layout
  const hasSections = header || footer || (children && (header || footer));
  
  // Card container classes
  const cardClasses = clsx(
    baseClasses,
    variantClasses[variant],
    roundedClasses[rounded],
    shadow !== 'none' && shadowClasses[shadow],
    border && variant !== 'outlined' && 'border border-gray-200',
    hoverable && 'hover:shadow-md transition-shadow cursor-pointer',
    onClick && 'cursor-pointer',
    hasSections && 'divide-y divide-gray-200',
    className
  );

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // If no sections are defined, render simple card
  if (!hasSections) {
    const simplePaddingClasses = {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4 sm:p-6',
      lg: 'p-6 sm:p-8',
      xl: 'p-8 sm:p-10',
    };

    return (
      <div className={clsx(cardClasses, simplePaddingClasses[padding])} onClick={handleClick}>
        {children}
      </div>
    );
  }

  // Render sectioned card
  return (
    <div className={cardClasses} onClick={handleClick}>
      {header && (
        <div className={clsx(
          'px-4 py-5 sm:px-6',
          headerClassName
        )}>
          {header}
        </div>
      )}
      
      {children && (
        <div className={clsx(
          'px-4 py-5 sm:p-6',
          bodyClassName
        )}>
          {children}
        </div>
      )}
      
      {footer && (
        <div className={clsx(
          'px-4 py-4 sm:px-6',
          'mt-4', // Added margin-top for bigger gap between content and footer
          footerClassName
        )}>
          {footer}
        </div>
      )}
    </div>
  );
}; 
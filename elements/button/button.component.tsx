import React from 'react'

interface ButtonProps {
  text?: string
  children?: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export const Button: React.FC<ButtonProps> = ({
  text,
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}) => {
  // Debug logging
  if (typeof window !== 'undefined' && window.location?.search?.includes('test=true')) {
    console.log('Button Component Rendering:', {
      text,
      href,
      variant,
      size,
      className,
      disabled
    })
  }

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500',
    secondary: 'bg-white/90 text-slate-900 hover:bg-white focus:ring-white backdrop-blur-md shadow-lg',
    outline: 'border-2 border-white/80 text-white hover:bg-white/10 focus:ring-white backdrop-blur-md',
  }
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg font-semibold',
  }
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  const finalClassName = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`.trim()
  
  // Use text prop if provided, otherwise fall back to children
  const buttonContent = text || children
  
  if (href && !disabled) {
    return (
      <a
        href={href}
        className={finalClassName}
        onClick={onClick}
      >
        {buttonContent}
      </a>
    )
  }
  
  return (
    <button
      type={type}
      className={finalClassName}
      onClick={onClick}
      disabled={disabled}
    >
      {buttonContent}
    </button>
  )
}

export default Button 
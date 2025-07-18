import React from 'react'
import { button } from '../../blocks/shared/tokens'

interface ButtonProps {
  text?: string
  children?: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: keyof typeof button.variant
  size?: keyof typeof button.size
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

  const finalClassName = [
    button.base,
    button.variant[variant],
    button.size[size],
    disabled ? button.disabled : '',
    className
  ]
    .filter(Boolean)
    .join(' ')
    .trim()
  
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
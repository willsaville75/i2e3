import React from 'react'
import { twMerge } from 'tailwind-merge'

interface IconProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
}

export function Icon({ icon: IconComponent, className, size = 'md', ...props }: IconProps & React.SVGProps<SVGSVGElement>) {
  const baseClasses = sizeClasses[size]
  const mergedClasses = twMerge(baseClasses, className)
  
  return <IconComponent className={mergedClasses} {...props} />
}

export default Icon 
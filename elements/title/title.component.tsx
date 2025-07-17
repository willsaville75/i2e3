import React from 'react'

interface TitleProps {
  content: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl'
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'
  color?: string
  align?: 'left' | 'center' | 'right' | 'justify'
  className?: string
}

export const Title: React.FC<TitleProps> = ({
  content,
  level = 1,
  size,
  weight,
  color = 'text-gray-900',
  align = 'left',
  className = '',
}) => {
  
  // Ensure content is always a string to prevent React child errors
  const safeContent = typeof content === 'string' 
    ? content 
    : typeof content === 'object' && content !== null
      ? String((content as any).content || (content as any).title || JSON.stringify(content))
      : String(content || '')
  
  // Font size classes
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl',
    '7xl': 'text-7xl',
    '8xl': 'text-8xl',
    '9xl': 'text-9xl',
  }

  // Font weight classes
  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  }

  // Text alignment classes
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  }
  
  // Level-based fallback classes (used when size/weight not provided)
  const levelClasses = {
    1: 'text-4xl font-bold',
    2: 'text-3xl font-bold',
    3: 'text-2xl font-bold',
    4: 'text-xl font-semibold',
    5: 'text-lg font-semibold',
    6: 'text-base font-semibold',
  }
  
  // Use size/weight if provided, otherwise fall back to level-based styling
  const sizeClass = size ? sizeClasses[size] : levelClasses[level].split(' ')[0]
  const weightClass = weight ? weightClasses[weight] : levelClasses[level].split(' ')[1]
  
  const finalClassName = `${sizeClass} ${weightClass} ${alignClasses[align]} ${color} ${className}`.trim()
  

  
  const Component = `h${level}` as keyof JSX.IntrinsicElements
  
  return (
    <Component className={finalClassName}>
      {safeContent}
    </Component>
  )
}

export default Title 
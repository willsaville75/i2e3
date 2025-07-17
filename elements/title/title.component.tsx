import React from 'react'
import { typography, alignment } from '../../src/blocks/shared/tokens'

interface TitleProps {
  content: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
  size?: keyof typeof typography.size
  weight?: keyof typeof typography.weight
  color?: string
  align?: keyof typeof alignment.text
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
  
  // Level-based fallback classes (used when size/weight not provided)
  const levelDefaults = {
    1: { size: '4xl' as keyof typeof typography.size, weight: 'bold' as keyof typeof typography.weight },
    2: { size: '3xl' as keyof typeof typography.size, weight: 'bold' as keyof typeof typography.weight },
    3: { size: '2xl' as keyof typeof typography.size, weight: 'bold' as keyof typeof typography.weight },
    4: { size: 'xl' as keyof typeof typography.size, weight: 'semibold' as keyof typeof typography.weight },
    5: { size: 'lg' as keyof typeof typography.size, weight: 'semibold' as keyof typeof typography.weight },
    6: { size: 'base' as keyof typeof typography.size, weight: 'semibold' as keyof typeof typography.weight },
  }
  
  // Use size/weight if provided, otherwise fall back to level-based defaults
  const finalSize = size || levelDefaults[level].size
  const finalWeight = weight || levelDefaults[level].weight
  
  const finalClassName = `${typography.size[finalSize]} ${typography.weight[finalWeight]} ${alignment.text[align]} ${color} ${className}`.trim()
  
  const Component = `h${level}` as keyof JSX.IntrinsicElements
  
  return (
    <Component className={finalClassName}>
      {safeContent}
    </Component>
  )
}

export default Title 
import React from 'react'
import { typography, alignment, spacing } from '../../blocks/shared/tokens'

interface TextProps {
  content: string
  tag?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote' | 'code' | 'pre' | 'strong' | 'em' | 'small' | 'mark'
  size?: keyof typeof typography.size
  weight?: keyof typeof typography.weight
  color?: string
  align?: keyof typeof alignment.text
  lineHeight?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose'
  letterSpacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest'
  decoration?: 'none' | 'underline' | 'overline' | 'line-through'
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  fontFamily?: 'sans' | 'serif' | 'mono'
  backgroundColor?: string
  padding?: keyof typeof spacing.map
  margin?: keyof typeof spacing.map
  maxWidth?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full' | 'prose'
  truncate?: boolean
  whitespace?: 'normal' | 'nowrap' | 'pre' | 'pre-line' | 'pre-wrap'
  className?: string
}

export const Text: React.FC<TextProps> = ({
  content,
  tag = 'p',
  size = 'base',
  weight = 'normal',
  color = 'text-gray-900',
  align = 'left',
  lineHeight = 'normal',
  letterSpacing = 'normal',
  decoration = 'none',
  transform = 'none',
  fontFamily = 'sans',
  backgroundColor = 'bg-transparent',
  padding = 'none',
  margin = 'none',
  maxWidth = 'none',
  truncate = false,
  whitespace = 'normal',
  className = '',
}) => {
  // Line height classes
  const lineHeightClasses = {
    none: 'leading-none',
    tight: 'leading-tight',
    snug: 'leading-snug',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
  }

  // Letter spacing classes
  const letterSpacingClasses = {
    tighter: 'tracking-tighter',
    tight: 'tracking-tight',
    normal: 'tracking-normal',
    wide: 'tracking-wide',
    wider: 'tracking-wider',
    widest: 'tracking-widest',
  }

  // Text decoration classes
  const decorationClasses = {
    none: 'no-underline',
    underline: 'underline',
    overline: 'overline',
    'line-through': 'line-through',
  }

  // Text transform classes
  const transformClasses = {
    none: 'normal-case',
    uppercase: 'uppercase',
    lowercase: 'lowercase',
    capitalize: 'capitalize',
  }

  // Font family classes
  const fontFamilyClasses = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
  }

  // Padding classes using token system
  const paddingClasses = {
    none: '',
    xs: `p-${spacing.map.xs}`,
    sm: `p-${spacing.map.sm}`,
    md: `p-${spacing.map.md}`,
    lg: `p-${spacing.map.lg}`,
    xl: `p-${spacing.map.xl}`,
    '2xl': `p-${spacing.map['2xl']}`,
  }

  // Margin classes using token system
  const marginClasses = {
    none: '',
    xs: `m-${spacing.map.xs}`,
    sm: `m-${spacing.map.sm}`,
    md: `m-${spacing.map.md}`,
    lg: `m-${spacing.map.lg}`,
    xl: `m-${spacing.map.xl}`,
    '2xl': `m-${spacing.map['2xl']}`,
  }

  // Max width classes
  const maxWidthClasses = {
    none: '',
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
    prose: 'max-w-prose',
  }

  // Whitespace classes
  const whitespaceClasses = {
    normal: 'whitespace-normal',
    nowrap: 'whitespace-nowrap',
    pre: 'whitespace-pre',
    'pre-line': 'whitespace-pre-line',
    'pre-wrap': 'whitespace-pre-wrap',
  }

  // Build the final className using tokens
  const finalClassName = [
    typography.size[size],
    typography.weight[weight],
    color,
    alignment.text[align],
    lineHeightClasses[lineHeight],
    letterSpacingClasses[letterSpacing],
    decorationClasses[decoration],
    transformClasses[transform],
    fontFamilyClasses[fontFamily],
    backgroundColor !== 'bg-transparent' ? backgroundColor : '',
    paddingClasses[padding as keyof typeof paddingClasses],
    marginClasses[margin as keyof typeof marginClasses],
    maxWidthClasses[maxWidth],
    truncate ? 'truncate' : '',
    whitespaceClasses[whitespace],
    className,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()

  const Component = tag as keyof JSX.IntrinsicElements

  // Handle HTML content vs plain text
  const shouldRenderHTML = content.includes('<') && (content.includes('</') || content.includes('/>'))

  return (
    <Component 
      className={finalClassName}
      {...(shouldRenderHTML ? { dangerouslySetInnerHTML: { __html: content } } : {})}
    >
      {!shouldRenderHTML ? content : undefined}
    </Component>
  )
}

export default Text 
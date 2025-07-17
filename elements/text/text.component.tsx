import React from 'react'

interface TextProps {
  content: string
  tag?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote' | 'code' | 'pre' | 'strong' | 'em' | 'small' | 'mark'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl'
  weight?: 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black'
  color?: string
  align?: 'left' | 'center' | 'right' | 'justify'
  lineHeight?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose'
  letterSpacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest'
  decoration?: 'none' | 'underline' | 'overline' | 'line-through'
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  fontFamily?: 'sans' | 'serif' | 'mono'
  backgroundColor?: string
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
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
    thin: 'font-thin',
    extralight: 'font-extralight',
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
    black: 'font-black',
  }

  // Text alignment classes
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  }

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

  // Padding classes
  const paddingClasses = {
    none: '',
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    '2xl': 'p-12',
  }

  // Margin classes
  const marginClasses = {
    none: '',
    xs: 'm-1',
    sm: 'm-2',
    md: 'm-4',
    lg: 'm-6',
    xl: 'm-8',
    '2xl': 'm-12',
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

  // Build the final className
  const finalClassName = [
    sizeClasses[size],
    weightClasses[weight],
    color,
    alignClasses[align],
    lineHeightClasses[lineHeight],
    letterSpacingClasses[letterSpacing],
    decorationClasses[decoration],
    transformClasses[transform],
    fontFamilyClasses[fontFamily],
    backgroundColor !== 'bg-transparent' ? backgroundColor : '',
    paddingClasses[padding],
    marginClasses[margin],
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
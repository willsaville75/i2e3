// Design tokens for the block system
// Single source of truth for all styling utilities

import React from 'react';

// ============================================
// SPACING & LAYOUT TOKENS
// ============================================

export const spacing = {
  map: {
    none: '0',
    xs: '1',
    sm: '2',
    md: '4',
    lg: '8',
    xl: '12',
    '2xl': '16'
  },
  margin: {
    top: {
      none: '',
      xs: 'mt-2',
      sm: 'mt-4',
      md: 'mt-8',
      lg: 'mt-8', // Special case for hero blocks
      xl: 'mt-16',
      '2xl': 'mt-24'
    },
    bottom: {
      none: '',
      xs: 'mb-2',
      sm: 'mb-4',
      md: 'mb-8',
      lg: 'mb-8', // Special case for hero blocks
      xl: 'mb-16',
      '2xl': 'mb-24'
    }
  },
  padding: {
    responsive: {
      base: 'px-4',
      sm: 'sm:px-6',
      lg: 'lg:px-8'
    }
  }
} as const;

export const sizing = {
  general: {
    xs: '32',
    sm: '40',
    md: '48',
    lg: '64',
    xl: '80',
    '2xl': '96',
    '3xl': 'screen'
  },
  height: {
    auto: 'min-h-0',
    quarter: 'min-h-[25vh]',
    half: 'min-h-[50vh]',
    screen: 'min-h-screen'
  }
} as const;

// ============================================
// CONTAINER TOKENS
// ============================================

export const container = {
  maxWidth: {
    narrow: 'max-w-3xl',  // 768px max
    medium: 'max-w-5xl',  // 1024px max
    wide: 'max-w-7xl',    // 1280px max - matches existing usage
    full: 'max-w-full'
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
} as const;

// ============================================
// ALIGNMENT TOKENS
// ============================================

export const alignment = {
  vertical: {
    top: 'items-start',
    center: 'items-center',
    bottom: 'items-end'
  },
  horizontal: {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  },
  text: {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  }
} as const;

// ============================================
// TYPOGRAPHY TOKENS
// ============================================

export const typography = {
  size: {
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
    '9xl': 'text-9xl'
  },
  weight: {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold'
  },
  color: {
    primary: 'text-gray-900',
    secondary: 'text-gray-700',
    muted: 'text-gray-500',
    inverse: 'text-white'
  }
} as const;

// ============================================
// COLOR TOKENS
// ============================================

export const colors = {
  scheme: {
    neutral: {
      '50': 'bg-gray-50',
      '100': 'bg-gray-100',
      '200': 'bg-gray-200',
      '500': 'bg-gray-500',
      '600': 'bg-gray-600',
      '800': 'bg-gray-800',
      '900': 'bg-gray-900'
    },
    red: {
      '50': 'bg-red-50',
      '100': 'bg-red-100',
      '200': 'bg-red-200',
      '500': 'bg-red-500',
      '600': 'bg-red-600',
      '800': 'bg-red-800',
      '900': 'bg-red-900'
    },
    orange: {
      '50': 'bg-orange-50',
      '100': 'bg-orange-100',
      '200': 'bg-orange-200',
      '500': 'bg-orange-500',
      '600': 'bg-orange-600',
      '800': 'bg-orange-800',
      '900': 'bg-orange-900'
    },
    amber: {
      '50': 'bg-amber-50',
      '100': 'bg-amber-100',
      '200': 'bg-amber-200',
      '500': 'bg-amber-500',
      '600': 'bg-amber-600',
      '800': 'bg-amber-800',
      '900': 'bg-amber-900'
    },
    yellow: {
      '50': 'bg-yellow-50',
      '100': 'bg-yellow-100',
      '200': 'bg-yellow-200',
      '500': 'bg-yellow-500',
      '600': 'bg-yellow-600',
      '800': 'bg-yellow-800',
      '900': 'bg-yellow-900'
    },
    lime: {
      '50': 'bg-lime-50',
      '100': 'bg-lime-100',
      '200': 'bg-lime-200',
      '500': 'bg-lime-500',
      '600': 'bg-lime-600',
      '800': 'bg-lime-800',
      '900': 'bg-lime-900'
    },
    green: {
      '50': 'bg-green-50',
      '100': 'bg-green-100',
      '200': 'bg-green-200',
      '500': 'bg-green-500',
      '600': 'bg-green-600',
      '800': 'bg-green-800',
      '900': 'bg-green-900'
    },
    emerald: {
      '50': 'bg-emerald-50',
      '100': 'bg-emerald-100',
      '200': 'bg-emerald-200',
      '500': 'bg-emerald-500',
      '600': 'bg-emerald-600',
      '800': 'bg-emerald-800',
      '900': 'bg-emerald-900'
    },
    teal: {
      '50': 'bg-teal-50',
      '100': 'bg-teal-100',
      '200': 'bg-teal-200',
      '500': 'bg-teal-500',
      '600': 'bg-teal-600',
      '800': 'bg-teal-800',
      '900': 'bg-teal-900'
    },
    cyan: {
      '50': 'bg-cyan-50',
      '100': 'bg-cyan-100',
      '200': 'bg-cyan-200',
      '500': 'bg-cyan-500',
      '600': 'bg-cyan-600',
      '800': 'bg-cyan-800',
      '900': 'bg-cyan-900'
    },

    sky: {
      '50': 'bg-sky-50',
      '100': 'bg-sky-100',
      '200': 'bg-sky-200',
      '500': 'bg-sky-500',
      '600': 'bg-sky-600',
      '800': 'bg-sky-800',
      '900': 'bg-sky-900'
    },
    blue: {
      '50': 'bg-blue-50',
      '100': 'bg-blue-100',
      '200': 'bg-blue-200',
      '500': 'bg-blue-500',
      '600': 'bg-blue-600',
      '800': 'bg-blue-800',
      '900': 'bg-blue-900'
    },
    indigo: {
      '50': 'bg-indigo-50',
      '100': 'bg-indigo-100',
      '200': 'bg-indigo-200',
      '500': 'bg-indigo-500',
      '600': 'bg-indigo-600',
      '800': 'bg-indigo-800',
      '900': 'bg-indigo-900'
    },
    violet: {
      '50': 'bg-violet-50',
      '100': 'bg-violet-100',
      '200': 'bg-violet-200',
      '500': 'bg-violet-500',
      '600': 'bg-violet-600',
      '800': 'bg-violet-800',
      '900': 'bg-violet-900'
    },
    purple: {
      '50': 'bg-purple-50',
      '100': 'bg-purple-100',
      '200': 'bg-purple-200',
      '500': 'bg-purple-500',
      '600': 'bg-purple-600',
      '800': 'bg-purple-800',
      '900': 'bg-purple-900'
    },
    fuchsia: {
      '50': 'bg-fuchsia-50',
      '100': 'bg-fuchsia-100',
      '200': 'bg-fuchsia-200',
      '500': 'bg-fuchsia-500',
      '600': 'bg-fuchsia-600',
      '800': 'bg-fuchsia-800',
      '900': 'bg-fuchsia-900'
    },
    pink: {
      '50': 'bg-pink-50',
      '100': 'bg-pink-100',
      '200': 'bg-pink-200',
      '500': 'bg-pink-500',
      '600': 'bg-pink-600',
      '800': 'bg-pink-800',
      '900': 'bg-pink-900'
    },
    rose: {
      '50': 'bg-rose-50',
      '100': 'bg-rose-100',
      '200': 'bg-rose-200',
      '500': 'bg-rose-500',
      '600': 'bg-rose-600',
      '800': 'bg-rose-800',
      '900': 'bg-rose-900'
    },
    white: {
      '50': 'bg-white',
      '100': 'bg-white',
      '200': 'bg-white',
      '500': 'bg-white',
      '600': 'bg-white',
      '800': 'bg-white',
      '900': 'bg-white'
    }
  },
  intensity: {
    light: '200',
    medium: '500',
    dark: '800'
  }
} as const;

// ============================================
// BORDER & SHAPE TOKENS
// ============================================

export const borders = {
  radius: {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  }
} as const;

export const shadows = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl'
} as const;

// ============================================
// IMAGE TOKENS
// ============================================

export const image = {
  position: {
    center: 'object-center',
    top: 'object-top',
    bottom: 'object-bottom',
    left: 'object-left',
    right: 'object-right'
  },
  size: {
    cover: 'object-cover',
    contain: 'object-contain',
    auto: 'object-none'
  }
} as const;

// ============================================
// BUTTON TOKENS
// ============================================

export const button = {
  variant: {
    primary: 'bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500',
    secondary: 'bg-white/90 text-slate-900 hover:bg-white focus:ring-white backdrop-blur-md shadow-lg',
    outline: 'border-2 border-white/80 text-white hover:bg-white/10 focus:ring-white backdrop-blur-md',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-500'
  },
  size: {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg font-semibold'
  },
  base: 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  disabled: 'opacity-50 cursor-not-allowed'
} as const;

// ============================================
// GRADIENT TOKENS
// ============================================

export const gradient = {
  direction: {
    'to-r': 'to right',
    'to-l': 'to left',
    'to-t': 'to top',
    'to-b': 'to bottom',
    'to-tr': 'to top right',
    'to-tl': 'to top left',
    'to-br': 'to bottom right',
    'to-bl': 'to bottom left'
  },
  tailwind: {
    // Tailwind gradient direction classes
    'to-r': 'bg-gradient-to-r',
    'to-l': 'bg-gradient-to-l',
    'to-t': 'bg-gradient-to-t',
    'to-b': 'bg-gradient-to-b',
    'to-tr': 'bg-gradient-to-tr',
    'to-tl': 'bg-gradient-to-tl',
    'to-br': 'bg-gradient-to-br',
    'to-bl': 'bg-gradient-to-bl'
  },
  presets: {
    // Popular gradient combinations
    sunset: {
      name: 'Sunset',
      fromColor: '#ff7e5f',
      toColor: '#feb47b',
      direction: 'to-r'
    },
    ocean: {
      name: 'Ocean',
      fromColor: '#667eea',
      toColor: '#764ba2',
      direction: 'to-r'
    },
    purple: {
      name: 'Purple Dream',
      fromColor: '#7775D6',
      toColor: '#E935C1',
      direction: 'to-r'
    },
    forest: {
      name: 'Forest',
      fromColor: '#11998e',
      toColor: '#38ef7d',
      direction: 'to-r'
    },
    fire: {
      name: 'Fire',
      fromColor: '#f12711',
      toColor: '#f5af19',
      direction: 'to-r'
    },
    sky: {
      name: 'Sky',
      fromColor: '#0f4c75',
      toColor: '#3282b8',
      direction: 'to-r'
    },
    rose: {
      name: 'Rose',
      fromColor: '#f093fb',
      toColor: '#f5576c',
      direction: 'to-r'
    },
    mint: {
      name: 'Mint',
      fromColor: '#4facfe',
      toColor: '#00f2fe',
      direction: 'to-r'
    }
  },
  defaults: {
    fromColor: '#7775D6',
    toColor: '#E935C1',
    direction: 'to-r'
  }
} as const;

// Gradient utility functions
export const createGradientStyle = (gradientConfig: {
  type?: 'linear' | 'radial';
  direction?: keyof typeof gradient.direction;
  fromColor?: string;
  toColor?: string;
  preset?: keyof typeof gradient.presets;
}): React.CSSProperties => {
  const { type = 'linear', direction = 'to-r', fromColor, toColor, preset } = gradientConfig;
  
  // Use preset if provided, otherwise use custom colors or defaults
  let from: string;
  let to: string;
  let gradientDirection: keyof typeof gradient.direction;
  
  if (preset && gradient.presets[preset]) {
    const presetConfig = gradient.presets[preset];
    from = presetConfig.fromColor;
    to = presetConfig.toColor;
    gradientDirection = presetConfig.direction as keyof typeof gradient.direction;
  } else {
    from = fromColor || gradient.defaults.fromColor;
    to = toColor || gradient.defaults.toColor;
    gradientDirection = direction;
  }
  
  const directionValue = gradient.direction[gradientDirection] || gradient.direction['to-r'];
  
  if (type === 'linear') {
    return {
      background: `linear-gradient(${directionValue}, ${from}, ${to})`
    };
  } else if (type === 'radial') {
    return {
      background: `radial-gradient(circle, ${from}, ${to})`
    };
  }
  
  return {};
};

// Helper function to get all gradient preset names
export const getGradientPresets = () => {
  return Object.keys(gradient.presets) as (keyof typeof gradient.presets)[];
};

// Helper function to get gradient preset by name
export const getGradientPreset = (presetName: keyof typeof gradient.presets) => {
  return gradient.presets[presetName];
};

// Helper function to create Tailwind gradient classes
export const createTailwindGradient = (config: {
  direction?: keyof typeof gradient.direction;
  fromColor?: string;
  toColor?: string;
  preset?: keyof typeof gradient.presets;
}): string => {
  const { direction = 'to-r', fromColor, toColor, preset } = config;
  
  // Use preset if provided
  if (preset && gradient.presets[preset]) {
    const presetConfig = gradient.presets[preset];
    const directionClass = gradient.tailwind[presetConfig.direction as keyof typeof gradient.tailwind] || gradient.tailwind['to-r'];
    return `${directionClass} from-[${presetConfig.fromColor}] to-[${presetConfig.toColor}]`;
  }
  
  // Use custom colors or defaults
  const from = fromColor || gradient.defaults.fromColor;
  const to = toColor || gradient.defaults.toColor;
  const directionClass = gradient.tailwind[direction] || gradient.tailwind['to-r'];
  
  return `${directionClass} from-[${from}] to-[${to}]`;
};



// ============================================
// TYPE EXPORTS
// ============================================

export type SpacingToken = keyof typeof spacing.map;
export type SizeToken = keyof typeof sizing.general;
export type HeightToken = keyof typeof sizing.height;
export type MarginToken = keyof typeof spacing.margin.top;
export type MarginBottomToken = keyof typeof spacing.margin.bottom;
export type ColorIntensityToken = keyof typeof colors.intensity;
export type VerticalAlignToken = keyof typeof alignment.vertical;
export type HorizontalAlignToken = keyof typeof alignment.horizontal;
export type TextSizeToken = keyof typeof typography.size;
export type FontWeightToken = keyof typeof typography.weight;
export type ColorSchemeToken = keyof typeof colors.scheme;
export type TextColorToken = keyof typeof typography.color;
export type BorderRadiusToken = keyof typeof borders.radius;
export type ShadowToken = keyof typeof shadows;
export type GradientDirectionToken = keyof typeof gradient.direction;
export type GradientPresetToken = keyof typeof gradient.presets;
export type AlignToken = keyof typeof alignment.text;
export type ImagePositionToken = keyof typeof image.position;
export type ImageSizeToken = keyof typeof image.size;
export type ButtonVariantToken = keyof typeof button.variant;
export type ButtonSizeToken = keyof typeof button.size;
export type ContainerWidthToken = keyof typeof container.maxWidth;
export type BreakpointToken = keyof typeof container.breakpoints; 
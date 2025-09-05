/**
 * Wouli Design System Tokens
 * Centralized design tokens for consistent styling across the app
 */

// Colors (HSL format for better manipulation)
export const colors = {
  // Wouli Brand Colors
  primary: 'hsl(262 100% 70%)',      // Purple
  accent: 'hsl(329 86% 70%)',        // Pink
  ring: 'hsl(271 91% 65%)',          // Focus ring
  
  // Wouli Signature Gradient
  gradientWouli: 'linear-gradient(135deg, hsl(262 100% 70%) 0%, hsl(329 86% 70%) 100%)',
  
  // Semantic Colors
  urgent: 'hsl(0 84% 56%)',
  success: 'hsl(155 64% 46%)',
  warning: 'hsl(48 96% 53%)',
  
  // Neutral Scale
  neutral: {
    50: 'hsl(210 40% 98%)',
    100: 'hsl(220 14% 96%)',
    200: 'hsl(220 13% 91%)',
    300: 'hsl(216 12% 84%)',
    400: 'hsl(218 11% 65%)',
    500: 'hsl(220 9% 46%)',
    600: 'hsl(215 14% 34%)',
    700: 'hsl(217 19% 27%)',
    800: 'hsl(215 28% 17%)',
    900: 'hsl(221 39% 11%)',
  },
  
  // Background & Surfaces
  background: 'hsl(0 0% 100%)',
  card: 'hsl(0 0% 100%)',
  popover: 'hsl(0 0% 100%)',
} as const;

// Typography
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
  },
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;

// Spacing
export const spacing = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  wouli: '0 10px 30px -10px hsl(262 100% 70% / 0.3)',
} as const;

// Animation Durations
export const duration = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
} as const;

// Export all tokens
export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  duration,
} as const;
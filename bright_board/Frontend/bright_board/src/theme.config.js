export const palette = {
  bw: {
    0: '#000000',
    12: '#1F1F1F',
    25: '#404040',
    37: '#616161',
    50: '#808080',
    62: '#9E9E9E',
    75: '#BFBFBF',
    87: '#DEDEDE',
    100: '#FFFFFF',
  },
};

export const typography = {
  fonts: {
    primary: '"Comic Sans MS", "Comic Neue", cursive',
    secondary: '"Gill Sans", "Gill Sans MT", "Work Sans", Calibri, "Trebuchet MS", sans-serif',
  },
  scale: {
    h1: 'clamp(2rem, 3vw, 3.5rem)',
    h2: 'clamp(1.75rem, 2.5vw, 2.75rem)',
    h3: 'clamp(1.5rem, 2vw, 2rem)',
    h4: 'clamp(1.25rem, 1.5vw, 1.5rem)',
    bodyLg: 'clamp(1.125rem, 1.2vw, 1.25rem)',
    body: 'clamp(1rem, 1vw, 1.125rem)',
    bodySm: 'clamp(0.875rem, 0.9vw, 1rem)',
  },
  weights: {
    primary: { regular: 400, semi: 600, bold: 700 },
    secondary: { light: 300, regular: 400, medium: 500 },
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const animation = {
  durations: {
    fast: 150,
    base: 300,
    slow: 500,
  },
  performanceBudgetMsPerFrame: 4,
};

export default { palette, typography, spacing, breakpoints, animation };
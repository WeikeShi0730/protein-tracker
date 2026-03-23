// Claude Design System
// Warm cream backgrounds, terracotta accent, refined typography

export const C = {
  // Backgrounds
  bg: '#FAF9F6',           // warm cream — the signature Claude background
  bgElevated: '#FFFFFF',   // white for cards/modals
  bgMuted: '#F0EBE3',      // slightly warmer for section headers, chips
  bgSubtle: '#F7F3EE',     // between bg and bgMuted

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#9A9A9A',
  textPlaceholder: '#BCBBB8',

  // Brand — Claude's warm terracotta copper
  accent: '#CC785C',
  accentDark: '#B3654A',
  accentLight: '#FAEEE8',
  accentMid: '#F0CFBE',

  // Semantic
  success: '#2E7D5E',
  successBg: '#EBF7F2',
  error: '#C53B2E',
  errorBg: '#FAEAEA',
  warning: '#C68A2A',
  warningBg: '#FEF3E2',

  // Border
  border: '#E8E2D9',
  borderStrong: '#CFC7BC',

  // Shadows
  shadowColor: '#8A7A6A',
} as const;

// Border radius
export const R = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 100,
} as const;

// Standard shadow (subtle)
export const shadow = {
  shadowColor: C.shadowColor,
  shadowOpacity: 0.07,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;

// Strong shadow
export const shadowStrong = {
  shadowColor: C.shadowColor,
  shadowOpacity: 0.12,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
} as const;

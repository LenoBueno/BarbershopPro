// ============================================
// TIER COLORS
// ============================================

export const tierColors = {
  ouro: {
    primary: '#fbbf24',
    light: '#fef3c7',
    gradient: ['#fbbf24', '#f59e0b'],
  },
  prata: {
    primary: '#9ca3af',
    light: '#e5e7eb',
    gradient: ['#d1d5db', '#9ca3af'],
  },
  bronze: {
    primary: '#cd7f32',
    light: '#fed7aa',
    gradient: ['#fb923c', '#cd7f32'],
  },
};

// ============================================
// BASE COLORS
// ============================================

export const colors = {
  primary: '#8b5cf6',
  secondary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  gold: '#fbbf24',
  silver: '#d1d5db',
  bronze: '#cd7f32',
  background: '#0a0a0a',
  surface: '#1a1a1a',
  surfaceLight: '#2a2a2a',
  text: '#ffffff',
  textSecondary: '#a3a3a3',
  textTertiary: '#737373',
  border: '#2a2a2a',
  disabled: '#525252',
};

// ============================================
// SPACING
// ============================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// ============================================
// BORDER RADIUS
// ============================================

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// ============================================
// TYPOGRAPHY
// ============================================

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};

// ============================================
// SHADOWS
// ============================================

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getTierColor(tier: 'bronze' | 'prata' | 'ouro'): string {
  return tierColors[tier].primary;
}

export function getTierLightColor(tier: 'bronze' | 'prata' | 'ouro'): string {
  return tierColors[tier].light;
}

export function getTierGradient(tier: 'bronze' | 'prata' | 'ouro'): string[] {
  return tierColors[tier].gradient;
}

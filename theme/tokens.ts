/** Unified design tokens — single source of truth for the app UI. */

export const palette = {
  primary: '#4F46E5',
  primaryLight: '#6366F1',
  primaryDark: '#3730A3',
  secondary: '#8B5CF6',
  accent: '#F59E0B',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#0EA5E9',

  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',

  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(15, 23, 42, 0.45)',
  onPrimary: '#FFFFFF',
  onPrimaryMuted: 'rgba(255, 255, 255, 0.8)',
  onPrimarySubtle: 'rgba(255, 255, 255, 0.2)',
} as const;

export const gradients = {
  primary: ['#4F46E5', '#6366F1'] as const,
  primaryDeep: ['#6366F1', '#8B5CF6'] as const,
  success: ['#10B981', '#059669'] as const,
  warning: ['#F59E0B', '#D97706'] as const,
  health: ['#EF4444', '#DC2626'] as const,
  goals: ['#8B5CF6', '#6366F1'] as const,
  auth: ['#4F46E5', '#3730A3'] as const,
} as const;

export type ScreenAccent = keyof typeof gradients;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const typography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    extrabold: 'Inter_800ExtraBold',
  },
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 24,
    xxl: 32,
    display: 40,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  lg: {
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

/** Backward-compatible exports used across the codebase */
export const Colors = {
  primary: palette.primaryLight,
  secondary: palette.secondary,
  accent: palette.error,
  background: palette.background,
  card: palette.surface,
  text: palette.text,
  textSecondary: palette.textSecondary,
  border: palette.border,
  success: palette.success,
  error: palette.error,
  white: palette.white,
  black: palette.black,
  gradient: gradients.primaryDeep,
  tint: palette.primaryLight,
  tabIconDefault: palette.textMuted,
  tabIconSelected: palette.primaryLight,
};

export const Spacing = spacing;
export const BorderRadius = radius;
export const Typography = typography;

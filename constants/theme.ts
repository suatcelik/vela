export const Colors = {
  // Navy palette
  navy950: '#020918',
  navy900: '#061228',
  navy800: '#0a1f42',
  navy700: '#0d2d5e',
  navy600: '#1a4080',
  navy400: '#3a70c0',
  navy200: '#a8c4e8',
  navy100: '#dce9f7',

  // Green (success/positive)
  green500: '#00c896',
  green400: '#1de9ad',
  green300: '#6ef5cc',
  green100: '#d0faf0',

  // Red (error/negative)
  red500: '#f04060',
  red100: '#fde8ec',

  // Gold (assets)
  gold: '#f5c842',
  goldLight: '#fef7d6',

  // Neutrals
  white: '#ffffff',
  bg: '#f0f4fa',
  surface: '#ffffff',
  surface2: '#f7f9fc',
  border: '#dce8f5',

  // Text
  textPrimary: '#0a1428',
  textSecondary: '#4a6080',
  textMuted: '#8aa0c0',
} as const;

export const Fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#0a1428',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0a1428',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0a1428',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

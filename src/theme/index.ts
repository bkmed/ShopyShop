export const palette = {
  primary: '#2D5BFF', // Modern electric blue
  secondary: '#00F294', // Cyber green
  accent: '#FF3D71', // Electric pink-red
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FFCC00',
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F8F9FA',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray500: '#ADB5BD',
  gray800: '#343A40',
  gray900: '#212529',
  darkSurface: '#151718',
  darkBackground: '#0F0F10',
};

const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

import { Platform } from 'react-native';

const shadows = {
  small: {
    shadowColor: '#091E42',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    ...(Platform.OS === 'web' && {
      boxShadow: '0px 2px 3px rgba(9, 30, 66, 0.1)',
    }),
  },
  medium: {
    shadowColor: '#091E42',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    ...(Platform.OS === 'web' && {
      boxShadow: '0px 8px 12px rgba(9, 30, 66, 0.15)',
    }),
  },
  large: {
    shadowColor: '#091E42',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    ...(Platform.OS === 'web' && {
      boxShadow: '0px 12px 16px rgba(9, 30, 66, 0.2)',
    }),
  },
};

const textVariants = {
  header: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  subheader: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  button: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
};

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  subText: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  warningBackground: string;
  primaryBackground: string;
  successBackground: string;
  card: string;
  notification: string;
  glass: string;
  glassBorder: string;
}

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  shadows: typeof shadows;
  textVariants: any;
}

export const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: palette.primary,
    secondary: palette.secondary,
    accent: palette.accent,
    background: palette.gray100,
    surface: palette.white,
    text: palette.gray900,
    subText: palette.gray500,
    border: palette.gray200,
    error: palette.error,
    success: palette.success,
    warning: palette.warning,
    warningBackground: '#FFFAE6',
    primaryBackground: '#DEEBFF',
    successBackground: '#E3FCEF',
    card: palette.white,
    notification: palette.error,
    glass: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
  },
  spacing,
  shadows,
  textVariants: {
    ...textVariants,
    header: { ...textVariants.header, color: palette.gray900 },
    subheader: { ...textVariants.subheader, color: palette.gray800 },
    body: { ...textVariants.body, color: palette.gray800 },
    caption: { ...textVariants.caption, color: palette.gray500 },
    button: { ...textVariants.button, color: palette.white },
  },
};

export const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#4C9AFF', // Lighter blue for dark mode accessibility
    secondary: palette.secondary,
    accent: palette.accent,
    background: palette.darkBackground,
    surface: palette.darkSurface,
    text: '#E3E3E3',
    subText: '#A5ADBA',
    border: '#334454',
    error: palette.error,
    success: palette.success,
    warning: palette.warning,
    warningBackground: '#2D2200',
    primaryBackground: '#0747A6',
    successBackground: '#006644',
    card: palette.darkSurface,
    notification: palette.error,
    glass: 'rgba(21, 23, 24, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
  },
  spacing,
  shadows,
  textVariants: {
    ...textVariants,
    header: { ...textVariants.header, color: '#FFFFFF' },
    subheader: { ...textVariants.subheader, color: '#E3E3E3' },
    body: { ...textVariants.body, color: '#E3E3E3' },
    caption: { ...textVariants.caption, color: '#A5ADBA' },
    button: { ...textVariants.button, color: palette.white },
  },
};

export const premiumTheme: Theme = {
  dark: true,
  colors: {
    primary: '#FFD700', // Gold for premium
    secondary: '#4CAF50', // Success green
    accent: '#FF6700', // Vibrant orange
    background: '#0A0A0A', // Deep black
    surface: '#1A1A1A', // Dark surface
    text: '#FFFFFF', // White text
    subText: '#B0B0B0', // Light gray
    border: '#333333', // Subtle border
    error: '#D32F2F',
    success: '#4CAF50',
    warning: '#FFA000',
    warningBackground: '#2D2200',
    primaryBackground: '#3D3004', // Dark gold background
    successBackground: '#1B5E20',
    card: '#1E1E1E',
    notification: '#FFD700',
    glass: 'rgba(26, 26, 26, 0.7)',
    glassBorder: 'rgba(255, 215, 0, 0.1)',
  },
  spacing,
  shadows: {
    ...shadows,
    medium: {
      shadowColor: '#FFD700',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
      ...(Platform.OS === 'web' && {
        boxShadow: '0px 4px 10px rgba(255, 215, 0, 0.3)',
      }),
    } as any, // Cast to any to avoid complex shadow overlap issues
  },
  textVariants: {
    ...textVariants,
    header: { ...textVariants.header, color: '#FFD700', letterSpacing: 0.5 },
    subheader: { ...textVariants.subheader, color: '#FFFFFF' },
    body: { ...textVariants.body, color: '#FFFFFF' },
    caption: { ...textVariants.caption, color: '#B0B0B0' },
    button: { ...textVariants.button, color: '#0A0A0A' },
  },
};

export const createCustomTheme = (customColors: {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
}): Theme => {
  const isDark = true; // Most custom themes look better in dark mode base
  return {
    dark: isDark,
    colors: {
      primary: customColors.primary,
      secondary: customColors.secondary,
      accent: palette.accent,
      background: customColors.background,
      surface: customColors.surface,
      text: '#FFFFFF',
      subText: palette.gray500,
      border: palette.gray800,
      error: palette.error,
      success: palette.success,
      warning: palette.warning,
      warningBackground: '#2D2200',
      primaryBackground: customColors.primary + '33',
      successBackground: '#E3FCEF',
      card: customColors.surface,
      notification: customColors.primary,
      glass: customColors.surface + 'B3',
      glassBorder: 'rgba(255, 255, 255, 0.1)',
    },
    spacing,
    shadows,
    textVariants: {
      ...textVariants,
      header: { ...textVariants.header, color: '#FFFFFF' },
      subheader: { ...textVariants.subheader, color: '#E3E3E3' },
      body: { ...textVariants.body, color: '#E3E3E3' },
      caption: { ...textVariants.caption, color: palette.gray500 },
      button: { ...textVariants.button, color: '#FFFFFF' },
    },
  };
};

export const theme = lightTheme; // Default export for backward compatibility during refactor

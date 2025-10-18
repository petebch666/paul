import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Custom colors matching the original Pollz design
const customColors = {
  primary: '#667eea',
  primaryContainer: '#e8edff',
  secondary: '#764ba2',
  secondaryContainer: '#f3e8ff',
  tertiary: '#ff6b6b',
  tertiaryContainer: '#ffe8e8',
  surface: '#ffffff',
  surfaceVariant: '#f8f9fa',
  background: '#ffffff',
  error: '#f5576c',
  errorContainer: '#ffe8e8',
  onPrimary: '#ffffff',
  onSecondary: '#ffffff',
  onTertiary: '#ffffff',
  onSurface: '#000000',
  onSurfaceVariant: '#666666',
  onBackground: '#000000',
  onError: '#ffffff',
  outline: '#dee2e6',
  outlineVariant: '#e9ecef',
  shadow: '#000000',
  scrim: '#000000',
};

// Light theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...customColors,
  },
  fonts: {
    ...MD3LightTheme.fonts,
    // Use system fonts for better performance
    headlineLarge: {
      fontFamily: 'System',
      fontSize: 32,
      fontWeight: '900',
      letterSpacing: 1,
    },
    headlineMedium: {
      fontFamily: 'System',
      fontSize: 28,
      fontWeight: '700',
      letterSpacing: 1,
    },
    headlineSmall: {
      fontFamily: 'System',
      fontSize: 24,
      fontWeight: '600',
      letterSpacing: 1,
    },
    titleLarge: {
      fontFamily: 'System',
      fontSize: 22,
      fontWeight: '600',
      letterSpacing: 1,
    },
    titleMedium: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    titleSmall: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    bodyLarge: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '400',
      letterSpacing: 0.5,
    },
    bodyMedium: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '400',
      letterSpacing: 0.25,
    },
    bodySmall: {
      fontFamily: 'System',
      fontSize: 12,
      fontWeight: '400',
      letterSpacing: 0.4,
    },
    labelLarge: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: 0.1,
    },
    labelMedium: {
      fontFamily: 'System',
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    labelSmall: {
      fontFamily: 'System',
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
  },
};

// Dark theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#667eea',
    primaryContainer: '#2a3d7a',
    secondary: '#764ba2',
    secondaryContainer: '#4a2c5a',
    tertiary: '#ff6b6b',
    tertiaryContainer: '#8b1a1a',
    surface: '#121212',
    surfaceVariant: '#1e1e1e',
    background: '#000000',
    error: '#f5576c',
    errorContainer: '#8b1a1a',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onTertiary: '#ffffff',
    onSurface: '#ffffff',
    onSurfaceVariant: '#cccccc',
    onBackground: '#ffffff',
    onError: '#ffffff',
    outline: '#404040',
    outlineVariant: '#2a2a2a',
    shadow: '#000000',
    scrim: '#000000',
  },
  fonts: lightTheme.fonts,
};

// Export default theme
export const theme = lightTheme;
export default lightTheme;


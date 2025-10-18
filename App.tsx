import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/components/auth/AuthProvider';
import AppNavigator from './src/navigation/AppNavigator';

// Simple theme
const theme = {
  colors: {
    primary: '#667eea',
    primaryContainer: '#e8edff',
    secondary: '#764ba2',
    secondaryContainer: '#f3e8ff',
    surface: '#ffffff',
    surfaceVariant: '#f8f9fa',
    background: '#f8f9fa',
    error: '#f5576c',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onSurface: '#000000',
    onSurfaceVariant: '#666666',
    onBackground: '#000000',
    onError: '#ffffff',
    outline: '#dee2e6',
    outlineVariant: '#e9ecef',
  },
  fonts: {
    headlineLarge: {
      fontFamily: 'System',
      fontSize: 32,
      fontWeight: '900',
    },
    headlineMedium: {
      fontFamily: 'System',
      fontSize: 28,
      fontWeight: '700',
    },
    headlineSmall: {
      fontFamily: 'System',
      fontSize: 24,
      fontWeight: '600',
    },
    titleLarge: {
      fontFamily: 'System',
      fontSize: 22,
      fontWeight: '600',
    },
    titleMedium: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '600',
    },
    bodyLarge: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '400',
    },
    bodyMedium: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '400',
    },
  },
  roundness: 8,
};

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </PaperProvider>
  );
};

export default App;
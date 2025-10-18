import React from 'react';
import { AuthProvider } from './src/components/auth/AuthProvider';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
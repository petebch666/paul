import React from 'react'
import { registerRootComponent } from 'expo'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
  useFonts,
  Silkscreen_400Regular,
  Silkscreen_700Bold,
} from '@expo-google-fonts/silkscreen'
import { View, Text, StyleSheet } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { AuthProvider, useAuth } from './src/hooks/useAuth'
import AppNavigator from './src/navigation'
import AuthScreen from './src/screens/AuthScreen'

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>LOADING...</Text>
      </View>
    )
  }

  if (!isAuthenticated) {
    return <AuthScreen />
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  )
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Silkscreen_400Regular,
    Silkscreen_700Bold,
  })

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <Text>.</Text>
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppContent />
          <StatusBar style="light" backgroundColor="#000000" />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

registerRootComponent(App)

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Silkscreen_400Regular',
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 4,
  },
})

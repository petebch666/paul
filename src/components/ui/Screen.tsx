import React, { useEffect } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { theme } from '../../theme'

const MAX_WIDTH = 960

interface ScreenProps {
  children: React.ReactNode
  scroll?: boolean
  keyboardAvoiding?: boolean
  padding?: boolean
}

export function Screen({ children, scroll = false, keyboardAvoiding = false, padding = false }: ScreenProps) {
  const { width } = useWindowDimensions()
  const isTablet = width >= 768
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(16)

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 })
    translateY.value = withTiming(0, { duration: 300 })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  const tabletStyle: ViewStyle | undefined = isTablet
    ? { maxWidth: MAX_WIDTH, alignSelf: 'center', width: '100%' }
    : undefined

  const scrollContent = (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[styles.scrollContent, padding && styles.padded]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={tabletStyle}>{children}</View>
    </ScrollView>
  )

  const staticContent = (
    <Reanimated.View style={[styles.flex, padding && styles.padded, animStyle]}>
      <View style={[styles.flex, tabletStyle]}>{children}</View>
    </Reanimated.View>
  )

  const inner = scroll ? (
    <Reanimated.View style={[styles.flex, animStyle]}>
      {scrollContent}
    </Reanimated.View>
  ) : staticContent

  if (keyboardAvoiding) {
    return (
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {inner}
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      {inner}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  padded: {
    padding: theme.spacing.lg,
  },
})

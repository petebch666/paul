import React, { useState } from 'react'
import { TextInput, Text, View, StyleSheet, TextInputProps, ViewStyle } from 'react-native'
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated'
import { theme } from '../../theme'

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string
  error?: string
  charCount?: { current: number; max: number }
  containerStyle?: ViewStyle
}

const AnimatedView = Reanimated.createAnimatedComponent(View)

export function Input({ label, error, charCount, containerStyle, ...textInputProps }: InputProps) {
  const [focused, setFocused] = useState(false)
  const focus = useSharedValue(0)

  function handleFocus() {
    setFocused(true)
    focus.value = withTiming(1, { duration: theme.animation.fast })
    textInputProps.onFocus?.({} as any)
  }

  function handleBlur() {
    setFocused(false)
    focus.value = withTiming(0, { duration: theme.animation.fast })
    textInputProps.onBlur?.({} as any)
  }

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focus.value,
      [0, 1],
      [error ? theme.colors.danger : theme.colors.borderMuted, theme.colors.border]
    ),
  }))

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <AnimatedView style={[styles.inputContainer, borderStyle]}>
        <TextInput
          {...textInputProps}
          style={[
            styles.input,
            textInputProps.multiline && styles.multiline,
          ]}
          placeholderTextColor={theme.colors.textDim}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </AnimatedView>
      {charCount ? (
        <Text style={styles.charCount}>{charCount.current}/{charCount.max}</Text>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    letterSpacing: 2,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  inputContainer: {
    borderWidth: theme.borderWidth,
  },
  input: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    letterSpacing: 1,
    backgroundColor: theme.colors.background,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.sm,
  },
  charCount: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textDim,
    textAlign: 'right',
    letterSpacing: 1,
    marginTop: 2,
  },
  error: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.danger,
    letterSpacing: 1,
    marginTop: theme.spacing.xs,
  },
})

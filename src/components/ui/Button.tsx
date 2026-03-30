import React from 'react'
import { Text, Pressable, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native'
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { theme } from '../../theme'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  onPress?: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  children: React.ReactNode
  icon?: React.ReactNode
  style?: ViewStyle
}

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable)

const VARIANT_STYLES = {
  primary: { backgroundColor: theme.colors.text, borderColor: theme.colors.text },
  secondary: { backgroundColor: 'transparent' as const, borderColor: theme.colors.border },
  ghost: { backgroundColor: 'transparent' as const, borderColor: theme.colors.borderMuted },
  danger: { backgroundColor: 'transparent' as const, borderColor: theme.colors.danger },
}

const TEXT_COLORS = {
  primary: theme.colors.background,
  secondary: theme.colors.text,
  ghost: theme.colors.textMuted,
  danger: theme.colors.danger,
}

const SIZE_PADDING = {
  sm: { paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs },
  md: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm + 2 },
  lg: { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md },
}

const SIZE_FONT = {
  sm: theme.fontSize.xxs,
  md: theme.fontSize.sm,
  lg: theme.fontSize.md,
}

export function Button({
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  icon,
  style,
}: ButtonProps) {
  const scale = useSharedValue(1)

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  function handlePressIn() {
    scale.value = withSpring(0.95, theme.animation.springSnappy)
  }

  function handlePressOut() {
    scale.value = withSpring(1, theme.animation.springSnappy)
  }

  const textColor = TEXT_COLORS[variant]

  return (
    <AnimatedPressable
      style={[
        styles.base,
        VARIANT_STYLES[variant],
        SIZE_PADDING[size],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        animStyle,
        style,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: textColor, fontSize: SIZE_FONT[size] }]}>
            {children}
          </Text>
        </>
      )}
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: theme.borderWidth,
    gap: theme.spacing.xs,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: theme.fonts.bold,
    letterSpacing: 2,
  },
})

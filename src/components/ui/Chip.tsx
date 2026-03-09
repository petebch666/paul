import React from 'react'
import { Text, Pressable, StyleSheet, ViewStyle } from 'react-native'
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { theme } from '../../theme'

interface ChipProps {
  label: string
  selected?: boolean
  onPress?: () => void
  icon?: React.ReactNode
  size?: 'sm' | 'md'
  style?: ViewStyle
  flex?: boolean
}

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable)

export function Chip({ label, selected = false, onPress, icon, size = 'sm', style, flex = false }: ChipProps) {
  const scale = useSharedValue(1)

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  function handlePressIn() {
    scale.value = withSpring(0.93, theme.animation.springSnappy)
  }

  function handlePressOut() {
    scale.value = withSpring(1, theme.animation.springSnappy)
  }

  const paddingH = size === 'md' ? theme.spacing.md : theme.spacing.sm
  const paddingV = size === 'md' ? theme.spacing.sm : theme.spacing.xs

  return (
    <AnimatedPressable
      style={[
        styles.chip,
        { paddingHorizontal: paddingH, paddingVertical: paddingV },
        selected && styles.selected,
        flex && { flex: 1 },
        animStyle,
        style,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {icon}
      <Text
        style={[
          styles.label,
          { fontSize: size === 'md' ? theme.fontSize.xs : theme.fontSize.xxs },
          selected && styles.selectedText,
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.borderMuted,
    gap: theme.spacing.xs,
  },
  selected: {
    backgroundColor: theme.colors.text,
    borderColor: theme.colors.text,
  },
  label: {
    fontFamily: theme.fonts.regular,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  selectedText: {
    color: theme.colors.background,
  },
})

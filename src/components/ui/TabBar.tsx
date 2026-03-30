import React, { useEffect, useRef } from 'react'
import { View, Text, Pressable, LayoutRectangle, StyleSheet } from 'react-native'
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { theme } from '../../theme'

interface TabItem {
  label: string
  value: string
  icon?: (color: string) => React.ReactNode
}

interface TabBarProps {
  tabs: TabItem[]
  active: string
  onSelect: (value: string) => void
}

export function TabBar({ tabs, active, onSelect }: TabBarProps) {
  const layoutsRef = useRef<Record<string, LayoutRectangle>>({})
  const underlineX = useSharedValue(0)
  const underlineWidth = useSharedValue(0)

  const underlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: underlineX.value }],
    width: underlineWidth.value,
  }))

  function applyActiveLayout(value: string) {
    const layout = layoutsRef.current[value]
    if (layout) {
      underlineX.value = withSpring(layout.x, theme.animation.spring)
      underlineWidth.value = withSpring(layout.width, theme.animation.spring)
    }
  }

  useEffect(() => {
    applyActiveLayout(active)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  function handleLayout(value: string, layout: LayoutRectangle) {
    layoutsRef.current[value] = layout
    if (value === active) {
      // Set immediately (no spring) on first layout
      underlineX.value = layout.x
      underlineWidth.value = layout.width
    }
  }

  return (
    <View style={styles.container}>
      {tabs.map(tab => (
        <Pressable
          key={tab.value}
          style={styles.tab}
          onPress={() => onSelect(tab.value)}
          onLayout={e => handleLayout(tab.value, e.nativeEvent.layout)}
        >
          {tab.icon ? tab.icon(active === tab.value ? theme.colors.text : theme.colors.textDim) : null}
          <Text style={[styles.label, active === tab.value && styles.labelActive]}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
      <Reanimated.View style={[styles.underline, underlineStyle]} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: theme.borderWidth,
    borderBottomColor: theme.colors.borderMuted,
    position: 'relative',
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  label: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textDim,
    letterSpacing: 2,
  },
  labelActive: {
    color: theme.colors.text,
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    backgroundColor: theme.colors.text,
  },
})

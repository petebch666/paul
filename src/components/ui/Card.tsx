import React from 'react'
import { StyleSheet, ViewStyle } from 'react-native'
import Reanimated from 'react-native-reanimated'
import { theme } from '../../theme'

interface CardProps {
  children: React.ReactNode
  animated?: boolean
  animatedStyle?: object
  padding?: number
  style?: ViewStyle
}

export function Card({ children, animatedStyle, padding = theme.spacing.lg, style }: CardProps) {
  return (
    <Reanimated.View style={[styles.card, { padding }, style, animatedStyle]}>
      {children}
    </Reanimated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#141414',
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
  },
})

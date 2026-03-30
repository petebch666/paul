import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../../theme'

interface ErrorBoxProps {
  message: string
  variant?: 'error' | 'warning'
}

export function ErrorBox({ message, variant = 'error' }: ErrorBoxProps) {
  const color = variant === 'warning' ? theme.colors.warning : theme.colors.danger

  return (
    <View style={[styles.box, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    borderWidth: theme.borderWidth,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  text: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    letterSpacing: 1,
  },
})

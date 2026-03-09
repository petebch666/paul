import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../../theme'

interface StatBoxProps {
  value: string | number
  label: string
  icon?: React.ReactNode
  size?: 'sm' | 'md'
}

export function StatBox({ value, label, icon, size = 'sm' }: StatBoxProps) {
  const valueFontSize = size === 'md' ? theme.fontSize.xl : theme.fontSize.lg

  return (
    <View style={styles.box}>
      {icon}
      <Text style={[styles.value, { fontSize: valueFontSize }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.borderMuted,
    padding: theme.spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    letterSpacing: 2,
  },
  label: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    letterSpacing: 1,
    textAlign: 'center',
  },
})

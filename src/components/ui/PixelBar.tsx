import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../../theme'

interface PixelBarProps {
  pct: number
  label: string
  segments?: number
}

export function PixelBar({ pct, label, segments = 10 }: PixelBarProps) {
  const filled = Math.round((pct / 100) * segments)
  const empty = segments - filled

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.bar}>
        {'█'.repeat(filled)}{'░'.repeat(empty)}
      </Text>
      <Text style={styles.pct}>{Math.round(pct)}%</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  label: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    width: 24,
    letterSpacing: 1,
  },
  bar: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    flex: 1,
    letterSpacing: 1,
  },
  pct: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    width: 36,
    textAlign: 'right',
  },
})

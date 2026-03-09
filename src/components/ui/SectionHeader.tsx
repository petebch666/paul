import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../../theme'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  right?: React.ReactNode
  border?: boolean
}

export function SectionHeader({ title, subtitle, right, border = true }: SectionHeaderProps) {
  return (
    <View style={[styles.header, border && styles.border]}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  border: {
    borderBottomWidth: theme.borderWidth,
    borderBottomColor: theme.colors.borderMuted,
  },
  left: {
    gap: 4,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.xl,
    color: theme.colors.text,
    letterSpacing: 6,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
})

import React from 'react'
import { View } from 'react-native'
import { theme } from '../../theme'

interface DividerProps {
  color?: 'muted' | 'bright'
  spacing?: number
}

export function Divider({ color = 'muted', spacing = theme.spacing.sm }: DividerProps) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: color === 'bright' ? theme.colors.border : theme.colors.borderMuted,
        marginVertical: spacing,
      }}
    />
  )
}

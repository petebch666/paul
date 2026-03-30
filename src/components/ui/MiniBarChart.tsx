import React from 'react'
import { View, Text } from 'react-native'
import { theme } from '../../theme'

interface BarDatum {
  label: string
  value: number
}

interface MiniBarChartProps {
  data: BarDatum[]
  height?: number
  color?: string
}

export function MiniBarChart({ data, height = 48, color = theme.colors.text }: MiniBarChartProps) {
  const max = Math.max(...data.map(d => d.value), 1)

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: height + 16 }}>
      {data.map((d, i) => {
        const barH = Math.max(2, Math.round((d.value / max) * height))
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: height + 16 }}>
            <View style={{ width: '80%', height: barH, backgroundColor: color }} />
            <Text style={{ fontFamily: theme.fonts.regular, fontSize: 7, color: theme.colors.textDim, marginTop: 2, letterSpacing: 0 }}>
              {d.label}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

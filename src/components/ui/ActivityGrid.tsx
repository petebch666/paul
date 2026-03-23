import React from 'react'
import { View, Text } from 'react-native'
import { theme } from '../../theme'

interface ActivityGridProps {
  /** Map of ISO date strings (YYYY-MM-DD) to vote counts */
  activity: Record<string, number>
  days?: number
}

export function ActivityGrid({ activity, days = 30 }: ActivityGridProps) {
  // Build array of last `days` dates
  const dates: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    dates.push(d.toISOString().slice(0, 10))
  }

  const maxVal = Math.max(...dates.map(d => activity[d] || 0), 1)

  // Group into weeks (columns of 7)
  const weeks: string[][] = []
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7))
  }

  function getColor(count: number): string {
    if (count === 0) return theme.colors.borderMuted
    const intensity = Math.ceil((count / maxVal) * 3)
    if (intensity >= 3) return theme.colors.text
    if (intensity === 2) return '#888'
    return '#444'
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 2 }}>
        {weeks.map((week, wi) => (
          <View key={wi} style={{ flexDirection: 'column', gap: 2 }}>
            {week.map(date => {
              const count = activity[date] || 0
              return (
                <View
                  key={date}
                  style={{
                    width: 10,
                    height: 10,
                    backgroundColor: getColor(count),
                  }}
                />
              )
            })}
          </View>
        ))}
      </View>
      <Text style={{ fontFamily: theme.fonts.regular, fontSize: 8, color: theme.colors.textDim, marginTop: 4, letterSpacing: 1 }}>
        LAST {days} DAYS
      </Text>
    </View>
  )
}

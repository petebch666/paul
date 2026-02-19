import React, { useState, useEffect } from 'react'
import { IonBadge, IonIcon } from '@ionic/react'
import { flameOutline, flame, trophyOutline } from 'ionicons/icons'
import { SupabasePollzAPI } from '../database/supabase-api'

interface StreakBadgeProps {
  userId: string
  size?: 'small' | 'medium' | 'large'
  showLabel?: boolean
  showBestStreak?: boolean
  onStreakLoad?: (streak: number) => void
}

const StreakBadge: React.FC<StreakBadgeProps> = ({
  userId,
  size = 'medium',
  showLabel = true,
  showBestStreak = false,
  onStreakLoad
}) => {
  const [currentStreak, setCurrentStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [isAtRisk, setIsAtRisk] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStreak()
  }, [userId])

  const loadStreak = async () => {
    try {
      setLoading(true)
      const streak = await SupabasePollzAPI.getUserStreak(userId)
      setCurrentStreak(streak.currentStreak)
      setLongestStreak(streak.longestStreak)

      // Check if at risk of losing streak
      const status = await SupabasePollzAPI.checkStreakStatus(userId)
      setIsAtRisk(status.isAtRisk)

      onStreakLoad?.(streak.currentStreak)
    } catch (error) {
      console.error('Error loading streak:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStreakColor = () => {
    if (currentStreak === 0) return 'medium'
    if (currentStreak >= 30) return 'danger' // 30+ days = legendary
    if (currentStreak >= 14) return 'warning' // 14+ days = epic
    if (currentStreak >= 7) return 'primary' // 7+ days = rare
    return 'success' // Active streak
  }

  const getStreakIcon = () => {
    if (currentStreak >= 7) return flame // Solid flame for 7+ days
    return flameOutline
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { fontSize: '10px', padding: '4px 8px', iconSize: '12px' }
      case 'large':
        return { fontSize: '16px', padding: '8px 16px', iconSize: '20px' }
      default:
        return { fontSize: '12px', padding: '6px 12px', iconSize: '16px' }
    }
  }

  const styles = getSizeStyles()

  if (loading) {
    return (
      <IonBadge
        color="light"
        style={{
          fontFamily: 'Courier New, monospace',
          fontSize: styles.fontSize,
          padding: styles.padding,
          opacity: 0.5
        }}
      >
        ...
      </IonBadge>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <IonBadge
        color={getStreakColor()}
        style={{
          fontFamily: 'Courier New, monospace',
          fontWeight: '700',
          fontSize: styles.fontSize,
          padding: styles.padding,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          animation: isAtRisk ? 'pulse 1.5s ease-in-out infinite' : undefined
        }}
      >
        <IonIcon icon={getStreakIcon()} style={{ fontSize: styles.iconSize }} />
        {currentStreak}
        {showLabel && <span style={{ marginLeft: '2px' }}>DAY{currentStreak !== 1 ? 'S' : ''}</span>}
      </IonBadge>

      {showBestStreak && longestStreak > currentStreak && (
        <IonBadge
          color="light"
          style={{
            fontFamily: 'Courier New, monospace',
            fontWeight: '600',
            fontSize: styles.fontSize,
            padding: styles.padding,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            opacity: 0.7
          }}
        >
          <IonIcon icon={trophyOutline} style={{ fontSize: styles.iconSize }} />
          BEST: {longestStreak}
        </IonBadge>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}

export default StreakBadge

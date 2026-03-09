import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { theme } from '../theme'
import { useAuth } from '../hooks/useAuth'
import { getUserPolls } from '../database/supabase-api'
import { Poll } from '../types'
import { Screen, TabBar, StatBox, PollRow, Button } from '../components/ui'

const PROFILE_TABS = [
  { label: 'STATS', value: 'STATS' },
  { label: 'POLLS', value: 'POLLS' },
]

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [tab, setTab] = useState('STATS')

  useEffect(() => {
    if (tab === 'POLLS' && user) loadPolls()
  }, [tab, user])

  async function loadPolls() {
    if (!user) return
    setIsLoading(true)
    try {
      const data = await getUserPolls(user.id)
      setPolls(data)
    } catch {
      // silently fail
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  const joinYear = new Date(user.joinDate).getFullYear()

  return (
    <Screen>
      <ScrollView>
        {/* Profile header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: theme.spacing.lg, borderBottomWidth: theme.borderWidth, borderBottomColor: theme.colors.borderMuted, gap: theme.spacing.md }}>
          <Text style={{ fontSize: 40 }}>{user.avatar}</Text>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.lg, color: theme.colors.text, letterSpacing: 2 }}>
              {user.name.toUpperCase()}
            </Text>
            <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 1 }}>
              @{user.username}
            </Text>
            {user.role === 'admin' && (
              <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.xxs, color: theme.colors.background, backgroundColor: theme.colors.text, paddingHorizontal: theme.spacing.xs, paddingVertical: 2, letterSpacing: 2, alignSelf: 'flex-start', marginTop: 2 }}>
                ADMIN
              </Text>
            )}
          </View>
          <Button variant="ghost" size="sm" onPress={logout}>LOGOUT</Button>
        </View>

        {/* Member since */}
        <View style={{ paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm, borderBottomWidth: theme.borderWidth, borderBottomColor: theme.colors.borderMuted }}>
          <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xxs, color: theme.colors.textDim, letterSpacing: 2 }}>
            MEMBER SINCE {joinYear}
          </Text>
        </View>

        <TabBar tabs={PROFILE_TABS} active={tab} onSelect={setTab} />

        {tab === 'STATS' ? (
          <View style={{ padding: theme.spacing.lg }}>
            <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
              <StatBox label="POLLS" value={user.pollCount} />
              <StatBox label="FOLLOWERS" value={user.followers} />
              <StatBox label="REP" value={user.reputation} />
            </View>
            <View style={{ flexDirection: 'row', gap: theme.spacing.xs, marginTop: theme.spacing.xs }}>
              <StatBox label="WIN RATE" value={`${Math.round(user.winRate)}%`} />
              <StatBox label="FOLLOWING" value={user.following} />
              <StatBox label="STATUS" value={(user.status || 'ACTIVE').toUpperCase()} />
            </View>
          </View>
        ) : (
          <View style={{ padding: theme.spacing.lg }}>
            {isLoading ? (
              <View style={{ paddingVertical: theme.spacing.xl, alignItems: 'center' }}>
                <ActivityIndicator color={theme.colors.text} />
              </View>
            ) : polls.length === 0 ? (
              <View style={{ paddingVertical: theme.spacing.xl, alignItems: 'center' }}>
                <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.sm, color: theme.colors.textMuted, letterSpacing: 4 }}>
                  NO POLLS YET
                </Text>
              </View>
            ) : (
              polls.map(p => <PollRow key={p.id} poll={p} variant="profile" />)
            )}
          </View>
        )}
      </ScrollView>
    </Screen>
  )
}

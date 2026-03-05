import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../theme'
import { useAuth } from '../hooks/useAuth'
import { getUserPolls } from '../database/supabase-api'
import { Poll } from '../types'

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={statStyles.box}>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  )
}

const statStyles = StyleSheet.create({
  box: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.borderMuted,
    padding: theme.spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    letterSpacing: 2,
  },
  label: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
})

function PollRow({ poll }: { poll: Poll }) {
  const pctA = poll.votes > 0 ? Math.round((poll.votesOptionA / poll.votes) * 100) : 0
  const pctB = poll.votes > 0 ? Math.round((poll.votesOptionB / poll.votes) * 100) : 0

  return (
    <View style={pollRowStyles.row}>
      <View style={pollRowStyles.meta}>
        <Text style={pollRowStyles.category}>{poll.category}</Text>
        <Text style={pollRowStyles.time}>{poll.isExpired ? 'ENDED' : poll.timeLeft}</Text>
      </View>
      <Text style={pollRowStyles.title} numberOfLines={2}>{poll.title}</Text>
      <View style={pollRowStyles.stats}>
        <Text style={pollRowStyles.stat}>A {pctA}%</Text>
        <Text style={pollRowStyles.votes}>{poll.votes} VOTES</Text>
        <Text style={pollRowStyles.stat}>B {pctB}%</Text>
      </View>
    </View>
  )
}

const pollRowStyles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderColor: theme.colors.borderMuted,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  category: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textDim,
    letterSpacing: 2,
  },
  time: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textDim,
    letterSpacing: 1,
  },
  title: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    letterSpacing: 1,
    lineHeight: 18,
    marginBottom: theme.spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  stat: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    letterSpacing: 1,
  },
  votes: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
})

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth()
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [tab, setTab] = useState<'STATS' | 'POLLS'>('STATS')

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

  function handleLogout() {
    logout()
  }

  if (!user) return null

  const joinYear = new Date(user.joinDate).getFullYear()

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <Text style={styles.avatar}>{user.avatar}</Text>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.name.toUpperCase()}</Text>
            <Text style={styles.username}>@{user.username}</Text>
            {user.role === 'admin' && (
              <Text style={styles.adminBadge}>ADMIN</Text>
            )}
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>LOGOUT</Text>
          </TouchableOpacity>
        </View>

        {/* Member since */}
        <View style={styles.memberRow}>
          <Text style={styles.memberText}>MEMBER SINCE {joinYear}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(['STATS', 'POLLS'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'STATS' ? (
          <View style={styles.section}>
            {/* Stats grid */}
            <View style={styles.statsRow}>
              <StatBox label="POLLS" value={user.pollCount} />
              <StatBox label="FOLLOWERS" value={user.followers} />
              <StatBox label="REP" value={user.reputation} />
            </View>
            <View style={[styles.statsRow, { marginTop: theme.spacing.xs }]}>
              <StatBox label="WIN RATE" value={`${Math.round(user.winRate)}%`} />
              <StatBox label="FOLLOWING" value={user.following} />
              <StatBox label="STATUS" value={(user.status || 'ACTIVE').toUpperCase()} />
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            {isLoading ? (
              <View style={styles.center}>
                <ActivityIndicator color={theme.colors.text} />
              </View>
            ) : polls.length === 0 ? (
              <View style={styles.center}>
                <Text style={styles.emptyText}>NO POLLS YET</Text>
              </View>
            ) : (
              polls.map(p => <PollRow key={p.id} poll={p} />)
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: theme.borderWidth,
    borderBottomColor: theme.colors.borderMuted,
    gap: theme.spacing.md,
  },
  avatar: {
    fontSize: 40,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    letterSpacing: 2,
  },
  username: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  adminBadge: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.background,
    backgroundColor: theme.colors.text,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    letterSpacing: 2,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  logoutBtn: {
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.borderMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  logoutText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    letterSpacing: 2,
  },
  memberRow: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: theme.borderWidth,
    borderBottomColor: theme.colors.borderMuted,
  },
  memberText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textDim,
    letterSpacing: 2,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: theme.borderWidth,
    borderBottomColor: theme.colors.borderMuted,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.text,
  },
  tabText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textDim,
    letterSpacing: 2,
  },
  tabTextActive: {
    color: theme.colors.text,
  },
  section: {
    padding: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  center: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    letterSpacing: 4,
  },
})

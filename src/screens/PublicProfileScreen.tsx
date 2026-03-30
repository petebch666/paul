import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { theme } from '../theme'
import { getUserById, getUserPolls, getUserActivity } from '../database/supabase-api'
import { User, Poll } from '../types'
import { Screen, StatBox, PollRow, Button, ErrorBox } from '../components/ui'
import { ActivityGrid } from '../components/ui/ActivityGrid'
import { useAuth } from '../hooks/useAuth'
import { useFriends } from '../hooks/useFriends'

interface PublicProfileScreenProps {
  route?: { params?: { userId?: string } }
  navigation?: { goBack: () => void }
  userId?: string
}

export default function PublicProfileScreen({ route, navigation, userId: propUserId }: PublicProfileScreenProps) {
  const userId = propUserId || route?.params?.userId
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [polls, setPolls] = useState<Poll[]>([])
  const [activity, setActivity] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pollsHasMore, setPollsHasMore] = useState(false)
  const [pollsOffset, setPollsOffset] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  const { follow, unfollow, checkIsFollowing } = useFriends(currentUser?.id || '')

  const PAGE_SIZE = 20

  useEffect(() => {
    if (!userId) return
    loadProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function loadProfile() {
    if (!userId) return
    setIsLoading(true)
    setError(null)
    try {
      const [u, p, a] = await Promise.all([
        getUserById(userId),
        getUserPolls(userId, 0, PAGE_SIZE),
        getUserActivity(userId, 30),
      ])
      if (!u) throw new Error('USER NOT FOUND')
      setUser(u)
      setPolls(p.polls)
      setPollsHasMore(p.hasMore)
      setPollsOffset(p.polls.length)
      setActivity(a)

      if (currentUser && currentUser.id !== userId) {
        const isF = await checkIsFollowing(userId)
        setFollowing(isF)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message.toUpperCase() : 'FAILED TO LOAD PROFILE')
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleFollow() {
    if (!userId || !currentUser || currentUser.id === userId) return
    setFollowLoading(true)
    try {
      if (following) {
        await unfollow(userId)
        setFollowing(false)
      } else {
        await follow(userId)
        setFollowing(true)
      }
    } catch { /* ignore */ } finally {
      setFollowLoading(false)
    }
  }

  async function loadMorePolls() {
    if (!userId || !pollsHasMore || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const { polls: p, hasMore } = await getUserPolls(userId, pollsOffset, PAGE_SIZE)
      setPolls(prev => [...prev, ...p])
      setPollsHasMore(hasMore)
      setPollsOffset(o => o + p.length)
    } catch { /* ignore */ } finally {
      setIsLoadingMore(false)
    }
  }

  if (isLoading) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.text} />
        </View>
      </Screen>
    )
  }

  if (error || !user) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg, gap: theme.spacing.md }}>
          <ErrorBox message={error || 'USER NOT FOUND'} />
          {navigation && (
            <Button variant="ghost" onPress={() => navigation.goBack()}>BACK</Button>
          )}
        </View>
      </Screen>
    )
  }

  const joinYear = new Date(user.joinDate).getFullYear()

  return (
    <Screen>
      <ScrollView
        onScroll={e => {
          const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent
          const nearEnd = contentOffset.y + layoutMeasurement.height >= contentSize.height - 200
          if (nearEnd) loadMorePolls()
        }}
        scrollEventThrottle={200}
      >
        {/* Back button */}
        {navigation && (
          <View style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md }}>
            <Button variant="ghost" size="sm" onPress={() => navigation.goBack()}>← BACK</Button>
          </View>
        )}

        {/* Profile header */}
        <View style={{ padding: theme.spacing.lg, borderBottomWidth: theme.borderWidth, borderBottomColor: theme.colors.borderMuted }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md }}>
            <Text style={{ fontSize: 40 }}>{user.avatar}</Text>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.lg, color: theme.colors.text, letterSpacing: 2 }}>
                {user.name.toUpperCase()}
              </Text>
              <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 1 }}>
                @{user.username} · SINCE {joinYear}
              </Text>
              {user.role === 'admin' && (
                <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.xxs, color: theme.colors.background, backgroundColor: theme.colors.text, paddingHorizontal: theme.spacing.xs, paddingVertical: 2, letterSpacing: 2, alignSelf: 'flex-start', marginTop: 2 }}>
                  ADMIN
                </Text>
              )}
              {user.bio ? (
                <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 1, marginTop: theme.spacing.xs, lineHeight: 16 }}>
                  {user.bio}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: theme.spacing.xs, padding: theme.spacing.md, borderBottomWidth: theme.borderWidth, borderBottomColor: theme.colors.borderMuted }}>
          <StatBox label="POLLS" value={user.pollCount} />
          <StatBox label="FOLLOWERS" value={user.followers} />
          <StatBox label="REP" value={user.reputation} />
          <StatBox label="WIN %" value={`${Math.round(user.winRate)}%`} />
        </View>

        {/* Follow button — only shown for other users */}
        {currentUser && currentUser.id !== userId && (
          <View style={{ paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm, borderBottomWidth: theme.borderWidth, borderBottomColor: theme.colors.borderMuted }}>
            <Button
              variant={following ? 'primary' : 'ghost'}
              fullWidth
              loading={followLoading}
              onPress={toggleFollow}
            >
              {following ? 'FOLLOWING' : 'FOLLOW'}
            </Button>
          </View>
        )}

        {/* Activity grid */}
        <View style={{ padding: theme.spacing.lg, borderBottomWidth: theme.borderWidth, borderBottomColor: theme.colors.borderMuted }}>
          <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 3, marginBottom: theme.spacing.sm }}>
            ACTIVITY — LAST 30 DAYS
          </Text>
          <ActivityGrid activity={activity} days={30} />
        </View>

        {/* Polls */}
        <View style={{ padding: theme.spacing.lg }}>
          <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 3, marginBottom: theme.spacing.sm }}>
            POLLS
          </Text>
          {polls.length === 0 ? (
            <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.sm, color: theme.colors.textMuted, letterSpacing: 4, textAlign: 'center', paddingVertical: theme.spacing.xl }}>
              NO POLLS YET
            </Text>
          ) : (
            <>
              {polls.map(p => <PollRow key={p.id} poll={p} variant="profile" />)}
              {pollsHasMore && (
                <Button variant="ghost" fullWidth loading={isLoadingMore} onPress={loadMorePolls}>
                  LOAD MORE
                </Button>
              )}
            </>
          )}
        </View>

        {isLoadingMore && (
          <View style={{ paddingVertical: theme.spacing.md, alignItems: 'center' }}>
            <ActivityIndicator color={theme.colors.textDim} size="small" />
          </View>
        )}
      </ScrollView>
    </Screen>
  )
}

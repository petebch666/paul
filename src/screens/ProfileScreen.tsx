import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native'
import { theme } from '../theme'
import { useAuth } from '../hooks/useAuth'
import { getUserPolls, getUserVoteHistory, getUserActivity, updateUserProfile } from '../database/supabase-api'
import { Poll } from '../types'
import { Screen, TabBar, StatBox, PollRow, Button, Input, ErrorBox } from '../components/ui'
import { ActivityGrid } from '../components/ui/ActivityGrid'

const PROFILE_TABS = [
  { label: 'POLLS', value: 'POLLS' },
  { label: 'VOTED', value: 'VOTED' },
  { label: 'STATS', value: 'STATS' },
]

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth()
  const [tab, setTab] = useState('POLLS')

  // Polls tab
  const [polls, setPolls] = useState<Poll[]>([])
  const [pollsHasMore, setPollsHasMore] = useState(false)
  const [pollsOffset, setPollsOffset] = useState(0)

  // Voted tab
  const [votedPolls, setVotedPolls] = useState<Poll[]>([])
  const [votedHasMore, setVotedHasMore] = useState(false)
  const [votedOffset, setVotedOffset] = useState(0)

  // Activity
  const [activity, setActivity] = useState<Record<string, number>>({})

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Edit mode
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const PAGE_SIZE = 20

  const loadTab = useCallback(async (selectedTab: string) => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    try {
      if (selectedTab === 'POLLS') {
        const { polls: p, hasMore } = await getUserPolls(user.id, 0, PAGE_SIZE)
        setPolls(p)
        setPollsHasMore(hasMore)
        setPollsOffset(p.length)
      } else if (selectedTab === 'VOTED') {
        const { polls: p, hasMore } = await getUserVoteHistory(user.id, 0, PAGE_SIZE)
        setVotedPolls(p)
        setVotedHasMore(hasMore)
        setVotedOffset(p.length)
      } else if (selectedTab === 'STATS') {
        const a = await getUserActivity(user.id, 30)
        setActivity(a)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message.toUpperCase() : 'FAILED TO LOAD')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadTab(tab)
  }, [tab, loadTab])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([loadTab(tab), refreshUser()])
    setRefreshing(false)
  }, [tab, loadTab, refreshUser])

  async function loadMorePolls() {
    if (!user || !pollsHasMore || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const { polls: p, hasMore } = await getUserPolls(user.id, pollsOffset, PAGE_SIZE)
      setPolls(prev => [...prev, ...p])
      setPollsHasMore(hasMore)
      setPollsOffset(o => o + p.length)
    } catch { /* ignore */ } finally {
      setIsLoadingMore(false)
    }
  }

  async function loadMoreVoted() {
    if (!user || !votedHasMore || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const { polls: p, hasMore } = await getUserVoteHistory(user.id, votedOffset, PAGE_SIZE)
      setVotedPolls(prev => [...prev, ...p])
      setVotedHasMore(hasMore)
      setVotedOffset(o => o + p.length)
    } catch { /* ignore */ } finally {
      setIsLoadingMore(false)
    }
  }

  function startEdit() {
    setEditName(user?.name || '')
    setEditBio(user?.bio || '')
    setEditError(null)
    setEditing(true)
  }

  async function saveEdit() {
    if (!user) return
    if (!editName.trim() || editName.trim().length < 2) {
      setEditError('NAME TOO SHORT')
      return
    }
    setEditSaving(true)
    setEditError(null)
    try {
      await updateUserProfile(user.id, {
        name: editName.trim(),
        bio: editBio.trim() || undefined,
      })
      await refreshUser()
      setEditing(false)
    } catch (e) {
      setEditError(e instanceof Error ? e.message.toUpperCase() : 'SAVE FAILED')
    } finally {
      setEditSaving(false)
    }
  }

  if (!user) return null

  const joinYear = new Date(user.joinDate).getFullYear()

  return (
    <Screen>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.textDim} />}
        onScroll={e => {
          const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent
          const nearEnd = contentOffset.y + layoutMeasurement.height >= contentSize.height - 200
          if (nearEnd) {
            if (tab === 'POLLS') loadMorePolls()
            else if (tab === 'VOTED') loadMoreVoted()
          }
        }}
        scrollEventThrottle={200}
      >
        {/* Profile header */}
        {editing ? (
          <View style={{ padding: theme.spacing.lg, borderBottomWidth: theme.borderWidth, borderBottomColor: theme.colors.borderMuted, gap: theme.spacing.sm }}>
            <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.sm, color: theme.colors.text, letterSpacing: 4 }}>
              EDIT PROFILE
            </Text>
            <Input label="NAME" value={editName} onChangeText={setEditName} placeholder="YOUR NAME" autoCapitalize="words" />
            <Input
              label="BIO (OPTIONAL)"
              value={editBio}
              onChangeText={setEditBio}
              placeholder="SAY SOMETHING..."
              multiline
              numberOfLines={2}
              maxLength={120}
              charCount={{ current: editBio.length, max: 120 }}
            />
            {editError ? <ErrorBox message={editError} /> : null}
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Button variant="primary" fullWidth loading={editSaving} onPress={saveEdit}>SAVE</Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button variant="ghost" fullWidth onPress={() => setEditing(false)}>CANCEL</Button>
              </View>
            </View>
          </View>
        ) : (
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
              <Button variant="ghost" size="sm" onPress={startEdit}>EDIT</Button>
            </View>
          </View>
        )}

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: theme.spacing.xs, padding: theme.spacing.md, borderBottomWidth: theme.borderWidth, borderBottomColor: theme.colors.borderMuted }}>
          <StatBox label="POLLS" value={user.pollCount} />
          <StatBox label="FOLLOWERS" value={user.followers} />
          <StatBox label="REP" value={user.reputation} />
          <StatBox label="WIN %" value={`${Math.round(user.winRate)}%`} />
        </View>

        {/* Logout */}
        <View style={{ paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm, borderBottomWidth: theme.borderWidth, borderBottomColor: theme.colors.borderMuted }}>
          <Button variant="ghost" size="sm" onPress={logout}>LOGOUT</Button>
        </View>

        <TabBar tabs={PROFILE_TABS} active={tab} onSelect={setTab} />

        {/* Tab content */}
        <View style={{ padding: theme.spacing.lg }}>
          {isLoading ? (
            <View style={{ paddingVertical: theme.spacing.xl, alignItems: 'center' }}>
              <ActivityIndicator color={theme.colors.text} />
            </View>
          ) : error ? (
            <View style={{ gap: theme.spacing.sm }}>
              <ErrorBox message={error} />
              <Button variant="ghost" onPress={() => loadTab(tab)}>RETRY</Button>
            </View>
          ) : tab === 'POLLS' ? (
            polls.length === 0 ? (
              <View style={{ paddingVertical: theme.spacing.xl, alignItems: 'center' }}>
                <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.sm, color: theme.colors.textMuted, letterSpacing: 4 }}>
                  NO POLLS YET
                </Text>
              </View>
            ) : (
              <>
                {polls.map(p => <PollRow key={p.id} poll={p} variant="profile" />)}
                {pollsHasMore && (
                  <Button variant="ghost" fullWidth loading={isLoadingMore} onPress={loadMorePolls}>
                    LOAD MORE
                  </Button>
                )}
              </>
            )
          ) : tab === 'VOTED' ? (
            votedPolls.length === 0 ? (
              <View style={{ paddingVertical: theme.spacing.xl, alignItems: 'center' }}>
                <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.sm, color: theme.colors.textMuted, letterSpacing: 4 }}>
                  NO VOTES YET
                </Text>
              </View>
            ) : (
              <>
                {votedPolls.map(p => <PollRow key={p.id} poll={p} variant="profile" />)}
                {votedHasMore && (
                  <Button variant="ghost" fullWidth loading={isLoadingMore} onPress={loadMoreVoted}>
                    LOAD MORE
                  </Button>
                )}
              </>
            )
          ) : (
            // STATS tab
            <View style={{ gap: theme.spacing.lg }}>
              <View>
                <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 3, marginBottom: theme.spacing.sm }}>
                  ACTIVITY — LAST 30 DAYS
                </Text>
                <ActivityGrid activity={activity} days={30} />
              </View>
              <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
                <StatBox label="FOLLOWING" value={user.following} />
                <StatBox label="STATUS" value={(user.status || 'ACTIVE').toUpperCase()} />
              </View>
            </View>
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

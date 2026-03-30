import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native'
import { useNavigation, NavigationProp } from '@react-navigation/native'
import { theme } from '../theme'
import { useAuth } from '../hooks/useAuth'
import { RootStackParamList } from '../navigation'
import {
  getAdminStats,
  getAdminStatsDetailed,
  getAllUsers,
  getAllPollsAdmin,
  getPendingPolls,
  getAuditLog,
  updateUserStatus,
  deletePollAdmin,
  updateUserRole,
  approvePoll,
  rejectPoll,
} from '../database/supabase-api'
import { AdminStats, AdminAuditLog, User, Poll } from '../types'
import { Screen, TabBar, StatBox, UserRow, PollRow, ErrorBox, Button, Input, SectionHeader } from '../components/ui'

type AdminTab = 'STATS' | 'USERS' | 'POLLS' | 'QUEUE' | 'AUDIT'

const ADMIN_TABS = [
  { label: 'STATS', value: 'STATS' },
  { label: 'USERS', value: 'USERS' },
  { label: 'POLLS', value: 'POLLS' },
  { label: 'QUEUE', value: 'QUEUE' },
  { label: 'AUDIT', value: 'AUDIT' },
]

const PAGE_SIZE = 20

export default function AdminScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const { user } = useAuth()
  const [tab, setTab] = useState<AdminTab>('STATS')

  // STATS
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [detailed, setDetailed] = useState<{ daily: Array<{ date: string; votes: number; polls: number }>; topPolls: Poll[] } | null>(null)

  // USERS
  const [users, setUsers] = useState<User[]>([])
  const [usersHasMore, setUsersHasMore] = useState(false)
  const [usersOffset, setUsersOffset] = useState(0)
  const [usersSearch, setUsersSearch] = useState('')

  // POLLS
  const [polls, setPolls] = useState<Poll[]>([])
  const [pollsHasMore, setPollsHasMore] = useState(false)
  const [pollsOffset, setPollsOffset] = useState(0)
  const [pollsSearch, setPollsSearch] = useState('')

  // QUEUE
  const [queue, setQueue] = useState<Poll[]>([])
  const [queueHasMore, setQueueHasMore] = useState(false)
  const [queueOffset, setQueueOffset] = useState(0)

  // AUDIT
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([])
  const [auditHasMore, setAuditHasMore] = useState(false)
  const [auditOffset, setAuditOffset] = useState(0)

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (tab === 'STATS') {
        const [s, d] = await Promise.all([getAdminStats(), getAdminStatsDetailed()])
        setStats(s)
        setDetailed(d)
      } else if (tab === 'USERS') {
        const { users: u, hasMore } = await getAllUsers(0, PAGE_SIZE)
        setUsers(u)
        setUsersHasMore(hasMore)
        setUsersOffset(u.length)
      } else if (tab === 'POLLS') {
        const { polls: p, hasMore } = await getAllPollsAdmin(0, PAGE_SIZE)
        setPolls(p)
        setPollsHasMore(hasMore)
        setPollsOffset(p.length)
      } else if (tab === 'QUEUE') {
        const { polls: q, hasMore } = await getPendingPolls(0, PAGE_SIZE)
        setQueue(q)
        setQueueHasMore(hasMore)
        setQueueOffset(q.length)
      } else if (tab === 'AUDIT') {
        const { logs, hasMore } = await getAuditLog(0, PAGE_SIZE)
        setAuditLogs(logs)
        setAuditHasMore(hasMore)
        setAuditOffset(logs.length)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message.toUpperCase() : 'FAILED TO LOAD DATA')
    } finally {
      setIsLoading(false)
    }
  }, [tab])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function loadMoreUsers() {
    if (!usersHasMore || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const { users: u, hasMore } = await getAllUsers(usersOffset, PAGE_SIZE)
      setUsers(prev => [...prev, ...u])
      setUsersHasMore(hasMore)
      setUsersOffset(o => o + u.length)
    } catch { /* ignore */ } finally {
      setIsLoadingMore(false)
    }
  }

  async function loadMorePolls() {
    if (!pollsHasMore || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const { polls: p, hasMore } = await getAllPollsAdmin(pollsOffset, PAGE_SIZE)
      setPolls(prev => [...prev, ...p])
      setPollsHasMore(hasMore)
      setPollsOffset(o => o + p.length)
    } catch { /* ignore */ } finally {
      setIsLoadingMore(false)
    }
  }

  async function loadMoreQueue() {
    if (!queueHasMore || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const { polls: q, hasMore } = await getPendingPolls(queueOffset, PAGE_SIZE)
      setQueue(prev => [...prev, ...q])
      setQueueHasMore(hasMore)
      setQueueOffset(o => o + q.length)
    } catch { /* ignore */ } finally {
      setIsLoadingMore(false)
    }
  }

  async function loadMoreAudit() {
    if (!auditHasMore || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const { logs, hasMore } = await getAuditLog(auditOffset, PAGE_SIZE)
      setAuditLogs(prev => [...prev, ...logs])
      setAuditHasMore(hasMore)
      setAuditOffset(o => o + logs.length)
    } catch { /* ignore */ } finally {
      setIsLoadingMore(false)
    }
  }

  async function handleStatusChange(userId: string, status: 'active' | 'suspended' | 'banned', reason: string) {
    try {
      await updateUserStatus(userId, status, reason, user!.id, user!.username)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u))
    } catch (e) {
      Alert.alert('ERROR', e instanceof Error ? e.message : 'FAILED TO UPDATE STATUS')
    }
  }

  async function handleRoleChange(userId: string, role: 'user' | 'admin') {
    try {
      await updateUserRole(userId, role, user!.id, user!.username)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
    } catch (e) {
      Alert.alert('ERROR', e instanceof Error ? e.message : 'FAILED TO UPDATE ROLE')
    }
  }

  async function handleDeletePoll(pollId: string) {
    Alert.alert(
      'DELETE POLL',
      'THIS CANNOT BE UNDONE.',
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'DELETE', style: 'destructive', onPress: async () => {
            try {
              await deletePollAdmin(pollId, user!.id, user!.username)
              setPolls(prev => prev.filter(p => p.id !== pollId))
            } catch (e) {
              Alert.alert('ERROR', e instanceof Error ? e.message : 'FAILED TO DELETE POLL')
            }
          },
        },
      ]
    )
  }

  async function handleApprovePoll(pollId: string) {
    try {
      await approvePoll(pollId, user!.id, user!.username)
      setQueue(prev => prev.filter(p => p.id !== pollId))
    } catch (e) {
      Alert.alert('ERROR', e instanceof Error ? e.message : 'FAILED TO APPROVE POLL')
    }
  }

  async function handleRejectPoll(pollId: string) {
    Alert.prompt(
      'REJECT POLL',
      'REASON (OPTIONAL):',
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'REJECT', style: 'destructive', onPress: async (reason: string | undefined) => {
            try {
              await rejectPoll(pollId, user!.id, user!.username, reason || 'No reason given')
              setQueue(prev => prev.filter(p => p.id !== pollId))
            } catch (e) {
              Alert.alert('ERROR', e instanceof Error ? e.message : 'FAILED TO REJECT POLL')
            }
          },
        },
      ],
      'plain-text',
      '',
    )
  }

  function handleTabChange(value: string) {
    setTab(value as AdminTab)
    setUsersSearch('')
    setPollsSearch('')
    setError(null)
  }

  const filteredUsers = usersSearch
    ? users.filter(u =>
        u.username.includes(usersSearch.toLowerCase()) ||
        u.name.toLowerCase().includes(usersSearch.toLowerCase())
      )
    : users

  const filteredPolls = pollsSearch
    ? polls.filter(p => p.title.toLowerCase().includes(pollsSearch.toLowerCase()))
    : polls

  return (
    <Screen>
      <SectionHeader title="ADMIN" subtitle={`@${user?.username}`} />
      <TabBar tabs={ADMIN_TABS} active={tab} onSelect={handleTabChange} />

      {(tab === 'USERS') && (
        <Input
          value={usersSearch}
          onChangeText={setUsersSearch}
          placeholder="SEARCH USERS..."
          autoCapitalize="none"
          autoCorrect={false}
          containerStyle={{ marginBottom: 0 }}
        />
      )}
      {(tab === 'POLLS') && (
        <Input
          value={pollsSearch}
          onChangeText={setPollsSearch}
          placeholder="SEARCH POLLS..."
          autoCapitalize="none"
          autoCorrect={false}
          containerStyle={{ marginBottom: 0 }}
        />
      )}

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.text} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg, gap: theme.spacing.md }}>
          <ErrorBox message={error} />
          <Button variant="secondary" onPress={loadData}>RETRY</Button>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          onScroll={e => {
            const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent
            const nearEnd = contentOffset.y + layoutMeasurement.height >= contentSize.height - 200
            if (nearEnd) {
              if (tab === 'USERS') loadMoreUsers()
              else if (tab === 'POLLS') loadMorePolls()
              else if (tab === 'QUEUE') loadMoreQueue()
              else if (tab === 'AUDIT') loadMoreAudit()
            }
          }}
          scrollEventThrottle={200}
        >
          {/* ── STATS ── */}
          {tab === 'STATS' && stats && (
            <View style={{ padding: theme.spacing.lg, gap: theme.spacing.xs }}>
              <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
                <StatBox label="USERS" value={stats.totalUsers} size="md" />
                <StatBox label="POLLS" value={stats.totalPolls} size="md" />
              </View>
              <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
                <StatBox label="VOTES" value={stats.totalVotes} size="md" />
                <StatBox label="ACTIVE" value={stats.activeUsers} size="md" />
              </View>
              {stats.pendingPolls > 0 && (
                <ErrorBox
                  message={`⚠ ${stats.pendingPolls} PENDING POLL${stats.pendingPolls !== 1 ? 'S' : ''} IN QUEUE`}
                  variant="warning"
                />
              )}

              {detailed && (
                <>
                  <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 3, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm }}>
                    VOTES — LAST 7 DAYS
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 48 }}>
                    {detailed.daily.map(d => {
                      const max = Math.max(...detailed.daily.map(x => x.votes), 1)
                      const h = Math.max(4, Math.round((d.votes / max) * 48))
                      return (
                        <View key={d.date} style={{ flex: 1, alignItems: 'center' }}>
                          <View style={{ width: '80%', height: h, backgroundColor: theme.colors.text }} />
                          <Text style={{ fontFamily: theme.fonts.regular, fontSize: 7, color: theme.colors.textDim, marginTop: 2 }}>
                            {d.date.slice(5)}
                          </Text>
                        </View>
                      )
                    })}
                  </View>

                  <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 3, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm }}>
                    TOP 5 POLLS BY VOTES
                  </Text>
                  {detailed.topPolls.map(p => (
                    <View key={p.id} style={{ borderWidth: theme.borderWidth, borderColor: theme.colors.borderMuted, padding: theme.spacing.sm, marginBottom: theme.spacing.xs }}>
                      <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.text, letterSpacing: 1 }} numberOfLines={1}>
                        {p.title}
                      </Text>
                      <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xxs, color: theme.colors.textMuted, letterSpacing: 1, marginTop: 2 }}>
                        {p.votes} VOTES · {p.category}
                      </Text>
                    </View>
                  ))}
                </>
              )}

              <View style={{ marginTop: theme.spacing.md }}>
                <Button variant="ghost" fullWidth onPress={loadData}>REFRESH</Button>
              </View>
            </View>
          )}

          {/* ── USERS ── */}
          {tab === 'USERS' && (
            <View style={{ padding: theme.spacing.lg }}>
              {filteredUsers.length === 0 ? (
                <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.sm, color: theme.colors.textMuted, letterSpacing: 4, textAlign: 'center', marginTop: theme.spacing.xl }}>
                  NO USERS FOUND
                </Text>
              ) : (
                <>
                  {filteredUsers.map(u => (
                    <UserRow
                      key={u.id}
                      user={u}
                      onStatusChange={handleStatusChange}
                      onRoleChange={handleRoleChange}
                    />
                  ))}
                  {usersHasMore && !usersSearch && (
                    <Button variant="ghost" fullWidth loading={isLoadingMore} onPress={loadMoreUsers}>
                      LOAD MORE
                    </Button>
                  )}
                </>
              )}
            </View>
          )}

          {/* ── POLLS ── */}
          {tab === 'POLLS' && (
            <View style={{ padding: theme.spacing.lg }}>
              {filteredPolls.length === 0 ? (
                <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.sm, color: theme.colors.textMuted, letterSpacing: 4, textAlign: 'center', marginTop: theme.spacing.xl }}>
                  NO POLLS FOUND
                </Text>
              ) : (
                <>
                  {filteredPolls.map(p => (
                    <PollRow key={p.id} poll={p} variant="admin" onDelete={handleDeletePoll} onAuthorPress={id => navigation.navigate('PublicProfile', { userId: id })} />
                  ))}
                  {pollsHasMore && !pollsSearch && (
                    <Button variant="ghost" fullWidth loading={isLoadingMore} onPress={loadMorePolls}>
                      LOAD MORE
                    </Button>
                  )}
                </>
              )}
            </View>
          )}

          {/* ── QUEUE ── */}
          {tab === 'QUEUE' && (
            <View style={{ padding: theme.spacing.lg }}>
              {queue.length === 0 ? (
                <View style={{ paddingVertical: theme.spacing.xl, alignItems: 'center', gap: theme.spacing.sm }}>
                  <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.sm, color: theme.colors.success, letterSpacing: 4 }}>
                    QUEUE CLEAR
                  </Text>
                  <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 2 }}>
                    NO POLLS AWAITING REVIEW
                  </Text>
                </View>
              ) : (
                <>
                  {queue.map(p => (
                    <View key={p.id} style={{ borderWidth: theme.borderWidth, borderColor: theme.colors.borderMuted, padding: theme.spacing.md, marginBottom: theme.spacing.sm, gap: theme.spacing.xs }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xxs, color: theme.colors.textDim, letterSpacing: 2 }}>{p.category}</Text>
                        <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xxs, color: theme.colors.textDim, letterSpacing: 1 }}>@{p.authorUsername || 'unknown'}</Text>
                      </View>
                      <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.sm, color: theme.colors.text, letterSpacing: 1, lineHeight: 18 }} numberOfLines={3}>
                        {p.title}
                      </Text>
                      <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xxs, color: theme.colors.textMuted, letterSpacing: 1 }}>
                        A: {p.optionA}  |  B: {p.optionB}
                      </Text>

                      {p.moderationResult && (
                        <View style={{ borderWidth: theme.borderWidth, borderColor: p.moderationResult.verdict === 'flagged' ? theme.colors.danger : theme.colors.success, padding: theme.spacing.sm, marginTop: theme.spacing.xs }}>
                          <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.xxs, color: p.moderationResult.verdict === 'flagged' ? theme.colors.danger : theme.colors.success, letterSpacing: 2 }}>
                            LLM: {p.moderationResult.verdict.toUpperCase()} ({p.moderationResult.confidence}%)
                          </Text>
                          {p.moderationResult.reason && (
                            <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xxs, color: theme.colors.textMuted, letterSpacing: 1, marginTop: 2, lineHeight: 14 }}>
                              {p.moderationResult.reason}
                            </Text>
                          )}
                        </View>
                      )}

                      <View style={{ flexDirection: 'row', gap: theme.spacing.xs, marginTop: theme.spacing.xs }}>
                        <TouchableOpacity
                          style={{ flex: 1, borderWidth: theme.borderWidth, borderColor: theme.colors.success, padding: theme.spacing.sm, alignItems: 'center' }}
                          onPress={() => handleApprovePoll(p.id)}
                        >
                          <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.xxs, color: theme.colors.success, letterSpacing: 2 }}>APPROVE</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{ flex: 1, borderWidth: theme.borderWidth, borderColor: theme.colors.danger, padding: theme.spacing.sm, alignItems: 'center' }}
                          onPress={() => handleRejectPoll(p.id)}
                        >
                          <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.xxs, color: theme.colors.danger, letterSpacing: 2 }}>REJECT</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  {queueHasMore && (
                    <Button variant="ghost" fullWidth loading={isLoadingMore} onPress={loadMoreQueue}>
                      LOAD MORE
                    </Button>
                  )}
                </>
              )}
            </View>
          )}

          {/* ── AUDIT LOG ── */}
          {tab === 'AUDIT' && (
            <View style={{ padding: theme.spacing.lg }}>
              {auditLogs.length === 0 ? (
                <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.sm, color: theme.colors.textMuted, letterSpacing: 4, textAlign: 'center', marginTop: theme.spacing.xl }}>
                  NO AUDIT ENTRIES
                </Text>
              ) : (
                <>
                  {auditLogs.map(log => (
                    <View key={log.id} style={{ borderWidth: theme.borderWidth, borderColor: theme.colors.borderMuted, padding: theme.spacing.md, marginBottom: theme.spacing.xs, gap: 2 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.xxs, color: theme.colors.text, letterSpacing: 2 }}>
                          {log.actionType.toUpperCase().replace(/_/g, ' ')}
                        </Text>
                        <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xxs, color: theme.colors.textDim, letterSpacing: 1 }}>
                          {log.createdAt.toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xxs, color: theme.colors.textMuted, letterSpacing: 1 }}>
                        BY @{log.adminUsername} · {log.targetType}: {log.targetId.slice(0, 8)}...
                      </Text>
                      {log.reason && (
                        <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xxs, color: theme.colors.textDim, letterSpacing: 1, lineHeight: 14, marginTop: 2 }}>
                          {log.reason}
                        </Text>
                      )}
                    </View>
                  ))}
                  {auditHasMore && (
                    <Button variant="ghost" fullWidth loading={isLoadingMore} onPress={loadMoreAudit}>
                      LOAD MORE
                    </Button>
                  )}
                </>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </Screen>
  )
}

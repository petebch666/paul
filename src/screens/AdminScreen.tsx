import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { theme } from '../theme'
import { useAuth } from '../hooks/useAuth'
import {
  getAdminStats,
  getAllUsers,
  getAllPollsAdmin,
  updateUserStatus,
  deletePollAdmin,
  updateUserRole,
} from '../database/supabase-api'
import { AdminStats, User, Poll } from '../types'
import { Screen, TabBar, StatBox, UserRow, PollRow, ErrorBox, Button, Input, SectionHeader } from '../components/ui'

type AdminTab = 'STATS' | 'USERS' | 'POLLS'

const ADMIN_TABS = [
  { label: 'STATS', value: 'STATS' },
  { label: 'USERS', value: 'USERS' },
  { label: 'POLLS', value: 'POLLS' },
]

export default function AdminScreen() {
  const { user } = useAuth()
  const [tab, setTab] = useState<AdminTab>('STATS')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [tab])

  async function loadData() {
    setIsLoading(true)
    try {
      if (tab === 'STATS') {
        const s = await getAdminStats()
        setStats(s)
      } else if (tab === 'USERS') {
        const u = await getAllUsers()
        setUsers(u)
      } else if (tab === 'POLLS') {
        const p = await getAllPollsAdmin()
        setPolls(p)
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false)
    }
  }

  async function handleStatusChange(userId: string, status: 'active' | 'suspended' | 'banned', reason: string) {
    try {
      await updateUserStatus(userId, status, reason)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u))
    } catch {
      Alert.alert('ERROR', 'FAILED TO UPDATE STATUS')
    }
  }

  async function handleRoleChange(userId: string, role: 'user' | 'admin') {
    try {
      await updateUserRole(userId, role)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
    } catch {
      Alert.alert('ERROR', 'FAILED TO UPDATE ROLE')
    }
  }

  async function handleDeletePoll(pollId: string) {
    try {
      await deletePollAdmin(pollId)
      setPolls(prev => prev.filter(p => p.id !== pollId))
    } catch {
      Alert.alert('ERROR', 'FAILED TO DELETE POLL')
    }
  }

  function handleTabChange(value: string) {
    setTab(value as AdminTab)
    setSearch('')
  }

  const filteredUsers = search
    ? users.filter(u =>
        u.username.includes(search.toLowerCase()) ||
        u.name.toLowerCase().includes(search.toLowerCase())
      )
    : users

  const filteredPolls = search
    ? polls.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    : polls

  return (
    <Screen>
      <SectionHeader title="ADMIN" subtitle={`@${user?.username}`} />
      <TabBar tabs={ADMIN_TABS} active={tab} onSelect={handleTabChange} />

      {(tab === 'USERS' || tab === 'POLLS') && (
        <Input
          value={search}
          onChangeText={setSearch}
          placeholder={tab === 'USERS' ? 'SEARCH USERS...' : 'SEARCH POLLS...'}
          autoCapitalize="none"
          autoCorrect={false}
          containerStyle={{ marginBottom: 0 }}
        />
      )}

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.text} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
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
                  message={`⚠ ${stats.pendingPolls} PENDING POLL${stats.pendingPolls !== 1 ? 'S' : ''}`}
                  variant="warning"
                />
              )}
              <View style={{ marginTop: theme.spacing.md }}>
                <Button variant="ghost" fullWidth onPress={loadData}>REFRESH STATS</Button>
              </View>
            </View>
          )}

          {tab === 'USERS' && (
            <View style={{ padding: theme.spacing.lg }}>
              {filteredUsers.length === 0 ? (
                <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.sm, color: theme.colors.textMuted, letterSpacing: 4, textAlign: 'center', marginTop: theme.spacing.xl }}>
                  NO USERS FOUND
                </Text>
              ) : (
                filteredUsers.map(u => (
                  <UserRow
                    key={u.id}
                    user={u}
                    onStatusChange={handleStatusChange}
                    onRoleChange={handleRoleChange}
                  />
                ))
              )}
            </View>
          )}

          {tab === 'POLLS' && (
            <View style={{ padding: theme.spacing.lg }}>
              {filteredPolls.length === 0 ? (
                <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.sm, color: theme.colors.textMuted, letterSpacing: 4, textAlign: 'center', marginTop: theme.spacing.xl }}>
                  NO POLLS FOUND
                </Text>
              ) : (
                filteredPolls.map(p => (
                  <PollRow key={p.id} poll={p} variant="admin" onDelete={handleDeletePoll} />
                ))
              )}
            </View>
          )}
        </ScrollView>
      )}
    </Screen>
  )
}

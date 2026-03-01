import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
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

type AdminTab = 'STATS' | 'USERS' | 'POLLS'

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={statStyles.card}>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  )
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.borderMuted,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.xl,
    color: theme.colors.text,
    letterSpacing: 2,
  },
  label: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    letterSpacing: 1,
    textAlign: 'center',
  },
})

function UserRow({
  user,
  onStatusChange,
  onRoleChange,
}: {
  user: User
  onStatusChange: (userId: string, status: 'active' | 'suspended' | 'banned', reason: string) => void
  onRoleChange: (userId: string, role: 'user' | 'admin') => void
}) {
  function confirmStatusChange(status: 'active' | 'suspended' | 'banned') {
    Alert.prompt(
      status.toUpperCase(),
      `REASON FOR ${status.toUpperCase()}:`,
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'CONFIRM',
          onPress: reason => onStatusChange(user.id, status, reason || ''),
        },
      ],
      'plain-text'
    )
  }

  return (
    <View style={userRowStyles.row}>
      <View style={userRowStyles.info}>
        <Text style={userRowStyles.avatar}>{user.avatar}</Text>
        <View>
          <Text style={userRowStyles.username}>@{user.username}</Text>
          <Text style={userRowStyles.name}>{user.name}</Text>
          <Text style={userRowStyles.meta}>
            {user.role?.toUpperCase() || 'USER'} · {(user.status || 'ACTIVE').toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={userRowStyles.actions}>
        {user.status !== 'active' && (
          <TouchableOpacity
            style={[userRowStyles.btn, userRowStyles.btnGreen]}
            onPress={() => onStatusChange(user.id, 'active', 'reinstated')}
          >
            <Text style={userRowStyles.btnText}>RESTORE</Text>
          </TouchableOpacity>
        )}
        {user.status === 'active' && (
          <TouchableOpacity
            style={userRowStyles.btn}
            onPress={() => confirmStatusChange('suspended')}
          >
            <Text style={userRowStyles.btnText}>SUSPEND</Text>
          </TouchableOpacity>
        )}
        {user.status !== 'banned' && (
          <TouchableOpacity
            style={[userRowStyles.btn, userRowStyles.btnRed]}
            onPress={() => confirmStatusChange('banned')}
          >
            <Text style={[userRowStyles.btnText, userRowStyles.btnTextRed]}>BAN</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={userRowStyles.btn}
          onPress={() => onRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}
        >
          <Text style={userRowStyles.btnText}>
            {user.role === 'admin' ? 'DEMOTE' : 'PROMOTE'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const userRowStyles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderColor: theme.colors.borderMuted,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  avatar: {
    fontSize: 24,
  },
  username: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    letterSpacing: 1,
  },
  name: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  meta: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textDim,
    letterSpacing: 1,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  btn: {
    borderWidth: 1,
    borderColor: theme.colors.borderMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
  },
  btnRed: {
    borderColor: theme.colors.danger,
  },
  btnGreen: {
    borderColor: theme.colors.success,
  },
  btnText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  btnTextRed: {
    color: theme.colors.danger,
  },
})

function PollRow({
  poll,
  onDelete,
}: {
  poll: Poll
  onDelete: (pollId: string) => void
}) {
  function confirmDelete() {
    Alert.alert(
      'DELETE POLL',
      `"${poll.title.substring(0, 40)}..."`,
      [
        { text: 'CANCEL', style: 'cancel' },
        { text: 'DELETE', style: 'destructive', onPress: () => onDelete(poll.id) },
      ]
    )
  }

  return (
    <View style={pollRowStyles.row}>
      <View style={pollRowStyles.header}>
        <Text style={pollRowStyles.category}>{poll.category}</Text>
        <Text style={pollRowStyles.votes}>{poll.votes} VOTES</Text>
      </View>
      <Text style={pollRowStyles.title} numberOfLines={2}>{poll.title}</Text>
      <View style={pollRowStyles.footer}>
        <Text style={pollRowStyles.author}>@{poll.authorUsername || 'unknown'}</Text>
        <TouchableOpacity style={pollRowStyles.deleteBtn} onPress={confirmDelete}>
          <Text style={pollRowStyles.deleteBtnText}>DELETE</Text>
        </TouchableOpacity>
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
  header: {
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
  votes: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  title: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    letterSpacing: 1,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  author: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textDim,
    letterSpacing: 1,
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: theme.colors.danger,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
  },
  deleteBtnText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.danger,
    letterSpacing: 1,
  },
})

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

  const filteredUsers = search
    ? users.filter(u =>
        u.username.includes(search.toLowerCase()) ||
        u.name.toLowerCase().includes(search.toLowerCase())
      )
    : users

  const filteredPolls = search
    ? polls.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    : polls

  const tabs: AdminTab[] = ['STATS', 'USERS', 'POLLS']

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>ADMIN</Text>
        <Text style={styles.subtitle}>@{user?.username}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => { setTab(t); setSearch('') }}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search for users/polls */}
      {(tab === 'USERS' || tab === 'POLLS') && (
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={tab === 'USERS' ? 'SEARCH USERS...' : 'SEARCH POLLS...'}
          placeholderTextColor={theme.colors.textDim}
          autoCapitalize="none"
          autoCorrect={false}
        />
      )}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.text} />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {tab === 'STATS' && stats && (
            <View style={styles.statsSection}>
              <View style={styles.statsRow}>
                <StatCard label="USERS" value={stats.totalUsers} />
                <StatCard label="POLLS" value={stats.totalPolls} />
              </View>
              <View style={[styles.statsRow, { marginTop: theme.spacing.xs }]}>
                <StatCard label="VOTES" value={stats.totalVotes} />
                <StatCard label="ACTIVE" value={stats.activeUsers} />
              </View>
              {stats.pendingPolls > 0 && (
                <View style={styles.alertBox}>
                  <Text style={styles.alertText}>
                    ⚠ {stats.pendingPolls} PENDING POLL{stats.pendingPolls !== 1 ? 'S' : ''}
                  </Text>
                </View>
              )}
              <TouchableOpacity style={styles.refreshBtn} onPress={loadData}>
                <Text style={styles.refreshBtnText}>REFRESH STATS</Text>
              </TouchableOpacity>
            </View>
          )}

          {tab === 'USERS' && (
            <View style={styles.listSection}>
              {filteredUsers.length === 0 ? (
                <Text style={styles.emptyText}>NO USERS FOUND</Text>
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
            <View style={styles.listSection}>
              {filteredPolls.length === 0 ? (
                <Text style={styles.emptyText}>NO POLLS FOUND</Text>
              ) : (
                filteredPolls.map(p => (
                  <PollRow key={p.id} poll={p} onDelete={handleDeletePoll} />
                ))
              )}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: theme.borderWidth,
    borderBottomColor: theme.colors.borderMuted,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.xl,
    color: theme.colors.text,
    letterSpacing: 6,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    letterSpacing: 1,
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
  searchInput: {
    borderBottomWidth: theme.borderWidth,
    borderBottomColor: theme.colors.borderMuted,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    letterSpacing: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  statsSection: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  alertBox: {
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.warning,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  alertText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.warning,
    letterSpacing: 2,
  },
  refreshBtn: {
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.borderMuted,
    padding: theme.spacing.sm,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  refreshBtnText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    letterSpacing: 3,
  },
  listSection: {
    padding: theme.spacing.lg,
  },
  emptyText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    letterSpacing: 4,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
})

import { supabase } from './supabase'
import { Poll, User, AdminStats, AdminAuditLog } from '../types'

// ─────────────────────────────────────────────
// Transform helpers
// ─────────────────────────────────────────────

function transformPoll(row: Record<string, unknown>): Poll {
  const votesA = Number(row.votes_option_a ?? 0)
  const votesB = Number(row.votes_option_b ?? 0)
  const total = votesA + votesB
  const expiresAt = new Date(row.expires_at as string)
  const now = new Date()
  const diffMs = expiresAt.getTime() - now.getTime()
  const diffH = Math.floor(diffMs / (1000 * 60 * 60))
  const diffM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  let timeLeft = 'EXPIRED'
  if (diffMs > 0) {
    timeLeft = diffH > 0 ? `${diffH}H ${diffM}M` : `${diffM}M`
  }

  return {
    id: row.id as string,
    title: row.title as string,
    optionA: (row.option_a as string) || 'A',
    optionB: (row.option_b as string) || 'B',
    votes: total,
    votesOptionA: votesA,
    votesOptionB: votesB,
    category: (row.category as string) || 'GENERAL',
    timeLeft,
    author: (row.author_name as string) || 'UNKNOWN',
    authorId: row.author_id as string,
    authorUsername: row.author_username as string | undefined,
    isVoted: false,
    createdAt: new Date(row.created_at as string),
    expiresAt,
    timerEnabled: Boolean(row.timer_enabled),
    isExpired: diffMs <= 0 || Boolean(row.is_expired),
    trendingScore: row.trending_score as number | undefined,
    isDeathmatch: Boolean(row.is_deathmatch),
    optionAOwnerId: row.option_a_owner_id as string | undefined,
    optionBOwnerId: row.option_b_owner_id as string | undefined,
    deathmatchStatus: row.deathmatch_status as Poll['deathmatchStatus'],
    validationStatus: row.validation_status as Poll['validationStatus'],
    isConfession: Boolean(row.is_confession),
    moderationResult: row.moderation_result as Poll['moderationResult'],
  }
}

function transformUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    name: (row.name as string) || '',
    username: (row.username as string) || '',
    email: row.email as string | undefined,
    avatar: (row.avatar as string) || '👤',
    password: row.password as string | undefined,
    role: (row.role as User['role']) || 'user',
    followers: Number(row.followers ?? 0),
    following: Number(row.following ?? 0),
    reputation: Number(row.reputation ?? 0),
    pollCount: Number(row.poll_count ?? 0),
    winRate: Number(row.win_rate ?? 0),
    joinDate: new Date(row.join_date as string),
    status: (row.status as User['status']) || 'active',
    statusReason: row.status_reason as string | undefined,
    bio: row.bio as string | undefined,
  }
}

function transformAuditLog(row: Record<string, unknown>): AdminAuditLog {
  return {
    id: row.id as string,
    adminId: row.admin_id as string,
    adminUsername: (row.admin_username as string) || '',
    actionType: row.action_type as AdminAuditLog['actionType'],
    targetId: row.target_id as string,
    targetType: row.target_type as AdminAuditLog['targetType'],
    reason: row.reason as string | undefined,
    previousValue: row.previous_value as string | undefined,
    newValue: row.new_value as string | undefined,
    createdAt: new Date(row.created_at as string),
  }
}

// ─────────────────────────────────────────────
// POLL OPERATIONS
// ─────────────────────────────────────────────

export async function getPollsWithVoteStatus(
  userId: string,
  offset = 0,
  limit = 20,
): Promise<{ polls: Poll[]; hasMore: boolean }> {
  const { data: pollsData, error: pollsError } = await supabase
    .from('polls')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (pollsError) throw new Error(pollsError.message)

  const { data: votes } = await supabase
    .from('votes')
    .select('poll_id, option')
    .eq('user_id', userId)

  const votedMap = new Map<string, 'A' | 'B'>()
  for (const v of votes || []) {
    votedMap.set(v.poll_id, v.option as 'A' | 'B')
  }

  const polls = (pollsData || [])
    .filter(row => {
      if (row.is_deathmatch && row.deathmatch_status === 'pending') {
        return row.author_id === userId || row.option_a_owner_id === userId || row.option_b_owner_id === userId
      }
      return true
    })
    .map(row => {
      const poll = transformPoll(row)
      const votedOption = votedMap.get(poll.id)
      poll.isVoted = votedMap.has(poll.id)
      poll.votedOption = votedOption
      return poll
    })

  return { polls, hasMore: (pollsData || []).length === limit }
}

export async function castVote(pollId: string, userId: string, option: 'A' | 'B'): Promise<void> {
  // Attempt atomic RPC first; fall back to manual update if RPC doesn't exist yet
  const { error: rpcError } = await supabase.rpc('cast_vote', {
    p_poll_id: pollId,
    p_user_id: userId,
    p_option: option,
  })

  if (rpcError) {
    // Fallback: insert vote + manual increment (non-atomic, acceptable until RPC is deployed)
    const { error: voteError } = await supabase
      .from('votes')
      .insert({ poll_id: pollId, user_id: userId, option })

    if (voteError) throw new Error(voteError.message)

    const column = option === 'A' ? 'votes_option_a' : 'votes_option_b'
    const { data: poll } = await supabase
      .from('polls')
      .select(column)
      .eq('id', pollId)
      .single()

    if (poll) {
      const current = Number((poll as Record<string, unknown>)[column] ?? 0)
      await supabase
        .from('polls')
        .update({ [column]: current + 1 })
        .eq('id', pollId)
    }
  }

  // Record in poll_history so the VOTED tab in ProfileScreen is populated.
  // Fire-and-forget — don't throw if this fails.
  await supabase
    .from('poll_history')
    .insert({ poll_id: pollId, user_id: userId, action: 'voted' })
}

export async function createPoll(data: {
  title: string
  optionA: string
  optionB: string
  category: string
  authorId: string
  authorName: string
  authorUsername: string
  timerEnabled: boolean
  timerDuration?: number
  isDeathmatch: boolean
  optionAOwnerId?: string
  optionBOwnerId?: string
  isConfession?: boolean
}): Promise<Poll> {
  const expiresAt = data.timerEnabled && data.timerDuration
    ? new Date(Date.now() + data.timerDuration * 60 * 1000)
    : new Date(Date.now() + 24 * 60 * 60 * 1000)

  const row = {
    title: data.title,
    option_a: data.optionA,
    option_b: data.optionB,
    category: data.category.toUpperCase(),
    author_id: data.authorId,
    author_name: data.authorName,
    author_username: data.authorUsername,
    votes_option_a: 0,
    votes_option_b: 0,
    expires_at: expiresAt.toISOString(),
    timer_enabled: data.timerEnabled,
    is_expired: false,
    is_deathmatch: data.isDeathmatch,
    option_a_owner_id: data.optionAOwnerId || null,
    option_b_owner_id: data.optionBOwnerId || null,
    deathmatch_status: data.isDeathmatch ? 'pending' : null,
    is_confession: data.isConfession || false,
    trending_score: 0,
    validation_status: 'pending',
  }

  const { data: inserted, error } = await supabase
    .from('polls')
    .insert(row)
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Increment poll_count
  const { data: user } = await supabase
    .from('users')
    .select('poll_count')
    .eq('id', data.authorId)
    .single()

  if (user) {
    await supabase
      .from('users')
      .update({ poll_count: (user.poll_count || 0) + 1 })
      .eq('id', data.authorId)
  }

  return transformPoll(inserted)
}

// ─────────────────────────────────────────────
// USER OPERATIONS
// ─────────────────────────────────────────────

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) return null
  return data ? transformUser(data) : null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle()

  if (error) return null
  return data ? transformUser(data) : null
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username.toLowerCase())
    .maybeSingle()

  if (error) return null
  return data ? transformUser(data) : null
}

export async function getUserByAuthId(authId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .maybeSingle()

  if (error) return null
  return data ? transformUser(data) : null
}

export async function createUserProfile(userData: {
  authId: string
  name: string
  username: string
  email: string
  avatar: string
}): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert({
      auth_id: userData.authId,
      name: userData.name,
      username: userData.username.toLowerCase(),
      email: userData.email.toLowerCase(),
      avatar: userData.avatar,
      role: 'user',
      followers: 0,
      following: 0,
      reputation: 0,
      poll_count: 0,
      win_rate: 0,
      join_date: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return transformUser(data)
}

export async function linkUserAuthId(email: string, authId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .update({ auth_id: authId })
    .eq('email', email.toLowerCase())
    .select()
    .maybeSingle()

  if (error) return null
  return data ? transformUser(data) : null
}

export async function getUserPolls(userId: string, offset = 0, limit = 20): Promise<{ polls: Poll[]; hasMore: boolean }> {
  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw new Error(error.message)
  const polls = (data || []).map(transformPoll)
  return { polls, hasMore: polls.length === limit }
}

export async function updateUserProfile(
  userId: string,
  updates: { name?: string; bio?: string; avatar?: string },
): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return transformUser(data)
}

export async function getUserVoteHistory(
  userId: string,
  offset = 0,
  limit = 20,
): Promise<{ polls: Poll[]; hasMore: boolean }> {
  const { data, error } = await supabase
    .from('poll_history')
    .select('poll_id, polls(*)')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw new Error(error.message)
  const polls = (data || [])
    .map((row: Record<string, unknown>) => {
      const pollData = row.polls as Record<string, unknown> | null
      return pollData ? transformPoll(pollData) : null
    })
    .filter((p): p is Poll => p !== null)

  return { polls, hasMore: polls.length === limit }
}

export async function getUserActivity(
  userId: string,
  days = 30,
): Promise<Record<string, number>> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('votes')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', since)

  if (error) return {}

  const counts: Record<string, number> = {}
  for (const row of data || []) {
    const day = (row.created_at as string).slice(0, 10)
    counts[day] = (counts[day] || 0) + 1
  }
  return counts
}

export async function searchUsers(query: string): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, username, avatar, reputation, poll_count, role, status')
    .ilike('username', `%${query}%`)
    .limit(10)

  if (error) return []
  return (data || []).map(transformUser)
}

// ─────────────────────────────────────────────
// ADMIN OPERATIONS
// ─────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const [usersRes, pollsRes, votesRes] = await Promise.all([
    supabase.from('users').select('id, status', { count: 'exact' }),
    supabase.from('polls').select('id, validation_status', { count: 'exact' }),
    supabase.from('votes').select('id', { count: 'exact' }),
  ])

  const totalUsers = usersRes.count || 0
  const totalPolls = pollsRes.count || 0
  const totalVotes = votesRes.count || 0
  const activeUsers = (usersRes.data || []).filter(u => u.status === 'active' || !u.status).length
  const pendingPolls = (pollsRes.data || []).filter(p => p.validation_status === 'pending').length

  return { totalUsers, totalPolls, totalVotes, activeUsers, pendingPolls }
}

export async function getAdminStatsDetailed(): Promise<{
  daily: Array<{ date: string; votes: number; polls: number }>
  topPolls: Poll[]
}> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [votesRes, pollsRes, topPollsRes] = await Promise.all([
    supabase.from('votes').select('created_at').gte('created_at', since),
    supabase.from('polls').select('created_at').gte('created_at', since),
    supabase.from('polls').select('*').order('votes_option_a', { ascending: false }).limit(5),
  ])

  // Build daily buckets for last 7 days
  const daily: Array<{ date: string; votes: number; polls: number }> = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    daily.push({ date: d.toISOString().slice(0, 10), votes: 0, polls: 0 })
  }

  for (const row of votesRes.data || []) {
    const day = (row.created_at as string).slice(0, 10)
    const bucket = daily.find(b => b.date === day)
    if (bucket) bucket.votes++
  }
  for (const row of pollsRes.data || []) {
    const day = (row.created_at as string).slice(0, 10)
    const bucket = daily.find(b => b.date === day)
    if (bucket) bucket.polls++
  }

  const topPolls = (topPollsRes.data || []).map(transformPoll)

  return { daily, topPolls }
}

export async function getAllUsers(offset = 0, limit = 20): Promise<{ users: User[]; hasMore: boolean }> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('join_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw new Error(error.message)
  const users = (data || []).map(transformUser)
  return { users, hasMore: users.length === limit }
}

export async function getAllPollsAdmin(offset = 0, limit = 20): Promise<{ polls: Poll[]; hasMore: boolean }> {
  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw new Error(error.message)
  const polls = (data || []).map(transformPoll)
  return { polls, hasMore: polls.length === limit }
}

export async function getPendingPolls(offset = 0, limit = 20): Promise<{ polls: Poll[]; hasMore: boolean }> {
  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .eq('validation_status', 'pending')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw new Error(error.message)
  const polls = (data || []).map(transformPoll)
  return { polls, hasMore: polls.length === limit }
}

export async function approvePoll(pollId: string, adminId: string, adminUsername: string): Promise<void> {
  const { error } = await supabase
    .from('polls')
    .update({ validation_status: 'approved' })
    .eq('id', pollId)

  if (error) throw new Error(error.message)

  await logAdminAction(adminId, adminUsername, 'poll_approved', pollId, 'poll')
}

export async function rejectPoll(pollId: string, adminId: string, adminUsername: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from('polls')
    .update({ validation_status: 'rejected' })
    .eq('id', pollId)

  if (error) throw new Error(error.message)

  await logAdminAction(adminId, adminUsername, 'poll_rejected', pollId, 'poll', reason)
}

export async function getModerationResult(pollId: string): Promise<Poll['moderationResult'] | null> {
  const { data, error } = await supabase
    .from('polls')
    .select('moderation_result')
    .eq('id', pollId)
    .maybeSingle()

  if (error || !data) return null
  return (data as Record<string, unknown>).moderation_result as Poll['moderationResult']
}

export async function updateUserStatus(
  userId: string,
  status: 'active' | 'suspended' | 'banned',
  reason: string,
  adminId?: string,
  adminUsername?: string,
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ status, status_reason: reason, status_changed_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) throw new Error(error.message)

  if (adminId && adminUsername) {
    const action = status === 'banned'
      ? 'user_banned'
      : status === 'suspended'
        ? 'user_suspended'
        : 'user_unsuspended'
    await logAdminAction(adminId, adminUsername, action as AdminAuditLog['actionType'], userId, 'user', reason)
  }
}

export async function deletePollAdmin(pollId: string, adminId?: string, adminUsername?: string): Promise<void> {
  const { error } = await supabase
    .from('polls')
    .delete()
    .eq('id', pollId)

  if (error) throw new Error(error.message)

  if (adminId && adminUsername) {
    await logAdminAction(adminId, adminUsername, 'poll_deleted', pollId, 'poll')
  }
}

export async function updateUserRole(
  userId: string,
  role: 'user' | 'admin',
  adminId?: string,
  adminUsername?: string,
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)

  if (error) throw new Error(error.message)

  if (adminId && adminUsername) {
    await logAdminAction(adminId, adminUsername, 'user_role_changed', userId, 'user', undefined, undefined, role)
  }
}

export async function logAdminAction(
  adminId: string,
  adminUsername: string,
  actionType: AdminAuditLog['actionType'],
  targetId: string,
  targetType: AdminAuditLog['targetType'],
  reason?: string,
  previousValue?: string,
  newValue?: string,
): Promise<void> {
  await supabase.from('admin_audit_log').insert({
    admin_id: adminId,
    admin_username: adminUsername,
    action_type: actionType,
    target_id: targetId,
    target_type: targetType,
    reason: reason || null,
    previous_value: previousValue || null,
    new_value: newValue || null,
  })
  // Fire and forget — don't throw if audit log fails
}

export async function getAuditLog(
  offset = 0,
  limit = 20,
): Promise<{ logs: AdminAuditLog[]; hasMore: boolean }> {
  const { data, error } = await supabase
    .from('admin_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw new Error(error.message)
  const logs = (data || []).map(transformAuditLog)
  return { logs, hasMore: logs.length === limit }
}

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
  }
}

// ─────────────────────────────────────────────
// POLL OPERATIONS
// ─────────────────────────────────────────────

export async function getPollsWithVoteStatus(userId: string): Promise<Poll[]> {
  const { data: pollsData, error: pollsError } = await supabase
    .from('polls')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

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

  return polls
}

export async function castVote(pollId: string, userId: string, option: 'A' | 'B'): Promise<void> {
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

export async function createUser(userData: {
  name: string
  username: string
  email: string
  password: string
  avatar: string
}): Promise<User> {
  const newUser = {
    name: userData.name,
    username: userData.username.toLowerCase(),
    email: userData.email.toLowerCase(),
    password: userData.password,
    avatar: userData.avatar,
    role: 'user',
    followers: 0,
    following: 0,
    reputation: 0,
    poll_count: 0,
    win_rate: 0,
    join_date: new Date().toISOString(),
    status: 'active',
  }

  const { data, error } = await supabase
    .from('users')
    .insert(newUser)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return transformUser(data)
}

export async function getUserPolls(userId: string): Promise<Poll[]> {
  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .eq('author_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data || []).map(transformPoll)
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

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('join_date', { ascending: false })
    .limit(100)

  if (error) throw new Error(error.message)
  return (data || []).map(transformUser)
}

export async function getAllPollsAdmin(): Promise<Poll[]> {
  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw new Error(error.message)
  return (data || []).map(transformPoll)
}

export async function updateUserStatus(
  userId: string,
  status: 'active' | 'suspended' | 'banned',
  reason: string
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ status, status_reason: reason, status_changed_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) throw new Error(error.message)
}

export async function deletePollAdmin(pollId: string): Promise<void> {
  const { error } = await supabase
    .from('polls')
    .delete()
    .eq('id', pollId)

  if (error) throw new Error(error.message)
}

export async function updateUserRole(userId: string, role: 'user' | 'admin'): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)

  if (error) throw new Error(error.message)
}

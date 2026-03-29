/**
 * Unit tests for the Deathmatch / Follow / Notification functions added to
 * src/database/supabase-api.ts during the Deathmatch Polls sprint.
 *
 * Functions under test:
 *   followUser, unfollowUser, isFollowing,
 *   getFollowing, getFollowers, getMutualFollows,
 *   getNotifications, getUnreadNotificationCount,
 *   markNotificationsRead, createNotification,
 *   acceptDeathmatchChallenge, rejectDeathmatchChallenge,
 *   getPendingChallengesForUser
 *
 * All Supabase calls are intercepted — no real network connections are made.
 * The builder chain pattern mirrors the existing supabase-api.test.ts file.
 *
 * Mock chain rules (IMPORTANT):
 *   - Every builder method must return builderChain to allow arbitrary chaining.
 *   - .insert()  → resolves a Promise (terminal when no .select() follows)
 *   - .single()  → resolves a Promise (terminal)
 *   - .maybeSingle() → resolves a Promise (terminal)
 *   - .range()   → resolves a Promise (terminal)
 *   - .eq() (last in chain) → resolves a Promise (terminal)
 *   - .order() (last in chain) → resolves a Promise (terminal)
 *   - .in() (last in chain) → resolves a Promise (terminal)
 *   - .delete()  → returns builderChain (more .eq() calls follow)
 *   - .update()  → returns builderChain (more .eq() calls follow)
 *   - .select()  → returns builderChain (more calls follow)
 */

// ─────────────────────────────────────────────────────────────
// Mock: src/database/supabase.ts
// ─────────────────────────────────────────────────────────────

const mockSingle = jest.fn()
const mockMaybeSingle = jest.fn()
const mockInsert = jest.fn()
const mockUpdate = jest.fn()
const mockDelete = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockOrder = jest.fn()
const mockRange = jest.fn()
const mockLimit = jest.fn()
const mockIn = jest.fn()
const mockFrom = jest.fn()

const builderChain = {
  select: mockSelect,
  eq: mockEq,
  order: mockOrder,
  range: mockRange,
  limit: mockLimit,
  in: mockIn,
  single: mockSingle,
  maybeSingle: mockMaybeSingle,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
}

// Wire every builder method to return the chain by default so arbitrary
// chaining always works. Individual tests override terminal call return values.
Object.values(builderChain).forEach(fn => fn.mockReturnValue(builderChain))
mockFrom.mockReturnValue(builderChain)

jest.mock('../database/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}))

// ─────────────────────────────────────────────────────────────
// Imports
// ─────────────────────────────────────────────────────────────

import {
  followUser,
  unfollowUser,
  isFollowing,
  getFollowing,
  getFollowers,
  getMutualFollows,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationsRead,
  createNotification,
  acceptDeathmatchChallenge,
  rejectDeathmatchChallenge,
  getPendingChallengesForUser,
} from '../database/supabase-api'
import type { User, PollNotification, Poll } from '../types'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function makeUserRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'user-1',
    name: 'Alice',
    username: 'alice',
    email: 'alice@example.com',
    avatar: '🎯',
    role: 'user',
    followers: 10,
    following: 5,
    reputation: 100,
    poll_count: 3,
    win_rate: 0.6,
    join_date: '2024-01-01T00:00:00.000Z',
    status: 'active',
    ...overrides,
  }
}

function makeNotificationRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'notif-1',
    poll_id: 'poll-1',
    user_id: 'user-1',
    type: 'deathmatch_created',
    message: 'YOU HAVE A DEATHMATCH CHALLENGE!',
    is_read: false,
    created_at: '2024-06-01T00:00:00.000Z',
    ...overrides,
  }
}

function makePollRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const future = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
  return {
    id: 'poll-1',
    title: 'Dogs vs Cats',
    option_a: 'Dogs',
    option_b: 'Cats',
    votes_option_a: 0,
    votes_option_b: 0,
    category: 'ANIMALS',
    expires_at: future,
    author_name: 'Alice',
    author_id: 'user-1',
    author_username: 'alice',
    timer_enabled: true,
    is_expired: false,
    is_deathmatch: true,
    is_confession: false,
    deathmatch_status: 'pending',
    trending_score: 0,
    validation_status: 'pending',
    created_at: '2024-06-01T00:00:00.000Z',
    ...overrides,
  }
}

// ─────────────────────────────────────────────────────────────
// Reset all mocks before every test
// ─────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.resetAllMocks()

  // Re-wire chain defaults after resetAllMocks wipes return values.
  // IMPORTANT: update/delete must return the chain (not a Promise) because
  // they are always followed by .eq() calls in the production code.
  Object.values(builderChain).forEach(fn => fn.mockReturnValue(builderChain))
  mockFrom.mockReturnValue(builderChain)
})

// ─────────────────────────────────────────────────────────────
// followUser
//
// Production code flow:
//   1. from('user_follows').insert({follower_id, following_id})      → Promise (terminal)
//   2. Promise.all([
//        from('users').select('following').eq('id', followerId).single()  → Promise (single)
//        from('users').select('followers').eq('id', followingId).single() → Promise (single)
//      ])
//   3. Promise.all([
//        from('users').update({following: N+1}).eq('id', followerId)   → Promise (eq terminal)
//        from('users').update({followers: N+1}).eq('id', followingId)  → Promise (eq terminal)
//      ])
// ─────────────────────────────────────────────────────────────

describe('followUser', () => {
  // Helper to set up the standard followUser mock sequence:
  //   insert → single (follower data) → single (following data) → eq (update1) → eq (update2)
  function setupFollowMocks(followerFollowing = 5, targetFollowers = 10) {
    // Step 1: user_follows insert
    mockInsert.mockResolvedValueOnce({ data: null, error: null })
    // Step 2a: select following count for follower
    mockSingle.mockResolvedValueOnce({ data: { following: followerFollowing }, error: null })
    // Step 2b: select followers count for target
    mockSingle.mockResolvedValueOnce({ data: { followers: targetFollowers }, error: null })
    // Step 3a: update following counter → terminal eq
    mockEq.mockResolvedValueOnce({ data: null, error: null })
    // Step 3b: update followers counter → terminal eq
    mockEq.mockResolvedValueOnce({ data: null, error: null })
  }

  it('should insert into user_follows with correct follower_id and following_id', async () => {
    setupFollowMocks()

    await followUser('user-1', 'user-2')

    expect(mockFrom).toHaveBeenCalledWith('user_follows')
    expect(mockInsert).toHaveBeenCalledWith({
      follower_id: 'user-1',
      following_id: 'user-2',
    })
  })

  it('should throw when the insert fails', async () => {
    mockInsert.mockResolvedValueOnce({ data: null, error: { message: 'unique violation' } })

    await expect(followUser('user-1', 'user-2')).rejects.toThrow('unique violation')
  })

  it('should increment following counter for the follower', async () => {
    setupFollowMocks(3, 7)

    await followUser('user-1', 'user-2')

    // update called with following: 4
    expect(mockUpdate).toHaveBeenCalledWith({ following: 4 })
  })

  it('should increment followers counter for the target user', async () => {
    setupFollowMocks(3, 7)

    await followUser('user-1', 'user-2')

    // update called with followers: 8
    expect(mockUpdate).toHaveBeenCalledWith({ followers: 8 })
  })

  it('should treat null counter values as 0 when incrementing', async () => {
    mockInsert.mockResolvedValueOnce({ data: null, error: null })
    mockSingle.mockResolvedValueOnce({ data: { following: null }, error: null })
    mockSingle.mockResolvedValueOnce({ data: { followers: null }, error: null })
    mockEq.mockResolvedValueOnce({ data: null, error: null })
    mockEq.mockResolvedValueOnce({ data: null, error: null })

    await followUser('user-1', 'user-2')

    expect(mockUpdate).toHaveBeenCalledWith({ following: 1 })
    expect(mockUpdate).toHaveBeenCalledWith({ followers: 1 })
  })

  it('should treat missing user data (null) as 0 when incrementing', async () => {
    mockInsert.mockResolvedValueOnce({ data: null, error: null })
    mockSingle.mockResolvedValueOnce({ data: null, error: null })
    mockSingle.mockResolvedValueOnce({ data: null, error: null })
    mockEq.mockResolvedValueOnce({ data: null, error: null })
    mockEq.mockResolvedValueOnce({ data: null, error: null })

    await followUser('user-1', 'user-2')

    expect(mockUpdate).toHaveBeenCalledWith({ following: 1 })
    expect(mockUpdate).toHaveBeenCalledWith({ followers: 1 })
  })

  it('should query users table with correct follower id to get following count', async () => {
    setupFollowMocks()

    await followUser('follower-id', 'target-id')

    expect(mockEq).toHaveBeenCalledWith('id', 'follower-id')
    expect(mockEq).toHaveBeenCalledWith('id', 'target-id')
  })
})

// ─────────────────────────────────────────────────────────────
// unfollowUser
//
// Production code flow:
//   1. from('user_follows').delete().eq('follower_id', x).eq('following_id', y) → Promise
//   2. Promise.all([
//        from('users').select('following').eq('id', followerId).single() → Promise
//        from('users').select('followers').eq('id', followingId).single() → Promise
//      ])
//   3. Promise.all([
//        from('users').update({following: N-1}).eq('id', followerId) → Promise
//        from('users').update({followers: N-1}).eq('id', followingId) → Promise
//      ])
//
// NOTE: The delete chain's terminal is the second .eq() call (following_id).
//       So mockEq queue: [delete eq for following_id, update eq1, update eq2]
//       But the delete also has an eq for follower_id before it.
//       Total eq sequence: eq(follower_id), eq(following_id) [delete terminal],
//                          single, single, eq [update1], eq [update2]
// ─────────────────────────────────────────────────────────────

describe('unfollowUser', () => {
  // Helper: set up the standard unfollow mock sequence.
  // eq calls: [delete eq(following_id) terminal, update eq1, update eq2]
  // (delete's first eq returns the chain, second eq is terminal)
  function setupUnfollowMocks(followerFollowing = 5, targetFollowers = 10) {
    // eq(follower_id) returns chain (already default), eq(following_id) is terminal
    mockEq.mockResolvedValueOnce({ data: null, error: null }) // delete terminal
    // selects for counter values
    mockSingle.mockResolvedValueOnce({ data: { following: followerFollowing }, error: null })
    mockSingle.mockResolvedValueOnce({ data: { followers: targetFollowers }, error: null })
    // update terminal eqs
    mockEq.mockResolvedValueOnce({ data: null, error: null })
    mockEq.mockResolvedValueOnce({ data: null, error: null })
  }

  it('should delete from user_follows with correct eq conditions', async () => {
    setupUnfollowMocks()

    await unfollowUser('user-1', 'user-2')

    expect(mockFrom).toHaveBeenCalledWith('user_follows')
    expect(mockDelete).toHaveBeenCalled()
    expect(mockEq).toHaveBeenCalledWith('follower_id', 'user-1')
    expect(mockEq).toHaveBeenCalledWith('following_id', 'user-2')
  })

  it('should throw when the delete fails', async () => {
    mockEq.mockResolvedValueOnce({ data: null, error: { message: 'row not found' } })

    await expect(unfollowUser('user-1', 'user-2')).rejects.toThrow('row not found')
  })

  it('should decrement following counter for the unfollower', async () => {
    setupUnfollowMocks(4, 8)

    await unfollowUser('user-1', 'user-2')

    expect(mockUpdate).toHaveBeenCalledWith({ following: 3 })
  })

  it('should decrement followers counter for the unfollowed user', async () => {
    setupUnfollowMocks(4, 8)

    await unfollowUser('user-1', 'user-2')

    expect(mockUpdate).toHaveBeenCalledWith({ followers: 7 })
  })

  it('should not decrement below 0 (floor at 0)', async () => {
    // Counters already at 0
    mockEq.mockResolvedValueOnce({ data: null, error: null })
    mockSingle.mockResolvedValueOnce({ data: { following: 0 }, error: null })
    mockSingle.mockResolvedValueOnce({ data: { followers: 0 }, error: null })
    mockEq.mockResolvedValueOnce({ data: null, error: null })
    mockEq.mockResolvedValueOnce({ data: null, error: null })

    await unfollowUser('user-1', 'user-2')

    expect(mockUpdate).toHaveBeenCalledWith({ following: 0 })
    expect(mockUpdate).toHaveBeenCalledWith({ followers: 0 })
  })
})

// ─────────────────────────────────────────────────────────────
// isFollowing
//
// Production code:
//   from('user_follows')
//     .select('*', { count: 'exact', head: true })
//     .eq('follower_id', followerId)      ← 1st eq: must return chain
//     .eq('following_id', followingId)    ← 2nd eq: terminal, resolves with { count }
//   → reads .count from the result (not data)
//
// Terminal: second .eq() call.
// We must queue: mockReturnValueOnce(builderChain) for the 1st eq,
//                mockResolvedValueOnce({count}) for the 2nd eq.
// ─────────────────────────────────────────────────────────────

describe('isFollowing', () => {
  it('should return true when the follow relationship exists (count > 0)', async () => {
    // 1st eq(follower_id) → chain; 2nd eq(following_id) → resolves with count
    mockEq.mockReturnValueOnce(builderChain)
    mockEq.mockResolvedValueOnce({ count: 1, error: null })

    const result = await isFollowing('user-1', 'user-2')

    expect(result).toBe(true)
    expect(mockFrom).toHaveBeenCalledWith('user_follows')
    expect(mockEq).toHaveBeenCalledWith('follower_id', 'user-1')
  })

  it('should return false when the follow relationship does not exist (count = 0)', async () => {
    mockEq.mockReturnValueOnce(builderChain)
    mockEq.mockResolvedValueOnce({ count: 0, error: null })

    const result = await isFollowing('user-1', 'user-2')

    expect(result).toBe(false)
  })

  it('should return false when count is null', async () => {
    mockEq.mockReturnValueOnce(builderChain)
    mockEq.mockResolvedValueOnce({ count: null, error: null })

    const result = await isFollowing('user-1', 'user-2')

    expect(result).toBe(false)
  })

  it('should query with correct following_id eq condition', async () => {
    mockEq.mockReturnValueOnce(builderChain)
    mockEq.mockResolvedValueOnce({ count: 1, error: null })

    await isFollowing('user-1', 'user-2')

    expect(mockEq).toHaveBeenCalledWith('following_id', 'user-2')
  })
})

// ─────────────────────────────────────────────────────────────
// getFollowing
//
// Production code:
//   from('user_follows').select(…).eq('follower_id', userId).order(…).range(…) → Promise
// Terminal: range()
// ─────────────────────────────────────────────────────────────

describe('getFollowing', () => {
  it('should return users when rows exist', async () => {
    const userRow = makeUserRow({ id: 'user-2', username: 'bob' })
    const rows = [{ following_id: 'user-2', users: userRow }]
    mockRange.mockResolvedValueOnce({ data: rows, error: null })

    const result = await getFollowing('user-1')

    expect(result.users).toHaveLength(1)
    expect(result.users[0].id).toBe('user-2')
    expect(result.users[0].username).toBe('bob')
  })

  it('should filter out rows where users is null', async () => {
    const rows = [
      { following_id: 'user-null', users: null },
      { following_id: 'user-2', users: makeUserRow({ id: 'user-2' }) },
    ]
    mockRange.mockResolvedValueOnce({ data: rows, error: null })

    const result = await getFollowing('user-1')

    expect(result.users).toHaveLength(1)
    expect(result.users[0].id).toBe('user-2')
  })

  it('should set hasMore=true when page is exactly limit size', async () => {
    const rows = Array.from({ length: 20 }, (_, i) => ({
      following_id: `user-${i}`,
      users: makeUserRow({ id: `user-${i}` }),
    }))
    mockRange.mockResolvedValueOnce({ data: rows, error: null })

    const result = await getFollowing('user-1', 0, 20)

    expect(result.hasMore).toBe(true)
  })

  it('should set hasMore=false when fewer rows than limit are returned', async () => {
    const rows = [{ following_id: 'user-2', users: makeUserRow({ id: 'user-2' }) }]
    mockRange.mockResolvedValueOnce({ data: rows, error: null })

    const result = await getFollowing('user-1', 0, 20)

    expect(result.hasMore).toBe(false)
  })

  it('should return empty array when data is null', async () => {
    mockRange.mockResolvedValueOnce({ data: null, error: null })

    const result = await getFollowing('user-1')

    expect(result.users).toHaveLength(0)
    expect(result.hasMore).toBe(false)
  })

  it('should throw when Supabase returns an error', async () => {
    mockRange.mockResolvedValueOnce({ data: null, error: { message: 'permission denied' } })

    await expect(getFollowing('user-1')).rejects.toThrow('permission denied')
  })

  it('should query user_follows ordered by created_at descending', async () => {
    mockRange.mockResolvedValueOnce({ data: [], error: null })

    await getFollowing('user-1', 0, 20)

    expect(mockFrom).toHaveBeenCalledWith('user_follows')
    expect(mockEq).toHaveBeenCalledWith('follower_id', 'user-1')
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('should apply the correct range for pagination', async () => {
    mockRange.mockResolvedValueOnce({ data: [], error: null })

    await getFollowing('user-1', 20, 20)

    expect(mockRange).toHaveBeenCalledWith(20, 39)
  })

  it('should map all user fields correctly through transformUser', async () => {
    const userRow = makeUserRow({
      id: 'u-99',
      name: 'Bob',
      username: 'bob',
      email: 'bob@example.com',
      role: 'admin',
      followers: 99,
      following: 42,
      reputation: 500,
      poll_count: 20,
      win_rate: 0.75,
    })
    mockRange.mockResolvedValueOnce({ data: [{ following_id: 'u-99', users: userRow }], error: null })

    const result = await getFollowing('user-1')
    const user = result.users[0] as User

    expect(user.id).toBe('u-99')
    expect(user.name).toBe('Bob')
    expect(user.role).toBe('admin')
    expect(user.followers).toBe(99)
    expect(user.reputation).toBe(500)
    expect(user.pollCount).toBe(20)
    expect(user.winRate).toBe(0.75)
  })
})

// ─────────────────────────────────────────────────────────────
// getFollowers
//
// Production code:
//   from('user_follows').select(…).eq('following_id', userId).order(…).range(…) → Promise
// Terminal: range()
// ─────────────────────────────────────────────────────────────

describe('getFollowers', () => {
  it('should return followers mapped from user_follows rows', async () => {
    const userRow = makeUserRow({ id: 'follower-1', username: 'charlie' })
    const rows = [{ follower_id: 'follower-1', users: userRow }]
    mockRange.mockResolvedValueOnce({ data: rows, error: null })

    const result = await getFollowers('user-1')

    expect(result.users).toHaveLength(1)
    expect(result.users[0].id).toBe('follower-1')
    expect(result.users[0].username).toBe('charlie')
  })

  it('should filter out rows where users is null', async () => {
    const rows = [
      { follower_id: 'null-user', users: null },
      { follower_id: 'follower-2', users: makeUserRow({ id: 'follower-2' }) },
    ]
    mockRange.mockResolvedValueOnce({ data: rows, error: null })

    const result = await getFollowers('user-1')

    expect(result.users).toHaveLength(1)
  })

  it('should set hasMore=true when page equals limit size', async () => {
    const rows = Array.from({ length: 20 }, (_, i) => ({
      follower_id: `user-${i}`,
      users: makeUserRow({ id: `user-${i}` }),
    }))
    mockRange.mockResolvedValueOnce({ data: rows, error: null })

    const result = await getFollowers('user-1', 0, 20)

    expect(result.hasMore).toBe(true)
  })

  it('should return empty array and hasMore=false when data is null', async () => {
    mockRange.mockResolvedValueOnce({ data: null, error: null })

    const result = await getFollowers('user-1')

    expect(result.users).toHaveLength(0)
    expect(result.hasMore).toBe(false)
  })

  it('should throw when Supabase returns an error', async () => {
    mockRange.mockResolvedValueOnce({ data: null, error: { message: 'network error' } })

    await expect(getFollowers('user-1')).rejects.toThrow('network error')
  })

  it('should query with correct following_id eq condition', async () => {
    mockRange.mockResolvedValueOnce({ data: [], error: null })

    await getFollowers('user-1', 0, 20)

    expect(mockFrom).toHaveBeenCalledWith('user_follows')
    expect(mockEq).toHaveBeenCalledWith('following_id', 'user-1')
  })

  it('should apply correct pagination range', async () => {
    mockRange.mockResolvedValueOnce({ data: [], error: null })

    await getFollowers('user-1', 40, 20)

    expect(mockRange).toHaveBeenCalledWith(40, 59)
  })
})

// ─────────────────────────────────────────────────────────────
// getMutualFollows
//
// Production code:
//   Query 1: from('user_follows').select(…).eq('follower_id', userId) → terminal eq
//   (if empty, return [])
//   Query 2: from('user_follows').select('follower_id').eq('following_id', userId).in('follower_id', ids)
//            → terminal in()
// ─────────────────────────────────────────────────────────────

describe('getMutualFollows', () => {
  it('should return users who mutually follow each other', async () => {
    const user2Row = makeUserRow({ id: 'user-2', username: 'bob' })
    const user3Row = makeUserRow({ id: 'user-3', username: 'carol' })
    const followingRows = [
      { following_id: 'user-2', users: user2Row },
      { following_id: 'user-3', users: user3Row },
    ]
    // First query terminal: eq('follower_id', userId)
    mockEq.mockResolvedValueOnce({ data: followingRows, error: null })
    // Second query terminal: in('follower_id', ids)
    // user-2 follows back, user-3 doesn't
    mockIn.mockResolvedValueOnce({ data: [{ follower_id: 'user-2' }], error: null })

    const result = await getMutualFollows('user-1')

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('user-2')
    expect(result[0].username).toBe('bob')
  })

  it('should return empty array when user follows nobody', async () => {
    mockEq.mockResolvedValueOnce({ data: [], error: null })

    const result = await getMutualFollows('user-1')

    expect(result).toHaveLength(0)
    // Should not make the second query
    expect(mockIn).not.toHaveBeenCalled()
  })

  it('should return empty array when following data is null', async () => {
    mockEq.mockResolvedValueOnce({ data: null, error: null })

    const result = await getMutualFollows('user-1')

    expect(result).toHaveLength(0)
    expect(mockIn).not.toHaveBeenCalled()
  })

  it('should return empty array when nobody follows back', async () => {
    const followingRows = [
      { following_id: 'user-2', users: makeUserRow({ id: 'user-2' }) },
    ]
    mockEq.mockResolvedValueOnce({ data: followingRows, error: null })
    mockIn.mockResolvedValueOnce({ data: [], error: null })

    const result = await getMutualFollows('user-1')

    expect(result).toHaveLength(0)
  })

  it('should throw when the first query fails', async () => {
    mockEq.mockResolvedValueOnce({ data: null, error: { message: 'db error' } })

    await expect(getMutualFollows('user-1')).rejects.toThrow('db error')
  })

  it('should filter out null user objects from mutual follow rows', async () => {
    const followingRows = [
      { following_id: 'user-2', users: null },
      { following_id: 'user-3', users: makeUserRow({ id: 'user-3' }) },
    ]
    mockEq.mockResolvedValueOnce({ data: followingRows, error: null })
    // Both follow back
    mockIn.mockResolvedValueOnce({
      data: [{ follower_id: 'user-2' }, { follower_id: 'user-3' }],
      error: null,
    })

    const result = await getMutualFollows('user-1')

    // user-2 has null users object so should be filtered out
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('user-3')
  })

  it('should query user_follows for the correct follower_id', async () => {
    mockEq.mockResolvedValueOnce({ data: [], error: null })

    await getMutualFollows('user-abc')

    expect(mockFrom).toHaveBeenCalledWith('user_follows')
    expect(mockEq).toHaveBeenCalledWith('follower_id', 'user-abc')
  })

  it('should perform the back-follow check with the correct following_id and in clause', async () => {
    const followingRows = [{ following_id: 'user-2', users: makeUserRow({ id: 'user-2' }) }]
    mockEq.mockResolvedValueOnce({ data: followingRows, error: null })
    mockIn.mockResolvedValueOnce({ data: [], error: null })

    await getMutualFollows('user-1')

    expect(mockEq).toHaveBeenCalledWith('following_id', 'user-1')
    expect(mockIn).toHaveBeenCalledWith('follower_id', ['user-2'])
  })
})

// ─────────────────────────────────────────────────────────────
// getNotifications
//
// Production code:
//   from('notifications').select('*').eq('user_id', userId).order(…).range(…) → Promise
// Terminal: range()
// ─────────────────────────────────────────────────────────────

describe('getNotifications', () => {
  it('should return notifications mapped from DB rows', async () => {
    const row = makeNotificationRow()
    mockRange.mockResolvedValueOnce({ data: [row], error: null })

    const result = await getNotifications('user-1')

    expect(result.notifications).toHaveLength(1)
    const notif = result.notifications[0] as PollNotification
    expect(notif.id).toBe('notif-1')
    expect(notif.pollId).toBe('poll-1')
    expect(notif.userId).toBe('user-1')
    expect(notif.type).toBe('deathmatch_created')
    expect(notif.message).toBe('YOU HAVE A DEATHMATCH CHALLENGE!')
    expect(notif.isRead).toBe(false)
    expect(notif.createdAt).toBeInstanceOf(Date)
  })

  it('should set hasMore=true when page equals limit size', async () => {
    const rows = Array.from({ length: 20 }, (_, i) =>
      makeNotificationRow({ id: `notif-${i}` }),
    )
    mockRange.mockResolvedValueOnce({ data: rows, error: null })

    const result = await getNotifications('user-1', 0, 20)

    expect(result.hasMore).toBe(true)
  })

  it('should set hasMore=false when fewer rows than limit', async () => {
    mockRange.mockResolvedValueOnce({ data: [makeNotificationRow()], error: null })

    const result = await getNotifications('user-1', 0, 20)

    expect(result.hasMore).toBe(false)
  })

  it('should return empty array when data is null', async () => {
    mockRange.mockResolvedValueOnce({ data: null, error: null })

    const result = await getNotifications('user-1')

    expect(result.notifications).toHaveLength(0)
    expect(result.hasMore).toBe(false)
  })

  it('should throw when Supabase returns an error', async () => {
    mockRange.mockResolvedValueOnce({ data: null, error: { message: 'access denied' } })

    await expect(getNotifications('user-1')).rejects.toThrow('access denied')
  })

  it('should query notifications table ordered by created_at descending', async () => {
    mockRange.mockResolvedValueOnce({ data: [], error: null })

    await getNotifications('user-1', 0, 20)

    expect(mockFrom).toHaveBeenCalledWith('notifications')
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('should apply the correct range for pagination', async () => {
    mockRange.mockResolvedValueOnce({ data: [], error: null })

    await getNotifications('user-1', 20, 10)

    expect(mockRange).toHaveBeenCalledWith(20, 29)
  })

  it('should default message to empty string when message is missing', async () => {
    const row = makeNotificationRow({ message: undefined })
    mockRange.mockResolvedValueOnce({ data: [row], error: null })

    const result = await getNotifications('user-1')

    expect(result.notifications[0].message).toBe('')
  })

  it('should coerce is_read to boolean', async () => {
    const rowFalsy = makeNotificationRow({ is_read: 0 })
    mockRange.mockResolvedValueOnce({ data: [rowFalsy], error: null })

    const result = await getNotifications('user-1')

    expect(result.notifications[0].isRead).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────
// getUnreadNotificationCount
//
// Production code:
//   from('notifications')
//     .select('*', { count: 'exact', head: true })
//     .eq('user_id', userId)
//     .eq('is_read', false)
//   → reads .count from the destructured result (not chained .then)
//
// Terminal: second eq() call
// ─────────────────────────────────────────────────────────────

describe('getUnreadNotificationCount', () => {
  it('should return the count from the query result', async () => {
    // first eq(user_id) returns chain (default), second eq(is_read) resolves with count
    mockEq.mockResolvedValueOnce({ count: 5, error: null })

    const count = await getUnreadNotificationCount('user-1')

    expect(count).toBe(5)
  })

  it('should return 0 when count is null', async () => {
    mockEq.mockResolvedValueOnce({ count: null, error: null })

    const count = await getUnreadNotificationCount('user-1')

    expect(count).toBe(0)
  })

  it('should return 0 when count is 0', async () => {
    mockEq.mockResolvedValueOnce({ count: 0, error: null })

    const count = await getUnreadNotificationCount('user-1')

    expect(count).toBe(0)
  })

  it('should query notifications with user_id eq and is_read eq false', async () => {
    mockEq.mockResolvedValueOnce({ count: 3, error: null })

    await getUnreadNotificationCount('user-abc')

    expect(mockFrom).toHaveBeenCalledWith('notifications')
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-abc')
    expect(mockEq).toHaveBeenCalledWith('is_read', false)
  })
})

// ─────────────────────────────────────────────────────────────
// markNotificationsRead
//
// Production code:
//   from('notifications').update({is_read: true}).eq('user_id', userId).eq('is_read', false)
// Terminal: second eq() call (fire-and-forget, no error check)
// ─────────────────────────────────────────────────────────────

describe('markNotificationsRead', () => {
  it('should call update with is_read=true on notifications table', async () => {
    // second eq is terminal — first eq returns chain (default)
    mockEq.mockResolvedValueOnce({ data: null, error: null })

    await markNotificationsRead('user-1')

    expect(mockFrom).toHaveBeenCalledWith('notifications')
    expect(mockUpdate).toHaveBeenCalledWith({ is_read: true })
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(mockEq).toHaveBeenCalledWith('is_read', false)
  })

  it('should not throw even if the update call rejects (fire-and-forget pattern)', async () => {
    // The implementation does not check for errors from markNotificationsRead
    mockEq.mockResolvedValueOnce({ data: null, error: { message: 'update failed' } })

    await expect(markNotificationsRead('user-1')).resolves.toBeUndefined()
  })
})

// ─────────────────────────────────────────────────────────────
// createNotification
//
// Production code:
//   from('notifications').insert({user_id, poll_id, type, message, is_read: false})
// Terminal: insert() (fire-and-forget)
// ─────────────────────────────────────────────────────────────

describe('createNotification', () => {
  it('should insert a notification with correct fields', async () => {
    mockInsert.mockResolvedValueOnce({ data: null, error: null })

    await createNotification('user-1', 'poll-1', 'deathmatch_created', 'YOU HAVE A CHALLENGE!')

    expect(mockFrom).toHaveBeenCalledWith('notifications')
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'user-1',
      poll_id: 'poll-1',
      type: 'deathmatch_created',
      message: 'YOU HAVE A CHALLENGE!',
      is_read: false,
    })
  })

  it('should work with all PollNotification type values', async () => {
    const types: PollNotification['type'][] = [
      'poll_expired',
      'poll_created',
      'poll_trending',
      'deathmatch_created',
      'deathmatch_accepted',
      'deathmatch_rejected',
    ]

    for (const type of types) {
      jest.resetAllMocks()
      Object.values(builderChain).forEach(fn => fn.mockReturnValue(builderChain))
      mockFrom.mockReturnValue(builderChain)
      mockInsert.mockResolvedValueOnce({ data: null, error: null })

      await createNotification('user-1', 'poll-1', type, 'test message')

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ type }),
      )
    }
  })
})

// ─────────────────────────────────────────────────────────────
// acceptDeathmatchChallenge
//
// Production code:
//   1. from('polls').update({deathmatch_status: 'accepted'}).eq('id', pollId) → Promise
//   2. createNotification(creatorId, pollId, 'deathmatch_accepted', '…')
//      → from('notifications').insert({…}) → Promise
//
// Terminal for update: eq('id', pollId) — first eq in queue
// Terminal for insert: insert() itself
// ─────────────────────────────────────────────────────────────

describe('acceptDeathmatchChallenge', () => {
  it('should update deathmatch_status to "accepted" on the poll', async () => {
    // update terminal: eq('id', pollId)
    mockEq.mockResolvedValueOnce({ data: null, error: null })
    // createNotification insert
    mockInsert.mockResolvedValueOnce({ data: null, error: null })

    await acceptDeathmatchChallenge('poll-1', 'user-2', 'user-1')

    expect(mockFrom).toHaveBeenCalledWith('polls')
    expect(mockUpdate).toHaveBeenCalledWith({ deathmatch_status: 'accepted' })
    expect(mockEq).toHaveBeenCalledWith('id', 'poll-1')
  })

  it('should throw when the poll update fails', async () => {
    mockEq.mockResolvedValueOnce({ data: null, error: { message: 'poll not found' } })

    await expect(acceptDeathmatchChallenge('poll-1', 'user-2', 'user-1')).rejects.toThrow('poll not found')
  })

  it('should send a deathmatch_accepted notification to the creator', async () => {
    mockEq.mockResolvedValueOnce({ data: null, error: null })
    mockInsert.mockResolvedValueOnce({ data: null, error: null })

    await acceptDeathmatchChallenge('poll-1', 'user-2', 'creator-1')

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'creator-1',
        poll_id: 'poll-1',
        type: 'deathmatch_accepted',
        message: 'YOUR DEATHMATCH CHALLENGE WAS ACCEPTED!',
        is_read: false,
      }),
    )
  })

  it('should notify the creator regardless of the acceptingUserId argument', async () => {
    // _acceptingUserId is unused in production code
    mockEq.mockResolvedValueOnce({ data: null, error: null })
    mockInsert.mockResolvedValueOnce({ data: null, error: null })

    await acceptDeathmatchChallenge('poll-99', 'any-user', 'creator-99')

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'creator-99' }),
    )
  })
})

// ─────────────────────────────────────────────────────────────
// rejectDeathmatchChallenge
//
// Production code:
//   1. from('polls').update({deathmatch_status: 'rejected'}).eq('id', pollId) → Promise
//   2. createNotification(creatorId, pollId, 'deathmatch_rejected', '…')
// Terminal for update: eq('id', pollId)
// ─────────────────────────────────────────────────────────────

describe('rejectDeathmatchChallenge', () => {
  it('should update deathmatch_status to "rejected" on the poll', async () => {
    mockEq.mockResolvedValueOnce({ data: null, error: null })
    mockInsert.mockResolvedValueOnce({ data: null, error: null })

    await rejectDeathmatchChallenge('poll-1', 'user-2', 'user-1')

    expect(mockFrom).toHaveBeenCalledWith('polls')
    expect(mockUpdate).toHaveBeenCalledWith({ deathmatch_status: 'rejected' })
    expect(mockEq).toHaveBeenCalledWith('id', 'poll-1')
  })

  it('should throw when the poll update fails', async () => {
    mockEq.mockResolvedValueOnce({ data: null, error: { message: 'cannot reject' } })

    await expect(rejectDeathmatchChallenge('poll-1', 'user-2', 'user-1')).rejects.toThrow('cannot reject')
  })

  it('should send a deathmatch_rejected notification to the creator', async () => {
    mockEq.mockResolvedValueOnce({ data: null, error: null })
    mockInsert.mockResolvedValueOnce({ data: null, error: null })

    await rejectDeathmatchChallenge('poll-1', 'user-2', 'creator-1')

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'creator-1',
        poll_id: 'poll-1',
        type: 'deathmatch_rejected',
        message: 'YOUR DEATHMATCH CHALLENGE WAS DECLINED.',
        is_read: false,
      }),
    )
  })

  it('should notify the creator (not the rejecting user)', async () => {
    mockEq.mockResolvedValueOnce({ data: null, error: null })
    mockInsert.mockResolvedValueOnce({ data: null, error: null })

    await rejectDeathmatchChallenge('poll-5', 'rejecter-id', 'creator-id')

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'creator-id' }),
    )
  })
})

// ─────────────────────────────────────────────────────────────
// getPendingChallengesForUser
//
// Production code:
//   from('polls')
//     .select('*')
//     .eq('option_b_owner_id', userId)
//     .eq('deathmatch_status', 'pending')
//     .order('created_at', { ascending: false })
//   → terminal: order()
// ─────────────────────────────────────────────────────────────

describe('getPendingChallengesForUser', () => {
  it('should return polls mapped from DB rows', async () => {
    const pollRow = makePollRow({ id: 'dm-1', option_b_owner_id: 'user-1' })
    mockOrder.mockResolvedValueOnce({ data: [pollRow], error: null })

    const result = await getPendingChallengesForUser('user-1')

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('dm-1')
    expect(result[0].isDeathmatch).toBe(true)
    expect(result[0].deathmatchStatus).toBe('pending')
  })

  it('should return empty array when data is null', async () => {
    mockOrder.mockResolvedValueOnce({ data: null, error: null })

    const result = await getPendingChallengesForUser('user-1')

    expect(result).toHaveLength(0)
  })

  it('should return empty array when there are no pending challenges', async () => {
    mockOrder.mockResolvedValueOnce({ data: [], error: null })

    const result = await getPendingChallengesForUser('user-1')

    expect(result).toHaveLength(0)
  })

  it('should throw when Supabase returns an error', async () => {
    mockOrder.mockResolvedValueOnce({ data: null, error: { message: 'query failed' } })

    await expect(getPendingChallengesForUser('user-1')).rejects.toThrow('query failed')
  })

  it('should query polls with correct eq conditions', async () => {
    mockOrder.mockResolvedValueOnce({ data: [], error: null })

    await getPendingChallengesForUser('user-abc')

    expect(mockFrom).toHaveBeenCalledWith('polls')
    expect(mockEq).toHaveBeenCalledWith('option_b_owner_id', 'user-abc')
    expect(mockEq).toHaveBeenCalledWith('deathmatch_status', 'pending')
  })

  it('should order results by created_at descending', async () => {
    mockOrder.mockResolvedValueOnce({ data: [], error: null })

    await getPendingChallengesForUser('user-1')

    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('should map multiple pending polls correctly', async () => {
    const rows = [
      makePollRow({ id: 'dm-1', title: 'Challenge 1' }),
      makePollRow({ id: 'dm-2', title: 'Challenge 2' }),
      makePollRow({ id: 'dm-3', title: 'Challenge 3' }),
    ]
    mockOrder.mockResolvedValueOnce({ data: rows, error: null })

    const result = await getPendingChallengesForUser('user-1')

    expect(result).toHaveLength(3)
    expect(result.map((p: Poll) => p.id)).toEqual(['dm-1', 'dm-2', 'dm-3'])
  })
})

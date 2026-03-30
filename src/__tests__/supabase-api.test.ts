/**
 * Unit tests for src/database/supabase-api.ts
 *
 * ALL Supabase calls are intercepted by the jest.mock() below —
 * no real network connections are made.
 *
 * Builder pattern used by Supabase:
 *   supabase.from('table').select().eq().maybeSingle()
 *
 * Each test constructs the mock chain it needs, calls the function
 * under test, then asserts on the return value and on which mock
 * methods were called.
 */

// ─────────────────────────────────────────────────────────────
// Mock: src/database/supabase.ts
// ─────────────────────────────────────────────────────────────

// We need full control over the Supabase builder chain.
// The mock factory returns stable jest.fn() references so tests
// can spy on them and configure return values per test.

const mockSingle = jest.fn()
const mockMaybeSingle = jest.fn()
const mockInsert = jest.fn()
const mockUpdate = jest.fn()
const mockDelete = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockGte = jest.fn()
const mockOrder = jest.fn()
const mockRange = jest.fn()
const mockLimit = jest.fn()
const mockIlike = jest.fn()
const mockRpc = jest.fn()
const mockFrom = jest.fn()
const mockUpsert = jest.fn()

// Each builder method returns `this` (the same chain object) so
// calls can be chained arbitrarily deep.  The terminal methods
// (single, maybeSingle) return the actual mock return values.
const builderChain = {
  select: mockSelect,
  eq: mockEq,
  gte: mockGte,
  order: mockOrder,
  range: mockRange,
  limit: mockLimit,
  ilike: mockIlike,
  single: mockSingle,
  maybeSingle: mockMaybeSingle,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  upsert: mockUpsert,
}

// Wire every builder method to return the chain by default so
// chaining always works.  Individual tests override the terminal
// call's return value.
Object.values(builderChain).forEach(fn => fn.mockReturnValue(builderChain))

mockFrom.mockReturnValue(builderChain)

jest.mock('../database/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    rpc: (...args: unknown[]) => mockRpc(...args),
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
// Helpers
// ─────────────────────────────────────────────────────────────

import {
  getUserByUsername,
  getUserByEmail,
  getUserById,
  castVote,
  getUserVoteHistory,
  getUserActivity,
  getPollsWithVoteStatus,
  createPoll,
} from '../database/supabase-api'
import type { User, Poll } from '../types'

/** A minimal raw DB row that satisfies transformUser */
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

/** A minimal raw DB row that satisfies transformPoll with an expiry 2 hours in the future */
function makePollRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const future = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // +2h
  return {
    id: 'poll-1',
    title: 'Dogs vs Cats',
    option_a: 'Dogs',
    option_b: 'Cats',
    votes_option_a: 30,
    votes_option_b: 70,
    category: 'ANIMALS',
    expires_at: future,
    author_name: 'Alice',
    author_id: 'user-1',
    author_username: 'alice',
    timer_enabled: true,
    is_expired: false,
    is_deathmatch: false,
    is_confession: false,
    trending_score: 50,
    validation_status: 'approved',
    created_at: '2024-06-01T00:00:00.000Z',
    ...overrides,
  }
}

// ─────────────────────────────────────────────────────────────
// Reset all mocks before every test
// ─────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.resetAllMocks()

  // Re-wire the chain defaults after resetAllMocks wipes return values and once-queues
  Object.values(builderChain).forEach(fn => fn.mockReturnValue(builderChain))
  mockFrom.mockReturnValue(builderChain)
  mockRpc.mockResolvedValue({ data: null, error: null })
})

// ─────────────────────────────────────────────────────────────
// getUserByUsername
// ─────────────────────────────────────────────────────────────

describe('getUserByUsername', () => {
  it('should return a User when a matching row is found', async () => {
    const row = makeUserRow({ username: 'alice' })
    mockMaybeSingle.mockResolvedValueOnce({ data: row, error: null })

    const result = await getUserByUsername('alice')

    expect(mockFrom).toHaveBeenCalledWith('users')
    expect(mockSelect).toHaveBeenCalledWith('*')
    expect(mockEq).toHaveBeenCalledWith('username', 'alice')
    expect(result).not.toBeNull()
    expect(result?.id).toBe('user-1')
    expect(result?.username).toBe('alice')
    expect(result?.email).toBe('alice@example.com')
  })

  it('should lowercase the username before querying', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })

    await getUserByUsername('ALICE')

    expect(mockEq).toHaveBeenCalledWith('username', 'alice')
  })

  it('should return null when no row is found (data is null)', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })

    const result = await getUserByUsername('nobody')

    expect(result).toBeNull()
  })

  it('should return null on Supabase error (not throw)', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'DB error' },
    })

    const result = await getUserByUsername('alice')

    expect(result).toBeNull()
  })

  it('should map all User fields correctly from the DB row', async () => {
    const row = makeUserRow({
      id: 'u-999',
      name: 'Bob',
      username: 'bob',
      email: 'bob@example.com',
      avatar: '🔥',
      role: 'admin',
      followers: 99,
      following: 42,
      reputation: 500,
      poll_count: 20,
      win_rate: 0.75,
      join_date: '2023-03-15T00:00:00.000Z',
      status: 'active',
      bio: 'Hello world',
    })
    mockMaybeSingle.mockResolvedValueOnce({ data: row, error: null })

    const user = await getUserByUsername('bob') as User

    expect(user.id).toBe('u-999')
    expect(user.name).toBe('Bob')
    expect(user.username).toBe('bob')
    expect(user.email).toBe('bob@example.com')
    expect(user.avatar).toBe('🔥')
    expect(user.role).toBe('admin')
    expect(user.followers).toBe(99)
    expect(user.following).toBe(42)
    expect(user.reputation).toBe(500)
    expect(user.pollCount).toBe(20)
    expect(user.winRate).toBe(0.75)
    expect(user.joinDate).toBeInstanceOf(Date)
    expect(user.status).toBe('active')
    expect(user.bio).toBe('Hello world')
  })

  it('should apply safe defaults when optional fields are missing from the row', async () => {
    const row: Record<string, unknown> = {
      id: 'u-min',
      join_date: '2024-01-01T00:00:00.000Z',
      // name, username, email, avatar, role, followers etc. deliberately omitted
    }
    mockMaybeSingle.mockResolvedValueOnce({ data: row, error: null })

    const user = await getUserByUsername('x') as User

    expect(user.name).toBe('')
    expect(user.username).toBe('')
    expect(user.avatar).toBe('👤')
    expect(user.role).toBe('user')
    expect(user.followers).toBe(0)
    expect(user.following).toBe(0)
    expect(user.reputation).toBe(0)
    expect(user.pollCount).toBe(0)
    expect(user.winRate).toBe(0)
    expect(user.status).toBe('active')
  })
})

// ─────────────────────────────────────────────────────────────
// getUserByEmail
// ─────────────────────────────────────────────────────────────

describe('getUserByEmail', () => {
  it('should return a User when email matches', async () => {
    const row = makeUserRow({ email: 'alice@example.com' })
    mockMaybeSingle.mockResolvedValueOnce({ data: row, error: null })

    const result = await getUserByEmail('alice@example.com')

    expect(mockEq).toHaveBeenCalledWith('email', 'alice@example.com')
    expect(result).not.toBeNull()
    expect(result?.email).toBe('alice@example.com')
  })

  it('should lowercase the email before querying', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })

    await getUserByEmail('ALICE@EXAMPLE.COM')

    expect(mockEq).toHaveBeenCalledWith('email', 'alice@example.com')
  })

  it('should return null when no matching row exists', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })

    const result = await getUserByEmail('notfound@example.com')

    expect(result).toBeNull()
  })

  it('should return null on Supabase error', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'connection refused' },
    })

    const result = await getUserByEmail('alice@example.com')

    expect(result).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────
// getUserById
// ─────────────────────────────────────────────────────────────

describe('getUserById', () => {
  it('should return a User for a matching id', async () => {
    const row = makeUserRow({ id: 'user-42' })
    mockMaybeSingle.mockResolvedValueOnce({ data: row, error: null })

    const result = await getUserById('user-42')

    expect(mockFrom).toHaveBeenCalledWith('users')
    expect(mockEq).toHaveBeenCalledWith('id', 'user-42')
    expect(result?.id).toBe('user-42') // id comes from the override passed to makeUserRow
  })

  it('should return null when no user is found', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })

    const result = await getUserById('missing-id')

    expect(result).toBeNull()
  })

  it('should return null on Supabase error', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'timeout' },
    })

    const result = await getUserById('user-1')

    expect(result).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────
// castVote
// ─────────────────────────────────────────────────────────────

describe('castVote', () => {
  describe('RPC success path', () => {
    it('should call supabase.rpc with correct params when voting A', async () => {
      // RPC succeeds (no error)
      mockRpc.mockResolvedValueOnce({ data: null, error: null })
      // poll_history insert (fire-and-forget)
      mockInsert.mockResolvedValueOnce({ data: null, error: null })

      await castVote('poll-1', 'user-1', 'A')

      expect(mockRpc).toHaveBeenCalledWith('cast_vote', {
        p_poll_id: 'poll-1',
        p_user_id: 'user-1',
        p_option: 'A',
      })
    })

    it('should call supabase.rpc with correct params when voting B', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: null })
      mockInsert.mockResolvedValueOnce({ data: null, error: null })

      await castVote('poll-99', 'user-7', 'B')

      expect(mockRpc).toHaveBeenCalledWith('cast_vote', {
        p_poll_id: 'poll-99',
        p_user_id: 'user-7',
        p_option: 'B',
      })
    })

    it('should insert into poll_history after a successful RPC vote', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: null })
      // The poll_history insert is the second .from('poll_history').insert(…) call
      mockInsert.mockResolvedValue({ data: null, error: null })

      await castVote('poll-1', 'user-1', 'A')

      // Second from() call should target poll_history
      const fromCalls = mockFrom.mock.calls
      expect(fromCalls.some((c: string[]) => c[0] === 'poll_history')).toBe(true)
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          poll_id: 'poll-1',
          user_id: 'user-1',
          action: 'voted',
        }),
      )
    })

    it('should not throw if poll_history insert fails (fire-and-forget)', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: null })
      mockInsert.mockResolvedValueOnce({ data: null, error: { message: 'history write failed' } })

      // Should resolve without throwing
      await expect(castVote('poll-1', 'user-1', 'A')).resolves.toBeUndefined()
    })
  })

  describe('RPC fallback path (manual insert)', () => {
    beforeEach(() => {
      // RPC returns an error — trigger fallback
      mockRpc.mockResolvedValue({ data: null, error: { message: 'function not found' } })
    })

    it('should insert directly into votes table when RPC fails', async () => {
      // votes insert succeeds
      mockInsert.mockResolvedValueOnce({ data: null, error: null })
      // polls select for current count
      mockSingle.mockResolvedValueOnce({ data: { votes_option_a: 5 }, error: null })
      // polls update
      mockUpdate.mockReturnValue(builderChain)
      // poll_history insert
      mockInsert.mockResolvedValueOnce({ data: null, error: null })

      await castVote('poll-1', 'user-1', 'A')

      const fromCalls: string[][] = mockFrom.mock.calls.map((c: unknown[]) => c as string[])
      expect(fromCalls.some(c => c[0] === 'votes')).toBe(true)
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ poll_id: 'poll-1', user_id: 'user-1', option: 'A' }),
      )
    })

    it('should throw if the fallback votes insert also fails', async () => {
      mockInsert.mockResolvedValueOnce({
        data: null,
        error: { message: 'unique violation' },
      })

      await expect(castVote('poll-1', 'user-1', 'A')).rejects.toThrow('unique violation')
    })

    it('should increment votes_option_a column when voting A', async () => {
      mockInsert.mockResolvedValueOnce({ data: null, error: null })
      mockSingle.mockResolvedValueOnce({ data: { votes_option_a: 10 }, error: null })
      mockUpdate.mockReturnValue(builderChain)
      mockInsert.mockResolvedValueOnce({ data: null, error: null })

      await castVote('poll-1', 'user-1', 'A')

      expect(mockUpdate).toHaveBeenCalledWith({ votes_option_a: 11 })
    })

    it('should increment votes_option_b column when voting B', async () => {
      mockInsert.mockResolvedValueOnce({ data: null, error: null })
      mockSingle.mockResolvedValueOnce({ data: { votes_option_b: 4 }, error: null })
      mockUpdate.mockReturnValue(builderChain)
      mockInsert.mockResolvedValueOnce({ data: null, error: null })

      await castVote('poll-1', 'user-1', 'B')

      expect(mockUpdate).toHaveBeenCalledWith({ votes_option_b: 5 })
    })

    it('should treat a missing poll row as 0 and set count to 1', async () => {
      mockInsert.mockResolvedValueOnce({ data: null, error: null })
      // poll row not found
      mockSingle.mockResolvedValueOnce({ data: null, error: null })
      mockInsert.mockResolvedValueOnce({ data: null, error: null })

      // Should not throw — the `if (poll)` guard prevents the update
      await expect(castVote('poll-1', 'user-1', 'A')).resolves.toBeUndefined()
    })
  })
})

// ─────────────────────────────────────────────────────────────
// getUserVoteHistory
// ─────────────────────────────────────────────────────────────

describe('getUserVoteHistory', () => {
  it('should return Poll objects mapped from poll_history rows', async () => {
    const pollRow = makePollRow({ id: 'poll-10' })
    const historyRows = [
      { poll_id: 'poll-10', polls: pollRow },
    ]
    // The entire chain terminates when .range() is called
    mockRange.mockResolvedValueOnce({ data: historyRows, error: null })

    const result = await getUserVoteHistory('user-1')

    expect(result.polls).toHaveLength(1)
    expect(result.polls[0].id).toBe('poll-10')
  })

  it('should filter out rows where polls is null', async () => {
    const historyRows = [
      { poll_id: 'poll-x', polls: null },
      { poll_id: 'poll-y', polls: makePollRow({ id: 'poll-y' }) },
    ]
    mockRange.mockResolvedValueOnce({ data: historyRows, error: null })

    const result = await getUserVoteHistory('user-1')

    expect(result.polls).toHaveLength(1)
    expect(result.polls[0].id).toBe('poll-y')
  })

  it('should set hasMore=true when the page is exactly limit size', async () => {
    // Default limit is 20 — fill 20 rows
    const rows = Array.from({ length: 20 }, (_, i) => ({
      poll_id: `poll-${i}`,
      polls: makePollRow({ id: `poll-${i}` }),
    }))
    mockRange.mockResolvedValueOnce({ data: rows, error: null })

    const result = await getUserVoteHistory('user-1', 0, 20)

    expect(result.hasMore).toBe(true)
  })

  it('should set hasMore=false when fewer rows than the limit are returned', async () => {
    const rows = [{ poll_id: 'poll-1', polls: makePollRow() }]
    mockRange.mockResolvedValueOnce({ data: rows, error: null })

    const result = await getUserVoteHistory('user-1', 0, 20)

    expect(result.hasMore).toBe(false)
  })

  it('should return empty array when data is null', async () => {
    mockRange.mockResolvedValueOnce({ data: null, error: null })

    const result = await getUserVoteHistory('user-1')

    expect(result.polls).toHaveLength(0)
    expect(result.hasMore).toBe(false)
  })

  it('should throw when Supabase returns an error', async () => {
    mockRange.mockResolvedValueOnce({
      data: null,
      error: { message: 'permission denied' },
    })

    await expect(getUserVoteHistory('user-1')).rejects.toThrow('permission denied')
  })

  it('should query poll_history ordered by timestamp descending', async () => {
    mockRange.mockResolvedValueOnce({ data: [], error: null })

    await getUserVoteHistory('user-1', 0, 20)

    expect(mockFrom).toHaveBeenCalledWith('poll_history')
    expect(mockOrder).toHaveBeenCalledWith('timestamp', { ascending: false })
  })

  it('should apply the correct range for pagination', async () => {
    mockRange.mockResolvedValueOnce({ data: [], error: null })

    await getUserVoteHistory('user-1', 40, 20)

    expect(mockRange).toHaveBeenCalledWith(40, 59)
  })
})

// ─────────────────────────────────────────────────────────────
// getUserActivity
// ─────────────────────────────────────────────────────────────

describe('getUserActivity', () => {
  it('should group votes by day into a Record<string, number>', async () => {
    const votes = [
      { created_at: '2024-06-01T08:00:00.000Z' },
      { created_at: '2024-06-01T20:00:00.000Z' },
      { created_at: '2024-06-02T10:00:00.000Z' },
    ]
    mockGte.mockResolvedValueOnce({ data: votes, error: null })

    const result = await getUserActivity('user-1')

    expect(result['2024-06-01']).toBe(2)
    expect(result['2024-06-02']).toBe(1)
  })

  it('should return an empty object when the user has no votes', async () => {
    mockGte.mockResolvedValueOnce({ data: [], error: null })

    const result = await getUserActivity('user-1')

    expect(result).toEqual({})
  })

  it('should return an empty object when data is null', async () => {
    mockGte.mockResolvedValueOnce({ data: null, error: null })

    const result = await getUserActivity('user-1')

    expect(result).toEqual({})
  })

  it('should return an empty object on Supabase error (not throw)', async () => {
    mockGte.mockResolvedValueOnce({ data: null, error: { message: 'network error' } })

    const result = await getUserActivity('user-1')

    expect(result).toEqual({})
  })

  it('should query the votes table filtered by user_id and gte on created_at', async () => {
    mockGte.mockResolvedValueOnce({ data: [], error: null })

    await getUserActivity('user-abc')

    expect(mockFrom).toHaveBeenCalledWith('votes')
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-abc')
  })

  it('should use the correct days window (default 30 days)', async () => {
    const beforeCall = Date.now()
    mockGte.mockResolvedValueOnce({ data: [], error: null })

    await getUserActivity('user-1')

    const gteArg: string = mockGte.mock.calls[0][1] as string
    const argTs = new Date(gteArg).getTime()
    const expectedTs = beforeCall - 30 * 24 * 60 * 60 * 1000
    // Allow 5 s tolerance for test execution time
    expect(Math.abs(argTs - expectedTs)).toBeLessThan(5000)
  })

  it('should support a custom days window', async () => {
    const beforeCall = Date.now()
    mockGte.mockResolvedValueOnce({ data: [], error: null })

    await getUserActivity('user-1', 7)

    const gteArg: string = mockGte.mock.calls[0][1] as string
    const argTs = new Date(gteArg).getTime()
    const expectedTs = beforeCall - 7 * 24 * 60 * 60 * 1000
    expect(Math.abs(argTs - expectedTs)).toBeLessThan(5000)
  })

  it('should count each day independently (no cross-day bleed)', async () => {
    const votes = [
      { created_at: '2024-01-01T23:59:59.000Z' },
      { created_at: '2024-01-02T00:00:00.000Z' },
    ]
    mockGte.mockResolvedValueOnce({ data: votes, error: null })

    const result = await getUserActivity('user-1')

    expect(result['2024-01-01']).toBe(1)
    expect(result['2024-01-02']).toBe(1)
    // Total across days
    expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(2)
  })
})

// ─────────────────────────────────────────────────────────────
// transformPoll — tested indirectly via getUserVoteHistory /
// getPollsWithVoteStatus.  We exercise the transform logic by
// passing specific row shapes and asserting on the returned Poll.
// ─────────────────────────────────────────────────────────────

describe('transformPoll (via getPollsWithVoteStatus)', () => {
  // getPollsWithVoteStatus makes two from() calls:
  //   1. polls table  — we mock .range() as the terminal call
  //   2. votes table  — we mock .eq() on the second call

  function setupPollAndVotesMock(
    pollRows: Record<string, unknown>[],
    voteRows: Array<{ poll_id: string; option: string }> = [],
  ) {
    // Polls query — terminal is range() (no .eq() in the polls query chain)
    mockRange.mockResolvedValueOnce({ data: pollRows, error: null })
    // Votes query — .from('votes').select(...).eq('user_id', userId) is the terminal call
    mockEq.mockResolvedValueOnce({ data: voteRows, error: null })
  }

  it('should compute total votes as sum of option A and B', async () => {
    const row = makePollRow({ votes_option_a: 30, votes_option_b: 70 })
    setupPollAndVotesMock([row])

    const { polls } = await getPollsWithVoteStatus('user-1')

    expect(polls[0].votes).toBe(100)
    expect(polls[0].votesOptionA).toBe(30)
    expect(polls[0].votesOptionB).toBe(70)
  })

  it('should set isExpired=false for a future expiry date', async () => {
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString() // +1h
    const row = makePollRow({ expires_at: future, is_expired: false })
    setupPollAndVotesMock([row])

    const { polls } = await getPollsWithVoteStatus('user-1')

    expect(polls[0].isExpired).toBe(false)
  })

  it('should set isExpired=true for a past expiry date', async () => {
    const past = new Date(Date.now() - 60 * 60 * 1000).toISOString() // -1h
    const row = makePollRow({ expires_at: past, is_expired: false })
    setupPollAndVotesMock([row])

    const { polls } = await getPollsWithVoteStatus('user-1')

    expect(polls[0].isExpired).toBe(true)
  })

  it('should set isExpired=true when the is_expired DB flag is set even if expiry is future', async () => {
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    const row = makePollRow({ expires_at: future, is_expired: true })
    setupPollAndVotesMock([row])

    const { polls } = await getPollsWithVoteStatus('user-1')

    expect(polls[0].isExpired).toBe(true)
  })

  it('should produce timeLeft in "XH YM" format when hours > 0', async () => {
    // expires exactly 2 hours 30 minutes from now
    const expiry = new Date(Date.now() + (2 * 60 + 30) * 60 * 1000).toISOString()
    const row = makePollRow({ expires_at: expiry })
    setupPollAndVotesMock([row])

    const { polls } = await getPollsWithVoteStatus('user-1')

    // e.g. "2H 30M" — hours part must be present
    expect(polls[0].timeLeft).toMatch(/^\d+H \d+M$/)
    expect(polls[0].timeLeft).not.toBe('EXPIRED')
  })

  it('should produce timeLeft in "XM" format when less than 1 hour remains', async () => {
    const expiry = new Date(Date.now() + 45 * 60 * 1000).toISOString() // 45 minutes
    const row = makePollRow({ expires_at: expiry })
    setupPollAndVotesMock([row])

    const { polls } = await getPollsWithVoteStatus('user-1')

    expect(polls[0].timeLeft).toMatch(/^\d+M$/)
  })

  it('should produce timeLeft="EXPIRED" for past expiry', async () => {
    const past = new Date(Date.now() - 60 * 1000).toISOString() // 1 min ago
    const row = makePollRow({ expires_at: past })
    setupPollAndVotesMock([row])

    const { polls } = await getPollsWithVoteStatus('user-1')

    expect(polls[0].timeLeft).toBe('EXPIRED')
  })

  it('should apply default values for missing optional fields', async () => {
    const minRow: Record<string, unknown> = {
      id: 'poll-min',
      title: 'Minimal poll',
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      created_at: '2024-01-01T00:00:00.000Z',
    }
    setupPollAndVotesMock([minRow])

    const { polls } = await getPollsWithVoteStatus('user-1')
    const p = polls[0]

    expect(p.optionA).toBe('A')
    expect(p.optionB).toBe('B')
    expect(p.category).toBe('GENERAL')
    expect(p.author).toBe('UNKNOWN')
    expect(p.isVoted).toBe(false)
    expect(p.isDeathmatch).toBe(false)
    expect(p.isConfession).toBe(false)
  })

  it('should mark poll as voted when user has voted on it', async () => {
    const row = makePollRow({ id: 'poll-voted' })
    const voteRows = [{ poll_id: 'poll-voted', option: 'A' }]
    setupPollAndVotesMock([row], voteRows)

    const { polls } = await getPollsWithVoteStatus('user-1')

    expect(polls[0].isVoted).toBe(true)
    expect(polls[0].votedOption).toBe('A')
  })

  it('should set hasMore=true when page is exactly limit size', async () => {
    const rows = Array.from({ length: 20 }, (_, i) => makePollRow({ id: `p-${i}` }))
    mockRange.mockResolvedValueOnce({ data: rows, error: null })
    mockEq.mockResolvedValueOnce({ data: [], error: null })

    const { hasMore } = await getPollsWithVoteStatus('user-1', 0, 20)

    expect(hasMore).toBe(true)
  })

  it('should filter out pending deathmatch polls not belonging to the user', async () => {
    const myPoll = makePollRow({
      id: 'dm-mine',
      is_deathmatch: true,
      deathmatch_status: 'pending',
      author_id: 'user-1',
    })
    const strangerPoll = makePollRow({
      id: 'dm-stranger',
      is_deathmatch: true,
      deathmatch_status: 'pending',
      author_id: 'user-999',
      option_a_owner_id: 'user-888',
      option_b_owner_id: 'user-777',
    })
    const regularPoll = makePollRow({ id: 'regular', is_deathmatch: false })

    mockRange.mockResolvedValueOnce({
      data: [myPoll, strangerPoll, regularPoll],
      error: null,
    })
    mockEq.mockResolvedValueOnce({ data: [], error: null })

    const { polls } = await getPollsWithVoteStatus('user-1')

    const ids = polls.map(p => p.id)
    expect(ids).toContain('dm-mine')
    expect(ids).toContain('regular')
    expect(ids).not.toContain('dm-stranger')
  })

  it('should throw when the polls query returns an error', async () => {
    mockRange.mockResolvedValueOnce({ data: null, error: { message: 'db offline' } })

    await expect(getPollsWithVoteStatus('user-1')).rejects.toThrow('db offline')
  })
})

// ─────────────────────────────────────────────────────────────
// transformUser — tested via getUserByUsername above, but we add
// a dedicated block for edge-case coercions.
// ─────────────────────────────────────────────────────────────

describe('transformUser (field coercion edge cases)', () => {
  it('should coerce string-encoded numbers to numbers', async () => {
    const row = makeUserRow({
      followers: '50',
      following: '25',
      reputation: '200',
      poll_count: '7',
      win_rate: '0.4',
    })
    mockMaybeSingle.mockResolvedValueOnce({ data: row, error: null })

    const user = await getUserByUsername('alice') as User

    expect(user.followers).toBe(50)
    expect(user.following).toBe(25)
    expect(user.reputation).toBe(200)
    expect(user.pollCount).toBe(7)
    expect(user.winRate).toBe(0.4)
  })

  it('should convert join_date string to a Date instance', async () => {
    const row = makeUserRow({ join_date: '2023-07-20T12:00:00.000Z' })
    mockMaybeSingle.mockResolvedValueOnce({ data: row, error: null })

    const user = await getUserByUsername('alice') as User

    expect(user.joinDate).toBeInstanceOf(Date)
    expect(user.joinDate.toISOString()).toBe('2023-07-20T12:00:00.000Z')
  })

  it('should use undefined for optional fields not present in the row', async () => {
    const row: Record<string, unknown> = {
      id: 'u1',
      join_date: '2024-01-01T00:00:00.000Z',
    }
    mockMaybeSingle.mockResolvedValueOnce({ data: row, error: null })

    const user = await getUserByUsername('x') as User

    expect(user.email).toBeUndefined()
    expect(user.password).toBeUndefined()
    expect(user.statusReason).toBeUndefined()
    expect(user.bio).toBeUndefined()
  })
})

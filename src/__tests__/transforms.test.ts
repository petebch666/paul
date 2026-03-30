/**
 * Unit tests for the transformPoll and transformUser pure transformation
 * logic in src/database/supabase-api.ts.
 *
 * Because transformPoll and transformUser are not exported from the module,
 * we test them indirectly through the exported getUserVoteHistory function,
 * which calls transformPoll internally, and through getUserByUsername, which
 * calls transformUser.
 *
 * For the time-calculation tests we control "now" by constructing expiry
 * dates relative to Date.now() at test-execution time, which avoids any
 * need to mock the clock while still being deterministic within the
 * millisecond-precision window.
 */

// ─────────────────────────────────────────────────────────────
// Supabase mock (same pattern as supabase-api.test.ts)
// ─────────────────────────────────────────────────────────────

const mockSingle = jest.fn()
const mockMaybeSingle = jest.fn()
const mockInsert = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockOrder = jest.fn()
const mockRange = jest.fn()
const mockFrom = jest.fn()

const builderChain = {
  select: mockSelect,
  eq: mockEq,
  order: mockOrder,
  range: mockRange,
  single: mockSingle,
  maybeSingle: mockMaybeSingle,
  insert: mockInsert,
}

Object.values(builderChain).forEach(fn => (fn as jest.Mock).mockReturnValue(builderChain))
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

import { getUserVoteHistory, getUserByUsername } from '../database/supabase-api'
import type { Poll, User } from '../types'

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

/**
 * Builds a poll history row in the shape that getUserVoteHistory expects:
 *   { poll_id: string, polls: Record<string, unknown> }
 */
function makeHistoryRow(pollRow: Record<string, unknown>) {
  return { poll_id: pollRow.id as string, polls: pollRow }
}

/** A poll row whose expiry is `offsetMs` milliseconds from now. */
function pollRowWithExpiry(offsetMs: number, extra: Record<string, unknown> = {}): Record<string, unknown> {
  const expiresAt = new Date(Date.now() + offsetMs).toISOString()
  return {
    id: 'poll-t',
    title: 'Time test poll',
    option_a: 'A',
    option_b: 'B',
    votes_option_a: 0,
    votes_option_b: 0,
    expires_at: expiresAt,
    author_name: 'UNKNOWN',
    author_id: 'u1',
    timer_enabled: true,
    is_expired: false,
    is_deathmatch: false,
    is_confession: false,
    created_at: '2024-01-01T00:00:00.000Z',
    ...extra,
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  Object.values(builderChain).forEach(fn => (fn as jest.Mock).mockReturnValue(builderChain))
  mockFrom.mockReturnValue(builderChain)
})

// Helper: call getUserVoteHistory with a single mock poll row and return the first poll
async function transformViaHistory(pollRow: Record<string, unknown>): Promise<Poll> {
  mockRange.mockResolvedValueOnce({
    data: [makeHistoryRow(pollRow)],
    error: null,
  })
  const { polls } = await getUserVoteHistory('user-1')
  return polls[0]
}

// ─────────────────────────────────────────────────────────────
// transformPoll — time calculations
// ─────────────────────────────────────────────────────────────

describe('transformPoll — timeLeft calculation', () => {
  it('should produce "EXPIRED" for a poll that expired in the past', async () => {
    const poll = await transformViaHistory(pollRowWithExpiry(-60 * 1000)) // 1 min ago
    expect(poll.timeLeft).toBe('EXPIRED')
  })

  it('should produce "EXPIRED" when expiry is exactly now (diffMs <= 0)', async () => {
    // Use a very small negative offset to simulate exactly-now
    const poll = await transformViaHistory(pollRowWithExpiry(-1))
    expect(poll.timeLeft).toBe('EXPIRED')
  })

  it('should produce "XM" format when less than 1 hour remains', async () => {
    const poll = await transformViaHistory(pollRowWithExpiry(45 * 60 * 1000)) // 45 min
    // Pattern: one or more digits followed by 'M'
    expect(poll.timeLeft).toMatch(/^\d+M$/)
    // The minutes value should be 44 or 45 (timing tolerance)
    const mins = parseInt(poll.timeLeft, 10)
    expect(mins).toBeGreaterThanOrEqual(44)
    expect(mins).toBeLessThanOrEqual(45)
  })

  it('should produce "XH YM" format when 2h30m remains', async () => {
    const twoHalfHours = (2 * 60 + 30) * 60 * 1000
    const poll = await transformViaHistory(pollRowWithExpiry(twoHalfHours))
    // Must match "2H 30M" — allow ±1 minute for execution timing
    expect(poll.timeLeft).toMatch(/^2H (2[89]|30)M$/)
  })

  it('should produce "XH YM" format when exactly 1h remains', async () => {
    // Add a 10s buffer so sub-second execution timing never crosses the hour boundary
    const poll = await transformViaHistory(pollRowWithExpiry(60 * 60 * 1000 + 10_000))
    expect(poll.timeLeft).toMatch(/^1H \d+M$/)
  })

  it('should show 0M when expiry is less than 60 seconds away', async () => {
    const poll = await transformViaHistory(pollRowWithExpiry(30 * 1000)) // 30 sec
    // Less than 60 seconds: Math.floor(diffMs % 3600000 / 60000) = 0
    // hours = 0, so format is "XM"
    expect(poll.timeLeft).toMatch(/^\d+M$/)
    const mins = parseInt(poll.timeLeft, 10)
    expect(mins).toBe(0)
  })

  it('should produce "XH 0M" when the remaining time is an exact hour boundary', async () => {
    // Add a 10s buffer so sub-second execution timing never crosses the 3-hour boundary
    const poll = await transformViaHistory(pollRowWithExpiry(3 * 60 * 60 * 1000 + 10_000))
    expect(poll.timeLeft).toMatch(/^3H \d+M$/)
  })
})

// ─────────────────────────────────────────────────────────────
// transformPoll — isExpired logic
// ─────────────────────────────────────────────────────────────

describe('transformPoll — isExpired logic', () => {
  it('should set isExpired=false when expiry is in the future', async () => {
    const poll = await transformViaHistory(pollRowWithExpiry(60 * 60 * 1000))
    expect(poll.isExpired).toBe(false)
  })

  it('should set isExpired=true when expiry is in the past', async () => {
    const poll = await transformViaHistory(pollRowWithExpiry(-1000))
    expect(poll.isExpired).toBe(true)
  })

  it('should set isExpired=true when is_expired DB flag is true, regardless of expiry date', async () => {
    const poll = await transformViaHistory(
      pollRowWithExpiry(2 * 60 * 60 * 1000, { is_expired: true }),
    )
    expect(poll.isExpired).toBe(true)
  })

  it('should set isExpired=false when is_expired DB flag is false and expiry is future', async () => {
    const poll = await transformViaHistory(
      pollRowWithExpiry(2 * 60 * 60 * 1000, { is_expired: false }),
    )
    expect(poll.isExpired).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────
// transformPoll — vote percentage calculations
// ─────────────────────────────────────────────────────────────

describe('transformPoll — vote counts and percentages', () => {
  it('should sum votesOptionA and votesOptionB to produce total votes', async () => {
    const poll = await transformViaHistory(
      pollRowWithExpiry(60 * 60 * 1000, { votes_option_a: 30, votes_option_b: 70 }),
    )
    expect(poll.votes).toBe(100)
    expect(poll.votesOptionA).toBe(30)
    expect(poll.votesOptionB).toBe(70)
  })

  it('should produce 0 total votes when both options are 0', async () => {
    const poll = await transformViaHistory(
      pollRowWithExpiry(60 * 60 * 1000, { votes_option_a: 0, votes_option_b: 0 }),
    )
    expect(poll.votes).toBe(0)
  })

  it('should handle null vote counts by treating them as 0', async () => {
    const poll = await transformViaHistory(
      pollRowWithExpiry(60 * 60 * 1000, { votes_option_a: null, votes_option_b: null }),
    )
    expect(poll.votes).toBe(0)
    expect(poll.votesOptionA).toBe(0)
    expect(poll.votesOptionB).toBe(0)
  })

  it('should correctly calculate implied vote percentages', async () => {
    const poll = await transformViaHistory(
      pollRowWithExpiry(60 * 60 * 1000, { votes_option_a: 1, votes_option_b: 3 }),
    )
    // 1 / 4 = 25%,  3 / 4 = 75%
    const pctA = (poll.votesOptionA / poll.votes) * 100
    const pctB = (poll.votesOptionB / poll.votes) * 100
    expect(pctA).toBeCloseTo(25)
    expect(pctB).toBeCloseTo(75)
  })

  it('should handle a lopsided vote (all A, none B)', async () => {
    const poll = await transformViaHistory(
      pollRowWithExpiry(60 * 60 * 1000, { votes_option_a: 100, votes_option_b: 0 }),
    )
    expect(poll.votes).toBe(100)
    const pctA = (poll.votesOptionA / poll.votes) * 100
    expect(pctA).toBeCloseTo(100)
  })

  it('should coerce string-encoded vote counts to numbers', async () => {
    const poll = await transformViaHistory(
      pollRowWithExpiry(60 * 60 * 1000, { votes_option_a: '40', votes_option_b: '60' }),
    )
    expect(poll.votes).toBe(100)
    expect(poll.votesOptionA).toBe(40)
    expect(poll.votesOptionB).toBe(60)
  })
})

// ─────────────────────────────────────────────────────────────
// transformPoll — field mapping
// ─────────────────────────────────────────────────────────────

describe('transformPoll — field mapping', () => {
  it('should map all standard fields from the DB row', async () => {
    const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    const created = '2024-05-01T10:00:00.000Z'
    const row: Record<string, unknown> = {
      id: 'poll-mapped',
      title: 'Best language?',
      option_a: 'TypeScript',
      option_b: 'Python',
      votes_option_a: 55,
      votes_option_b: 45,
      category: 'TECH',
      expires_at: expiry,
      author_name: 'Pete',
      author_id: 'u-pete',
      author_username: 'pete',
      timer_enabled: true,
      is_expired: false,
      is_deathmatch: false,
      is_confession: false,
      trending_score: 99,
      validation_status: 'approved',
      created_at: created,
      deathmatch_status: null,
    }
    const poll = await transformViaHistory(row)

    expect(poll.id).toBe('poll-mapped')
    expect(poll.title).toBe('Best language?')
    expect(poll.optionA).toBe('TypeScript')
    expect(poll.optionB).toBe('Python')
    expect(poll.category).toBe('TECH')
    expect(poll.author).toBe('Pete')
    expect(poll.authorId).toBe('u-pete')
    expect(poll.authorUsername).toBe('pete')
    expect(poll.timerEnabled).toBe(true)
    expect(poll.isDeathmatch).toBe(false)
    expect(poll.isConfession).toBe(false)
    expect(poll.trendingScore).toBe(99)
    expect(poll.validationStatus).toBe('approved')
    expect(poll.isVoted).toBe(false) // default
    expect(poll.createdAt).toBeInstanceOf(Date)
    expect(poll.expiresAt).toBeInstanceOf(Date)
  })

  it('should default optionA to "A" when option_a is missing', async () => {
    const row = pollRowWithExpiry(3600000, { option_a: undefined })
    const poll = await transformViaHistory(row)
    expect(poll.optionA).toBe('A')
  })

  it('should default optionB to "B" when option_b is missing', async () => {
    const row = pollRowWithExpiry(3600000, { option_b: undefined })
    const poll = await transformViaHistory(row)
    expect(poll.optionB).toBe('B')
  })

  it('should default category to "GENERAL" when category is missing', async () => {
    const row = pollRowWithExpiry(3600000, { category: undefined })
    const poll = await transformViaHistory(row)
    expect(poll.category).toBe('GENERAL')
  })

  it('should default author to "UNKNOWN" when author_name is missing', async () => {
    const row = pollRowWithExpiry(3600000, { author_name: undefined })
    const poll = await transformViaHistory(row)
    expect(poll.author).toBe('UNKNOWN')
  })

  it('should convert both createdAt and expiresAt to Date instances', async () => {
    const row = pollRowWithExpiry(3600000)
    const poll = await transformViaHistory(row)
    expect(poll.createdAt).toBeInstanceOf(Date)
    expect(poll.expiresAt).toBeInstanceOf(Date)
  })

  it('should coerce is_deathmatch to boolean', async () => {
    const rowFalsy = pollRowWithExpiry(3600000, { is_deathmatch: 0 })
    const pollFalsy = await transformViaHistory(rowFalsy)
    expect(pollFalsy.isDeathmatch).toBe(false)

    const rowTruthy = pollRowWithExpiry(3600000, { is_deathmatch: 1 })
    const pollTruthy = await transformViaHistory(rowTruthy)
    expect(pollTruthy.isDeathmatch).toBe(true)
  })

  it('should coerce is_confession to boolean', async () => {
    const row = pollRowWithExpiry(3600000, { is_confession: 1 })
    const poll = await transformViaHistory(row)
    expect(poll.isConfession).toBe(true)
  })

  it('should coerce timer_enabled to boolean', async () => {
    const row = pollRowWithExpiry(3600000, { timer_enabled: 0 })
    const poll = await transformViaHistory(row)
    expect(poll.timerEnabled).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────
// transformUser — field mapping (via getUserByUsername)
// ─────────────────────────────────────────────────────────────

describe('transformUser — field mapping', () => {
  it('should map all standard fields from the DB row', async () => {
    const row = makeUserRow({
      id: 'u-full',
      name: 'Full User',
      username: 'fulluser',
      email: 'full@example.com',
      avatar: '💀',
      role: 'admin',
      followers: 200,
      following: 100,
      reputation: 999,
      poll_count: 50,
      win_rate: 0.88,
      join_date: '2022-12-01T00:00:00.000Z',
      status: 'suspended',
      status_reason: 'test reason',
      bio: 'I am a test user',
    })
    mockMaybeSingle.mockResolvedValueOnce({ data: row, error: null })

    const user = await getUserByUsername('fulluser') as User

    expect(user.id).toBe('u-full')
    expect(user.name).toBe('Full User')
    expect(user.username).toBe('fulluser')
    expect(user.email).toBe('full@example.com')
    expect(user.avatar).toBe('💀')
    expect(user.role).toBe('admin')
    expect(user.followers).toBe(200)
    expect(user.following).toBe(100)
    expect(user.reputation).toBe(999)
    expect(user.pollCount).toBe(50)
    expect(user.winRate).toBe(0.88)
    expect(user.joinDate).toBeInstanceOf(Date)
    expect(user.status).toBe('suspended')
    expect(user.statusReason).toBe('test reason')
    expect(user.bio).toBe('I am a test user')
  })

  it('should default role to "user" when not provided', async () => {
    const row = makeUserRow({ role: undefined })
    mockMaybeSingle.mockResolvedValueOnce({ data: row, error: null })
    const user = await getUserByUsername('x') as User
    expect(user.role).toBe('user')
  })

  it('should default status to "active" when not provided', async () => {
    const row = makeUserRow({ status: undefined })
    mockMaybeSingle.mockResolvedValueOnce({ data: row, error: null })
    const user = await getUserByUsername('x') as User
    expect(user.status).toBe('active')
  })

  it('should default avatar to "👤" when not provided', async () => {
    const row = makeUserRow({ avatar: undefined })
    mockMaybeSingle.mockResolvedValueOnce({ data: row, error: null })
    const user = await getUserByUsername('x') as User
    expect(user.avatar).toBe('👤')
  })

  it('should coerce null numeric fields to 0', async () => {
    const row = makeUserRow({
      followers: null,
      following: null,
      reputation: null,
      poll_count: null,
      win_rate: null,
    })
    mockMaybeSingle.mockResolvedValueOnce({ data: row, error: null })
    const user = await getUserByUsername('x') as User
    expect(user.followers).toBe(0)
    expect(user.following).toBe(0)
    expect(user.reputation).toBe(0)
    expect(user.pollCount).toBe(0)
    expect(user.winRate).toBe(0)
  })
})

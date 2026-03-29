/**
 * Unit tests for src/hooks/useNotifications.ts
 *
 * All API functions from src/database/supabase-api are mocked.
 * We use renderHook + act from @testing-library/react-native to drive
 * state transitions.
 *
 * Functions under test:
 *   loadNotifications(reset)  — parallel fetch of notifications + unread count + pending challenges
 *   markAllRead()             — marks all read, clears unreadCount, updates notification items
 *   acceptChallenge()         — accepts a deathmatch, removes from pendingChallenges + notifications
 *   rejectChallenge()         — rejects a deathmatch, removes from pendingChallenges + notifications
 *   refreshUnreadCount()      — fetches just the unread count
 */

// ─────────────────────────────────────────────────────────────
// Mock: src/database/supabase-api
// ─────────────────────────────────────────────────────────────

const mockGetNotifications = jest.fn()
const mockGetUnreadNotificationCount = jest.fn()
const mockMarkNotificationsRead = jest.fn()
const mockAcceptDeathmatchChallenge = jest.fn()
const mockRejectDeathmatchChallenge = jest.fn()
const mockGetPendingChallengesForUser = jest.fn()

jest.mock('../database/supabase-api', () => ({
  getNotifications: (...args: unknown[]) => mockGetNotifications(...args),
  getUnreadNotificationCount: (...args: unknown[]) => mockGetUnreadNotificationCount(...args),
  markNotificationsRead: (...args: unknown[]) => mockMarkNotificationsRead(...args),
  acceptDeathmatchChallenge: (...args: unknown[]) => mockAcceptDeathmatchChallenge(...args),
  rejectDeathmatchChallenge: (...args: unknown[]) => mockRejectDeathmatchChallenge(...args),
  getPendingChallengesForUser: (...args: unknown[]) => mockGetPendingChallengesForUser(...args),
}))

// ─────────────────────────────────────────────────────────────
// Imports (after mocks)
// ─────────────────────────────────────────────────────────────

import { renderHook, act } from '@testing-library/react-native'
import { useNotifications } from '../hooks/useNotifications'
import type { PollNotification, Poll } from '../types'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function makeNotification(overrides: Partial<PollNotification> = {}): PollNotification {
  return {
    id: 'notif-1',
    pollId: 'poll-1',
    userId: 'user-1',
    type: 'deathmatch_created',
    message: 'YOU HAVE A DEATHMATCH CHALLENGE!',
    isRead: false,
    createdAt: new Date('2024-06-01'),
    ...overrides,
  }
}

function makePoll(overrides: Partial<Poll> = {}): Poll {
  return {
    id: 'poll-1',
    title: 'Dogs vs Cats',
    optionA: 'Dogs',
    optionB: 'Cats',
    votes: 0,
    votesOptionA: 0,
    votesOptionB: 0,
    category: 'ANIMALS',
    timeLeft: '2H 0M',
    author: 'Alice',
    authorId: 'user-1',
    isVoted: false,
    createdAt: new Date('2024-06-01'),
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    timerEnabled: true,
    isExpired: false,
    isDeathmatch: true,
    deathmatchStatus: 'pending',
    ...overrides,
  }
}

// Standard successful API mock responses
function setupSuccessfulLoad(
  notifications: PollNotification[] = [],
  unreadCount = 0,
  challenges: Poll[] = [],
  hasMore = false,
) {
  mockGetNotifications.mockResolvedValueOnce({ notifications, hasMore })
  mockGetUnreadNotificationCount.mockResolvedValueOnce(unreadCount)
  mockGetPendingChallengesForUser.mockResolvedValueOnce(challenges)
}

// ─────────────────────────────────────────────────────────────
// Reset mocks before every test
// ─────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.resetAllMocks()
})

// ─────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────

describe('useNotifications — initial state', () => {
  it('should initialize with empty state and no loading', () => {
    const { result } = renderHook(() => useNotifications('user-1'))

    expect(result.current.notifications).toEqual([])
    expect(result.current.unreadCount).toBe(0)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.hasMore).toBe(false)
    expect(result.current.pendingChallenges).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────
// loadNotifications
// ─────────────────────────────────────────────────────────────

describe('useNotifications — loadNotifications', () => {
  it('should populate notifications, unreadCount, and pendingChallenges on success', async () => {
    const notifs = [makeNotification({ id: 'n-1' }), makeNotification({ id: 'n-2' })]
    const challenges = [makePoll({ id: 'dm-1' })]
    setupSuccessfulLoad(notifs, 2, challenges)

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    expect(result.current.notifications).toHaveLength(2)
    expect(result.current.notifications[0].id).toBe('n-1')
    expect(result.current.unreadCount).toBe(2)
    expect(result.current.pendingChallenges).toHaveLength(1)
    expect(result.current.pendingChallenges[0].id).toBe('dm-1')
  })

  it('should call all three API functions in parallel', async () => {
    setupSuccessfulLoad()

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    expect(mockGetNotifications).toHaveBeenCalledWith('user-1', 0, 20)
    expect(mockGetUnreadNotificationCount).toHaveBeenCalledWith('user-1')
    expect(mockGetPendingChallengesForUser).toHaveBeenCalledWith('user-1')
  })

  it('should replace notifications list when reset=true', async () => {
    const first = [makeNotification({ id: 'old-1' })]
    const second = [makeNotification({ id: 'new-1' })]

    setupSuccessfulLoad(first)
    setupSuccessfulLoad(second)

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    expect(result.current.notifications).toHaveLength(1)
    expect(result.current.notifications[0].id).toBe('old-1')

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    expect(result.current.notifications).toHaveLength(1)
    expect(result.current.notifications[0].id).toBe('new-1')
  })

  it('should append notifications when reset=false (pagination)', async () => {
    const page1 = [makeNotification({ id: 'n-1' }), makeNotification({ id: 'n-2' })]
    const page2 = [makeNotification({ id: 'n-3' })]

    setupSuccessfulLoad(page1, 0, [], true)
    setupSuccessfulLoad(page2, 0, [], false)

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    expect(result.current.notifications).toHaveLength(2)

    await act(async () => {
      await result.current.loadNotifications(false)
    })

    expect(result.current.notifications).toHaveLength(3)
    expect(result.current.notifications.map(n => n.id)).toEqual(['n-1', 'n-2', 'n-3'])
  })

  it('should set hasMore correctly', async () => {
    setupSuccessfulLoad([], 0, [], true)

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    expect(result.current.hasMore).toBe(true)
  })

  it('should set isLoading to true during load then back to false', async () => {
    let resolveNotifs!: (val: { notifications: PollNotification[]; hasMore: boolean }) => void
    const notifsPromise = new Promise<{ notifications: PollNotification[]; hasMore: boolean }>(
      res => { resolveNotifs = res },
    )
    mockGetNotifications.mockReturnValueOnce(notifsPromise)
    mockGetUnreadNotificationCount.mockResolvedValueOnce(0)
    mockGetPendingChallengesForUser.mockResolvedValueOnce([])

    const { result } = renderHook(() => useNotifications('user-1'))

    act(() => { result.current.loadNotifications(true) })

    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      resolveNotifs({ notifications: [], hasMore: false })
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('should clear error before each load', async () => {
    // First load fails
    mockGetNotifications.mockRejectedValueOnce(new Error('network error'))
    mockGetUnreadNotificationCount.mockResolvedValueOnce(0)
    mockGetPendingChallengesForUser.mockResolvedValueOnce([])

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    expect(result.current.error).not.toBeNull()

    // Second load succeeds
    setupSuccessfulLoad()

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    expect(result.current.error).toBeNull()
  })

  it('should return early without making any API calls when userId is empty', async () => {
    const { result } = renderHook(() => useNotifications(''))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    expect(mockGetNotifications).not.toHaveBeenCalled()
    expect(mockGetUnreadNotificationCount).not.toHaveBeenCalled()
    expect(mockGetPendingChallengesForUser).not.toHaveBeenCalled()
  })

  it('should set error state when the API call throws', async () => {
    mockGetNotifications.mockRejectedValueOnce(new Error('SERVER DOWN'))
    mockGetUnreadNotificationCount.mockResolvedValueOnce(0)
    mockGetPendingChallengesForUser.mockResolvedValueOnce([])

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    expect(result.current.error).toBe('SERVER DOWN')
  })

  it('should uppercase the error message', async () => {
    mockGetNotifications.mockRejectedValueOnce(new Error('something went wrong'))
    mockGetUnreadNotificationCount.mockResolvedValueOnce(0)
    mockGetPendingChallengesForUser.mockResolvedValueOnce([])

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    expect(result.current.error).toBe('SOMETHING WENT WRONG')
  })

  it('should fall back to "FAILED TO LOAD" when error is not an Error instance', async () => {
    // Reject with a plain string (not an Error object)
    mockGetNotifications.mockRejectedValueOnce('network timeout')
    mockGetUnreadNotificationCount.mockResolvedValueOnce(0)
    mockGetPendingChallengesForUser.mockResolvedValueOnce([])

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    expect(result.current.error).toBe('FAILED TO LOAD')
  })

  it('should set isLoading back to false even when an error occurs', async () => {
    mockGetNotifications.mockRejectedValueOnce(new Error('oops'))
    mockGetUnreadNotificationCount.mockResolvedValueOnce(0)
    mockGetPendingChallengesForUser.mockResolvedValueOnce([])

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('should use offset=0 when reset=true', async () => {
    setupSuccessfulLoad([makeNotification()], 1, [], false)

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    expect(mockGetNotifications).toHaveBeenCalledWith('user-1', 0, 20)
  })

  it('should advance offset on successive non-reset loads', async () => {
    const page1 = [makeNotification({ id: 'n-1' }), makeNotification({ id: 'n-2' })]
    setupSuccessfulLoad(page1, 0, [], true)
    setupSuccessfulLoad([], 0, [], false)

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    await act(async () => {
      await result.current.loadNotifications(false)
    })

    // Second call should use offset=2 (length of page1)
    expect(mockGetNotifications).toHaveBeenNthCalledWith(2, 'user-1', 2, 20)
  })
})

// ─────────────────────────────────────────────────────────────
// markAllRead
// ─────────────────────────────────────────────────────────────

describe('useNotifications — markAllRead', () => {
  it('should call markNotificationsRead with the userId', async () => {
    mockMarkNotificationsRead.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.markAllRead()
    })

    expect(mockMarkNotificationsRead).toHaveBeenCalledWith('user-1')
  })

  it('should set unreadCount to 0 after marking all read', async () => {
    setupSuccessfulLoad([makeNotification()], 5)

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    expect(result.current.unreadCount).toBe(5)

    mockMarkNotificationsRead.mockResolvedValueOnce(undefined)

    await act(async () => {
      await result.current.markAllRead()
    })

    expect(result.current.unreadCount).toBe(0)
  })

  it('should set isRead=true on all notifications in state', async () => {
    const notifs = [
      makeNotification({ id: 'n-1', isRead: false }),
      makeNotification({ id: 'n-2', isRead: false }),
    ]
    setupSuccessfulLoad(notifs, 2)

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    mockMarkNotificationsRead.mockResolvedValueOnce(undefined)

    await act(async () => {
      await result.current.markAllRead()
    })

    expect(result.current.notifications.every(n => n.isRead)).toBe(true)
  })

  it('should not mutate other notification fields when marking all read', async () => {
    const notif = makeNotification({
      id: 'n-special',
      message: 'ORIGINAL MESSAGE',
      type: 'poll_expired',
      isRead: false,
    })
    setupSuccessfulLoad([notif], 1)

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    mockMarkNotificationsRead.mockResolvedValueOnce(undefined)

    await act(async () => {
      await result.current.markAllRead()
    })

    const updated = result.current.notifications[0]
    expect(updated.id).toBe('n-special')
    expect(updated.message).toBe('ORIGINAL MESSAGE')
    expect(updated.type).toBe('poll_expired')
    expect(updated.isRead).toBe(true)
  })

  it('should return early without API call when userId is empty', async () => {
    const { result } = renderHook(() => useNotifications(''))

    await act(async () => {
      await result.current.markAllRead()
    })

    expect(mockMarkNotificationsRead).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────
// acceptChallenge
// ─────────────────────────────────────────────────────────────

describe('useNotifications — acceptChallenge', () => {
  it('should call acceptDeathmatchChallenge with correct args', async () => {
    mockAcceptDeathmatchChallenge.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.acceptChallenge('poll-1', 'creator-1')
    })

    expect(mockAcceptDeathmatchChallenge).toHaveBeenCalledWith('poll-1', 'user-1', 'creator-1')
  })

  it('should remove the accepted poll from pendingChallenges', async () => {
    const challenges = [makePoll({ id: 'dm-1' }), makePoll({ id: 'dm-2' })]
    setupSuccessfulLoad([], 0, challenges)

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    expect(result.current.pendingChallenges).toHaveLength(2)

    mockAcceptDeathmatchChallenge.mockResolvedValueOnce(undefined)

    await act(async () => {
      await result.current.acceptChallenge('dm-1', 'creator-1')
    })

    expect(result.current.pendingChallenges).toHaveLength(1)
    expect(result.current.pendingChallenges[0].id).toBe('dm-2')
  })

  it('should remove the matching deathmatch_created notification', async () => {
    const notifs = [
      makeNotification({ id: 'n-dm', pollId: 'poll-1', type: 'deathmatch_created' }),
      makeNotification({ id: 'n-other', pollId: 'poll-2', type: 'poll_expired' }),
    ]
    setupSuccessfulLoad(notifs, 1)

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    mockAcceptDeathmatchChallenge.mockResolvedValueOnce(undefined)

    await act(async () => {
      await result.current.acceptChallenge('poll-1', 'creator-1')
    })

    expect(result.current.notifications).toHaveLength(1)
    expect(result.current.notifications[0].id).toBe('n-other')
  })

  it('should keep notifications with matching pollId but different type', async () => {
    // A notification with poll_expired for the same poll should NOT be removed
    const notifs = [
      makeNotification({ id: 'n-dm', pollId: 'poll-1', type: 'deathmatch_created' }),
      makeNotification({ id: 'n-expired', pollId: 'poll-1', type: 'poll_expired' }),
    ]
    setupSuccessfulLoad(notifs, 2)

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    mockAcceptDeathmatchChallenge.mockResolvedValueOnce(undefined)

    await act(async () => {
      await result.current.acceptChallenge('poll-1', 'creator-1')
    })

    // n-expired has type 'poll_expired', not 'deathmatch_created' so it should remain
    expect(result.current.notifications).toHaveLength(1)
    expect(result.current.notifications[0].id).toBe('n-expired')
  })

  it('should propagate errors thrown by acceptDeathmatchChallenge', async () => {
    mockAcceptDeathmatchChallenge.mockRejectedValueOnce(new Error('acceptance failed'))

    const { result } = renderHook(() => useNotifications('user-1'))

    await expect(
      act(async () => {
        await result.current.acceptChallenge('poll-1', 'creator-1')
      }),
    ).rejects.toThrow('acceptance failed')
  })
})

// ─────────────────────────────────────────────────────────────
// rejectChallenge
// ─────────────────────────────────────────────────────────────

describe('useNotifications — rejectChallenge', () => {
  it('should call rejectDeathmatchChallenge with correct args', async () => {
    mockRejectDeathmatchChallenge.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.rejectChallenge('poll-1', 'creator-1')
    })

    expect(mockRejectDeathmatchChallenge).toHaveBeenCalledWith('poll-1', 'user-1', 'creator-1')
  })

  it('should remove the rejected poll from pendingChallenges', async () => {
    const challenges = [makePoll({ id: 'dm-A' }), makePoll({ id: 'dm-B' })]
    setupSuccessfulLoad([], 0, challenges)

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    mockRejectDeathmatchChallenge.mockResolvedValueOnce(undefined)

    await act(async () => {
      await result.current.rejectChallenge('dm-A', 'creator-1')
    })

    expect(result.current.pendingChallenges).toHaveLength(1)
    expect(result.current.pendingChallenges[0].id).toBe('dm-B')
  })

  it('should remove the matching deathmatch_created notification', async () => {
    const notifs = [
      makeNotification({ id: 'n-dm', pollId: 'poll-99', type: 'deathmatch_created' }),
      makeNotification({ id: 'n-keep', pollId: 'poll-other', type: 'deathmatch_created' }),
    ]
    setupSuccessfulLoad(notifs, 2)

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    mockRejectDeathmatchChallenge.mockResolvedValueOnce(undefined)

    await act(async () => {
      await result.current.rejectChallenge('poll-99', 'creator-1')
    })

    expect(result.current.notifications).toHaveLength(1)
    expect(result.current.notifications[0].id).toBe('n-keep')
  })

  it('should propagate errors thrown by rejectDeathmatchChallenge', async () => {
    mockRejectDeathmatchChallenge.mockRejectedValueOnce(new Error('rejection failed'))

    const { result } = renderHook(() => useNotifications('user-1'))

    await expect(
      act(async () => {
        await result.current.rejectChallenge('poll-1', 'creator-1')
      }),
    ).rejects.toThrow('rejection failed')
  })

  it('should handle rejecting a challenge that is not in the current list (no-op on state)', async () => {
    setupSuccessfulLoad([], 0, [makePoll({ id: 'dm-X' })])

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    mockRejectDeathmatchChallenge.mockResolvedValueOnce(undefined)

    // Reject a poll that isn't in the challenges list
    await act(async () => {
      await result.current.rejectChallenge('dm-nonexistent', 'creator-1')
    })

    // dm-X should still be present
    expect(result.current.pendingChallenges).toHaveLength(1)
    expect(result.current.pendingChallenges[0].id).toBe('dm-X')
  })
})

// ─────────────────────────────────────────────────────────────
// refreshUnreadCount
// ─────────────────────────────────────────────────────────────

describe('useNotifications — refreshUnreadCount', () => {
  it('should call getUnreadNotificationCount with the userId', async () => {
    mockGetUnreadNotificationCount.mockResolvedValueOnce(3)

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.refreshUnreadCount()
    })

    expect(mockGetUnreadNotificationCount).toHaveBeenCalledWith('user-1')
  })

  it('should update unreadCount state with the returned count', async () => {
    mockGetUnreadNotificationCount.mockResolvedValueOnce(7)

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.refreshUnreadCount()
    })

    expect(result.current.unreadCount).toBe(7)
  })

  it('should set unreadCount to 0 when API returns 0', async () => {
    // First set a non-zero count via loadNotifications
    setupSuccessfulLoad([], 5)

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    expect(result.current.unreadCount).toBe(5)

    mockGetUnreadNotificationCount.mockResolvedValueOnce(0)

    await act(async () => {
      await result.current.refreshUnreadCount()
    })

    expect(result.current.unreadCount).toBe(0)
  })

  it('should return early without API call when userId is empty', async () => {
    const { result } = renderHook(() => useNotifications(''))

    await act(async () => {
      await result.current.refreshUnreadCount()
    })

    expect(mockGetUnreadNotificationCount).not.toHaveBeenCalled()
  })

  it('should not affect other state when refreshing count', async () => {
    const notifs = [makeNotification({ id: 'n-1' })]
    const challenges = [makePoll({ id: 'dm-1' })]
    setupSuccessfulLoad(notifs, 1, challenges)

    const { result } = renderHook(() => useNotifications('user-1'))

    await act(async () => {
      await result.current.loadNotifications(true)
    })

    mockGetUnreadNotificationCount.mockResolvedValueOnce(3)

    await act(async () => {
      await result.current.refreshUnreadCount()
    })

    // Other state should be unchanged
    expect(result.current.notifications).toHaveLength(1)
    expect(result.current.pendingChallenges).toHaveLength(1)
    expect(result.current.unreadCount).toBe(3)
  })
})

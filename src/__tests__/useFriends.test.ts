/**
 * Unit tests for src/hooks/useFriends.ts
 *
 * All API functions from src/database/supabase-api are mocked so no real
 * network or DB calls are made.  We use @testing-library/react-hooks via
 * renderHook (re-exported from @testing-library/react-native) to exercise
 * the hook's state transitions.
 *
 * Patterns:
 *   - act() wraps every async state update
 *   - jest.resetAllMocks() before each test
 *   - Each mock returns { users, hasMore } (getFollowing / getFollowers)
 *     or User[] (getMutualFollows) matching the API contract
 */

// ─────────────────────────────────────────────────────────────
// Mock: src/database/supabase-api
// ─────────────────────────────────────────────────────────────

const mockFollowUser = jest.fn()
const mockUnfollowUser = jest.fn()
const mockApiIsFollowing = jest.fn()
const mockGetFollowing = jest.fn()
const mockGetFollowers = jest.fn()
const mockGetMutualFollows = jest.fn()

jest.mock('../database/supabase-api', () => ({
  followUser: (...args: unknown[]) => mockFollowUser(...args),
  unfollowUser: (...args: unknown[]) => mockUnfollowUser(...args),
  isFollowing: (...args: unknown[]) => mockApiIsFollowing(...args),
  getFollowing: (...args: unknown[]) => mockGetFollowing(...args),
  getFollowers: (...args: unknown[]) => mockGetFollowers(...args),
  getMutualFollows: (...args: unknown[]) => mockGetMutualFollows(...args),
}))

// ─────────────────────────────────────────────────────────────
// Imports (after mocks)
// ─────────────────────────────────────────────────────────────

import { renderHook, act } from '@testing-library/react-native'
import { useFriends } from '../hooks/useFriends'
import type { User } from '../types'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function makeUser(overrides: Partial<User> = {}): User {
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
    pollCount: 3,
    winRate: 0.6,
    joinDate: new Date('2024-01-01'),
    status: 'active',
    ...overrides,
  }
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

describe('useFriends — initial state', () => {
  it('should initialize with empty arrays and no loading states', () => {
    const { result } = renderHook(() => useFriends('user-1'))

    expect(result.current.following).toEqual([])
    expect(result.current.followers).toEqual([])
    expect(result.current.mutualFollows).toEqual([])
    expect(result.current.followingHasMore).toBe(false)
    expect(result.current.followersHasMore).toBe(false)
    expect(result.current.isLoadingFollowing).toBe(false)
    expect(result.current.isLoadingFollowers).toBe(false)
    expect(result.current.isLoadingMutuals).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────
// isFollowingUser
// ─────────────────────────────────────────────────────────────

describe('useFriends — isFollowingUser', () => {
  it('should return false for any user before any following is loaded', () => {
    const { result } = renderHook(() => useFriends('user-1'))

    expect(result.current.isFollowingUser('user-2')).toBe(false)
    expect(result.current.isFollowingUser('anyone')).toBe(false)
  })

  it('should return true after following a user', async () => {
    mockFollowUser.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.follow('user-2')
    })

    expect(result.current.isFollowingUser('user-2')).toBe(true)
  })

  it('should return false after unfollowing a user', async () => {
    mockFollowUser.mockResolvedValueOnce(undefined)
    mockUnfollowUser.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.follow('user-2')
    })

    expect(result.current.isFollowingUser('user-2')).toBe(true)

    await act(async () => {
      await result.current.unfollow('user-2')
    })

    expect(result.current.isFollowingUser('user-2')).toBe(false)
  })

  it('should return true for users loaded via loadFollowing', async () => {
    const user2 = makeUser({ id: 'user-2' })
    mockGetFollowing.mockResolvedValueOnce({ users: [user2], hasMore: false })

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.loadFollowing(true)
    })

    expect(result.current.isFollowingUser('user-2')).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────
// follow
// ─────────────────────────────────────────────────────────────

describe('useFriends — follow', () => {
  it('should call followUser API with currentUserId and targetUserId', async () => {
    mockFollowUser.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useFriends('current-user'))

    await act(async () => {
      await result.current.follow('target-user')
    })

    expect(mockFollowUser).toHaveBeenCalledWith('current-user', 'target-user')
  })

  it('should add the userId to followingSet after follow', async () => {
    mockFollowUser.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.follow('user-99')
    })

    expect(result.current.isFollowingUser('user-99')).toBe(true)
  })

  it('should propagate errors thrown by followUser', async () => {
    mockFollowUser.mockRejectedValueOnce(new Error('already following'))

    const { result } = renderHook(() => useFriends('user-1'))

    await expect(
      act(async () => {
        await result.current.follow('user-2')
      }),
    ).rejects.toThrow('already following')
  })

  it('should be possible to follow multiple users independently', async () => {
    mockFollowUser.mockResolvedValue(undefined)

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.follow('user-A')
      await result.current.follow('user-B')
      await result.current.follow('user-C')
    })

    expect(result.current.isFollowingUser('user-A')).toBe(true)
    expect(result.current.isFollowingUser('user-B')).toBe(true)
    expect(result.current.isFollowingUser('user-C')).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────
// unfollow
// ─────────────────────────────────────────────────────────────

describe('useFriends — unfollow', () => {
  it('should call unfollowUser API with currentUserId and targetUserId', async () => {
    mockFollowUser.mockResolvedValueOnce(undefined)
    mockUnfollowUser.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useFriends('current-user'))

    await act(async () => {
      await result.current.follow('target-user')
      await result.current.unfollow('target-user')
    })

    expect(mockUnfollowUser).toHaveBeenCalledWith('current-user', 'target-user')
  })

  it('should remove userId from followingSet after unfollow', async () => {
    mockFollowUser.mockResolvedValueOnce(undefined)
    mockUnfollowUser.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.follow('user-2')
    })

    expect(result.current.isFollowingUser('user-2')).toBe(true)

    await act(async () => {
      await result.current.unfollow('user-2')
    })

    expect(result.current.isFollowingUser('user-2')).toBe(false)
  })

  it('should remove the user from the following list', async () => {
    const user2 = makeUser({ id: 'user-2' })
    mockGetFollowing.mockResolvedValueOnce({ users: [user2], hasMore: false })
    mockUnfollowUser.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.loadFollowing(true)
    })

    expect(result.current.following).toHaveLength(1)

    await act(async () => {
      await result.current.unfollow('user-2')
    })

    expect(result.current.following).toHaveLength(0)
    expect(result.current.following.find(u => u.id === 'user-2')).toBeUndefined()
  })

  it('should remove the user from the mutualFollows list', async () => {
    const user2 = makeUser({ id: 'user-2' })
    mockGetMutualFollows.mockResolvedValueOnce([user2])
    mockUnfollowUser.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.loadMutualFollows()
    })

    expect(result.current.mutualFollows).toHaveLength(1)

    await act(async () => {
      await result.current.unfollow('user-2')
    })

    expect(result.current.mutualFollows).toHaveLength(0)
  })

  it('should propagate errors thrown by unfollowUser', async () => {
    mockUnfollowUser.mockRejectedValueOnce(new Error('not following'))

    const { result } = renderHook(() => useFriends('user-1'))

    await expect(
      act(async () => {
        await result.current.unfollow('user-2')
      }),
    ).rejects.toThrow('not following')
  })
})

// ─────────────────────────────────────────────────────────────
// checkIsFollowing
// ─────────────────────────────────────────────────────────────

describe('useFriends — checkIsFollowing', () => {
  it('should call apiIsFollowing with currentUserId and targetUserId', async () => {
    mockApiIsFollowing.mockResolvedValueOnce(true)

    const { result } = renderHook(() => useFriends('current-user'))

    await act(async () => {
      await result.current.checkIsFollowing('target-user')
    })

    expect(mockApiIsFollowing).toHaveBeenCalledWith('current-user', 'target-user')
  })

  it('should return true when apiIsFollowing returns true', async () => {
    mockApiIsFollowing.mockResolvedValueOnce(true)

    const { result } = renderHook(() => useFriends('user-1'))

    let isFollowingResult: boolean = false
    await act(async () => {
      isFollowingResult = await result.current.checkIsFollowing('user-2')
    })

    expect(isFollowingResult).toBe(true)
  })

  it('should return false when apiIsFollowing returns false', async () => {
    mockApiIsFollowing.mockResolvedValueOnce(false)

    const { result } = renderHook(() => useFriends('user-1'))

    let isFollowingResult: boolean = true
    await act(async () => {
      isFollowingResult = await result.current.checkIsFollowing('user-2')
    })

    expect(isFollowingResult).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────
// loadFollowing
// ─────────────────────────────────────────────────────────────

describe('useFriends — loadFollowing', () => {
  it('should populate following list on reset=true', async () => {
    const users = [makeUser({ id: 'user-2' }), makeUser({ id: 'user-3' })]
    mockGetFollowing.mockResolvedValueOnce({ users, hasMore: false })

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.loadFollowing(true)
    })

    expect(result.current.following).toHaveLength(2)
    expect(result.current.following[0].id).toBe('user-2')
  })

  it('should replace following list when reset=true is called twice', async () => {
    mockGetFollowing
      .mockResolvedValueOnce({ users: [makeUser({ id: 'user-2' })], hasMore: true })
      .mockResolvedValueOnce({ users: [makeUser({ id: 'user-99' })], hasMore: false })

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.loadFollowing(true)
    })

    expect(result.current.following).toHaveLength(1)

    await act(async () => {
      await result.current.loadFollowing(true)
    })

    expect(result.current.following).toHaveLength(1)
    expect(result.current.following[0].id).toBe('user-99')
  })

  it('should append to following list when reset=false (pagination)', async () => {
    const page1 = [makeUser({ id: 'user-2' }), makeUser({ id: 'user-3' })]
    const page2 = [makeUser({ id: 'user-4' })]
    mockGetFollowing
      .mockResolvedValueOnce({ users: page1, hasMore: true })
      .mockResolvedValueOnce({ users: page2, hasMore: false })

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.loadFollowing(true)
    })

    expect(result.current.following).toHaveLength(2)

    await act(async () => {
      await result.current.loadFollowing(false)
    })

    expect(result.current.following).toHaveLength(3)
    expect(result.current.following.map(u => u.id)).toEqual(['user-2', 'user-3', 'user-4'])
  })

  it('should populate followingSet with user ids from the loaded list', async () => {
    const users = [makeUser({ id: 'user-A' }), makeUser({ id: 'user-B' })]
    mockGetFollowing.mockResolvedValueOnce({ users, hasMore: false })

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.loadFollowing(true)
    })

    expect(result.current.isFollowingUser('user-A')).toBe(true)
    expect(result.current.isFollowingUser('user-B')).toBe(true)
  })

  it('should set followingHasMore correctly', async () => {
    mockGetFollowing.mockResolvedValueOnce({ users: [], hasMore: true })

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.loadFollowing(true)
    })

    expect(result.current.followingHasMore).toBe(true)
  })

  it('should set isLoadingFollowing to true during load then back to false', async () => {
    let resolveLoad!: (val: { users: User[]; hasMore: boolean }) => void
    const loadPromise = new Promise<{ users: User[]; hasMore: boolean }>(res => {
      resolveLoad = res
    })
    mockGetFollowing.mockReturnValueOnce(loadPromise)

    const { result } = renderHook(() => useFriends('user-1'))

    // Start the load without awaiting
    act(() => { result.current.loadFollowing(true) })

    // Loading should be true immediately after calling
    expect(result.current.isLoadingFollowing).toBe(true)

    // Resolve the promise
    await act(async () => {
      resolveLoad({ users: [], hasMore: false })
    })

    expect(result.current.isLoadingFollowing).toBe(false)
  })

  it('should return early without API call when currentUserId is empty', async () => {
    const { result } = renderHook(() => useFriends(''))

    await act(async () => {
      await result.current.loadFollowing(true)
    })

    expect(mockGetFollowing).not.toHaveBeenCalled()
  })

  it('should not throw when the API call fails (error is swallowed)', async () => {
    mockGetFollowing.mockRejectedValueOnce(new Error('network error'))

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.loadFollowing(true)
    })

    // Should not throw, loading should be false, list should be empty
    expect(result.current.isLoadingFollowing).toBe(false)
    expect(result.current.following).toEqual([])
  })

  it('should call getFollowing with correct userId and offset=0 on reset', async () => {
    mockGetFollowing.mockResolvedValueOnce({ users: [], hasMore: false })

    const { result } = renderHook(() => useFriends('user-abc'))

    await act(async () => {
      await result.current.loadFollowing(true)
    })

    expect(mockGetFollowing).toHaveBeenCalledWith('user-abc', 0, 20)
  })

  it('should advance the offset on successive paginated loads', async () => {
    const page1Users = Array.from({ length: 20 }, (_, i) => makeUser({ id: `u-${i}` }))
    mockGetFollowing
      .mockResolvedValueOnce({ users: page1Users, hasMore: true })
      .mockResolvedValueOnce({ users: [], hasMore: false })

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.loadFollowing(true)
    })

    await act(async () => {
      await result.current.loadFollowing(false)
    })

    // Second call should use offset=20 (page1Users.length)
    expect(mockGetFollowing).toHaveBeenNthCalledWith(2, 'user-1', 20, 20)
  })
})

// ─────────────────────────────────────────────────────────────
// loadFollowers
// ─────────────────────────────────────────────────────────────

describe('useFriends — loadFollowers', () => {
  it('should populate followers list on reset=true', async () => {
    const users = [makeUser({ id: 'follower-1' }), makeUser({ id: 'follower-2' })]
    mockGetFollowers.mockResolvedValueOnce({ users, hasMore: false })

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.loadFollowers(true)
    })

    expect(result.current.followers).toHaveLength(2)
    expect(result.current.followers[0].id).toBe('follower-1')
  })

  it('should append to followers list when reset=false', async () => {
    mockGetFollowers
      .mockResolvedValueOnce({ users: [makeUser({ id: 'f-1' })], hasMore: true })
      .mockResolvedValueOnce({ users: [makeUser({ id: 'f-2' })], hasMore: false })

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.loadFollowers(true)
      await result.current.loadFollowers(false)
    })

    expect(result.current.followers).toHaveLength(2)
  })

  it('should replace followers on reset=true (not append)', async () => {
    mockGetFollowers
      .mockResolvedValueOnce({ users: [makeUser({ id: 'old-1' })], hasMore: false })
      .mockResolvedValueOnce({ users: [makeUser({ id: 'new-1' })], hasMore: false })

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.loadFollowers(true)
    })

    await act(async () => {
      await result.current.loadFollowers(true)
    })

    expect(result.current.followers).toHaveLength(1)
    expect(result.current.followers[0].id).toBe('new-1')
  })

  it('should set followersHasMore correctly', async () => {
    mockGetFollowers.mockResolvedValueOnce({ users: [], hasMore: true })

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.loadFollowers(true)
    })

    expect(result.current.followersHasMore).toBe(true)
  })

  it('should return early without API call when currentUserId is empty', async () => {
    const { result } = renderHook(() => useFriends(''))

    await act(async () => {
      await result.current.loadFollowers(true)
    })

    expect(mockGetFollowers).not.toHaveBeenCalled()
  })

  it('should not throw when the API call fails', async () => {
    mockGetFollowers.mockRejectedValueOnce(new Error('network error'))

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.loadFollowers(true)
    })

    expect(result.current.isLoadingFollowers).toBe(false)
    expect(result.current.followers).toEqual([])
  })

  it('should call getFollowers with correct userId', async () => {
    mockGetFollowers.mockResolvedValueOnce({ users: [], hasMore: false })

    const { result } = renderHook(() => useFriends('user-xyz'))

    await act(async () => {
      await result.current.loadFollowers(true)
    })

    expect(mockGetFollowers).toHaveBeenCalledWith('user-xyz', 0, 20)
  })
})

// ─────────────────────────────────────────────────────────────
// loadMutualFollows
// ─────────────────────────────────────────────────────────────

describe('useFriends — loadMutualFollows', () => {
  it('should populate mutualFollows list', async () => {
    const users = [makeUser({ id: 'mutual-1' }), makeUser({ id: 'mutual-2' })]
    mockGetMutualFollows.mockResolvedValueOnce(users)

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.loadMutualFollows()
    })

    expect(result.current.mutualFollows).toHaveLength(2)
    expect(result.current.mutualFollows[0].id).toBe('mutual-1')
  })

  it('should replace mutualFollows on subsequent calls', async () => {
    mockGetMutualFollows
      .mockResolvedValueOnce([makeUser({ id: 'old-mutual' })])
      .mockResolvedValueOnce([makeUser({ id: 'new-mutual' })])

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.loadMutualFollows()
    })

    await act(async () => {
      await result.current.loadMutualFollows()
    })

    expect(result.current.mutualFollows).toHaveLength(1)
    expect(result.current.mutualFollows[0].id).toBe('new-mutual')
  })

  it('should return early without API call when currentUserId is empty', async () => {
    const { result } = renderHook(() => useFriends(''))

    await act(async () => {
      await result.current.loadMutualFollows()
    })

    expect(mockGetMutualFollows).not.toHaveBeenCalled()
  })

  it('should not throw when the API call fails', async () => {
    mockGetMutualFollows.mockRejectedValueOnce(new Error('API error'))

    const { result } = renderHook(() => useFriends('user-1'))

    await act(async () => {
      await result.current.loadMutualFollows()
    })

    expect(result.current.isLoadingMutuals).toBe(false)
    expect(result.current.mutualFollows).toEqual([])
  })

  it('should call getMutualFollows with currentUserId', async () => {
    mockGetMutualFollows.mockResolvedValueOnce([])

    const { result } = renderHook(() => useFriends('user-abc'))

    await act(async () => {
      await result.current.loadMutualFollows()
    })

    expect(mockGetMutualFollows).toHaveBeenCalledWith('user-abc')
  })

  it('should set isLoadingMutuals to true during load then back to false', async () => {
    let resolveMutuals!: (users: User[]) => void
    const loadPromise = new Promise<User[]>(res => { resolveMutuals = res })
    mockGetMutualFollows.mockReturnValueOnce(loadPromise)

    const { result } = renderHook(() => useFriends('user-1'))

    act(() => { result.current.loadMutualFollows() })

    expect(result.current.isLoadingMutuals).toBe(true)

    await act(async () => {
      resolveMutuals([])
    })

    expect(result.current.isLoadingMutuals).toBe(false)
  })
})

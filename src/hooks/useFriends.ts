import { useState, useCallback, useRef } from 'react'
import { User } from '../types'
import {
  followUser,
  unfollowUser,
  isFollowing as apiIsFollowing,
  getFollowing,
  getFollowers,
  getMutualFollows,
} from '../database/supabase-api'

const PAGE_SIZE = 20

export function useFriends(currentUserId: string) {
  const [following, setFollowing] = useState<User[]>([])
  const [followers, setFollowers] = useState<User[]>([])
  const [mutualFollows, setMutualFollows] = useState<User[]>([])
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set())

  const [followingHasMore, setFollowingHasMore] = useState(false)
  const [followersHasMore, setFollowersHasMore] = useState(false)
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false)
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false)
  const [isLoadingMutuals, setIsLoadingMutuals] = useState(false)

  // Use refs for offsets so callbacks don't get recreated when offset changes
  const followingOffsetRef = useRef(0)
  const followersOffsetRef = useRef(0)

  const loadFollowing = useCallback(async (reset = false) => {
    if (!currentUserId) return
    setIsLoadingFollowing(true)
    try {
      const offset = reset ? 0 : followingOffsetRef.current
      const { users, hasMore } = await getFollowing(currentUserId, offset, PAGE_SIZE)
      if (reset) {
        setFollowing(users)
        setFollowingSet(new Set(users.map(u => u.id)))
        followingOffsetRef.current = users.length
      } else {
        setFollowing(prev => [...prev, ...users])
        setFollowingSet(prev => {
          const next = new Set(prev)
          users.forEach(u => next.add(u.id))
          return next
        })
        followingOffsetRef.current += users.length
      }
      setFollowingHasMore(hasMore)
    } catch { /* ignore */ } finally {
      setIsLoadingFollowing(false)
    }
  }, [currentUserId])

  const loadFollowers = useCallback(async (reset = false) => {
    if (!currentUserId) return
    setIsLoadingFollowers(true)
    try {
      const offset = reset ? 0 : followersOffsetRef.current
      const { users, hasMore } = await getFollowers(currentUserId, offset, PAGE_SIZE)
      if (reset) {
        setFollowers(users)
        followersOffsetRef.current = users.length
      } else {
        setFollowers(prev => [...prev, ...users])
        followersOffsetRef.current += users.length
      }
      setFollowersHasMore(hasMore)
    } catch { /* ignore */ } finally {
      setIsLoadingFollowers(false)
    }
  }, [currentUserId])

  const loadMutualFollows = useCallback(async () => {
    if (!currentUserId) return
    setIsLoadingMutuals(true)
    try {
      const mutuals = await getMutualFollows(currentUserId)
      setMutualFollows(mutuals)
    } catch { /* ignore */ } finally {
      setIsLoadingMutuals(false)
    }
  }, [currentUserId])

  const isFollowingUser = useCallback((userId: string): boolean => {
    return followingSet.has(userId)
  }, [followingSet])

  const follow = useCallback(async (userId: string): Promise<void> => {
    await followUser(currentUserId, userId)
    setFollowingSet(prev => {
      const next = new Set(prev)
      next.add(userId)
      return next
    })
  }, [currentUserId])

  const unfollow = useCallback(async (userId: string): Promise<void> => {
    await unfollowUser(currentUserId, userId)
    setFollowingSet(prev => {
      const next = new Set(prev)
      next.delete(userId)
      return next
    })
    setFollowing(prev => prev.filter(u => u.id !== userId))
    setMutualFollows(prev => prev.filter(u => u.id !== userId))
  }, [currentUserId])

  const checkIsFollowing = useCallback(async (userId: string): Promise<boolean> => {
    return apiIsFollowing(currentUserId, userId)
  }, [currentUserId])

  return {
    following,
    followers,
    mutualFollows,
    followingHasMore,
    followersHasMore,
    isLoadingFollowing,
    isLoadingFollowers,
    isLoadingMutuals,
    isFollowingUser,
    follow,
    unfollow,
    checkIsFollowing,
    loadFollowing,
    loadFollowers,
    loadMutualFollows,
  }
}

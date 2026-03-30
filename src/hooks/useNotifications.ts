import { useState, useCallback, useRef } from 'react'
import { PollNotification, Poll } from '../types'
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationsRead,
  acceptDeathmatchChallenge,
  rejectDeathmatchChallenge,
  getPendingChallengesForUser,
} from '../database/supabase-api'

const PAGE_SIZE = 20

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<PollNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [pendingChallenges, setPendingChallenges] = useState<Poll[]>([])

  // Ref for offset so the callback stays stable
  const offsetRef = useRef(0)

  const loadNotifications = useCallback(async (reset = false) => {
    if (!userId) return
    setIsLoading(true)
    setError(null)
    try {
      const offset = reset ? 0 : offsetRef.current
      const [{ notifications: items, hasMore: more }, count, challenges] = await Promise.all([
        getNotifications(userId, offset, PAGE_SIZE),
        getUnreadNotificationCount(userId),
        getPendingChallengesForUser(userId),
      ])
      if (reset) {
        setNotifications(items)
        offsetRef.current = items.length
      } else {
        setNotifications(prev => [...prev, ...items])
        offsetRef.current += items.length
      }
      setHasMore(more)
      setUnreadCount(count)
      setPendingChallenges(challenges)
    } catch (e) {
      setError(e instanceof Error ? e.message.toUpperCase() : 'FAILED TO LOAD')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const refreshUnreadCount = useCallback(async () => {
    if (!userId) return
    const count = await getUnreadNotificationCount(userId)
    setUnreadCount(count)
  }, [userId])

  const markAllRead = useCallback(async () => {
    if (!userId) return
    await markNotificationsRead(userId)
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }, [userId])

  const acceptChallenge = useCallback(async (pollId: string, creatorId: string) => {
    await acceptDeathmatchChallenge(pollId, userId, creatorId)
    setPendingChallenges(prev => prev.filter(p => p.id !== pollId))
    setNotifications(prev => prev.filter(n => n.pollId !== pollId || n.type !== 'deathmatch_created'))
  }, [userId])

  const rejectChallenge = useCallback(async (pollId: string, creatorId: string) => {
    await rejectDeathmatchChallenge(pollId, userId, creatorId)
    setPendingChallenges(prev => prev.filter(p => p.id !== pollId))
    setNotifications(prev => prev.filter(n => n.pollId !== pollId || n.type !== 'deathmatch_created'))
  }, [userId])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasMore,
    pendingChallenges,
    loadNotifications,
    refreshUnreadCount,
    markAllRead,
    acceptChallenge,
    rejectChallenge,
  }
}

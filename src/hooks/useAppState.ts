import { useState, useCallback, useEffect } from 'react'
import { Poll, User, CreatePollFormData, PollNotification, PollHistory } from '../types'
import { PollzAPI } from '../database/api'
import { initializeDatabase } from '../database/simple-db'

// Custom hook for managing app state
export function useAppState() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(0)
  const [hasMorePolls, setHasMorePolls] = useState<boolean>(true)
  const [totalPolls, setTotalPolls] = useState<number>(0)
  const [notifications, setNotifications] = useState<PollNotification[]>([])
  const [pollHistory, setPollHistory] = useState<PollHistory[]>([])
  const [user, setUser] = useState<User>({
    id: 'user-1',
    name: 'Alex Johnson',
    username: '@alexjohnson',
    email: 'alex@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    followers: 1247,
    following: 89,
    reputation: 2847,
    badges: [
      {
        id: 'badge-1',
        name: 'Master Debater',
        description: 'Won 25+ debates',
        icon: 'Crown',
        category: 'debate',
        rarity: 'legendary',
        earnedAt: new Date('2024-01-15')
      },
      {
        id: 'badge-2',
        name: 'Poll Creator',
        description: 'Created 50+ polls',
        icon: 'Plus',
        category: 'creation',
        rarity: 'epic',
        earnedAt: new Date('2024-02-01')
      }
    ],
    pollCount: 52,
    winRate: 0.73,
    joinDate: new Date('2023-12-01')
  })

  // Load initial batch of polls
  const loadPolls = useCallback(async (reset: boolean = false) => {
    if (reset) {
      setCurrentPage(0)
      setPolls([])
      setHasMorePolls(true)
    }
    
    setLoading(true)
    setError(null)
    try {
      const page = reset ? 0 : currentPage
      const batchPolls = await PollzAPI.getPollsBatch(page, 10)
      const totalCount = await PollzAPI.getTotalPollsCount()
      
      console.log(`Loading page ${page}, got ${batchPolls.length} polls, total: ${totalCount}`)
      
      setTotalPolls(totalCount)
      setPolls(batchPolls) // Always replace for sliding window
      setCurrentPage(page + 1)
      setHasMorePolls(page + 1 < Math.ceil(totalCount / 10))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load polls')
      console.error('Error loading polls:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage])

  // Load next batch of polls
  const loadMorePolls = useCallback(async () => {
    if (loadingMore || !hasMorePolls) return
    
    setLoadingMore(true)
    setError(null)
    try {
      const batchPolls = await PollzAPI.getPollsBatch(currentPage, 10)
      
      console.log(`Loading more polls, page ${currentPage}, got ${batchPolls.length} polls`)
      
      if (batchPolls.length > 0) {
        setPolls(batchPolls) // Replace current polls
        setCurrentPage(prev => prev + 1)
      }
      
      // Check if there are more polls available
      const totalCount = await PollzAPI.getTotalPollsCount()
      setHasMorePolls(currentPage + 1 < Math.ceil(totalCount / 10))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more polls')
      console.error('Error loading more polls:', err)
    } finally {
      setLoadingMore(false)
    }
  }, [currentPage, loadingMore, hasMorePolls])

  // Load user from API
  const loadUser = useCallback(async () => {
    try {
      const apiUser = await PollzAPI.getUserById('user-1')
      if (apiUser) {
        setUser(apiUser)
      }
    } catch (err) {
      console.error('Error loading user:', err)
      // Keep the default user if API fails
    }
  }, [])

  // Load user notifications
  const loadNotifications = useCallback(async () => {
    try {
      const userNotifications = await PollzAPI.getUserNotifications(user.id)
      setNotifications(userNotifications)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }, [user.id])

  // Load user poll history
  const loadPollHistory = useCallback(async () => {
    try {
      const userHistory = await PollzAPI.getUserPollHistory(user.id)
      setPollHistory(userHistory)
    } catch (error) {
      console.error('Error loading poll history:', error)
    }
  }, [user.id])

  // Update poll timers
  const updatePollTimers = useCallback(async () => {
    try {
      // Update timers for all polls
      for (const poll of polls) {
        if (poll.timerEnabled && !poll.isExpired) {
          await PollzAPI.updatePollTimer(poll.id)
        }
      }
      // Reload polls to get updated timer information
      await loadPolls(true)
    } catch (error) {
      console.error('Error updating poll timers:', error)
    }
  }, [polls, loadPolls])

  // Initialize database and data on mount
  useEffect(() => {
    const init = async () => {
      try {
        console.log('Initializing app...')
        await initializeDatabase()
        console.log('Database initialized')
        await loadPolls(true) // Reset to page 0
        console.log('Polls loaded')
        await loadUser()
        console.log('User loaded')
        await loadNotifications()
        console.log('Notifications loaded')
        await loadPollHistory()
        console.log('Poll history loaded')
      } catch (error) {
        console.error('Failed to initialize app:', error)
        setError('Failed to initialize application')
      }
    }
    
    init()
  }, [loadPolls, loadUser, loadNotifications, loadPollHistory])

  // Set up timer interval for updating poll timers
  useEffect(() => {
    const timerInterval = setInterval(() => {
      updatePollTimers()
    }, 60000) // Update every minute

    return () => clearInterval(timerInterval)
  }, [updatePollTimers])


  const handleVote = useCallback(async (pollId: string, option: 'A' | 'B') => {
    // Add visual feedback
    const pollCard = document.querySelector(`[data-poll-id="${pollId}"]`)
    if (pollCard) {
      pollCard.classList.add('success-animation')
      setTimeout(() => {
        pollCard.classList.remove('success-animation')
      }, 600)
    }

    try {
      // Call API to vote
      await PollzAPI.voteOnPoll(pollId, user.id, option)
      
      // Update local state optimistically
      setPolls(prev => prev.map(poll => 
        poll.id === pollId 
          ? { 
              ...poll, 
              votes: poll.votes + 1,
              votesOptionA: option === 'A' ? poll.votesOptionA + 1 : poll.votesOptionA,
              votesOptionB: option === 'B' ? poll.votesOptionB + 1 : poll.votesOptionB,
              isVoted: true 
            }
          : poll
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote')
      console.error('Error voting:', err)
    }
  }, [user.id])

  const handleLike = useCallback((pollId: string) => {
    // Add visual feedback
    const pollCard = document.querySelector(`[data-poll-id="${pollId}"]`)
    if (pollCard) {
      pollCard.classList.add('success-animation')
      setTimeout(() => {
        pollCard.classList.remove('success-animation')
      }, 600)
    }

    setPolls(prev => prev.map(poll => 
      poll.id === pollId 
        ? { ...poll, isLiked: !poll.isLiked }
        : poll
    ))
  }, [])

  const createPoll = useCallback(async (pollData: CreatePollFormData) => {
    try {
      setLoading(true)
      setError(null)

      // Calculate expiration time based on timer settings
      const expirationTime = pollData.timerEnabled && pollData.timerDuration 
        ? new Date(Date.now() + pollData.timerDuration * 60 * 60 * 1000) // Convert hours to milliseconds
        : new Date(Date.now() + 24 * 60 * 60 * 1000) // Default 24 hours

      const newPoll = await PollzAPI.createPoll({
        title: pollData.title,
        description: pollData.description,
        category: pollData.category,
        timeLeft: pollData.timerEnabled 
          ? `${pollData.timerDuration} hours left`
          : 'No time limit',
        authorId: user.id,
        author: user.name,
        context: pollData.context,
        arguments: {
          optionA: pollData.optionA,
          optionB: pollData.optionB
        },
        expiresAt: expirationTime,
        // Enhanced poll features
        pollType: pollData.pollType,
        timerDuration: pollData.timerDuration,
        timerEnabled: pollData.timerEnabled,
        notificationEnabled: pollData.notificationEnabled,
        isExpired: false
      })

      // Add poll history entry
      await PollzAPI.addPollHistory({
        pollId: newPoll.id,
        userId: user.id,
        action: 'created',
        pollTitle: newPoll.title,
        pollCategory: newPoll.category
      })

      // Create notification if enabled
      if (pollData.notificationEnabled) {
        await PollzAPI.createNotification({
          pollId: newPoll.id,
          userId: user.id,
          type: 'poll_created',
          message: `Your poll "${newPoll.title}" has been created!`,
          isRead: false
        })
      }

      // Add the new poll to local state
      setPolls(prev => [newPoll, ...prev])
      
      // Update user poll count
      setUser(prev => ({
        ...prev,
        pollCount: prev.pollCount + 1
      }))

      return newPoll
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create poll')
      console.error('Error creating poll:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user.id, user.name])

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      await PollzAPI.markNotificationAsRead(notificationId)
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [])

  return {
    polls,
    user,
    loading,
    loadingMore,
    error,
    currentPage,
    hasMorePolls,
    totalPolls,
    notifications,
    pollHistory,
    handleVote,
    handleLike,
    createPoll,
    loadPolls,
    loadMorePolls,
    loadNotifications,
    loadPollHistory,
    markNotificationAsRead,
    updatePollTimers,
    setPolls,
    setUser,
    setError
  }
}


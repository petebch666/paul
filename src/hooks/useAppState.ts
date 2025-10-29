import { useState, useCallback, useEffect } from 'react'
import { Poll, User, CreatePollFormData, PollNotification, PollHistory } from '../types'
import { UnifiedPollzAPI as PollzAPI, getAPIType } from '../database/unified-api'
import { initializeDatabase } from '../database/simple-db'
import { useAuth } from './useAuth'

// Log which API is being used
console.log(`🔄 useAppState using: ${getAPIType()}`)

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
  const [initialized, setInitialized] = useState<boolean>(false)
  
  // Get authenticated user from useAuth hook
  const { user: authUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)

  // Load initial batch of polls
  const loadPolls = useCallback(async (reset: boolean = false) => {
    if (!authUser) {
      console.log('⏳ Waiting for user to load before fetching polls')
      return
    }

    if (reset) {
      setCurrentPage(0)
      setPolls([])
      setHasMorePolls(true)
    }
    
    setLoading(true)
    setError(null)
    try {
      const page = reset ? 0 : currentPage
      
      // Get all polls with vote status for current user
      const allPolls = await PollzAPI.getPollsWithVoteStatus(authUser.id)
      
      // Paginate on client side
      const startIndex = page * 10
      const endIndex = startIndex + 10
      const batchPolls = allPolls.slice(startIndex, endIndex)
      
      console.log(`Loading page ${page}, got ${batchPolls.length} polls, total: ${allPolls.length}`)
      console.log(`Voted polls: ${batchPolls.filter(p => p.isVoted).length}`)
      
      setTotalPolls(allPolls.length)
      setPolls(batchPolls)
      setCurrentPage(page + 1)
      setHasMorePolls(endIndex < allPolls.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load polls')
      console.error('Error loading polls:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, authUser])

  // Load next batch of polls
  const loadMorePolls = useCallback(async () => {
    if (loadingMore || !hasMorePolls || !authUser) return
    
    setLoadingMore(true)
    setError(null)
    try {
      // Get all polls with vote status
      const allPolls = await PollzAPI.getPollsWithVoteStatus(authUser.id)
      
      // Paginate on client side
      const startIndex = currentPage * 10
      const endIndex = startIndex + 10
      const batchPolls = allPolls.slice(startIndex, endIndex)
      
      console.log(`Loading more polls, page ${currentPage}, got ${batchPolls.length} polls`)
      
      if (batchPolls.length > 0) {
        setPolls(batchPolls)
        setCurrentPage(prev => prev + 1)
      }
      
      setHasMorePolls(endIndex < allPolls.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more polls')
      console.error('Error loading more polls:', err)
    } finally {
      setLoadingMore(false)
    }
  }, [currentPage, loadingMore, hasMorePolls, authUser])

  // Load user from API (sync with auth user)
  const loadUser = useCallback(async () => {
    try {
      if (authUser) {
        console.log('📥 Loading user from API:', authUser.id, authUser.name)
        // Fetch latest user data from database
        const apiUser = await PollzAPI.getUserById(authUser.id)
        if (apiUser) {
          console.log('✅ User loaded from API:', apiUser.name)
          setUser(apiUser)
        } else {
          console.log('⚠️ User not found in DB, using auth user:', authUser.name)
          // If not found in DB, use auth user
          setUser(authUser)
        }
      } else {
        console.log('⚠️ No authUser available to load')
      }
    } catch (err) {
      console.error('❌ Error loading user:', err)
      // Use auth user if API fails
      if (authUser) {
        console.log('🔄 Using auth user as fallback:', authUser.name)
        setUser(authUser)
      }
    }
  }, [authUser])

  // Load user notifications
  const loadNotifications = useCallback(async () => {
    if (!user) return
    try {
      const userNotifications = await PollzAPI.getUserNotifications(user.id)
      setNotifications(userNotifications)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }, [user])

  // Load user poll history
  const loadPollHistory = useCallback(async () => {
    if (!user) return
    try {
      const userHistory = await PollzAPI.getUserPollHistory(user.id)
      setPollHistory(userHistory)
    } catch (error) {
      console.error('Error loading poll history:', error)
    }
  }, [user])

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

  // Initialize database and data when authUser is available
  useEffect(() => {
    if (initialized) {
      console.log('⏭️ App already initialized, skipping')
      return
    }

    if (!authUser) {
      console.log('⏳ Waiting for authUser before initialization...')
      return
    }

    const init = async () => {
      try {
        console.log('🚀 Initializing app...')
        console.log('📍 Auth user available:', !!authUser, authUser?.name)
        
        await initializeDatabase()
        console.log('✅ Database initialized')
        
        await loadUser()
        console.log('✅ User load called')
        
        await loadPolls(true) // Reset to page 0
        console.log('✅ Polls loaded')
        
        await loadNotifications()
        console.log('✅ Notifications loaded')
        
        await loadPollHistory()
        console.log('✅ Poll history loaded')
        
        setInitialized(true)
        console.log('✅ App initialization complete')
      } catch (error) {
        console.error('❌ Failed to initialize app:', error)
        setError('Failed to initialize application')
      }
    }
    
    init()
  }, [authUser, initialized]) // Wait for authUser

  // Sync user when authUser changes (after initial load)
  useEffect(() => {
    if (initialized && authUser && !user) {
      console.log('🔄 Syncing user after auth change...')
      loadUser()
    }
  }, [authUser, initialized, user, loadUser])

  // Set up timer interval for updating poll timers
  useEffect(() => {
    const timerInterval = setInterval(() => {
      updatePollTimers()
    }, 60000) // Update every minute

    return () => clearInterval(timerInterval)
  }, [updatePollTimers])


  const handleVote = useCallback(async (pollId: string, option: 'A' | 'B') => {
    if (!user) {
      console.error('Cannot vote: No user logged in')
      return
    }
    
    // Check if user already voted (double-check before voting)
    const hasVoted = await PollzAPI.hasUserVoted(pollId, user.id)
    if (hasVoted) {
      console.error('User already voted on this poll')
      setError('You have already voted on this poll')
      
      // Update local state to reflect voted status
      setPolls(prev => prev.map(poll => 
        poll.id === pollId ? { ...poll, isVoted: true } : poll
      ))
      return
    }
    
    // Clear any previous errors
    setError(null)
    
    // Add visual feedback
    const pollCard = document.querySelector(`[data-poll-id="${pollId}"]`)
    if (pollCard) {
      pollCard.classList.add('success-animation')
      setTimeout(() => {
        pollCard.classList.remove('success-animation')
      }, 600)
    }

    try {
      // First call API to persist the vote
      await PollzAPI.voteOnPoll(pollId, user.id, option)
      
      // Then update local state
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
      
      console.log('✅ Vote recorded successfully for poll:', pollId)
    } catch (err) {
      console.error('❌ Error voting on poll:', err)
      setError(err instanceof Error ? err.message : 'Failed to vote')
      
      // Reload polls to get correct state
      await loadPolls(true)
    }
  }, [user, loadPolls])

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
    if (!user) {
      throw new Error('User not authenticated')
    }
    
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
        authorUsername: user.username, // Include username
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
        isExpired: false,
        // Deathmatch features
        isDeathmatch: pollData.isDeathmatch || false,
        isShadowDeathmatch: pollData.isShadowDeathmatch || false,
        optionAUserId: pollData.optionAUserId,
        optionBUserId: pollData.optionBUserId
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
      setUser(prev => prev ? ({
        ...prev,
        pollCount: prev.pollCount + 1
      }) : prev)

      return newPoll
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create poll')
      console.error('Error creating poll:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user])

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


import { useState, useCallback, useEffect } from 'react'
import { Poll, User, CreatePollFormData } from '../types'
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
      } catch (error) {
        console.error('Failed to initialize app:', error)
        setError('Failed to initialize application')
      }
    }
    
    init()
  }, [loadPolls, loadUser])


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
      const result = await PollzAPI.voteOnPoll(pollId, user.id, option)
      
      if (result.success) {
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
      } else {
        setError(result.message)
      }
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

      const newPoll = await PollzAPI.createPoll({
        title: pollData.title,
        description: pollData.description,
        category: pollData.category,
        timeLeft: `${pollData.timeLimit} hours left`,
        authorId: user.id,
        author: user.name,
        context: pollData.context,
        arguments: {
          optionA: pollData.optionA,
          optionB: pollData.optionB
        },
        expiresAt: new Date(Date.now() + pollData.timeLimit * 60 * 60 * 1000)
      })

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

  return {
    polls,
    user,
    loading,
    loadingMore,
    error,
    currentPage,
    hasMorePolls,
    totalPolls,
    handleVote,
    handleLike,
    createPoll,
    loadPolls,
    loadMorePolls,
    setPolls,
    setUser,
    setError
  }
}


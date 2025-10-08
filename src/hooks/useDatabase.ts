import { useState, useEffect } from 'react'
import { PollzAPI } from '../database/api'
import { Poll, User } from '../database/db'

// Custom hook for database operations
export function useDatabase() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize database when hook is first used
    const initDB = async () => {
      try {
        setLoading(true)
        // Database initialization happens automatically
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Database initialization failed')
        setLoading(false)
      }
    }

    initDB()
  }, [])

  return { loading, error }
}

// Hook for polls
export function usePolls() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true)
        const fetchedPolls = await PollzAPI.getAllPolls()
        setPolls(fetchedPolls)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch polls')
      } finally {
        setLoading(false)
      }
    }

    fetchPolls()
  }, [])

  const createPoll = async (pollData: {
    title: string
    description: string
    category: string
    timeLeft: string
    authorId: string
    author: string
    context?: string
    arguments?: {
      optionA: string
      optionB: string
    }
    expiresAt: Date
  }) => {
    try {
      const newPoll = await PollzAPI.createPoll(pollData)
      setPolls(prev => [newPoll, ...prev])
      return newPoll
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create poll')
      throw err
    }
  }

  const voteOnPoll = async (pollId: string, userId: string, option: 'A' | 'B') => {
    try {
      const result = await PollzAPI.voteOnPoll(pollId, userId, option)
      if (result.success) {
        // Refresh polls to get updated vote counts
        const updatedPolls = await PollzAPI.getAllPolls()
        setPolls(updatedPolls)
      }
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote')
      throw err
    }
  }

  return {
    polls,
    loading,
    error,
    createPoll,
    voteOnPoll,
    refetch: () => {
      setLoading(true)
      PollzAPI.getAllPolls()
        .then(setPolls)
        .catch(err => setError(err instanceof Error ? err.message : 'Failed to fetch polls'))
        .finally(() => setLoading(false))
    }
  }
}

// Hook for trending polls
export function useTrendingPolls() {
  const [trendingPolls, setTrendingPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrendingPolls = async () => {
      try {
        setLoading(true)
        const fetchedPolls = await PollzAPI.getTrendingPolls()
        setTrendingPolls(fetchedPolls)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trending polls')
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingPolls()
  }, [])

  const updateTrending = async () => {
    try {
      await PollzAPI.updateTrendingPolls()
      const updatedPolls = await PollzAPI.getTrendingPolls()
      setTrendingPolls(updatedPolls)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update trending polls')
    }
  }

  return {
    trendingPolls,
    loading,
    error,
    updateTrending,
    refetch: () => {
      setLoading(true)
      PollzAPI.getTrendingPolls()
        .then(setTrendingPolls)
        .catch(err => setError(err instanceof Error ? err.message : 'Failed to fetch trending polls'))
        .finally(() => setLoading(false))
    }
  }
}

// Hook for users
export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchUser = async () => {
      try {
        setLoading(true)
        const fetchedUser = await PollzAPI.getUserById(userId)
        setUser(fetchedUser)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  return { user, loading, error }
}

// Hook for search
export function useSearch() {
  const [results, setResults] = useState<Poll[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    try {
      setLoading(true)
      const searchResults = await PollzAPI.searchPolls(query)
      setResults(searchResults)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return { results, loading, error, search }
}

// Hook for category suggestions
export function useCategorySuggestions() {
  const [suggestions, setSuggestions] = useState<Array<{
    category: string
    confidence: number
    keywords: string[]
  }>>([])
  const [loading, setLoading] = useState(false)

  const getSuggestions = async (question: string) => {
    if (!question.trim() || question.length < 10) {
      setSuggestions([])
      return
    }

    try {
      setLoading(true)
      const categorySuggestions = await PollzAPI.getCategorySuggestions(question)
      setSuggestions(categorySuggestions)
    } catch (err) {
      console.error('Failed to get category suggestions:', err)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  return { suggestions, loading, getSuggestions }
}

// Hook for duplicate checking
export function useDuplicateCheck() {
  const [duplicates, setDuplicates] = useState<{
    hasDuplicates: boolean
    similarPolls: Array<{
      id: string
      title: string
      similarity: number
      author: string
    }>
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const checkDuplicates = async (question: string, optionA: string, optionB: string) => {
    try {
      setLoading(true)
      const duplicateResult = await PollzAPI.checkForDuplicates(question, optionA, optionB)
      setDuplicates(duplicateResult)
    } catch (err) {
      console.error('Failed to check duplicates:', err)
      setDuplicates(null)
    } finally {
      setLoading(false)
    }
  }

  return { duplicates, loading, checkDuplicates }
}


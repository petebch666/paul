import { useState, useCallback, useRef } from 'react'
import { Poll, CreatePollFormData } from '../types'
import { getPollsWithVoteStatus, castVote, createPoll } from '../database/supabase-api'

const PAGE_SIZE = 200

interface PollsState {
  polls: Poll[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  hasMore: boolean
}

export function usePolls(userId: string) {
  const [state, setState] = useState<PollsState>({
    polls: [],
    isLoading: true,
    isLoadingMore: false,
    error: null,
    hasMore: true,
  })

  const loadingRef = useRef(false)
  const loadingMoreRef = useRef(false)
  const offsetRef = useRef(0)
  const hasMoreRef = useRef(true)

  const loadPolls = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    setState(s => ({ ...s, isLoading: true, error: null }))
    try {
      const { polls, hasMore } = await getPollsWithVoteStatus(userId, 0, PAGE_SIZE)
      offsetRef.current = polls.length
      hasMoreRef.current = hasMore
      setState({ polls, isLoading: false, isLoadingMore: false, error: null, hasMore })
    } catch (e) {
      const msg = e instanceof Error ? e.message.toUpperCase() : 'FAILED TO LOAD POLLS'
      setState(s => ({ ...s, isLoading: false, error: msg }))
    } finally {
      loadingRef.current = false
    }
  }, [userId])

  const loadMore = useCallback(async () => {
    if (!hasMoreRef.current || loadingRef.current || loadingMoreRef.current) return
    loadingMoreRef.current = true
    setState(s => ({ ...s, isLoadingMore: true }))
    try {
      const { polls: newPolls, hasMore } = await getPollsWithVoteStatus(userId, offsetRef.current, PAGE_SIZE)
      offsetRef.current += newPolls.length
      hasMoreRef.current = hasMore
      setState(s => ({
        ...s,
        polls: [...s.polls, ...newPolls],
        isLoadingMore: false,
        hasMore,
      }))
    } catch {
      setState(s => ({ ...s, isLoadingMore: false }))
    } finally {
      loadingMoreRef.current = false
    }
  }, [userId])

  const vote = useCallback(async (pollId: string, option: 'A' | 'B') => {
    try {
      await castVote(pollId, userId, option)
      setState(s => ({
        ...s,
        polls: s.polls.map(p => {
          if (p.id !== pollId) return p
          const updatedA = option === 'A' ? p.votesOptionA + 1 : p.votesOptionA
          const updatedB = option === 'B' ? p.votesOptionB + 1 : p.votesOptionB
          return {
            ...p,
            isVoted: true,
            votedOption: option,
            votesOptionA: updatedA,
            votesOptionB: updatedB,
            votes: updatedA + updatedB,
          }
        }),
      }))
    } catch (e) {
      throw new Error('VOTE FAILED')
    }
  }, [userId])

  const submitPoll = useCallback(async (form: CreatePollFormData, user: { id: string; name: string; username: string }) => {
    const poll = await createPoll({
      title: form.title,
      optionA: form.optionA,
      optionB: form.optionB,
      category: form.category,
      authorId: user.id,
      authorName: user.name,
      authorUsername: user.username,
      timerEnabled: form.timerEnabled,
      timerDuration: form.timerDuration,
      isDeathmatch: form.isDeathmatch,
      optionAOwnerId: form.optionAUserId,
      optionBOwnerId: form.optionBUserId,
      isConfession: form.isConfession,
    })

    setState(s => ({ ...s, polls: [poll, ...s.polls] }))
    return poll
  }, [])

  const removePollFromList = useCallback((pollId: string) => {
    setState(s => ({ ...s, polls: s.polls.filter(p => p.id !== pollId) }))
  }, [])

  return {
    polls: state.polls,
    isLoading: state.isLoading,
    isLoadingMore: state.isLoadingMore,
    error: state.error,
    hasMore: state.hasMore,
    loadPolls,
    loadMore,
    vote,
    submitPoll,
    removePollFromList,
  }
}

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../database/supabase'

interface LiveVoteState {
  votes: number
  votesOptionA: number
  votesOptionB: number
  lastVoteOption: 'A' | 'B' | null
  isAnimating: boolean
}

/**
 * Hook to subscribe to live vote updates for a poll via Supabase Realtime.
 * Shows animated vote count changes when other users vote.
 */
export function useLiveVotes(pollId: string, initialVotes: number, initialA: number, initialB: number): LiveVoteState {
  const [state, setState] = useState<LiveVoteState>({
    votes: initialVotes,
    votesOptionA: initialA,
    votesOptionB: initialB,
    lastVoteOption: null,
    isAnimating: false
  })
  const animationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync with prop changes (e.g. when poll data is refreshed)
  useEffect(() => {
    setState(prev => ({
      ...prev,
      votes: initialVotes,
      votesOptionA: initialA,
      votesOptionB: initialB
    }))
  }, [initialVotes, initialA, initialB])

  useEffect(() => {
    // Subscribe to INSERT events on the votes table for this poll
    const channel = supabase
      .channel(`votes:${pollId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
          filter: `poll_id=eq.${pollId}`
        },
        (payload) => {
          const option = payload.new.option as 'A' | 'B'

          setState(prev => ({
            votes: prev.votes + 1,
            votesOptionA: option === 'A' ? prev.votesOptionA + 1 : prev.votesOptionA,
            votesOptionB: option === 'B' ? prev.votesOptionB + 1 : prev.votesOptionB,
            lastVoteOption: option,
            isAnimating: true
          }))

          // Clear animation after 600ms
          if (animationTimeout.current) {
            clearTimeout(animationTimeout.current)
          }
          animationTimeout.current = setTimeout(() => {
            setState(prev => ({ ...prev, isAnimating: false, lastVoteOption: null }))
          }, 600)
        }
      )
      .subscribe()

    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current)
      }
      supabase.removeChannel(channel)
    }
  }, [pollId])

  return state
}

export default useLiveVotes

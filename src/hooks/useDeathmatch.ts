import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../database/supabase'
import { getDeathmatchDetails, completeDeathmatch, castVote } from '../database/supabase-api'
import { Poll, User } from '../types'

interface UseDeathmatchResult {
  poll: Poll | null
  playerA: User | null
  playerB: User | null
  percentA: number
  percentB: number
  timeLeft: number
  isExpired: boolean
  hasVoted: boolean
  userVote: 'A' | 'B' | null
  isLoading: boolean
  error: string | null
  vote: (option: 'A' | 'B') => Promise<void>
}

export function useDeathmatch(pollId: string, userId: string): UseDeathmatchResult {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [playerA, setPlayerA] = useState<User | null>(null)
  const [playerB, setPlayerB] = useState<User | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [userVote, setUserVote] = useState<'A' | 'B' | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isExpired, setIsExpired] = useState(false)
  const isCompletingRef = useRef(false)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const { poll: p, playerA: pA, playerB: pB } = await getDeathmatchDetails(pollId)
      setPoll(p)
      setPlayerA(pA)
      setPlayerB(pB)

      const remaining = Math.max(0, Math.floor((p.expiresAt.getTime() - Date.now()) / 1000))
      setTimeLeft(remaining)
      setIsExpired(remaining === 0 || p.isExpired)

      // Check if current user already voted
      const { data: voteRow } = await supabase
        .from('votes')
        .select('option')
        .eq('poll_id', pollId)
        .eq('user_id', userId)
        .maybeSingle()

      if (voteRow) {
        setHasVoted(true)
        setUserVote((voteRow as Record<string, unknown>).option as 'A' | 'B')
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [pollId, userId])

  // Initial load
  useEffect(() => {
    load()
  }, [load])

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`deathmatch:${pollId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'polls', filter: `id=eq.${pollId}` },
        payload => {
          const row = payload.new as Record<string, unknown>
          setPoll(prev => {
            if (!prev) return prev
            const votesA = Number(row.votes_option_a ?? prev.votesOptionA)
            const votesB = Number(row.votes_option_b ?? prev.votesOptionB)
            return {
              ...prev,
              votesOptionA: votesA,
              votesOptionB: votesB,
              votes: votesA + votesB,
            }
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [pollId])

  // Countdown timer
  useEffect(() => {
    if (isExpired) return
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const next = Math.max(0, prev - 1)
        if (next === 0) setIsExpired(true)
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isExpired])

  // Trigger completeDeathmatch on expiry
  useEffect(() => {
    if (!isExpired || !poll || isCompletingRef.current) return
    if (poll.deathmatchStatus === 'completed') return

    isCompletingRef.current = true

    const votesA = poll.votesOptionA
    const votesB = poll.votesOptionB

    let winnerId: string | null = null
    let loserId: string | null = null

    if (votesA > votesB) {
      winnerId = poll.optionAOwnerId || null
      loserId = poll.optionBOwnerId || null
    } else if (votesB > votesA) {
      winnerId = poll.optionBOwnerId || null
      loserId = poll.optionAOwnerId || null
    }
    // draw: both null

    completeDeathmatch(poll.id, winnerId, loserId).catch(() => {
      isCompletingRef.current = false
    })
  }, [isExpired, poll])

  const vote = useCallback(async (option: 'A' | 'B') => {
    if (hasVoted || !poll) return
    setHasVoted(true)
    setUserVote(option)
    try {
      await castVote(poll.id, userId, option)
    } catch {
      setHasVoted(false)
      setUserVote(null)
    }
  }, [hasVoted, poll, userId])

  const total = (poll?.votesOptionA || 0) + (poll?.votesOptionB || 0)
  const percentA = total > 0 ? ((poll?.votesOptionA || 0) / total) * 100 : 50
  const percentB = total > 0 ? ((poll?.votesOptionB || 0) / total) * 100 : 50

  return {
    poll,
    playerA,
    playerB,
    percentA,
    percentB,
    timeLeft,
    isExpired,
    hasVoted,
    userVote,
    isLoading,
    error,
    vote,
  }
}

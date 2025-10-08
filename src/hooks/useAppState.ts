import { useState, useCallback } from 'react'
import { Poll, User, Page, CreatePollFormData } from '../types'

// Custom hook for managing app state
export function useAppState() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [polls, setPolls] = useState<Poll[]>([])
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

  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page)
  }, [])

  const handleVote = useCallback((pollId: string, option: 'A' | 'B') => {
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
        ? { 
            ...poll, 
            votes: poll.votes + 1,
            votesOptionA: option === 'A' ? poll.votesOptionA + 1 : poll.votesOptionA,
            votesOptionB: option === 'B' ? poll.votesOptionB + 1 : poll.votesOptionB,
            isVoted: true 
          }
        : poll
    ))
  }, [])

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

  const createPoll = useCallback((pollData: CreatePollFormData) => {
    const newPoll: Poll = {
      id: `poll-${Date.now()}`,
      title: pollData.title,
      description: pollData.description,
      votes: 0,
      votesOptionA: 0,
      votesOptionB: 0,
      category: pollData.category,
      timeLeft: `${pollData.timeLimit} hours left`,
      authorId: user.id,
      author: user.name,
      isVoted: false,
      isLiked: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + pollData.timeLimit * 60 * 60 * 1000),
      context: pollData.context,
      arguments: {
        optionA: pollData.optionA,
        optionB: pollData.optionB
      },
      evidence: {
        optionA: [],
        optionB: []
      },
      comments: [],
      trendingScore: Math.random() * 100
    }

    setPolls(prev => [newPoll, ...prev])
    
    // Update user poll count
    setUser(prev => ({
      ...prev,
      pollCount: prev.pollCount + 1
    }))
  }, [user.id, user.name])

  return {
    currentPage,
    polls,
    user,
    navigateTo,
    handleVote,
    handleLike,
    createPoll,
    setPolls,
    setUser
  }
}


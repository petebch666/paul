// Main type definitions for the Pollz app
export interface Poll {
  id: string
  title: string
  description: string
  votes: number
  votesOptionA: number
  votesOptionB: number
  category: string
  timeLeft: string
  author: string
  authorId?: string
  isVoted: boolean
  isLiked: boolean
  createdAt?: Date
  expiresAt?: Date
  // Enhanced Debate Features
  context?: string
  arguments?: {
    optionA: string
    optionB: string
  }
  evidence?: {
    optionA: Evidence[]
    optionB: Evidence[]
  }
  comments: Comment[]
  debateHistory?: {
    creatorWins: number
    opponentWins: number
    totalDebates: number
  }
  // Smart Features
  trendingScore?: number
}

export interface Evidence {
  id: string
  type: 'link' | 'image' | 'text'
  content: string
  title: string
  submittedBy: string
  submittedAt: Date
}

export interface Comment {
  id: string
  pollId: string
  userId: string
  username: string
  avatar: string
  content: string
  timestamp: Date
  likes: number
  isLiked: boolean
}

export interface User {
  id: string
  name: string
  username: string
  email?: string
  avatar: string
  password?: string
  followers: number
  following: number
  reputation: number
  badges: Badge[]
  pollCount: number
  winRate: number
  joinDate: Date
  isFollowing?: boolean
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  earnedAt: Date
}

export interface ReputationEvent {
  id: string
  userId: string
  type: 'poll_created' | 'poll_won' | 'evidence_submitted' | 'comment_liked'
  points: number
  description: string
  timestamp: Date
}

export interface CategorySuggestion {
  category: string
  confidence: number
  keywords: string[]
}

export interface PollSuggestion {
  pollId: string
  reason: string
  confidence: number
}

export interface DuplicateCheck {
  hasDuplicates: boolean
  similarPolls: Array<{
    id: string
    title: string
    similarity: number
    author: string
  }>
}

export interface TrendingScore {
  score: number
  factors: {
    recentVotes: number
    voteVelocity: number
    categoryBoost: number
    engagementRate: number
  }
}

export interface Vote {
  id: string
  pollId: string
  userId: string
  option: 'A' | 'B'
  timestamp: Date
}

// Navigation types
export type Page = 'home' | 'create' | 'profile' | 'trending'

// Component props types
export interface PollCardProps {
  poll: Poll
  onVote: (pollId: string, option: 'A' | 'B') => void
  onLike: (pollId: string) => void
  currentUser: User
}

export interface NavigationProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

export interface CreatePollFormData {
  title: string
  description: string
  category: string
  optionA: string
  optionB: string
  timeLimit: number
  context?: string
}


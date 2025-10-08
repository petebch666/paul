import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import path from 'path'

// Database schema interfaces
export interface User {
  id: string
  name: string
  username: string
  email: string
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

export interface Poll {
  id: string
  title: string
  description: string
  votes: number
  votesOptionA: number
  votesOptionB: number
  category: string
  timeLeft: string
  authorId: string
  author: string
  isVoted: boolean
  isLiked: boolean
  createdAt: Date
  expiresAt: Date
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

export interface Vote {
  id: string
  pollId: string
  userId: string
  option: 'A' | 'B'
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

// Database schema
export interface DatabaseSchema {
  users: User[]
  polls: Poll[]
  votes: Vote[]
  categories: string[]
  trendingPolls: Poll[]
  pollSuggestions: PollSuggestion[]
  duplicateChecks: DuplicateCheck[]
}

// Database file path
const file = path.join(process.cwd(), 'data', 'db.json')

// Initialize database
const adapter = new JSONFile<DatabaseSchema>(file)
const defaultData: DatabaseSchema = {
  users: [],
  polls: [],
  votes: [],
  categories: ['Food', 'Animals', 'Lifestyle', 'Technology', 'Social', 'Work', 'Entertainment', 'Sports'],
  trendingPolls: [],
  pollSuggestions: [],
  duplicateChecks: []
}

export const db = new Low(adapter, defaultData)

// Initialize database
export async function initializeDatabase() {
  try {
    await db.read()
    
    // If database is empty, populate with initial data
    if (db.data.users.length === 0) {
      await populateInitialData()
    }
    
    console.log('✅ Database initialized successfully')
    return db.data
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

// Populate database with initial data
async function populateInitialData() {
  const initialUsers: User[] = [
    {
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
    },
    {
      id: 'user-2',
      name: 'Sarah Chen',
      username: '@sarahchen',
      email: 'sarah@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      followers: 892,
      following: 234,
      reputation: 1956,
      badges: [
        {
          id: 'badge-5',
          name: 'Evidence Master',
          description: 'Submitted 30+ pieces of evidence',
          icon: 'Target',
          category: 'debate',
          rarity: 'rare',
          earnedAt: new Date('2024-01-20')
        }
      ],
      pollCount: 23,
      winRate: 0.68,
      joinDate: new Date('2024-01-01'),
      isFollowing: false
    }
  ]

  const initialPolls: Poll[] = [
    {
      id: 'poll-1',
      title: 'Pineapple on Pizza: Crime or Genius?',
      description: 'The eternal debate that divides families and destroys friendships',
      votes: 1247,
      votesOptionA: 534,
      votesOptionB: 713,
      category: 'Food',
      timeLeft: '2 days left',
      authorId: 'user-2',
      author: 'PizzaMaster',
      isVoted: false,
      isLiked: true,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      context: 'My Italian grandmother is rolling in her grave, but I need to know the truth!',
      arguments: {
        optionA: 'Pineapple adds the perfect sweet contrast to salty toppings',
        optionB: 'Fruit has no place on pizza - it\'s basically a crime against Italy'
      },
      evidence: {
        optionA: [
          {
            id: '1',
            type: 'text',
            title: 'Hawaiian Pizza Facts',
            content: 'Hawaiian pizza was invented in Canada by a Greek immigrant in 1962',
            submittedBy: 'PizzaMaster',
            submittedAt: new Date()
          }
        ],
        optionB: [
          {
            id: '2',
            type: 'text',
            title: 'Italian Pizza Purists',
            content: 'Real Italians would rather eat their nonna\'s cooking than pineapple pizza',
            submittedBy: 'PizzaPurist',
            submittedAt: new Date()
          }
        ]
      },
      comments: [
        {
          id: '1',
          pollId: 'poll-1',
          userId: 'user-1',
          username: 'ChefMario',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
          content: 'As an Italian, I\'m offended this is even a question! 🇮🇹',
          timestamp: new Date(),
          likes: 12,
          isLiked: true
        }
      ],
      debateHistory: {
        creatorWins: 8,
        opponentWins: 3,
        totalDebates: 11
      },
      trendingScore: 95.2
    },
    {
      id: 'poll-2',
      title: 'Cats vs Dogs: Who Rules the Internet?',
      description: 'Which furry overlord deserves the crown of viral supremacy?',
      votes: 892,
      votesOptionA: 445,
      votesOptionB: 447,
      category: 'Animals',
      timeLeft: '5 hours left',
      authorId: 'user-1',
      author: 'PetInfluencer',
      isVoted: true,
      isLiked: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 60 * 1000),
      context: 'My cat just knocked over my coffee again while my dog watched with judgmental eyes',
      arguments: {
        optionA: 'Cats are mysterious, elegant, and perfect meme material',
        optionB: 'Dogs are loyal, goofy, and always ready for adventure'
      },
      evidence: {
        optionA: [],
        optionB: []
      },
      comments: [],
      debateHistory: {
        creatorWins: 5,
        opponentWins: 2,
        totalDebates: 7
      },
      trendingScore: 87.4
    },
    {
      id: 'poll-3',
      title: 'Socks: One Big or Two Small?',
      description: 'The most controversial question in laundry history',
      votes: 2156,
      votesOptionA: 892,
      votesOptionB: 1264,
      category: 'Lifestyle',
      timeLeft: '1 week left',
      authorId: 'user-2',
      author: 'LaundryGuru',
      isVoted: false,
      isLiked: true,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      context: 'I\'m tired of losing socks in the dryer. Time to settle this scientifically!',
      arguments: {
        optionA: 'One big sock for both feet - efficiency and warmth combined',
        optionB: 'Two small socks - tradition and individual toe freedom'
      },
      evidence: {
        optionA: [
          {
            id: '3',
            type: 'text',
            title: 'Sock Efficiency Study',
            content: 'Studies show 47% less sock loss with the one-big-sock method',
            submittedBy: 'LaundryGuru',
            submittedAt: new Date()
          }
        ],
        optionB: [
          {
            id: '4',
            type: 'text',
            title: 'Traditional Sock Wisdom',
            content: 'Your ancestors wore two socks for a reason - don\'t break tradition!',
            submittedBy: 'SockTraditionalist',
            submittedAt: new Date()
          }
        ]
      },
      comments: [
        {
          id: '2',
          pollId: 'poll-3',
          userId: 'user-1',
          username: 'SockCollector',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
          content: 'I have 47 single socks. This debate is personal!',
          timestamp: new Date(),
          likes: 8,
          isLiked: false
        }
      ],
      debateHistory: {
        creatorWins: 12,
        opponentWins: 7,
        totalDebates: 19
      },
      trendingScore: 92.8
    }
  ]

  // Set initial data
  db.data.users = initialUsers
  db.data.polls = initialPolls
  db.data.trendingPolls = [...initialPolls].sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0))

  // Save to file
  await db.write()
  console.log('📊 Initial data populated successfully')
}

// Database helper functions
export class DatabaseService {
  // User operations
  static async getUserById(id: string): Promise<User | undefined> {
    await db.read()
    return db.data.users.find(user => user.id === id)
  }

  static async getUserByEmail(email: string): Promise<User | undefined> {
    await db.read()
    return db.data.users.find(user => user.email === email)
  }

  static async createUser(user: Omit<User, 'id'>): Promise<User> {
    await db.read()
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`
    }
    db.data.users.push(newUser)
    await db.write()
    return newUser
  }

  // Poll operations
  static async getAllPolls(): Promise<Poll[]> {
    await db.read()
    return db.data.polls
  }

  static async getPollById(id: string): Promise<Poll | undefined> {
    await db.read()
    return db.data.polls.find(poll => poll.id === id)
  }

  static async createPoll(poll: Omit<Poll, 'id' | 'createdAt' | 'votes' | 'votesOptionA' | 'votesOptionB'>): Promise<Poll> {
    await db.read()
    const newPoll: Poll = {
      ...poll,
      id: `poll-${Date.now()}`,
      createdAt: new Date(),
      votes: 0,
      votesOptionA: 0,
      votesOptionB: 0
    }
    db.data.polls.push(newPoll)
    await db.write()
    return newPoll
  }

  static async voteOnPoll(pollId: string, userId: string, option: 'A' | 'B'): Promise<void> {
    await db.read()
    const poll = db.data.polls.find(p => p.id === pollId)
    if (!poll) throw new Error('Poll not found')

    // Check if user already voted
    const existingVote = db.data.votes.find(v => v.pollId === pollId && v.userId === userId)
    if (existingVote) throw new Error('User already voted on this poll')

    // Add vote
    const vote: Vote = {
      id: `vote-${Date.now()}`,
      pollId,
      userId,
      option,
      timestamp: new Date()
    }
    db.data.votes.push(vote)

    // Update poll counts
    poll.votes += 1
    if (option === 'A') {
      poll.votesOptionA += 1
    } else {
      poll.votesOptionB += 1
    }

    await db.write()
  }

  // Trending operations
  static async getTrendingPolls(): Promise<Poll[]> {
    await db.read()
    return db.data.trendingPolls
  }

  static async updateTrendingPolls(): Promise<void> {
    await db.read()
    // Sort polls by trending score and take top 10
    db.data.trendingPolls = [...db.data.polls]
      .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0))
      .slice(0, 10)
    await db.write()
  }
}

export default db


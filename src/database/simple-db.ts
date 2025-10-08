// Simple browser storage implementation for Pollz
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
  trendingScore?: number
  // Enhanced poll features
  pollType: 'question' | 'options-only'
  timerDuration?: number
  timerEnabled: boolean
  notificationEnabled: boolean
  isExpired: boolean
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

export interface PollNotification {
  id: string
  pollId: string
  userId: string
  type: 'poll_expired' | 'poll_created' | 'poll_trending'
  message: string
  isRead: boolean
  createdAt: Date
}

export interface PollHistory {
  id: string
  pollId: string
  userId: string
  action: 'created' | 'voted' | 'liked' | 'shared'
  timestamp: Date
  pollTitle: string
  pollCategory: string
}

export interface DatabaseSchema {
  users: User[]
  polls: Poll[]
  votes: Vote[]
  categories: string[]
  trendingPolls: Poll[]
  notifications: PollNotification[]
  pollHistory: PollHistory[]
}

class SimpleDatabase {
  private key = 'paul-db'
  private data: DatabaseSchema | null = null

  async read(): Promise<DatabaseSchema> {
    if (this.data) return this.data

    try {
      const stored = localStorage.getItem(this.key)
      if (stored) {
        this.data = JSON.parse(stored)
        // Convert date strings back to Date objects
        if (this.data) {
          this.data.users.forEach(user => {
            user.joinDate = new Date(user.joinDate)
            user.badges.forEach(badge => {
              badge.earnedAt = new Date(badge.earnedAt)
            })
          })
          this.data.polls.forEach(poll => {
            poll.createdAt = new Date(poll.createdAt)
            poll.expiresAt = new Date(poll.expiresAt)
            poll.comments.forEach(comment => {
              comment.timestamp = new Date(comment.timestamp)
            })
          })
          this.data.votes.forEach(vote => {
            vote.timestamp = new Date(vote.timestamp)
          })
        }
      }
    } catch (error) {
      console.error('Failed to read from localStorage:', error)
    }

    if (!this.data) {
      this.data = await this.getDefaultData()
    }

    return this.data
  }

  async write(): Promise<void> {
    if (!this.data) return

    try {
      localStorage.setItem(this.key, JSON.stringify(this.data))
    } catch (error) {
      console.error('Failed to write to localStorage:', error)
    }
  }

  private async getDefaultData(): Promise<DatabaseSchema> {
    const initialUsers: User[] = [
      {
        id: 'admin-1',
        name: 'Admin',
        username: '@admin',
        email: 'admin@pollz.app',
        // Password: Admin@123 (hashed with bcrypt)
        password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        role: 'admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=ff0000&color=ffffff&size=150',
        followers: 0,
        following: 0,
        reputation: 0,
        badges: [
          {
            id: 'badge-admin',
            name: 'Administrator',
            description: 'System Administrator',
            icon: 'Shield',
            category: 'admin',
            rarity: 'legendary',
            earnedAt: new Date()
          }
        ],
        pollCount: 0,
        winRate: 0,
        joinDate: new Date()
      },
      {
        id: 'user-1',
        name: 'Alex Johnson',
        username: '@alexjohnson',
        email: 'alex@example.com',
        role: 'user',
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
        trendingScore: 95.2,
        // Enhanced poll features
        pollType: 'question',
        timerDuration: 48,
        timerEnabled: true,
        notificationEnabled: true,
        isExpired: false
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
        trendingScore: 87.4,
        // Enhanced poll features
        pollType: 'question',
        timerDuration: 5,
        timerEnabled: true,
        notificationEnabled: true,
        isExpired: false
      }
    ]

    return {
      users: initialUsers,
      polls: initialPolls,
      votes: [],
      categories: ['Food', 'Animals', 'Lifestyle', 'Technology', 'Social', 'Work', 'Entertainment', 'Sports'],
      trendingPolls: [...initialPolls].sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0)),
      notifications: [],
      pollHistory: []
    }
  }

  // User operations
  async getUserById(id: string): Promise<User | undefined> {
    const data = await this.read()
    return data.users.find(user => user.id === id)
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const data = await this.read()
    return data.users.find(user => user.email === email)
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const data = await this.read()
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`
    }
    data.users.push(newUser)
    await this.write()
    return newUser
  }

  // Poll operations
  async getAllPolls(): Promise<Poll[]> {
    const data = await this.read()
    return data.polls
  }

  async getPollsBatch(page: number = 0, limit: number = 10): Promise<Poll[]> {
    const data = await this.read()
    const startIndex = page * limit
    const endIndex = startIndex + limit
    return data.polls.slice(startIndex, endIndex)
  }

  async getTotalPollsCount(): Promise<number> {
    const data = await this.read()
    return data.polls.length
  }

  async getPollById(id: string): Promise<Poll | undefined> {
    const data = await this.read()
    return data.polls.find(poll => poll.id === id)
  }

  async createPoll(poll: Omit<Poll, 'id' | 'createdAt' | 'votes' | 'votesOptionA' | 'votesOptionB'>): Promise<Poll> {
    const data = await this.read()
    const newPoll: Poll = {
      ...poll,
      id: `poll-${Date.now()}`,
      createdAt: new Date(),
      votes: 0,
      votesOptionA: 0,
      votesOptionB: 0
    }
    data.polls.push(newPoll)
    await this.write()
    return newPoll
  }

  async voteOnPoll(pollId: string, userId: string, option: 'A' | 'B'): Promise<void> {
    const data = await this.read()
    console.log('Voting on poll:', pollId, 'Total polls:', data.polls.length)
    console.log('Poll IDs:', data.polls.map(p => p.id))
    const poll = data.polls.find(p => p.id === pollId)
    if (!poll) {
      console.error('Poll not found! Looking for:', pollId, 'Available polls:', data.polls.map(p => p.id))
      throw new Error('Poll not found')
    }

    // Check if user already voted
    const existingVote = data.votes.find(v => v.pollId === pollId && v.userId === userId)
    if (existingVote) throw new Error('User already voted on this poll')

    // Add vote
    const vote: Vote = {
      id: `vote-${Date.now()}`,
      pollId,
      userId,
      option,
      timestamp: new Date()
    }
    data.votes.push(vote)

    // Update poll counts
    poll.votes += 1
    if (option === 'A') {
      poll.votesOptionA += 1
    } else {
      poll.votesOptionB += 1
    }

    await this.write()
  }

  // Trending operations
  async getTrendingPolls(): Promise<Poll[]> {
    const data = await this.read()
    return data.trendingPolls
  }

  async updateTrendingPolls(): Promise<void> {
    const data = await this.read()
    // Sort polls by trending score and take top 10
    data.trendingPolls = [...data.polls]
      .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0))
      .slice(0, 10)
    await this.write()
  }

  // Notification operations
  async createNotification(notification: Omit<PollNotification, 'id' | 'createdAt'>): Promise<PollNotification> {
    const data = await this.read()
    const newNotification: PollNotification = {
      ...notification,
      id: `notification-${Date.now()}`,
      createdAt: new Date()
    }
    data.notifications.push(newNotification)
    await this.write()
    return newNotification
  }

  async getUserNotifications(userId: string): Promise<PollNotification[]> {
    const data = await this.read()
    return data.notifications.filter(n => n.userId === userId)
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const data = await this.read()
    const notification = data.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.isRead = true
      await this.write()
    }
  }

  // Poll history operations
  async addPollHistory(history: Omit<PollHistory, 'id' | 'timestamp'>): Promise<PollHistory> {
    const data = await this.read()
    const newHistory: PollHistory = {
      ...history,
      id: `history-${Date.now()}`,
      timestamp: new Date()
    }
    data.pollHistory.push(newHistory)
    await this.write()
    return newHistory
  }

  async getUserPollHistory(userId: string): Promise<PollHistory[]> {
    const data = await this.read()
    return data.pollHistory.filter(h => h.userId === userId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Timer operations
  async updatePollTimer(pollId: string): Promise<void> {
    const data = await this.read()
    const poll = data.polls.find(p => p.id === pollId)
    if (!poll) return

    const now = new Date()
    const expiresAt = new Date(poll.expiresAt)
    
    if (now >= expiresAt && !poll.isExpired) {
      poll.isExpired = true
      poll.timeLeft = 'Expired'
      
      // Create notification for poll expiration
      await this.createNotification({
        pollId: poll.id,
        userId: poll.authorId,
        type: 'poll_expired',
        message: `Your poll "${poll.title}" has expired!`,
        isRead: false
      })
      
      await this.write()
    } else if (now < expiresAt) {
      const timeLeft = expiresAt.getTime() - now.getTime()
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
      
      if (days > 0) {
        poll.timeLeft = `${days} day${days > 1 ? 's' : ''} left`
      } else if (hours > 0) {
        poll.timeLeft = `${hours} hour${hours > 1 ? 's' : ''} left`
      } else {
        poll.timeLeft = `${minutes} minute${minutes > 1 ? 's' : ''} left`
      }
      
      await this.write()
    }
  }
}

export const db = new SimpleDatabase()

// Initialize database
export async function initializeDatabase() {
  try {
    await db.read()
    await db.updateTrendingPolls()
    console.log('✅ Database initialized successfully')
    return true
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    return false
  }
}

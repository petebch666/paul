// Simple browser storage implementation for Pollz
import { generate50Polls } from '../utils/generate-polls'

export interface User {
  id: string
  name: string
  username: string
  email: string
  avatar: string
  password?: string
  role?: 'user' | 'admin'
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
    // Only create admin user - no more dummy data!
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
      }
    ]

    // No more auto-generated polls! Start with empty database
    const initialPolls: Poll[] = []

    return {
      users: initialUsers,
      polls: initialPolls,
      votes: [],
      categories: ['Food', 'Animals', 'Lifestyle', 'Technology', 'Social', 'Work', 'Entertainment', 'Sports'],
      trendingPolls: [],
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
    console.log('Voting on poll:', pollId, 'User:', userId)
    const poll = data.polls.find(p => p.id === pollId)
    if (!poll) {
      console.error('Poll not found! Looking for:', pollId)
      throw new Error('Poll not found')
    }

    // Check if user already voted
    const existingVote = data.votes.find(v => v.pollId === pollId && v.userId === userId)
    if (existingVote) {
      console.error('User already voted on this poll:', { pollId, userId, existingVote })
      throw new Error('User already voted on this poll')
    }

    // Add vote
    const vote: Vote = {
      id: `vote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
    console.log('✅ Vote recorded successfully')
  }

  // Check if user has voted on a poll
  async hasUserVoted(pollId: string, userId: string): Promise<boolean> {
    const data = await this.read()
    return data.votes.some(v => v.pollId === pollId && v.userId === userId)
  }

  // Get polls with user vote status
  async getPollsWithVoteStatus(userId: string): Promise<Poll[]> {
    const data = await this.read()
    
    // Mark polls as voted if user has voted on them
    return data.polls.map(poll => ({
      ...poll,
      isVoted: data.votes.some(v => v.pollId === poll.id && v.userId === userId)
    }))
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

  // Development: Reset all polls and user statistics
  async resetPollsForDevelopment(): Promise<void> {
    const data = await this.read()
    
    // Reset all polls to initial state
    data.polls.forEach(poll => {
      poll.votes = 0
      poll.votesOptionA = 0
      poll.votesOptionB = 0
      poll.isVoted = false
      poll.isExpired = false
      poll.createdAt = new Date()
      
      // Set new expiration date (7 days from now)
      const newExpiresAt = new Date()
      newExpiresAt.setDate(newExpiresAt.getDate() + 7)
      poll.expiresAt = newExpiresAt
      poll.timeLeft = '7 days left'
      
      // Reset debate history if exists
      if (poll.debateHistory) {
        poll.debateHistory.creatorWins = 0
        poll.debateHistory.opponentWins = 0
        poll.debateHistory.totalDebates = 0
      }
      
      // Clear evidence and comments
      if (poll.evidence) {
        poll.evidence.optionA = []
        poll.evidence.optionB = []
      }
      poll.comments = []
    })
    
    // Clear all votes
    data.votes = []
    
    // Reset user statistics (except pollCount)
    data.users.forEach(user => {
      user.winRate = 0
      user.reputation = 0
      // Keep admin badge but remove other badges for non-admin users
      if (user.role !== 'admin') {
        user.badges = []
      }
    })
    
    // Clear poll history and notifications
    data.pollHistory = []
    data.notifications = []
    
    await this.write()
    console.log('✅ Development reset completed: All polls reset to initial state')
  }

  // Development: Generate 50 additional polls
  async generate50AdditionalPolls(): Promise<void> {
    const data = await this.read()
    
    // Get Admin user and other users
    const adminUser = data.users.find(u => u.role === 'admin')
    const otherUsers = data.users.filter(u => u.role !== 'admin' && u.id !== 'admin-1')
    
    if (!adminUser) {
      console.error('Admin user not found!')
      return
    }

    const pollTemplates = [
      { title: 'Coffee or Tea in the morning?', desc: 'The ultimate morning beverage debate', optionA: 'Coffee', optionB: 'Tea', category: 'Food' },
      { title: 'Work from home or office?', desc: 'Where do you get more done?', optionA: 'Home', optionB: 'Office', category: 'Work' },
      { title: 'iPhone or Android?', desc: 'The eternal smartphone debate', optionA: 'iPhone', optionB: 'Android', category: 'Technology' },
      { title: 'Summer or Winter?', desc: 'Which season is superior?', optionA: 'Summer', optionB: 'Winter', category: 'Lifestyle' },
      { title: 'Books or Movies?', desc: 'Best way to experience a story', optionA: 'Books', optionB: 'Movies', category: 'Entertainment' },
      { title: 'Early bird or night owl?', desc: 'When are you most productive?', optionA: 'Early bird', optionB: 'Night owl', category: 'Lifestyle' },
      { title: 'Beach or Mountains?', desc: 'Perfect vacation destination', optionA: 'Beach', optionB: 'Mountains', category: 'Lifestyle' },
      { title: 'Pizza or Burger?', desc: 'Fast food showdown', optionA: 'Pizza', optionB: 'Burger', category: 'Food' },
      { title: 'Marvel or DC?', desc: 'Superhero universe supremacy', optionA: 'Marvel', optionB: 'DC', category: 'Entertainment' },
      { title: 'Spotify or Apple Music?', desc: 'Music streaming service battle', optionA: 'Spotify', optionB: 'Apple Music', category: 'Technology' },
      { title: 'Chocolate or Vanilla?', desc: 'Classic ice cream flavors', optionA: 'Chocolate', optionB: 'Vanilla', category: 'Food' },
      { title: 'Shower at night or morning?', desc: 'Best time to shower', optionA: 'Night', optionB: 'Morning', category: 'Lifestyle' },
      { title: 'Text or Call?', desc: 'Preferred communication method', optionA: 'Text', optionB: 'Call', category: 'Social' },
      { title: 'Windows or Mac?', desc: 'Operating system preference', optionA: 'Windows', optionB: 'Mac', category: 'Technology' },
      { title: 'Cake or Pie?', desc: 'Dessert debate', optionA: 'Cake', optionB: 'Pie', category: 'Food' },
      { title: 'Football or Basketball?', desc: 'Which sport is more exciting?', optionA: 'Football', optionB: 'Basketball', category: 'Sports' },
      { title: 'Email or Slack?', desc: 'Better workplace communication', optionA: 'Email', optionB: 'Slack', category: 'Work' },
      { title: 'Save money or travel?', desc: 'Financial priorities', optionA: 'Save', optionB: 'Travel', category: 'Lifestyle' },
      { title: 'Gaming console or PC?', desc: 'Ultimate gaming platform', optionA: 'Console', optionB: 'PC', category: 'Entertainment' },
      { title: 'Hot dog: sandwich or not?', desc: 'The philosophical question', optionA: 'Sandwich', optionB: 'Not sandwich', category: 'Food' },
      { title: 'City life or countryside?', desc: 'Where would you rather live?', optionA: 'City', optionB: 'Countryside', category: 'Lifestyle' },
      { title: 'Online shopping or in-store?', desc: 'Shopping preference', optionA: 'Online', optionB: 'In-store', category: 'Social' },
      { title: 'Comedy or Drama shows?', desc: 'What do you binge?', optionA: 'Comedy', optionB: 'Drama', category: 'Entertainment' },
      { title: 'Pancakes or Waffles?', desc: 'Breakfast battle', optionA: 'Pancakes', optionB: 'Waffles', category: 'Food' },
      { title: 'Work hard or work smart?', desc: 'Path to success', optionA: 'Work hard', optionB: 'Work smart', category: 'Work' },
      { title: 'Manual or Automatic car?', desc: 'Driving preference', optionA: 'Manual', optionB: 'Automatic', category: 'Lifestyle' },
      { title: 'Cats or Dogs as pets?', desc: 'Best companion animal', optionA: 'Cats', optionB: 'Dogs', category: 'Animals' },
      { title: 'Netflix or YouTube?', desc: 'Streaming platform preference', optionA: 'Netflix', optionB: 'YouTube', category: 'Entertainment' },
      { title: 'Pasta or Rice?', desc: 'Carb of choice', optionA: 'Pasta', optionB: 'Rice', category: 'Food' },
      { title: 'Gym or Home workout?', desc: 'Exercise preference', optionA: 'Gym', optionB: 'Home', category: 'Lifestyle' },
      { title: 'Fiction or Non-fiction books?', desc: 'Reading preference', optionA: 'Fiction', optionB: 'Non-fiction', category: 'Entertainment' },
      { title: 'Salty or Sweet snacks?', desc: 'Snacking preference', optionA: 'Salty', optionB: 'Sweet', category: 'Food' },
      { title: 'Morning person or not?', desc: 'Natural rhythm', optionA: 'Yes', optionB: 'No', category: 'Lifestyle' },
      { title: 'Paper books or E-books?', desc: 'Reading format', optionA: 'Paper', optionB: 'E-books', category: 'Technology' },
      { title: 'Solo travel or group travel?', desc: 'Travel style', optionA: 'Solo', optionB: 'Group', category: 'Lifestyle' },
      { title: 'Ketchup or Mustard?', desc: 'Condiment choice', optionA: 'Ketchup', optionB: 'Mustard', category: 'Food' },
      { title: 'Loud music or quiet ambience?', desc: 'Working environment', optionA: 'Loud music', optionB: 'Quiet', category: 'Work' },
      { title: 'Video call or phone call?', desc: 'Remote communication', optionA: 'Video', optionB: 'Phone', category: 'Social' },
      { title: 'Breakfast or Dinner?', desc: 'Most important meal', optionA: 'Breakfast', optionB: 'Dinner', category: 'Food' },
      { title: 'Reading or Writing?', desc: 'Creative preference', optionA: 'Reading', optionB: 'Writing', category: 'Entertainment' },
      { title: 'Plan ahead or go with flow?', desc: 'Life philosophy', optionA: 'Plan', optionB: 'Go with flow', category: 'Lifestyle' },
      { title: 'Desktop or Laptop?', desc: 'Computer preference', optionA: 'Desktop', optionB: 'Laptop', category: 'Technology' },
      { title: 'Comedy or Horror movies?', desc: 'Movie genre', optionA: 'Comedy', optionB: 'Horror', category: 'Entertainment' },
      { title: 'Salad or Soup?', desc: 'Healthy meal choice', optionA: 'Salad', optionB: 'Soup', category: 'Food' },
      { title: 'Freelance or Full-time job?', desc: 'Work style preference', optionA: 'Freelance', optionB: 'Full-time', category: 'Work' },
      { title: 'Public transport or own car?', desc: 'Transportation method', optionA: 'Public', optionB: 'Own car', category: 'Lifestyle' },
      { title: 'Action or Strategy games?', desc: 'Gaming preference', optionA: 'Action', optionB: 'Strategy', category: 'Entertainment' },
      { title: 'Texting emojis or words only?', desc: 'Texting style', optionA: 'Emojis', optionB: 'Words only', category: 'Social' },
      { title: 'Instagram or TikTok?', desc: 'Social media preference', optionA: 'Instagram', optionB: 'TikTok', category: 'Social' },
      { title: 'Minimalist or Maximalist lifestyle?', desc: 'Living philosophy', optionA: 'Minimalist', optionB: 'Maximalist', category: 'Lifestyle' }
    ]

    const newPolls: Poll[] = []
    
    // Create 25 polls for Admin
    for (let i = 0; i < 25; i++) {
      const template = pollTemplates[i]
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + Math.floor(Math.random() * 7) + 1) // 1-7 days
      
      const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      
      const votes = Math.floor(Math.random() * 500)
      const votesOptionA = Math.floor(votes * (0.3 + Math.random() * 0.4))
      const votesOptionB = votes - votesOptionA
      
      const poll: Poll = {
        id: `poll-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
        title: template.title,
        description: template.desc,
        votes,
        votesOptionA,
        votesOptionB,
        category: template.category,
        timeLeft: `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`,
        authorId: adminUser.id,
        author: adminUser.name,
        isVoted: false,
        isLiked: false,
        createdAt: new Date(),
        expiresAt: expiresAt,
        context: `Let's settle this debate once and for all!`,
        arguments: {
          optionA: `${template.optionA} is clearly superior for obvious reasons`,
          optionB: `${template.optionB} is the better choice without question`
        },
        evidence: {
          optionA: [],
          optionB: []
        },
        comments: [],
        trendingScore: Math.random() * 100,
        pollType: 'question',
        timerEnabled: true,
        notificationEnabled: false,
        isExpired: false,
        debateHistory: {
          creatorWins: 0,
          opponentWins: 0,
          totalDebates: 0
        }
      }
      
      newPolls.push(poll)
    }
    
    // Create 25 polls for other users
    for (let i = 25; i < 50; i++) {
      const template = pollTemplates[i]
      const randomUser = otherUsers.length > 0 
        ? otherUsers[Math.floor(Math.random() * otherUsers.length)]
        : adminUser
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + Math.floor(Math.random() * 7) + 1) // 1-7 days
      
      const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      
      const votes = Math.floor(Math.random() * 300)
      const votesOptionA = Math.floor(votes * (0.3 + Math.random() * 0.4))
      const votesOptionB = votes - votesOptionA
      
      const poll: Poll = {
        id: `poll-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
        title: template.title,
        description: template.desc,
        votes,
        votesOptionA,
        votesOptionB,
        category: template.category,
        timeLeft: `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`,
        authorId: randomUser.id,
        author: randomUser.name,
        isVoted: false,
        isLiked: false,
        createdAt: new Date(),
        expiresAt: expiresAt,
        context: `I need your opinion on this!`,
        arguments: {
          optionA: `${template.optionA} for the win`,
          optionB: `${template.optionB} all the way`
        },
        evidence: {
          optionA: [],
          optionB: []
        },
        comments: [],
        trendingScore: Math.random() * 80,
        pollType: 'question',
        timerEnabled: true,
        notificationEnabled: false,
        isExpired: false,
        debateHistory: {
          creatorWins: 0,
          opponentWins: 0,
          totalDebates: 0
        }
      }
      
      newPolls.push(poll)
    }
    
    // Add all new polls to database
    data.polls.push(...newPolls)
    
    // Update user poll counts
    const adminPollCount = data.polls.filter(p => p.authorId === adminUser.id).length
    adminUser.pollCount = adminPollCount
    
    otherUsers.forEach(user => {
      const userPollCount = data.polls.filter(p => p.authorId === user.id).length
      user.pollCount = userPollCount
    })
    
    await this.write()
    
    // Count polls by author
    const pollsByAuthor: { [key: string]: number } = {}
    data.polls.forEach(poll => {
      pollsByAuthor[poll.author] = (pollsByAuthor[poll.author] || 0) + 1
    })
    
    console.log(`✅ Generated 50 additional polls:`)
    console.log(`   • 25 NEW polls for ${adminUser.name} (Admin)`)
    console.log(`   • 25 NEW polls distributed among other users`)
    console.log(`   • Total polls in database: ${data.polls.length}`)
    console.log(`\n📊 Polls by Author:`)
    Object.entries(pollsByAuthor).forEach(([author, count]) => {
      console.log(`   • ${author}: ${count} polls`)
    })
    console.log(`\n🔢 Poll Status:`)
    console.log(`   • Active (Last/Trending): ${data.polls.filter(p => !p.isExpired).length}`)
    console.log(`   • Expired: ${data.polls.filter(p => p.isExpired).length}`)
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

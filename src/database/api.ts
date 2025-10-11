import { db, Poll, User, Vote, PollNotification, PollHistory } from './simple-db'

// API service for database operations
export class PollzAPI {
  // Poll operations
  static async getAllPolls(): Promise<Poll[]> {
    try {
      return await db.getAllPolls()
    } catch (error) {
      console.error('Error fetching polls:', error)
      throw new Error('Failed to fetch polls')
    }
  }

  // Get polls with user vote status
  static async getPollsWithVoteStatus(userId: string): Promise<Poll[]> {
    try {
      return await db.getPollsWithVoteStatus(userId)
    } catch (error) {
      console.error('Error fetching polls with vote status:', error)
      throw new Error('Failed to fetch polls with vote status')
    }
  }

  // Check if user has voted
  static async hasUserVoted(pollId: string, userId: string): Promise<boolean> {
    try {
      return await db.hasUserVoted(pollId, userId)
    } catch (error) {
      console.error('Error checking user vote:', error)
      return false
    }
  }

  static async getPollsBatch(page: number = 0, limit: number = 10): Promise<Poll[]> {
    try {
      return await db.getPollsBatch(page, limit)
    } catch (error) {
      console.error('Error fetching polls batch:', error)
      throw new Error('Failed to fetch polls batch')
    }
  }

  static async getTotalPollsCount(): Promise<number> {
    try {
      return await db.getTotalPollsCount()
    } catch (error) {
      console.error('Error getting polls count:', error)
      throw new Error('Failed to get polls count')
    }
  }

  static async getPollById(id: string): Promise<Poll | undefined> {
    try {
      const poll = await db.getPollById(id)
      return poll
    } catch (error) {
      console.error('Error fetching poll:', error)
      throw new Error('Failed to fetch poll')
    }
  }

  static async createPoll(pollData: {
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
  }): Promise<Poll> {
    try {
      return await db.createPoll({
        ...pollData,
        isVoted: false,
        isLiked: false,
        evidence: {
          optionA: [],
          optionB: []
        },
        comments: [],
        trendingScore: 0
      })
    } catch (error) {
      console.error('Error creating poll:', error)
      throw new Error('Failed to create poll')
    }
  }

  static async voteOnPoll(pollId: string, userId: string, option: 'A' | 'B'): Promise<void> {
    try {
      await db.voteOnPoll(pollId, userId, option)
    } catch (error) {
      console.error('Error voting on poll:', error)
      throw error
    }
  }

  // User operations
  static async getUserById(id: string): Promise<User | undefined> {
    try {
      const user = await db.getUserById(id)
      return user
    } catch (error) {
      console.error('Error fetching user:', error)
      throw new Error('Failed to fetch user')
    }
  }

  static async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await db.getUserByEmail(email)
      return user
    } catch (error) {
      console.error('Error fetching user by email:', error)
      throw new Error('Failed to fetch user')
    }
  }

  static async createUser(userData: {
    name: string
    username: string
    email: string
    avatar: string
    password?: string
  }): Promise<User> {
    try {
      return await db.createUser({
        ...userData,
        followers: 0,
        following: 0,
        reputation: 0,
        badges: [],
        pollCount: 0,
        winRate: 0,
        joinDate: new Date()
      })
    } catch (error) {
      console.error('Error creating user:', error)
      throw new Error('Failed to create user')
    }
  }

  // Trending operations
  static async getTrendingPolls(): Promise<Poll[]> {
    try {
      return await db.getTrendingPolls()
    } catch (error) {
      console.error('Error fetching trending polls:', error)
      throw new Error('Failed to fetch trending polls')
    }
  }

  static async updateTrendingPolls(): Promise<void> {
    try {
      await db.updateTrendingPolls()
    } catch (error) {
      console.error('Error updating trending polls:', error)
      throw new Error('Failed to update trending polls')
    }
  }

  // Analytics operations
  static async getPollAnalytics(pollId: string): Promise<{
    totalVotes: number
    optionAVotes: number
    optionBVotes: number
    optionAPercentage: number
    optionBPercentage: number
    recentVotes: number
    trendingScore: number
  } | null> {
    try {
      const poll = await db.getPollById(pollId)
      if (!poll) return null

      const optionAPercentage = poll.votes > 0 ? Math.round((poll.votesOptionA / poll.votes) * 100) : 0
      const optionBPercentage = poll.votes > 0 ? Math.round((poll.votesOptionB / poll.votes) * 100) : 0

      return {
        totalVotes: poll.votes,
        optionAVotes: poll.votesOptionA,
        optionBVotes: poll.votesOptionB,
        optionAPercentage,
        optionBPercentage,
        recentVotes: poll.votes, // This could be calculated based on time
        trendingScore: poll.trendingScore || 0
      }
    } catch (error) {
      console.error('Error fetching poll analytics:', error)
      throw new Error('Failed to fetch poll analytics')
    }
  }

  // Search operations
  static async searchPolls(query: string): Promise<Poll[]> {
    try {
      const polls = await db.getAllPolls()
      const searchTerm = query.toLowerCase()
      
      return polls.filter(poll => 
        poll.title.toLowerCase().includes(searchTerm) ||
        poll.description.toLowerCase().includes(searchTerm) ||
        poll.category.toLowerCase().includes(searchTerm) ||
        poll.author.toLowerCase().includes(searchTerm)
      )
    } catch (error) {
      console.error('Error searching polls:', error)
      throw new Error('Failed to search polls')
    }
  }

  static async getPollsByCategory(category: string): Promise<Poll[]> {
    try {
      const polls = await db.getAllPolls()
      return polls.filter(poll => poll.category.toLowerCase() === category.toLowerCase())
    } catch (error) {
      console.error('Error fetching polls by category:', error)
      throw new Error('Failed to fetch polls by category')
    }
  }

  static async getUserPolls(userId: string): Promise<Poll[]> {
    try {
      const polls = await db.getAllPolls()
      return polls.filter(poll => poll.authorId === userId)
    } catch (error) {
      console.error('Error fetching user polls:', error)
      throw new Error('Failed to fetch user polls')
    }
  }

  // Smart features
  static async getCategorySuggestions(question: string): Promise<Array<{
    category: string
    confidence: number
    keywords: string[]
  }>> {
    // This would integrate with your existing autoCategorize function
    const categories = ['Food', 'Animals', 'Lifestyle', 'Technology', 'Social', 'Work', 'Entertainment', 'Sports']
    const suggestions = []

    for (const category of categories) {
      const keywords = this.getCategoryKeywords(category)
      const matches = keywords.filter(keyword => 
        question.toLowerCase().includes(keyword.toLowerCase())
      ).length
      
      if (matches > 0) {
        suggestions.push({
          category,
          confidence: Math.min(matches / keywords.length * 100, 100),
          keywords: keywords.slice(0, 3)
        })
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5)
  }

  private static getCategoryKeywords(category: string): string[] {
    const keywordMap: { [key: string]: string[] } = {
      'Food': ['food', 'eat', 'taste', 'cook', 'recipe', 'restaurant', 'meal', 'hungry', 'delicious', 'pizza', 'burger', 'pasta', 'sushi'],
      'Animals': ['cat', 'dog', 'pet', 'animal', 'cute', 'furry', 'wildlife', 'zoo', 'farm', 'bird', 'fish'],
      'Lifestyle': ['lifestyle', 'habit', 'routine', 'health', 'fitness', 'sleep', 'work', 'life', 'daily', 'shower', 'socks'],
      'Technology': ['tech', 'computer', 'phone', 'app', 'software', 'internet', 'digital', 'online', 'programming', 'code'],
      'Social': ['social', 'friend', 'relationship', 'community', 'people', 'meet', 'party', 'network', 'connection'],
      'Work': ['work', 'job', 'career', 'office', 'remote', 'business', 'professional', 'employee', 'boss'],
      'Entertainment': ['movie', 'music', 'game', 'fun', 'entertainment', 'show', 'book', 'art', 'culture'],
      'Sports': ['sport', 'game', 'team', 'player', 'match', 'football', 'basketball', 'soccer', 'tennis']
    }
    
    return keywordMap[category] || []
  }

  static async checkForDuplicates(question: string, optionA: string, optionB: string): Promise<{
    hasDuplicates: boolean
    similarPolls: Array<{
      id: string
      title: string
      similarity: number
      author: string
    }>
  }> {
    try {
      const polls = await db.getAllPolls()
      const similarPolls = []

      for (const poll of polls) {
        const similarity = this.calculateSimilarity(question, poll.title)
        if (similarity > 0.3) { // 30% similarity threshold
          similarPolls.push({
            id: poll.id,
            title: poll.title,
            similarity: Math.round(similarity * 100),
            author: poll.author
          })
        }
      }

      return {
        hasDuplicates: similarPolls.length > 0,
        similarPolls: similarPolls.sort((a, b) => b.similarity - a.similarity).slice(0, 5)
      }
    } catch (error) {
      console.error('Error checking for duplicates:', error)
      throw new Error('Failed to check for duplicates')
    }
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.toLowerCase().split(' ')
    const words2 = str2.toLowerCase().split(' ')
    const intersection = words1.filter(word => words2.includes(word))
    const union = [...new Set([...words1, ...words2])]
    return intersection.length / union.length
  }

  // Notification methods
  static async createNotification(notification: Omit<PollNotification, 'id' | 'createdAt'>): Promise<PollNotification> {
    try {
      return await db.createNotification(notification)
    } catch (error) {
      console.error('Error creating notification:', error)
      throw new Error('Failed to create notification')
    }
  }

  static async getUserNotifications(userId: string): Promise<PollNotification[]> {
    try {
      return await db.getUserNotifications(userId)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      throw new Error('Failed to fetch notifications')
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      return await db.markNotificationAsRead(notificationId)
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw new Error('Failed to mark notification as read')
    }
  }

  // Poll history methods
  static async addPollHistory(history: Omit<PollHistory, 'id' | 'timestamp'>): Promise<PollHistory> {
    try {
      return await db.addPollHistory(history)
    } catch (error) {
      console.error('Error adding poll history:', error)
      throw new Error('Failed to add poll history')
    }
  }

  static async getUserPollHistory(userId: string): Promise<PollHistory[]> {
    try {
      return await db.getUserPollHistory(userId)
    } catch (error) {
      console.error('Error fetching poll history:', error)
      throw new Error('Failed to fetch poll history')
    }
  }

  // Timer methods
  static async updatePollTimer(pollId: string): Promise<void> {
    try {
      return await db.updatePollTimer(pollId)
    } catch (error) {
      console.error('Error updating poll timer:', error)
      throw new Error('Failed to update poll timer')
    }
  }

  // Development: Reset polls and statistics
  static async resetPollsForDevelopment(): Promise<void> {
    try {
      await db.resetPollsForDevelopment()
    } catch (error) {
      console.error('Error resetting polls:', error)
      throw new Error('Failed to reset polls')
    }
  }

  // Development: Generate 50 additional polls
  static async generate50AdditionalPolls(): Promise<void> {
    try {
      await db.generate50AdditionalPolls()
    } catch (error) {
      console.error('Error generating additional polls:', error)
      throw new Error('Failed to generate additional polls')
    }
  }
}

export default PollzAPI


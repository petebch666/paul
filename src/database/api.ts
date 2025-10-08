import { DatabaseService, Poll, User, Vote } from './db'

// API service for database operations
export class PollzAPI {
  // Poll operations
  static async getAllPolls(): Promise<Poll[]> {
    try {
      return await DatabaseService.getAllPolls()
    } catch (error) {
      console.error('Error fetching polls:', error)
      throw new Error('Failed to fetch polls')
    }
  }

  static async getPollById(id: string): Promise<Poll | null> {
    try {
      const poll = await DatabaseService.getPollById(id)
      return poll || null
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
      return await DatabaseService.createPoll({
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

  static async voteOnPoll(pollId: string, userId: string, option: 'A' | 'B'): Promise<{ success: boolean; message: string }> {
    try {
      await DatabaseService.voteOnPoll(pollId, userId, option)
      return { success: true, message: 'Vote recorded successfully' }
    } catch (error) {
      console.error('Error voting on poll:', error)
      return { success: false, message: error instanceof Error ? error.message : 'Failed to vote' }
    }
  }

  // User operations
  static async getUserById(id: string): Promise<User | null> {
    try {
      const user = await DatabaseService.getUserById(id)
      return user || null
    } catch (error) {
      console.error('Error fetching user:', error)
      throw new Error('Failed to fetch user')
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await DatabaseService.getUserByEmail(email)
      return user || null
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
      return await DatabaseService.createUser({
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
      return await DatabaseService.getTrendingPolls()
    } catch (error) {
      console.error('Error fetching trending polls:', error)
      throw new Error('Failed to fetch trending polls')
    }
  }

  static async updateTrendingPolls(): Promise<void> {
    try {
      await DatabaseService.updateTrendingPolls()
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
      const poll = await DatabaseService.getPollById(pollId)
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
      const polls = await DatabaseService.getAllPolls()
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
      const polls = await DatabaseService.getAllPolls()
      return polls.filter(poll => poll.category.toLowerCase() === category.toLowerCase())
    } catch (error) {
      console.error('Error fetching polls by category:', error)
      throw new Error('Failed to fetch polls by category')
    }
  }

  static async getUserPolls(userId: string): Promise<Poll[]> {
    try {
      const polls = await DatabaseService.getAllPolls()
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
      const polls = await DatabaseService.getAllPolls()
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
}

export default PollzAPI


import { supabase, isSupabaseConfigured } from './supabase'
import { Poll, User, Vote, PollNotification, PollHistory } from '../types'

/**
 * Supabase API Layer for Pollz
 * This replaces localStorage with Supabase database
 */
export class SupabasePollzAPI {
  // ============================================
  // POLL OPERATIONS
  // ============================================

  static async getAllPolls(): Promise<Poll[]> {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(this.transformPollFromDB)
    } catch (error) {
      console.error('Error fetching polls:', error)
      throw new Error('Failed to fetch polls')
    }
  }

  static async getPollsWithVoteStatus(userId: string): Promise<Poll[]> {
    try {
      // Get all polls
      const { data: polls, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false })

      if (pollsError) throw pollsError

      // Get user's votes
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('poll_id')
        .eq('user_id', userId)

      if (votesError) throw votesError

      const votedPollIds = new Set(votes?.map(v => v.poll_id) || [])

      return (polls || []).map(poll => ({
        ...this.transformPollFromDB(poll),
        isVoted: votedPollIds.has(poll.id)
      }))
    } catch (error) {
      console.error('Error fetching polls with vote status:', error)
      throw new Error('Failed to fetch polls with vote status')
    }
  }

  static async hasUserVoted(pollId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows found
      return !!data
    } catch (error) {
      console.error('Error checking user vote:', error)
      return false
    }
  }

  static async getPollsBatch(page: number = 0, limit: number = 10): Promise<Poll[]> {
    try {
      const startIndex = page * limit

      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false })
        .range(startIndex, startIndex + limit - 1)

      if (error) throw error

      return (data || []).map(this.transformPollFromDB)
    } catch (error) {
      console.error('Error fetching polls batch:', error)
      throw new Error('Failed to fetch polls batch')
    }
  }

  static async getTotalPollsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('polls')
        .select('*', { count: 'exact', head: true })

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error getting polls count:', error)
      throw new Error('Failed to get polls count')
    }
  }

  static async getPollById(id: string): Promise<Poll | undefined> {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return undefined
        throw error
      }

      return this.transformPollFromDB(data)
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
      const { data, error } = await supabase
        .from('polls')
        .insert({
          title: pollData.title,
          description: pollData.description,
          category: pollData.category,
          author_id: pollData.authorId,
          author_name: pollData.author,
          option_a: pollData.arguments?.optionA || 'Option A',
          option_b: pollData.arguments?.optionB || 'Option B',
          context: pollData.context,
          expires_at: pollData.expiresAt,
          votes: 0,
          votes_option_a: 0,
          votes_option_b: 0,
          is_expired: false,
          trending_score: 0,
          poll_type: 'question',
          timer_enabled: true,
          notification_enabled: false
        })
        .select()
        .single()

      if (error) throw error

      return this.transformPollFromDB(data)
    } catch (error) {
      console.error('Error creating poll:', error)
      throw new Error('Failed to create poll')
    }
  }

  static async voteOnPoll(pollId: string, userId: string, option: 'A' | 'B'): Promise<void> {
    try {
      // Check if already voted
      const hasVoted = await this.hasUserVoted(pollId, userId)
      if (hasVoted) {
        throw new Error('User already voted on this poll')
      }

      // Insert vote (trigger will automatically update poll counts)
      const { error } = await supabase
        .from('votes')
        .insert({
          poll_id: pollId,
          user_id: userId,
          option: option
        })

      if (error) throw error

      console.log('✅ Vote recorded successfully')
    } catch (error) {
      console.error('Error voting on poll:', error)
      throw error
    }
  }

  // ============================================
  // USER OPERATIONS
  // ============================================

  static async getUserById(id: string): Promise<User | undefined> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return undefined
        throw error
      }

      return this.transformUserFromDB(data)
    } catch (error) {
      console.error('Error fetching user:', error)
      throw new Error('Failed to fetch user')
    }
  }

  static async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return undefined
        throw error
      }

      return this.transformUserFromDB(data)
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
      const { data, error } = await supabase
        .from('users')
        .insert({
          name: userData.name,
          username: userData.username,
          email: userData.email,
          avatar: userData.avatar,
          password_hash: userData.password,
          followers: 0,
          following: 0,
          reputation: 0,
          poll_count: 0,
          win_rate: 0
        })
        .select()
        .single()

      if (error) throw error

      return this.transformUserFromDB(data)
    } catch (error) {
      console.error('Error creating user:', error)
      throw new Error('Failed to create user')
    }
  }

  // ============================================
  // TRENDING OPERATIONS
  // ============================================

  static async getTrendingPolls(): Promise<Poll[]> {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .order('trending_score', { ascending: false })
        .limit(10)

      if (error) throw error

      return (data || []).map(this.transformPollFromDB)
    } catch (error) {
      console.error('Error fetching trending polls:', error)
      throw new Error('Failed to fetch trending polls')
    }
  }

  static async updateTrendingPolls(): Promise<void> {
    // Trending scores are automatically calculated via SQL
    // This is now a no-op since we can just query by trending_score
    console.log('Trending polls updated (queried by score)')
  }

  // ============================================
  // NOTIFICATION OPERATIONS
  // ============================================

  static async createNotification(notification: Omit<PollNotification, 'id' | 'createdAt'>): Promise<PollNotification> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          poll_id: notification.pollId,
          user_id: notification.userId,
          type: notification.type,
          message: notification.message,
          is_read: false
        })
        .select()
        .single()

      if (error) throw error

      return this.transformNotificationFromDB(data)
    } catch (error) {
      console.error('Error creating notification:', error)
      throw new Error('Failed to create notification')
    }
  }

  static async getUserNotifications(userId: string): Promise<PollNotification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(this.transformNotificationFromDB)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      throw new Error('Failed to fetch notifications')
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw new Error('Failed to mark notification as read')
    }
  }

  // ============================================
  // POLL HISTORY OPERATIONS
  // ============================================

  static async addPollHistory(history: Omit<PollHistory, 'id' | 'timestamp'>): Promise<PollHistory> {
    try {
      const { data, error } = await supabase
        .from('poll_history')
        .insert({
          poll_id: history.pollId,
          user_id: history.userId,
          action: history.action,
          poll_title: history.pollTitle,
          poll_category: history.pollCategory
        })
        .select()
        .single()

      if (error) throw error

      return this.transformPollHistoryFromDB(data)
    } catch (error) {
      console.error('Error adding poll history:', error)
      throw new Error('Failed to add poll history')
    }
  }

  static async getUserPollHistory(userId: string): Promise<PollHistory[]> {
    try {
      const { data, error } = await supabase
        .from('poll_history')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })

      if (error) throw error

      return (data || []).map(this.transformPollHistoryFromDB)
    } catch (error) {
      console.error('Error fetching poll history:', error)
      throw new Error('Failed to fetch poll history')
    }
  }

  // ============================================
  // HELPER METHODS - Transform DB to App Format
  // ============================================

  private static transformPollFromDB(dbPoll: any): Poll {
    return {
      id: dbPoll.id,
      title: dbPoll.title,
      description: dbPoll.description,
      votes: dbPoll.votes || 0,
      votesOptionA: dbPoll.votes_option_a || 0,
      votesOptionB: dbPoll.votes_option_b || 0,
      category: dbPoll.category,
      timeLeft: this.calculateTimeLeft(dbPoll.expires_at),
      authorId: dbPoll.author_id,
      author: dbPoll.author_name,
      isVoted: false, // Will be set by getPollsWithVoteStatus
      isLiked: false,
      createdAt: new Date(dbPoll.created_at),
      expiresAt: new Date(dbPoll.expires_at),
      context: dbPoll.context,
      arguments: {
        optionA: dbPoll.option_a,
        optionB: dbPoll.option_b
      },
      evidence: {
        optionA: [],
        optionB: []
      },
      comments: [],
      trendingScore: dbPoll.trending_score || 0,
      pollType: dbPoll.poll_type || 'question',
      timerDuration: undefined,
      timerEnabled: dbPoll.timer_enabled !== undefined ? dbPoll.timer_enabled : true,
      notificationEnabled: dbPoll.notification_enabled !== undefined ? dbPoll.notification_enabled : false,
      isExpired: dbPoll.is_expired || new Date(dbPoll.expires_at) < new Date()
    }
  }

  private static transformUserFromDB(dbUser: any): User {
    return {
      id: dbUser.id,
      name: dbUser.name,
      username: dbUser.username,
      email: dbUser.email,
      avatar: dbUser.avatar,
      password: dbUser.password_hash,
      role: dbUser.role || 'user',
      followers: dbUser.followers || 0,
      following: dbUser.following || 0,
      reputation: dbUser.reputation || 0,
      badges: [],
      pollCount: dbUser.poll_count || 0,
      winRate: dbUser.win_rate || 0,
      joinDate: new Date(dbUser.join_date),
      isFollowing: false
    }
  }

  private static transformNotificationFromDB(dbNotification: any): PollNotification {
    return {
      id: dbNotification.id,
      pollId: dbNotification.poll_id,
      userId: dbNotification.user_id,
      type: dbNotification.type,
      message: dbNotification.message,
      isRead: dbNotification.is_read,
      createdAt: new Date(dbNotification.created_at)
    }
  }

  private static transformPollHistoryFromDB(dbHistory: any): PollHistory {
    return {
      id: dbHistory.id,
      pollId: dbHistory.poll_id,
      userId: dbHistory.user_id,
      action: dbHistory.action,
      timestamp: new Date(dbHistory.timestamp),
      pollTitle: dbHistory.poll_title,
      pollCategory: dbHistory.poll_category
    }
  }

  private static calculateTimeLeft(expiresAt: string): string {
    const now = new Date()
    const expires = new Date(expiresAt)
    const timeLeft = expires.getTime() - now.getTime()

    if (timeLeft <= 0) return 'Expired'

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`
    return `${minutes} minute${minutes > 1 ? 's' : ''} left`
  }

  // ============================================
  // SEARCH & FILTER OPERATIONS
  // ============================================

  static async searchPolls(query: string): Promise<Poll[]> {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,author_name.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(this.transformPollFromDB)
    } catch (error) {
      console.error('Error searching polls:', error)
      throw new Error('Failed to search polls')
    }
  }

  static async getPollsByCategory(category: string): Promise<Poll[]> {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .ilike('category', category)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(this.transformPollFromDB)
    } catch (error) {
      console.error('Error fetching polls by category:', error)
      throw new Error('Failed to fetch polls by category')
    }
  }

  static async getUserPolls(userId: string): Promise<Poll[]> {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('author_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(this.transformPollFromDB)
    } catch (error) {
      console.error('Error fetching user polls:', error)
      throw new Error('Failed to fetch user polls')
    }
  }

  // ============================================
  // ANALYTICS OPERATIONS
  // ============================================

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
      const poll = await this.getPollById(pollId)
      if (!poll) return null

      const optionAPercentage = poll.votes > 0 ? Math.round((poll.votesOptionA / poll.votes) * 100) : 0
      const optionBPercentage = poll.votes > 0 ? Math.round((poll.votesOptionB / poll.votes) * 100) : 0

      return {
        totalVotes: poll.votes,
        optionAVotes: poll.votesOptionA,
        optionBVotes: poll.votesOptionB,
        optionAPercentage,
        optionBPercentage,
        recentVotes: poll.votes,
        trendingScore: poll.trendingScore || 0
      }
    } catch (error) {
      console.error('Error fetching poll analytics:', error)
      throw new Error('Failed to fetch poll analytics')
    }
  }
}

export default SupabasePollzAPI


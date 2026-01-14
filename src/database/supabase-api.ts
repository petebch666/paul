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

  static async getAllPolls(userId?: string): Promise<Poll[]> {
    try {
      // Get all polls, but filter by validation status
      // Only show approved polls to everyone, but allow authors to see their own pending/rejected polls
      let query = supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false })

      // If userId is provided, we'll filter in the application layer to allow authors to see their own polls
      // Otherwise, RLS policy will handle filtering
      const { data, error } = await query

      if (error) throw error

      let polls = (data || []).map(poll => SupabasePollzAPI.transformPollFromDB(poll))

      // Filter: only show approved polls, or pending/rejected polls if user is the author
      // TEMPORARILY DISABLED until validation_status column is added
      // if (userId) {
      //   polls = polls.filter(poll =>
      //     poll.validationStatus === 'approved' ||
      //     (poll.authorId === userId && poll.validationStatus !== 'approved')
      //   )
      // } else {
      //   // If no userId, only show approved polls
      //   polls = polls.filter(poll => poll.validationStatus === 'approved')
      // }
      
      // Load author usernames for polls that don't have them stored (backward compatibility)
      for (const poll of polls) {
        if (!poll.authorUsername && poll.authorId) {
          const author = await SupabasePollzAPI.getUserById(poll.authorId)
          if (author) {
            poll.authorUsername = author.username
          }
        }
      }

      return polls
    } catch (error) {
      console.error('Error fetching polls:', error)
      throw new Error('Failed to fetch polls')
    }
  }

  static async getPollsWithVoteStatus(userId: string): Promise<Poll[]> {
    try {
      // Get all polls, but exclude pending deathmatch polls (user can still see their own pending polls)
      const { data: pollsData, error: pollsError } = await supabase
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

      // Filter out pending deathmatch polls that user is not involved in
      // Also filter by validation status: only show approved polls, or pending/rejected if user is author
      const filteredPolls = (pollsData || []).filter(poll => {
        // Validation status filter: TEMPORARILY DISABLED until validation_status column is added
        // const isAuthor = poll.author_id === userId
        // const isApproved = poll.validation_status === 'approved'
        // if (!isApproved && !isAuthor) {
        //   return false
        // }

        // If it's a pending deathmatch, only show if user is the creator, option A owner, or option B owner
        if (poll.is_deathmatch && poll.deathmatch_status === 'pending') {
          const isAuthor = poll.author_id === userId
          return isAuthor ||
                 poll.option_a_owner_id === userId ||
                 poll.option_b_owner_id === userId
        }
        return true
      })

      const pollsWithVotes = filteredPolls.map(poll => ({
        ...SupabasePollzAPI.transformPollFromDB(poll),
        isVoted: votedPollIds.has(poll.id)
      }))
      
      // Load author usernames for polls that don't have them stored (backward compatibility)
      for (const poll of pollsWithVotes) {
        if (!poll.authorUsername && poll.authorId) {
          const author = await SupabasePollzAPI.getUserById(poll.authorId)
          if (author) {
            poll.authorUsername = author.username
          }
        }
      }
      
      return pollsWithVotes
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
        .maybeSingle() // Use maybeSingle() instead of single() to avoid 406 errors

      if (error) {
        console.error('Error checking user vote:', error)
        return false
      }
      
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

      return (data || []).map(poll => SupabasePollzAPI.transformPollFromDB(poll))
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
        .maybeSingle()

      if (error) {
        console.error('Error fetching poll:', error)
        throw new Error('Failed to fetch poll')
      }

      if (!data) return undefined

      const poll = SupabasePollzAPI.transformPollFromDB(data)

      // Load author username if not stored (for backward compatibility)
      if (!poll.authorUsername && poll.authorId) {
        const author = await SupabasePollzAPI.getUserById(poll.authorId)
        if (author) {
          poll.authorUsername = author.username
        }
      }

      // Load owner data for deathmatch polls
      if (poll.isDeathmatch) {
        if (poll.optionAOwnerId) {
          const ownerA = await SupabasePollzAPI.getUserById(poll.optionAOwnerId)
          if (ownerA) poll.optionAOwner = ownerA
        }
        if (poll.optionBOwnerId) {
          const ownerB = await SupabasePollzAPI.getUserById(poll.optionBOwnerId)
          if (ownerB) poll.optionBOwner = ownerB
        }
      }

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
    authorUsername?: string
    context?: string
    arguments?: {
      optionA: string
      optionB: string
    }
    expiresAt: Date
    isDeathmatch?: boolean
    isShadowDeathmatch?: boolean
    optionAUserId?: string
    optionBUserId?: string
  }): Promise<Poll> {
    try {
      const isDeathmatch = !!(pollData.optionAUserId && pollData.optionBUserId)
      
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
          notification_enabled: false,
          is_deathmatch: isDeathmatch,
          is_shadow_deathmatch: pollData.isShadowDeathmatch || false,
          option_a_owner_id: pollData.optionAUserId || null,
          option_b_owner_id: pollData.optionBUserId || null,
          deathmatch_status: isDeathmatch ? 'pending' : 'accepted',  // Deathmatch polls start as pending
          author_username: pollData.authorUsername || null,  // Store author username
          validation_status: 'pending'  // All polls start as pending until validated
        })
        .select()
        .single()

      if (error) throw error

      const newPoll = SupabasePollzAPI.transformPollFromDB(data)

      // Create notifications for deathmatch users
      if (isDeathmatch && pollData.optionAUserId && pollData.optionBUserId) {
        // Notify option A owner (creator or assigned user)
        await SupabasePollzAPI.createNotification({
          pollId: newPoll.id,
          userId: pollData.optionAUserId,
          type: 'deathmatch_created',
          message: `You've been assigned to defend Option A in: "${pollData.title}"`
        })

        // Notify option B owner - they need to ACCEPT first
        await SupabasePollzAPI.createNotification({
          pollId: newPoll.id,
          userId: pollData.optionBUserId,
          type: 'deathmatch_awaiting_acceptance',
          message: `You've been challenged to a deathmatch! Accept or modify your option: "${pollData.title}"`
        })
      }

      return newPoll
    } catch (error) {
      console.error('Error creating poll:', error)
      throw new Error('Failed to create poll')
    }
  }

  /**
   * Update poll validation status
   */
  static async updatePollValidationStatus(
    pollId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        validation_status: status,
        validated_at: new Date().toISOString()
      }

      if (reason) {
        updateData.validation_reason = reason
      }

      const { error } = await supabase
        .from('polls')
        .update(updateData)
        .eq('id', pollId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating poll validation status:', error)
      throw new Error('Failed to update poll validation status')
    }
  }

  /**
   * Get all pending polls for validation
   */
  static async getPendingPolls(limit: number = 10): Promise<Poll[]> {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('validation_status', 'pending')
        .order('created_at', { ascending: true }) // Process oldest first
        .limit(limit)

      if (error) throw error

      return (data || []).map(poll => SupabasePollzAPI.transformPollFromDB(poll))
    } catch (error) {
      console.error('Error fetching pending polls:', error)
      throw new Error('Failed to fetch pending polls')
    }
  }

  static async acceptDeathmatchPoll(pollId: string, userId: string, modifiedOptionB?: string): Promise<Poll> {
    try {
      const poll = await SupabasePollzAPI.getPollById(pollId)
      if (!poll || !poll.isDeathmatch) {
        throw new Error('Poll is not a deathmatch poll')
      }

      if (poll.optionBOwnerId !== userId) {
        throw new Error('Only the assigned user can accept this deathmatch')
      }

      if (poll.deathmatchStatus === 'accepted') {
        throw new Error('This deathmatch has already been accepted')
      }

      // Update poll status and optionally modify option B
      const updateData: any = {
        deathmatch_status: 'accepted'
      }

      if (modifiedOptionB) {
        updateData.option_b = modifiedOptionB
      }

      const { data, error } = await supabase
        .from('polls')
        .update(updateData)
        .eq('id', pollId)
        .select()
        .single()

      if (error) throw error

      const updatedPoll = SupabasePollzAPI.transformPollFromDB(data)

      // Notify option A owner that the deathmatch was accepted
      if (poll.optionAOwnerId) {
        await SupabasePollzAPI.createNotification({
          pollId: pollId,
          userId: poll.optionAOwnerId,
          type: 'deathmatch_accepted',
          message: `Your deathmatch has been accepted! "${poll.title}" is now active.`
        })
      }

      return updatedPoll
    } catch (error) {
      console.error('Error accepting deathmatch:', error)
      throw new Error('Failed to accept deathmatch')
    }
  }

  static async rejectDeathmatchPoll(pollId: string, userId: string): Promise<void> {
    try {
      const poll = await SupabasePollzAPI.getPollById(pollId)
      if (!poll || !poll.isDeathmatch) {
        throw new Error('Poll is not a deathmatch poll')
      }

      if (poll.optionBOwnerId !== userId) {
        throw new Error('Only the assigned user can reject this deathmatch')
      }

      const { error } = await supabase
        .from('polls')
        .update({ deathmatch_status: 'rejected' })
        .eq('id', pollId)

      if (error) throw error

      // Notify option A owner that the deathmatch was rejected
      if (poll.optionAOwnerId) {
        await SupabasePollzAPI.createNotification({
          pollId: pollId,
          userId: poll.optionAOwnerId,
          type: 'deathmatch_created',
          message: `Your deathmatch was rejected: "${poll.title}"`
        })
      }
    } catch (error) {
      console.error('Error rejecting deathmatch:', error)
      throw new Error('Failed to reject deathmatch')
    }
  }

  static async voteOnPoll(pollId: string, userId: string, option: 'A' | 'B'): Promise<void> {
    try {
      // Check if poll is a pending deathmatch
      const poll = await SupabasePollzAPI.getPollById(pollId)
      if (poll?.isDeathmatch && poll.deathmatchStatus === 'pending') {
        throw new Error('This deathmatch poll is pending acceptance. Cannot vote yet.')
      }

      // Check if already voted
      const hasVoted = await SupabasePollzAPI.hasUserVoted(pollId, userId)
      if (hasVoted) {
        throw new Error('User already voted on this poll')
      }

      // Get poll before voting to check for deathmatch and current state
      const pollBefore = await SupabasePollzAPI.getPollById(pollId)
      if (!pollBefore) {
        throw new Error('Poll not found')
      }

      const votesBeforeA = pollBefore.votesOptionA
      const votesBeforeB = pollBefore.votesOptionB
      const totalVotesBefore = pollBefore.votes
      const wasLeadingA = votesBeforeA > votesBeforeB
      const wasLeadingB = votesBeforeB > votesBeforeA
      const wasTied = votesBeforeA === votesBeforeB

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

      // Check for deathmatch notifications
      if (pollBefore.isDeathmatch && pollBefore.optionAOwnerId && pollBefore.optionBOwnerId) {
        // Get updated poll to check new vote counts
        const pollAfter = await SupabasePollzAPI.getPollById(pollId)
        if (pollAfter) {
          const totalVotesAfter = pollAfter.votes
          const votesAfterA = pollAfter.votesOptionA
          const votesAfterB = pollAfter.votesOptionB

          // Check 100-vote threshold
          const wasMultipleOf100 = Math.floor(totalVotesBefore / 100) * 100 === totalVotesBefore
          const isMultipleOf100 = Math.floor(totalVotesAfter / 100) * 100 === totalVotesAfter
          
          if (!wasMultipleOf100 && isMultipleOf100 && totalVotesAfter > 0) {
            // Notify both owners for 100-vote milestone
            await SupabasePollzAPI.createNotification({
              pollId: pollId,
              userId: pollBefore.optionAOwnerId,
              type: 'deathmatch_100_votes',
              message: `Your deathmatch poll reached ${totalVotesAfter} votes!`
            })
            await SupabasePollzAPI.createNotification({
              pollId: pollId,
              userId: pollBefore.optionBOwnerId,
              type: 'deathmatch_100_votes',
              message: `Your deathmatch poll reached ${totalVotesAfter} votes!`
            })
          }

          // Check if one option surpassed the other
          const isNowLeadingA = votesAfterA > votesAfterB
          const isNowLeadingB = votesAfterB > votesAfterA
          const isNowTied = votesAfterA === votesAfterB

          // Option A surpassed B
          if ((wasLeadingB || wasTied) && isNowLeadingA) {
            await SupabasePollzAPI.createNotification({
              pollId: pollId,
              userId: pollBefore.optionAOwnerId,
              type: 'deathmatch_surpassed',
              message: `Your deathmatch poll: Option A is now leading!`
            })
            await SupabasePollzAPI.createNotification({
              pollId: pollId,
              userId: pollBefore.optionBOwnerId,
              type: 'deathmatch_surpassed',
              message: `Your deathmatch poll: Option A is now leading!`
            })
          }

          // Option B surpassed A
          if ((wasLeadingA || wasTied) && isNowLeadingB) {
            await SupabasePollzAPI.createNotification({
              pollId: pollId,
              userId: pollBefore.optionAOwnerId,
              type: 'deathmatch_surpassed',
              message: `Your deathmatch poll: Option B is now leading!`
            })
            await SupabasePollzAPI.createNotification({
              pollId: pollId,
              userId: pollBefore.optionBOwnerId,
              type: 'deathmatch_surpassed',
              message: `Your deathmatch poll: Option B is now leading!`
            })
          }
        }
      }
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
        .maybeSingle()

      if (error) {
        console.error('Error fetching user:', error)
        throw new Error('Failed to fetch user')
      }

      return data ? SupabasePollzAPI.transformUserFromDB(data) : undefined
    } catch (error) {
      console.error('Error fetching user:', error)
      throw new Error('Failed to fetch user')
    }
  }

  static async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const { data, error} = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle()

      if (error) {
        console.error('Error fetching user by email:', error)
        throw new Error('Failed to fetch user by email')
      }

      return data ? SupabasePollzAPI.transformUserFromDB(data) : undefined
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

      return SupabasePollzAPI.transformUserFromDB(data)
    } catch (error) {
      console.error('Error creating user:', error)
      throw new Error('Failed to create user')
    }
  }

  static async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(limit)

      if (error) throw error

      return (data || []).map(user => SupabasePollzAPI.transformUserFromDB(user))
    } catch (error) {
      console.error('Error searching users:', error)
      throw new Error('Failed to search users')
    }
  }

  static async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      return (data || []).map(user => SupabasePollzAPI.transformUserFromDB(user))
    } catch (error) {
      console.error('Error fetching all users:', error)
      throw new Error('Failed to fetch users')
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

      return (data || []).map(poll => SupabasePollzAPI.transformPollFromDB(poll))
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

      return SupabasePollzAPI.transformNotificationFromDB(data)
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

      return (data || []).map(notif => SupabasePollzAPI.transformNotificationFromDB(notif))
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

      return SupabasePollzAPI.transformPollHistoryFromDB(data)
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

      return (data || []).map(history => SupabasePollzAPI.transformPollHistoryFromDB(history))
    } catch (error) {
      console.error('Error fetching poll history:', error)
      throw new Error('Failed to fetch poll history')
    }
  }

  // ============================================
  // HELPER METHODS - Transform DB to App Format
  // ============================================

  private static transformPollFromDB(dbPoll: any): Poll {
    // Get author username from database or fetch from users table if not stored
    let authorUsername = dbPoll.author_username
    
    // If no author_username stored, try to get it from author_id if possible
    // (We'll update existing polls with a migration script)
    
    return {
      id: dbPoll.id,
      title: dbPoll.title,
      description: dbPoll.description,
      votes: dbPoll.votes || 0,
      votesOptionA: dbPoll.votes_option_a || 0,
      votesOptionB: dbPoll.votes_option_b || 0,
      category: dbPoll.category,
      timeLeft: SupabasePollzAPI.calculateTimeLeft(dbPoll.expires_at),
      authorId: dbPoll.author_id,
      author: dbPoll.author_name,
      authorUsername: authorUsername || undefined,  // Include username
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
      isExpired: dbPoll.is_expired || new Date(dbPoll.expires_at) < new Date(),
      isDeathmatch: dbPoll.is_deathmatch || false,
      isShadowDeathmatch: dbPoll.is_shadow_deathmatch || false,
      optionAOwnerId: dbPoll.option_a_owner_id || undefined,
      optionBOwnerId: dbPoll.option_b_owner_id || undefined,
      deathmatchStatus: dbPoll.deathmatch_status || 'accepted',
      // AI Validation fields
      validationStatus: dbPoll.validation_status || 'pending',
      validationReason: dbPoll.validation_reason || undefined,
      validatedAt: dbPoll.validated_at ? new Date(dbPoll.validated_at) : undefined
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

      return (data || []).map(poll => SupabasePollzAPI.transformPollFromDB(poll))
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

      return (data || []).map(poll => SupabasePollzAPI.transformPollFromDB(poll))
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

      return (data || []).map(poll => SupabasePollzAPI.transformPollFromDB(poll))
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
      const poll = await SupabasePollzAPI.getPollById(pollId)
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

  // ============================================
  // DEVELOPMENT UTILITIES
  // ============================================

  /**
   * DEVELOPMENT ONLY: Reset all polls and votes to initial state
   * ⚠️ DESTRUCTIVE OPERATION - Cannot be undone
   * This will:
   * - Delete ALL votes from database
   * - Reset all poll statistics to 0
   * - Reset all poll expiration dates to 7 days from now
   * - Reset user statistics (win rate, reputation)
   * - Clear all notifications and poll history
   */
  static async resetPollsForDevelopment(): Promise<void> {
    try {
      console.log('🔄 Starting development reset...')

      // Safety check: Only allow in development mode
      if (import.meta.env.PROD) {
        throw new Error('❌ Development reset is disabled in production!')
      }

      // Step 1: Delete ALL votes
      console.log('📦 Step 1/5: Deleting all votes...')
      const { error: deleteVotesError } = await supabase
        .from('votes')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all rows

      if (deleteVotesError) {
        console.error('Error deleting votes:', deleteVotesError)
        throw new Error('Failed to delete votes')
      }
      console.log('✅ All votes deleted')

      // Step 2: Reset all polls
      console.log('📦 Step 2/5: Resetting all polls...')
      const newExpiresAt = new Date()
      newExpiresAt.setDate(newExpiresAt.getDate() + 7) // 7 days from now

      const { error: resetPollsError } = await supabase
        .from('polls')
        .update({
          votes: 0,
          votes_option_a: 0,
          votes_option_b: 0,
          created_at: new Date().toISOString(),
          expires_at: newExpiresAt.toISOString()
        })
        .neq('id', '00000000-0000-0000-0000-000000000000') // Update all rows

      if (resetPollsError) {
        console.error('Error resetting polls:', resetPollsError)
        throw new Error('Failed to reset polls')
      }
      console.log('✅ All polls reset')

      // Step 3: Reset user statistics
      console.log('📦 Step 3/5: Resetting user statistics...')
      const { error: resetUsersError } = await supabase
        .from('users')
        .update({
          win_rate: 0,
          reputation: 0
        })
        .neq('id', '00000000-0000-0000-0000-000000000000') // Update all rows

      if (resetUsersError) {
        console.error('Error resetting user stats:', resetUsersError)
        throw new Error('Failed to reset user statistics')
      }
      console.log('✅ User statistics reset')

      // Step 4: Clear notifications
      console.log('📦 Step 4/5: Clearing notifications...')
      const { error: deleteNotificationsError } = await supabase
        .from('notifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all rows

      if (deleteNotificationsError) {
        console.error('Error deleting notifications:', deleteNotificationsError)
        // Don't throw - notifications are not critical
        console.warn('⚠️ Failed to delete notifications, continuing...')
      } else {
        console.log('✅ Notifications cleared')
      }

      // Step 5: Clear poll history
      console.log('📦 Step 5/5: Clearing poll history...')
      const { error: deleteHistoryError } = await supabase
        .from('poll_history')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all rows

      if (deleteHistoryError) {
        console.error('Error deleting poll history:', deleteHistoryError)
        // Don't throw - history is not critical
        console.warn('⚠️ Failed to delete poll history, continuing...')
      } else {
        console.log('✅ Poll history cleared')
      }

      console.log('✅ Development reset completed successfully!')
      console.log('📊 Summary:')
      console.log('  - All votes deleted')
      console.log('  - All polls reset to 0 votes')
      console.log('  - All polls expire in 7 days')
      console.log('  - User statistics reset')
      console.log('  - Notifications and history cleared')

    } catch (error) {
      console.error('❌ Development reset failed:', error)
      throw error
    }
  }
}

export default SupabasePollzAPI


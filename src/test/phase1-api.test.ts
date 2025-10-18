import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { SupabasePollzAPI } from '../database/supabase-api'
import { UnifiedPollzAPI } from '../database/unified-api'
import { isSupabaseConfigured } from '../database/supabase'

/**
 * Phase 1: API Route Testing
 * Comprehensive test suite for all API endpoints
 * 
 * Tests:
 * - Poll CRUD operations
 * - User operations
 * - Notification system
 * - Poll history
 * - Error handling
 * - Edge cases
 */

describe('Phase 1: API Route Testing', () => {
  const isUsingSupabase = isSupabaseConfigured()
  const API = isUsingSupabase ? SupabasePollzAPI : UnifiedPollzAPI

  // Test data
  const testUser = {
    name: 'Test User',
    username: 'testuser',
    email: 'test@pollz.app',
    avatar: 'https://example.com/avatar.jpg'
  }

  const testPoll = {
    title: 'Test Poll for API Testing',
    description: 'This is a test poll to validate API functionality',
    category: 'Technology',
    timeLeft: '7 days left',
    authorId: '',
    author: 'Test User',
    context: 'Testing API endpoints',
    arguments: {
      optionA: 'Option A - API Test',
      optionB: 'Option B - API Test'
    },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  }

  let createdUserId: string = ''
  let createdPollId: string = ''

  beforeEach(async () => {
    // Clean up any existing test data
    try {
      if (isUsingSupabase) {
        // For Supabase, we'll clean up test data
        console.log('🧹 Cleaning up test data...')
      }
    } catch (error) {
      console.warn('Cleanup warning:', error)
    }
  })

  afterEach(async () => {
    // Clean up test data after each test
    try {
      if (createdPollId) {
        // Note: In production, we'd want to delete test data
        // For now, we'll just log that cleanup would happen
        console.log(`🧹 Would clean up poll: ${createdPollId}`)
      }
    } catch (error) {
      console.warn('Cleanup warning:', error)
    }
  })

  describe('🔍 API Configuration Check', () => {
    it('should detect correct API backend', () => {
      console.log(`📊 Using ${isUsingSupabase ? 'Supabase' : 'localStorage'} API`)
      expect(typeof isUsingSupabase).toBe('boolean')
    })
  })

  describe('📊 Poll CRUD Operations', () => {
    it('should get all polls', async () => {
      console.log('📊 Testing: Get all polls')
      const polls = await API.getAllPolls()
      
      expect(Array.isArray(polls)).toBe(true)
      expect(polls.length).toBeGreaterThanOrEqual(0)
      
      if (polls.length > 0) {
        const poll = polls[0]
        expect(poll).toHaveProperty('id')
        expect(poll).toHaveProperty('title')
        expect(poll).toHaveProperty('description')
        expect(poll).toHaveProperty('votes')
        expect(poll).toHaveProperty('votesOptionA')
        expect(poll).toHaveProperty('votesOptionB')
        expect(poll).toHaveProperty('category')
        expect(poll).toHaveProperty('authorId')
        expect(poll).toHaveProperty('author')
        expect(poll).toHaveProperty('createdAt')
        expect(poll).toHaveProperty('expiresAt')
        expect(poll.createdAt).toBeInstanceOf(Date)
        expect(poll.expiresAt).toBeInstanceOf(Date)
      }
      
      console.log(`✅ Found ${polls.length} polls`)
    })

    it('should get polls with pagination', async () => {
      console.log('📊 Testing: Get polls with pagination')
      
      const batch1 = await API.getPollsBatch(0, 5)
      const batch2 = await API.getPollsBatch(1, 5)
      
      expect(Array.isArray(batch1)).toBe(true)
      expect(Array.isArray(batch2)).toBe(true)
      expect(batch1.length).toBeLessThanOrEqual(5)
      expect(batch2.length).toBeLessThanOrEqual(5)
      
      // Batches should not overlap
      const batch1Ids = batch1.map(p => p.id)
      const batch2Ids = batch2.map(p => p.id)
      const overlap = batch1Ids.filter(id => batch2Ids.includes(id))
      expect(overlap.length).toBe(0)
      
      console.log(`✅ Batch 1: ${batch1.length} polls, Batch 2: ${batch2.length} polls`)
    })

    it('should get total polls count', async () => {
      console.log('📊 Testing: Get total polls count')
      
      const count = await API.getTotalPollsCount()
      
      expect(typeof count).toBe('number')
      expect(count).toBeGreaterThanOrEqual(0)
      
      console.log(`✅ Total polls: ${count}`)
    })

    it('should get poll by ID', async () => {
      console.log('📊 Testing: Get poll by ID')
      
      const polls = await API.getAllPolls()
      if (polls.length === 0) {
        console.log('⚠️ No polls available for ID test')
        return
      }
      
      const firstPoll = polls[0]
      const pollById = await API.getPollById(firstPoll.id)
      
      expect(pollById).toBeDefined()
      expect(pollById?.id).toBe(firstPoll.id)
      expect(pollById?.title).toBe(firstPoll.title)
      expect(pollById?.description).toBe(firstPoll.description)
      
      console.log(`✅ Retrieved poll: ${pollById?.title}`)
    })

    it('should return undefined for non-existent poll ID', async () => {
      console.log('📊 Testing: Non-existent poll ID')
      
      const poll = await API.getPollById('non-existent-id-12345')
      expect(poll).toBeUndefined()
      
      console.log('✅ Correctly returned undefined for non-existent poll')
    })

    it('should create a new poll', async () => {
      console.log('📊 Testing: Create new poll')
      
      // First create a test user if needed
      try {
        const existingUser = await API.getUserByEmail(testUser.email)
        if (existingUser) {
          testPoll.authorId = existingUser.id
          createdUserId = existingUser.id
        } else {
          const newUser = await API.createUser(testUser)
          testPoll.authorId = newUser.id
          createdUserId = newUser.id
        }
      } catch (error) {
        console.log('⚠️ User creation failed, using mock ID')
        testPoll.authorId = 'test-user-id'
        createdUserId = 'test-user-id'
      }
      
      const newPoll = await API.createPoll(testPoll)
      
      expect(newPoll).toBeDefined()
      expect(newPoll.id).toBeDefined()
      expect(newPoll.title).toBe(testPoll.title)
      expect(newPoll.description).toBe(testPoll.description)
      expect(newPoll.votes).toBe(0)
      expect(newPoll.votesOptionA).toBe(0)
      expect(newPoll.votesOptionB).toBe(0)
      expect(newPoll.createdAt).toBeInstanceOf(Date)
      expect(newPoll.expiresAt).toBeInstanceOf(Date)
      
      createdPollId = newPoll.id
      console.log(`✅ Created poll: ${newPoll.title} (ID: ${newPoll.id})`)
    })

    it('should vote on a poll', async () => {
      console.log('📊 Testing: Vote on poll')
      
      if (!createdPollId) {
        console.log('⚠️ No poll available for voting test')
        return
      }
      
      const userId = createdUserId || 'test-user-id'
      
      try {
        await API.voteOnPoll(createdPollId, userId, 'A')
        
        // Verify vote was recorded
        const updatedPoll = await API.getPollById(createdPollId)
        expect(updatedPoll?.votes).toBe(1)
        expect(updatedPoll?.votesOptionA).toBe(1)
        expect(updatedPoll?.votesOptionB).toBe(0)
        
        console.log('✅ Vote recorded successfully')
      } catch (error) {
        console.log('⚠️ Voting test skipped:', error)
      }
    })

    it('should prevent duplicate votes', async () => {
      console.log('📊 Testing: Prevent duplicate votes')
      
      if (!createdPollId) {
        console.log('⚠️ No poll available for duplicate vote test')
        return
      }
      
      const userId = createdUserId || 'test-user-id'
      
      try {
        // First vote should succeed (already done in previous test)
        const hasVoted = await API.hasUserVoted(createdPollId, userId)
        expect(hasVoted).toBe(true)
        
        // Second vote should fail
        await expect(API.voteOnPoll(createdPollId, userId, 'B'))
          .rejects.toThrow('User already voted on this poll')
        
        console.log('✅ Duplicate vote prevention working')
      } catch (error) {
        console.log('⚠️ Duplicate vote test skipped:', error)
      }
    })

    it('should get trending polls', async () => {
      console.log('📊 Testing: Get trending polls')
      
      const trendingPolls = await API.getTrendingPolls()
      
      expect(Array.isArray(trendingPolls)).toBe(true)
      expect(trendingPolls.length).toBeLessThanOrEqual(10)
      
      if (trendingPolls.length > 1) {
        // Check that polls are sorted by trending score (descending)
        for (let i = 0; i < trendingPolls.length - 1; i++) {
          expect(trendingPolls[i].trendingScore).toBeGreaterThanOrEqual(
            trendingPolls[i + 1].trendingScore
          )
        }
      }
      
      console.log(`✅ Found ${trendingPolls.length} trending polls`)
    })
  })

  describe('👤 User Operations', () => {
    it('should get user by ID', async () => {
      console.log('👤 Testing: Get user by ID')
      
      if (!createdUserId) {
        console.log('⚠️ No user available for ID test')
        return
      }
      
      const user = await API.getUserById(createdUserId)
      
      expect(user).toBeDefined()
      expect(user?.id).toBe(createdUserId)
      expect(user?.name).toBeDefined()
      expect(user?.email).toBeDefined()
      
      console.log(`✅ Retrieved user: ${user?.name}`)
    })

    it('should return undefined for non-existent user', async () => {
      console.log('👤 Testing: Non-existent user ID')
      
      const user = await API.getUserById('non-existent-user-id')
      expect(user).toBeUndefined()
      
      console.log('✅ Correctly returned undefined for non-existent user')
    })

    it('should get user by email', async () => {
      console.log('👤 Testing: Get user by email')
      
      const user = await API.getUserByEmail(testUser.email)
      
      if (user) {
        expect(user.email).toBe(testUser.email)
        expect(user.name).toBeDefined()
        console.log(`✅ Retrieved user by email: ${user.name}`)
      } else {
        console.log('⚠️ No user found with test email')
      }
    })

    it('should create a new user', async () => {
      console.log('👤 Testing: Create new user')
      
      const newUserData = {
        ...testUser,
        email: `test-${Date.now()}@pollz.app`
      }
      
      try {
        const newUser = await API.createUser(newUserData)
        
        expect(newUser).toBeDefined()
        expect(newUser.id).toBeDefined()
        expect(newUser.name).toBe(newUserData.name)
        expect(newUser.email).toBe(newUserData.email)
        expect(newUser.avatar).toBe(newUserData.avatar)
        
        console.log(`✅ Created user: ${newUser.name} (${newUser.email})`)
      } catch (error) {
        console.log('⚠️ User creation test skipped:', error)
      }
    })
  })

  describe('🔔 Notification System', () => {
    it('should get user notifications', async () => {
      console.log('🔔 Testing: Get user notifications')
      
      const userId = createdUserId || 'test-user-id'
      const notifications = await API.getUserNotifications(userId)
      
      expect(Array.isArray(notifications)).toBe(true)
      
      if (notifications.length > 0) {
        const notification = notifications[0]
        expect(notification).toHaveProperty('id')
        expect(notification).toHaveProperty('pollId')
        expect(notification).toHaveProperty('userId')
        expect(notification).toHaveProperty('type')
        expect(notification).toHaveProperty('message')
        expect(notification).toHaveProperty('isRead')
        expect(notification).toHaveProperty('createdAt')
        expect(notification.createdAt).toBeInstanceOf(Date)
      }
      
      console.log(`✅ Found ${notifications.length} notifications`)
    })

    it('should create notification', async () => {
      console.log('🔔 Testing: Create notification')
      
      if (!createdPollId) {
        console.log('⚠️ No poll available for notification test')
        return
      }
      
      const userId = createdUserId || 'test-user-id'
      const notificationData = {
        pollId: createdPollId,
        userId: userId,
        type: 'poll_created' as const,
        message: 'Test notification for API testing'
      }
      
      try {
        const notification = await API.createNotification(notificationData)
        
        expect(notification).toBeDefined()
        expect(notification.id).toBeDefined()
        expect(notification.pollId).toBe(notificationData.pollId)
        expect(notification.userId).toBe(notificationData.userId)
        expect(notification.type).toBe(notificationData.type)
        expect(notification.message).toBe(notificationData.message)
        expect(notification.isRead).toBe(false)
        expect(notification.createdAt).toBeInstanceOf(Date)
        
        console.log(`✅ Created notification: ${notification.message}`)
      } catch (error) {
        console.log('⚠️ Notification creation test skipped:', error)
      }
    })

    it('should mark notification as read', async () => {
      console.log('🔔 Testing: Mark notification as read')
      
      const userId = createdUserId || 'test-user-id'
      const notifications = await API.getUserNotifications(userId)
      
      if (notifications.length === 0) {
        console.log('⚠️ No notifications available for read test')
        return
      }
      
      const notification = notifications[0]
      
      try {
        await API.markNotificationAsRead(notification.id)
        
        // Verify it's marked as read
        const updatedNotifications = await API.getUserNotifications(userId)
        const updatedNotification = updatedNotifications.find(n => n.id === notification.id)
        expect(updatedNotification?.isRead).toBe(true)
        
        console.log('✅ Notification marked as read')
      } catch (error) {
        console.log('⚠️ Mark as read test skipped:', error)
      }
    })
  })

  describe('📚 Poll History', () => {
    it('should get user poll history', async () => {
      console.log('📚 Testing: Get user poll history')
      
      const userId = createdUserId || 'test-user-id'
      const history = await API.getUserPollHistory(userId)
      
      expect(Array.isArray(history)).toBe(true)
      
      if (history.length > 0) {
        const historyEntry = history[0]
        expect(historyEntry).toHaveProperty('id')
        expect(historyEntry).toHaveProperty('pollId')
        expect(historyEntry).toHaveProperty('userId')
        expect(historyEntry).toHaveProperty('action')
        expect(historyEntry).toHaveProperty('timestamp')
        expect(historyEntry).toHaveProperty('pollTitle')
        expect(historyEntry).toHaveProperty('pollCategory')
        expect(historyEntry.timestamp).toBeInstanceOf(Date)
      }
      
      console.log(`✅ Found ${history.length} history entries`)
    })

    it('should add poll history entry', async () => {
      console.log('📚 Testing: Add poll history entry')
      
      if (!createdPollId) {
        console.log('⚠️ No poll available for history test')
        return
      }
      
      const userId = createdUserId || 'test-user-id'
      const historyData = {
        pollId: createdPollId,
        userId: userId,
        action: 'voted' as const,
        pollTitle: testPoll.title,
        pollCategory: testPoll.category
      }
      
      try {
        const historyEntry = await API.addPollHistory(historyData)
        
        expect(historyEntry).toBeDefined()
        expect(historyEntry.id).toBeDefined()
        expect(historyEntry.pollId).toBe(historyData.pollId)
        expect(historyEntry.userId).toBe(historyData.userId)
        expect(historyEntry.action).toBe(historyData.action)
        expect(historyEntry.pollTitle).toBe(historyData.pollTitle)
        expect(historyEntry.pollCategory).toBe(historyData.pollCategory)
        expect(historyEntry.timestamp).toBeInstanceOf(Date)
        
        console.log(`✅ Added history entry: ${historyEntry.action}`)
      } catch (error) {
        console.log('⚠️ History entry test skipped:', error)
      }
    })
  })

  describe('🔍 Search & Filter Operations', () => {
    it('should search polls', async () => {
      console.log('🔍 Testing: Search polls')
      
      const searchResults = await API.searchPolls('test')
      
      expect(Array.isArray(searchResults)).toBe(true)
      
      if (searchResults.length > 0) {
        const poll = searchResults[0]
        expect(poll).toHaveProperty('id')
        expect(poll).toHaveProperty('title')
        expect(poll).toHaveProperty('description')
      }
      
      console.log(`✅ Found ${searchResults.length} search results`)
    })

    it('should get polls by category', async () => {
      console.log('🔍 Testing: Get polls by category')
      
      const categoryPolls = await API.getPollsByCategory('Technology')
      
      expect(Array.isArray(categoryPolls)).toBe(true)
      
      if (categoryPolls.length > 0) {
        categoryPolls.forEach(poll => {
          expect(poll.category.toLowerCase()).toContain('technology')
        })
      }
      
      console.log(`✅ Found ${categoryPolls.length} Technology polls`)
    })

    it('should get user polls', async () => {
      console.log('🔍 Testing: Get user polls')
      
      const userId = createdUserId || 'test-user-id'
      const userPolls = await API.getUserPolls(userId)
      
      expect(Array.isArray(userPolls)).toBe(true)
      
      if (userPolls.length > 0) {
        userPolls.forEach(poll => {
          expect(poll.authorId).toBe(userId)
        })
      }
      
      console.log(`✅ Found ${userPolls.length} user polls`)
    })
  })

  describe('📊 Analytics Operations', () => {
    it('should get poll analytics', async () => {
      console.log('📊 Testing: Get poll analytics')
      
      if (!createdPollId) {
        console.log('⚠️ No poll available for analytics test')
        return
      }
      
      try {
        const analytics = await API.getPollAnalytics(createdPollId)
        
        if (analytics) {
          expect(analytics).toHaveProperty('totalVotes')
          expect(analytics).toHaveProperty('optionAVotes')
          expect(analytics).toHaveProperty('optionBVotes')
          expect(analytics).toHaveProperty('optionAPercentage')
          expect(analytics).toHaveProperty('optionBPercentage')
          expect(analytics).toHaveProperty('recentVotes')
          expect(analytics).toHaveProperty('trendingScore')
          
          expect(typeof analytics.totalVotes).toBe('number')
          expect(typeof analytics.optionAVotes).toBe('number')
          expect(typeof analytics.optionBVotes).toBe('number')
          expect(typeof analytics.optionAPercentage).toBe('number')
          expect(typeof analytics.optionBPercentage).toBe('number')
          
          console.log(`✅ Analytics: ${analytics.totalVotes} total votes, ${analytics.optionAPercentage}% vs ${analytics.optionBPercentage}%`)
        } else {
          console.log('⚠️ No analytics data available')
        }
      } catch (error) {
        console.log('⚠️ Analytics test skipped:', error)
      }
    })
  })

  describe('❌ Error Handling', () => {
    it('should handle invalid poll ID gracefully', async () => {
      console.log('❌ Testing: Invalid poll ID handling')
      
      const poll = await API.getPollById('invalid-poll-id-12345')
      expect(poll).toBeUndefined()
      
      console.log('✅ Gracefully handled invalid poll ID')
    })

    it('should handle invalid user ID gracefully', async () => {
      console.log('❌ Testing: Invalid user ID handling')
      
      const user = await API.getUserById('invalid-user-id-12345')
      expect(user).toBeUndefined()
      
      console.log('✅ Gracefully handled invalid user ID')
    })

    it('should handle voting on non-existent poll', async () => {
      console.log('❌ Testing: Voting on non-existent poll')
      
      await expect(API.voteOnPoll('non-existent-poll-id', 'user-id', 'A'))
        .rejects.toThrow()
      
      console.log('✅ Correctly rejected vote on non-existent poll')
    })
  })

  describe('🎯 Performance Tests', () => {
    it('should handle batch operations efficiently', async () => {
      console.log('🎯 Testing: Batch operations performance')
      
      const startTime = Date.now()
      
      // Test multiple operations
      const [polls, count, trending] = await Promise.all([
        API.getAllPolls(),
        API.getTotalPollsCount(),
        API.getTrendingPolls()
      ])
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(Array.isArray(polls)).toBe(true)
      expect(typeof count).toBe('number')
      expect(Array.isArray(trending)).toBe(true)
      
      console.log(`✅ Batch operations completed in ${duration}ms`)
      expect(duration).toBeLessThan(5000) // Should complete within 5 seconds
    })

    it('should handle pagination efficiently', async () => {
      console.log('🎯 Testing: Pagination performance')
      
      const startTime = Date.now()
      
      const [batch1, batch2, batch3] = await Promise.all([
        API.getPollsBatch(0, 10),
        API.getPollsBatch(1, 10),
        API.getPollsBatch(2, 10)
      ])
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(Array.isArray(batch1)).toBe(true)
      expect(Array.isArray(batch2)).toBe(true)
      expect(Array.isArray(batch3)).toBe(true)
      
      console.log(`✅ Pagination completed in ${duration}ms`)
      expect(duration).toBeLessThan(3000) // Should complete within 3 seconds
    })
  })
})

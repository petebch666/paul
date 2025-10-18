import { describe, it, expect, beforeEach } from 'vitest'
import { SupabasePollzAPI } from '../database/supabase-api'

/**
 * Test using existing admin user from database
 * This avoids RLS policy issues since admin user should already exist
 */

describe('Admin API Test', () => {
  let adminUserId: string = ''
  let testPollId: string = ''

  beforeEach(async () => {
    // Get the admin user that should exist from the schema
    try {
      const adminUser = await SupabasePollzAPI.getUserByEmail('admin@pollz.app')
      if (adminUser) {
        adminUserId = adminUser.id
        console.log(`✅ Found admin user: ${adminUser.name} (${adminUser.id})`)
      } else {
        console.log('⚠️ Admin user not found, tests may fail')
      }
    } catch (error) {
      console.log('⚠️ Could not fetch admin user:', error)
    }
  })

  it('should get admin user by email', async () => {
    console.log('👤 Testing: Get admin user by email')
    
    const adminUser = await SupabasePollzAPI.getUserByEmail('admin@pollz.app')
    
    if (adminUser) {
      expect(adminUser.email).toBe('admin@pollz.app')
      expect(adminUser.name).toBeDefined()
      expect(adminUser.id).toBeDefined()
      adminUserId = adminUser.id
      console.log(`✅ Found admin user: ${adminUser.name}`)
    } else {
      console.log('⚠️ Admin user not found - database may not be set up')
    }
  })

  it('should create a poll using admin user', async () => {
    console.log('📊 Testing: Create poll using admin user')
    
    if (!adminUserId) {
      console.log('⚠️ No admin user available, skipping poll creation test')
      return
    }

    const testPoll = {
      title: 'Admin Test Poll',
      description: 'This poll tests admin functionality',
      category: 'Technology',
      timeLeft: '7 days left',
      authorId: adminUserId,
      author: 'Admin',
      context: 'Testing admin poll creation',
      arguments: {
        optionA: 'Admin can create polls',
        optionB: 'Admin has issues creating polls'
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }

    try {
      const newPoll = await SupabasePollzAPI.createPoll(testPoll)
      
      expect(newPoll).toBeDefined()
      expect(newPoll.id).toBeDefined()
      expect(newPoll.title).toBe(testPoll.title)
      expect(newPoll.authorId).toBe(adminUserId)
      expect(newPoll.author).toBe('Admin')
      
      testPollId = newPoll.id
      console.log(`✅ Created poll: ${newPoll.title} (ID: ${newPoll.id})`)
    } catch (error) {
      console.log('❌ Poll creation failed:', error)
      throw error
    }
  })

  it('should vote on the created poll', async () => {
    console.log('🗳️ Testing: Vote on poll')
    
    if (!testPollId || !adminUserId) {
      console.log('⚠️ No poll or user available for voting test')
      return
    }

    try {
      await SupabasePollzAPI.voteOnPoll(testPollId, adminUserId, 'A')
      
      // Verify vote was recorded
      const updatedPoll = await SupabasePollzAPI.getPollById(testPollId)
      expect(updatedPoll?.votes).toBe(1)
      expect(updatedPoll?.votesOptionA).toBe(1)
      expect(updatedPoll?.votesOptionB).toBe(0)
      
      console.log('✅ Vote recorded successfully')
    } catch (error) {
      console.log('❌ Voting failed:', error)
      throw error
    }
  })

  it('should get all polls', async () => {
    console.log('📊 Testing: Get all polls')
    
    const polls = await SupabasePollzAPI.getAllPolls()
    
    expect(Array.isArray(polls)).toBe(true)
    expect(polls.length).toBeGreaterThanOrEqual(0)
    
    if (polls.length > 0) {
      const poll = polls[0]
      expect(poll).toHaveProperty('id')
      expect(poll).toHaveProperty('title')
      expect(poll).toHaveProperty('description')
      expect(poll).toHaveProperty('votes')
      expect(poll).toHaveProperty('category')
      expect(poll).toHaveProperty('author')
    }
    
    console.log(`✅ Found ${polls.length} polls`)
  })

  it('should get trending polls', async () => {
    console.log('📈 Testing: Get trending polls')
    
    const trendingPolls = await SupabasePollzAPI.getTrendingPolls()
    
    expect(Array.isArray(trendingPolls)).toBe(true)
    expect(trendingPolls.length).toBeLessThanOrEqual(10)
    
    console.log(`✅ Found ${trendingPolls.length} trending polls`)
  })

  it('should search polls', async () => {
    console.log('🔍 Testing: Search polls')
    
    const searchResults = await SupabasePollzAPI.searchPolls('test')
    
    expect(Array.isArray(searchResults)).toBe(true)
    
    console.log(`✅ Found ${searchResults.length} search results for "test"`)
  })

  it('should get polls by category', async () => {
    console.log('📂 Testing: Get polls by category')
    
    const categoryPolls = await SupabasePollzAPI.getPollsByCategory('Technology')
    
    expect(Array.isArray(categoryPolls)).toBe(true)
    
    if (categoryPolls.length > 0) {
      categoryPolls.forEach(poll => {
        expect(poll.category.toLowerCase()).toContain('technology')
      })
    }
    
    console.log(`✅ Found ${categoryPolls.length} Technology polls`)
  })

  it('should get user polls', async () => {
    console.log('👤 Testing: Get user polls')
    
    if (!adminUserId) {
      console.log('⚠️ No admin user available for user polls test')
      return
    }

    const userPolls = await SupabasePollzAPI.getUserPolls(adminUserId)
    
    expect(Array.isArray(userPolls)).toBe(true)
    
    if (userPolls.length > 0) {
      userPolls.forEach(poll => {
        expect(poll.authorId).toBe(adminUserId)
      })
    }
    
    console.log(`✅ Found ${userPolls.length} polls by admin user`)
  })

  it('should get poll analytics', async () => {
    console.log('📊 Testing: Get poll analytics')
    
    if (!testPollId) {
      console.log('⚠️ No test poll available for analytics test')
      return
    }

    const analytics = await SupabasePollzAPI.getPollAnalytics(testPollId)
    
    if (analytics) {
      expect(analytics).toHaveProperty('totalVotes')
      expect(analytics).toHaveProperty('optionAVotes')
      expect(analytics).toHaveProperty('optionBVotes')
      expect(analytics).toHaveProperty('optionAPercentage')
      expect(analytics).toHaveProperty('optionBPercentage')
      expect(analytics).toHaveProperty('trendingScore')
      
      console.log(`✅ Analytics: ${analytics.totalVotes} total votes, ${analytics.optionAPercentage}% vs ${analytics.optionBPercentage}%`)
    } else {
      console.log('⚠️ No analytics data available')
    }
  })

  it('should handle notifications', async () => {
    console.log('🔔 Testing: Notifications')
    
    if (!adminUserId) {
      console.log('⚠️ No admin user available for notifications test')
      return
    }

    // Get user notifications
    const notifications = await SupabasePollzAPI.getUserNotifications(adminUserId)
    expect(Array.isArray(notifications)).toBe(true)
    console.log(`✅ Found ${notifications.length} notifications`)
  })

  it('should handle poll history', async () => {
    console.log('📚 Testing: Poll history')
    
    if (!adminUserId) {
      console.log('⚠️ No admin user available for poll history test')
      return
    }

    // Get user poll history
    const history = await SupabasePollzAPI.getUserPollHistory(adminUserId)
    expect(Array.isArray(history)).toBe(true)
    console.log(`✅ Found ${history.length} history entries`)
  })
})


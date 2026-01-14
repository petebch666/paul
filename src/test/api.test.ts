import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PollzAPI } from '../database/api'
import { initializeDatabase } from '../database/simple-db'

describe('API Endpoints Test Suite', () => {
  beforeEach(async () => {
    // Clear localStorage before each test
    localStorage.clear()
    // Initialize fresh database
    await initializeDatabase()
  })

  afterEach(() => {
    // Clean up after each test
    localStorage.clear()
  })

  describe('Database Initialization', () => {
    it('should initialize database with default data', async () => {
      await initializeDatabase()
      const polls = await PollzAPI.getAllPolls()
      expect(polls.length).toBeGreaterThan(0)
      expect(polls[0]).toHaveProperty('id')
      expect(polls[0]).toHaveProperty('title')
      expect(polls[0]).toHaveProperty('votes')
    })
  })

  describe('Poll Operations', () => {
    it('should get all polls', async () => {
      const polls = await PollzAPI.getAllPolls()
      expect(Array.isArray(polls)).toBe(true)
      expect(polls.length).toBeGreaterThan(0)
      
      // Check poll structure
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
    })

    it('should get polls in batches', async () => {
      const batch1 = await PollzAPI.getPollsBatch(0, 5)
      const batch2 = await PollzAPI.getPollsBatch(1, 5)
      
      expect(batch1.length).toBeLessThanOrEqual(5)
      expect(batch2.length).toBeLessThanOrEqual(5)
      
      // Batches should not overlap
      const batch1Ids = batch1.map(p => p.id)
      const batch2Ids = batch2.map(p => p.id)
      const overlap = batch1Ids.filter(id => batch2Ids.includes(id))
      expect(overlap.length).toBe(0)
    })

    it('should get total polls count', async () => {
      const count = await PollzAPI.getTotalPollsCount()
      expect(typeof count).toBe('number')
      expect(count).toBeGreaterThan(0)
    })

    it('should get poll by ID', async () => {
      const polls = await PollzAPI.getAllPolls()
      const firstPoll = polls[0]
      
      const pollById = await PollzAPI.getPollById(firstPoll.id)
      expect(pollById).toBeDefined()
      expect(pollById?.id).toBe(firstPoll.id)
      expect(pollById?.title).toBe(firstPoll.title)
    })

    it('should return undefined for non-existent poll ID', async () => {
      const poll = await PollzAPI.getPollById('non-existent-id')
      expect(poll).toBeUndefined()
    })

    it('should create a new poll', async () => {
      const pollData = {
        title: 'Test Poll Creation',
        description: 'Testing poll creation functionality',
        category: 'Technology',
        timeLeft: '24 hours left',
        authorId: 'user-1',
        author: 'Test User',
        context: 'This is a test poll',
        arguments: {
          optionA: 'Option A works',
          optionB: 'Option B works'
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }

      const newPoll = await PollzAPI.createPoll(pollData)
      
      expect(newPoll).toBeDefined()
      expect(newPoll.id).toBeDefined()
      expect(newPoll.title).toBe(pollData.title)
      expect(newPoll.description).toBe(pollData.description)
      expect(newPoll.votes).toBe(0)
      expect(newPoll.votesOptionA).toBe(0)
      expect(newPoll.votesOptionB).toBe(0)
      expect(newPoll.createdAt).toBeInstanceOf(Date)
    })

    it('should vote on a poll', async () => {
      // First create a poll
      const pollData = {
        title: 'Test Voting Poll',
        description: 'Testing voting functionality',
        category: 'Technology',
        timeLeft: '24 hours left',
        authorId: 'user-1',
        author: 'Test User',
        context: 'This is a test poll for voting',
        arguments: {
          optionA: 'Vote A',
          optionB: 'Vote B'
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }

      const newPoll = await PollzAPI.createPoll(pollData)
      
      // Vote on the poll
      const voteResult = await PollzAPI.voteOnPoll(newPoll.id, 'user-1', 'A')
      
      expect(voteResult.success).toBe(true)
      
      // Verify vote was recorded
      const updatedPoll = await PollzAPI.getPollById(newPoll.id)
      expect(updatedPoll?.votes).toBe(1)
      expect(updatedPoll?.votesOptionA).toBe(1)
      expect(updatedPoll?.votesOptionB).toBe(0)
    })

    it('should prevent duplicate votes from same user', async () => {
      // Create a poll
      const pollData = {
        title: 'Test Duplicate Vote',
        description: 'Testing duplicate vote prevention',
        category: 'Technology',
        timeLeft: '24 hours left',
        authorId: 'user-1',
        author: 'Test User',
        context: 'This is a test poll for duplicate voting',
        arguments: {
          optionA: 'Vote A',
          optionB: 'Vote B'
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }

      const newPoll = await PollzAPI.createPoll(pollData)
      
      // First vote should succeed
      const firstVote = await PollzAPI.voteOnPoll(newPoll.id, 'user-1', 'A')
      expect(firstVote.success).toBe(true)
      
      // Second vote should fail
      await expect(PollzAPI.voteOnPoll(newPoll.id, 'user-1', 'B'))
        .rejects.toThrow('User already voted on this poll')
    })

    it('should throw error when voting on non-existent poll', async () => {
      await expect(PollzAPI.voteOnPoll('non-existent-id', 'user-1', 'A'))
        .rejects.toThrow('Poll not found')
    })
  })

  describe('User Operations', () => {
    it('should get user by ID', async () => {
      const user = await PollzAPI.getUserById('user-1')
      expect(user).toBeDefined()
      expect(user?.id).toBe('user-1')
      expect(user?.name).toBeDefined()
      expect(user?.email).toBeDefined()
    })

    it('should return undefined for non-existent user', async () => {
      const user = await PollzAPI.getUserById('non-existent-user')
      expect(user).toBeUndefined()
    })

    it('should get user by email', async () => {
      const user = await PollzAPI.getUserByEmail('john.doe@example.com')
      expect(user).toBeDefined()
      expect(user?.email).toBe('john.doe@example.com')
    })

    it('should create a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        avatar: 'https://example.com/avatar.jpg',
        bio: 'Test user bio',
        joinDate: new Date()
      }

      const newUser = await PollzAPI.createUser(userData)
      
      expect(newUser).toBeDefined()
      expect(newUser.id).toBeDefined()
      expect(newUser.name).toBe(userData.name)
      expect(newUser.email).toBe(userData.email)
      expect(newUser.avatar).toBe(userData.avatar)
      expect(newUser.bio).toBe(userData.bio)
    })
  })

  describe('Notification Operations', () => {
    it('should get user notifications', async () => {
      const notifications = await PollzAPI.getUserNotifications('user-1')
      expect(Array.isArray(notifications)).toBe(true)
    })

    it('should create notification', async () => {
      const notificationData = {
        pollId: 'poll-1',
        userId: 'user-1',
        type: 'poll_created' as const,
        message: 'Test notification'
      }

      const notification = await PollzAPI.createNotification(notificationData)
      
      expect(notification).toBeDefined()
      expect(notification.id).toBeDefined()
      expect(notification.pollId).toBe(notificationData.pollId)
      expect(notification.userId).toBe(notificationData.userId)
      expect(notification.type).toBe(notificationData.type)
      expect(notification.message).toBe(notificationData.message)
      expect(notification.isRead).toBe(false)
      expect(notification.createdAt).toBeInstanceOf(Date)
    })

    it('should mark notification as read', async () => {
      // First create a notification
      const notificationData = {
        pollId: 'poll-1',
        userId: 'user-1',
        type: 'poll_created' as const,
        message: 'Test notification for marking as read'
      }

      const notification = await PollzAPI.createNotification(notificationData)
      
      // Mark as read
      await PollzAPI.markNotificationAsRead(notification.id)
      
      // Verify it's marked as read
      const notifications = await PollzAPI.getUserNotifications('user-1')
      const updatedNotification = notifications.find(n => n.id === notification.id)
      expect(updatedNotification?.isRead).toBe(true)
    })
  })

  describe('Poll History Operations', () => {
    it('should get user poll history', async () => {
      const history = await PollzAPI.getUserPollHistory('user-1')
      expect(Array.isArray(history)).toBe(true)
    })

    it('should add poll history entry', async () => {
      const historyData = {
        pollId: 'poll-1',
        userId: 'user-1',
        action: 'voted' as const,
        pollTitle: 'Test Poll',
        pollCategory: 'Technology'
      }

      const historyEntry = await PollzAPI.addPollHistory(historyData)
      
      expect(historyEntry).toBeDefined()
      expect(historyEntry.id).toBeDefined()
      expect(historyEntry.pollId).toBe(historyData.pollId)
      expect(historyEntry.userId).toBe(historyData.userId)
      expect(historyEntry.action).toBe(historyData.action)
      expect(historyEntry.pollTitle).toBe(historyData.pollTitle)
      expect(historyEntry.pollCategory).toBe(historyData.pollCategory)
      expect(historyEntry.timestamp).toBeInstanceOf(Date)
    })
  })

  describe('Poll Timer Operations', () => {
    it('should update poll timer', async () => {
      // Create a poll with timer enabled
      const pollData = {
        title: 'Test Timer Poll',
        description: 'Testing timer functionality',
        category: 'Technology',
        timeLeft: '24 hours left',
        authorId: 'user-1',
        author: 'Test User',
        context: 'This is a test poll for timer',
        arguments: {
          optionA: 'Timer A',
          optionB: 'Timer B'
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        timerEnabled: true
      }

      const newPoll = await PollzAPI.createPoll(pollData)
      
      // Update timer
      await PollzAPI.updatePollTimer(newPoll.id)
      
      // Verify timer was updated
      const updatedPoll = await PollzAPI.getPollById(newPoll.id)
      expect(updatedPoll?.timeLeft).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid poll ID gracefully', async () => {
      await expect(PollzAPI.getPollById('invalid-id'))
        .resolves.toBeUndefined()
    })

    it('should handle invalid user ID gracefully', async () => {
      await expect(PollzAPI.getUserById('invalid-user'))
        .resolves.toBeUndefined()
    })

    it('should handle voting on non-existent poll', async () => {
      await expect(PollzAPI.voteOnPoll('non-existent-poll', 'user-1', 'A'))
        .rejects.toThrow('Poll not found')
    })
  })
})

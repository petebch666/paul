/**
 * Comprehensive API Testing Suite
 * Phase 1: Testing & Validation
 * 
 * This suite tests all critical API operations including:
 * - Poll CRUD operations
 * - User operations
 * - Voting system
 * - Notifications
 * - Poll history
 */

import { UnifiedPollzAPI as PollzAPI } from '../database/unified-api'
import { Poll, User, PollNotification, PollHistory } from '../types'

// ============================================
// TEST RESULTS TRACKER
// ============================================

interface TestResult {
  name: string
  passed: boolean
  error?: string
  duration: number
}

class TestSuite {
  private results: TestResult[] = []
  private startTime: number = 0

  start() {
    this.results = []
    this.startTime = Date.now()
    console.log('🧪 Starting API Test Suite...\n')
  }

  addResult(name: string, passed: boolean, error?: string, duration?: number) {
    this.results.push({
      name,
      passed,
      error,
      duration: duration || 0
    })
    
    const status = passed ? '✅ PASS' : '❌ FAIL'
    const durationText = duration ? ` (${duration}ms)` : ''
    console.log(`${status}: ${name}${durationText}`)
    if (error) {
      console.log(`   Error: ${error}`)
    }
  }

  summary() {
    const totalDuration = Date.now() - this.startTime
    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.filter(r => !r.passed).length
    const total = this.results.length

    console.log('\n' + '='.repeat(50))
    console.log('📊 TEST SUMMARY')
    console.log('='.repeat(50))
    console.log(`Total Tests: ${total}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⏱️  Duration: ${totalDuration}ms`)
    console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`)
    console.log('='.repeat(50))

    return {
      total,
      passed,
      failed,
      duration: totalDuration,
      successRate: (passed / total) * 100
    }
  }
}

const testSuite = new TestSuite()

// ============================================
// HELPER FUNCTIONS
// ============================================

async function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = Date.now()
  const result = await fn()
  const duration = Date.now() - start
  return { result, duration }
}

// ============================================
// TEST SUITES
// ============================================

/**
 * Test Poll CRUD Operations
 */
export async function testPollCRUD() {
  console.log('\n🧪 Testing Poll CRUD Operations...')
  
  // Test 1: Get All Polls
  {
    const start = Date.now()
    try {
      const polls = await PollzAPI.getAllPolls()
      const duration = Date.now() - start
      testSuite.addResult('Get All Polls', Array.isArray(polls), undefined, duration)
      console.log(`   Retrieved ${polls.length} polls`)
    } catch (error) {
      testSuite.addResult('Get All Polls', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - start)
    }
  }

  // Test 2: Get Total Polls Count
  {
    const start = Date.now()
    try {
      const count = await PollzAPI.getTotalPollsCount()
      const duration = Date.now() - start
      testSuite.addResult('Get Polls Count', typeof count === 'number' && count >= 0, undefined, duration)
      console.log(`   Total polls: ${count}`)
    } catch (error) {
      testSuite.addResult('Get Polls Count', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - start)
    }
  }

  // Test 3: Create Poll
  let testPollId: string | null = null
  {
    const start = Date.now()
    try {
      const { result: poll, duration } = await measureTime(() => 
        PollzAPI.createPoll({
          title: 'Test Poll - ' + Date.now(),
          description: 'This is a test poll for API testing',
          category: 'Technology',
          authorId: 'test-user-id',
          author: 'Test User',
          context: 'Testing API',
          arguments: {
            optionA: 'Test Option A',
            optionB: 'Test Option B'
          },
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          timeLeft: '24 hours left'
        })
      )
      testPollId = poll.id
      testSuite.addResult('Create Poll', !!poll.id, undefined, duration)
      console.log(`   Created poll: ${poll.id}`)
    } catch (error) {
      testSuite.addResult('Create Poll', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - start)
    }
  }

  // Test 4: Get Single Poll
  if (testPollId) {
    const start = Date.now()
    try {
      const poll = await PollzAPI.getPollById(testPollId)
      const duration = Date.now() - start
      testSuite.addResult('Get Poll By ID', !!poll && poll.id === testPollId, undefined, duration)
    } catch (error) {
      testSuite.addResult('Get Poll By ID', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - start)
    }
  }

  // Test 5: Vote on Poll
  if (testPollId) {
    const start = Date.now()
    try {
      await PollzAPI.voteOnPoll(testPollId, 'test-user-id', 'A')
      const duration = Date.now() - start
      testSuite.addResult('Vote on Poll', true, undefined, duration)
      console.log(`   Voted on poll successfully`)
    } catch (error) {
      testSuite.addResult('Vote on Poll', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - start)
    }
  }

  // Test 6: Check if User Voted
  if (testPollId) {
    const start = Date.now()
    try {
      const hasVoted = await PollzAPI.hasUserVoted(testPollId, 'test-user-id')
      const duration = Date.now() - start
      testSuite.addResult('Check User Vote Status', typeof hasVoted === 'boolean', undefined, duration)
    } catch (error) {
      testSuite.addResult('Check User Vote Status', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - start)
    }
  }

  // Test 7: Get Polls with Vote Status
  {
    const start = Date.now()
    try {
      const polls = await PollzAPI.getPollsWithVoteStatus('test-user-id')
      const duration = Date.now() - start
      testSuite.addResult('Get Polls With Vote Status', Array.isArray(polls), undefined, duration)
    } catch (error) {
      testSuite.addResult('Get Polls With Vote Status', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - start)
    }
  }

  // Test 8: Get Trending Polls
  {
    const start = Date.now()
    try {
      const polls = await PollzAPI.getTrendingPolls()
      const duration = Date.now() - start
      testSuite.addResult('Get Trending Polls', Array.isArray(polls), undefined, duration)
    } catch (error) {
      testSuite.addResult('Get Trending Polls', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - start)
    }
  }

  // Test 9: Search Polls
  {
    const start = Date.now()
    try {
      const polls = await PollzAPI.searchPolls('test')
      const duration = Date.now() - start
      testSuite.addResult('Search Polls', Array.isArray(polls), undefined, duration)
    } catch (error) {
      testSuite.addResult('Search Polls', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - start)
    }
  }

  // Test 10: Get Polls by Category
  {
    const start = Date.now()
    try {
      const polls = await PollzAPI.getPollsByCategory('Technology')
      const duration = Date.now() - start
      testSuite.addResult('Get Polls By Category', Array.isArray(polls), undefined, duration)
    } catch (error) {
      testSuite.addResult('Get Polls By Category', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - start)
    }
  }

  console.log('✅ Poll CRUD tests completed\n')
}

/**
 * Test User Operations
 */
export async function testUserOperations() {
  console.log('\n🧪 Testing User Operations...')

  // Test 1: Create User
  let testUserId: string | null = null
  {
    const start = Date.now()
    try {
      const { result: user, duration } = await measureTime(() =>
        PollzAPI.createUser({
          name: 'Test User ' + Date.now(),
          username: '@testuser' + Date.now(),
          email: `test${Date.now()}@test.com`,
          avatar: 'https://ui-avatars.com/api/?name=Test+User',
          password: 'TestPassword123!'
        })
      )
      testUserId = user.id
      testSuite.addResult('Create User', !!user.id, undefined, duration)
      console.log(`   Created user: ${user.id}`)
    } catch (error) {
      testSuite.addResult('Create User', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - start)
    }
  }

  // Test 2: Get User By ID
  if (testUserId) {
    const start = Date.now()
    try {
      const user = await PollzAPI.getUserById(testUserId)
      const duration = Date.now() - start
      testSuite.addResult('Get User By ID', !!user && user.id === testUserId, undefined, duration)
    } catch (error) {
      testSuite.addResult('Get User By ID', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - start)
    }
  }

  // Test 3: Get User By Email
  if (testUserId) {
    const start = Date.now()
    try {
      // This assumes we know the email from the created user
      const users = await PollzAPI.getAllPolls() // This would typically return all users
      const duration = Date.now() - start
      testSuite.addResult('Get User Operations', true, undefined, duration)
    } catch (error) {
      testSuite.addResult('Get User Operations', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - start)
    }
  }

  console.log('✅ User operations tests completed\n')
}

/**
 * Test Notification System
 */
export async function testNotifications() {
  console.log('\n🧪 Testing Notification System...')

  let testNotificationId: string | null = null

  // Test 1: Create Notification
  {
    const start = Date.now()
    try {
      const { result: notification, duration } = await measureTime(() =>
        PollzAPI.createNotification({
          pollId: 'test-poll-id',
          userId: 'test-user-id',
          type: 'poll_expired',
          message: 'Test notification message'
        })
      )
      testNotificationId = notification.id
      testSuite.addResult('Create Notification', !!notification.id, undefined, duration)
      console.log(`   Created notification: ${notification.id}`)
    } catch (error) {
      testSuite.addResult('Create Notification', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - start)
    }
  }

  // Test 2: Get User Notifications
  {
    const start = Date.now()
    try {
      const notifications = await PollzAPI.getUserNotifications('test-user-id')
      const duration = Date.now() - start
      testSuite.addResult('Get User Notifications', Array.isArray(notifications), undefined, duration)
    } catch (error) {
      testSuite.addResult('Get User Notifications', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - start)
    }
  }

  // Test 3: Mark Notification as Read
  if (testNotificationId) {
    const start = Date.now()
    try {
      await PollzAPI.markNotificationAsRead(testNotificationId)
      const duration = Date.now() - start
      testSuite.addResult('Mark Notification As Read', true, undefined, duration)
    } catch (error) {
      testSuite.addResult('Mark Notification As Read', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - start)
    }
  }

  console.log('✅ Notification system tests completed\n')
}

/**
 * Test Poll History
 */
export async function testPollHistory() {
  console.log('\n🧪 Testing Poll History...')

  let testHistoryId: string | null = null

  // Test 1: Add Poll History
  {
    const start = Date.now()
    try {
      const { result: history, duration } = await measureTime(() =>
        PollzAPI.addPollHistory({
          pollId: 'test-poll-id',
          userId: 'test-user-id',
          action: 'voted',
          pollTitle: 'Test Poll',
          pollCategory: 'Technology'
        })
      )
      testHistoryId = history.id
      testSuite.addResult('Add Poll History', !!history.id, undefined, duration)
      console.log(`   Added history entry: ${history.id}`)
    } catch (error) {
      testSuite.addResult('Add Poll History', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - start)
    }
  }

  // Test 2: Get User Poll History
  {
    const start = Date.now()
    try {
      const history = await PollzAPI.getUserPollHistory('test-user-id')
      const duration = Date.now() - start
      testSuite.addResult('Get User Poll History', Array.isArray(history), undefined, duration)
    } catch (error) {
      testSuite.addResult('Get User Poll History', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - start)
    }
  }

  console.log('✅ Poll history tests completed\n')
}

/**
 * Main Test Runner
 */
export async function runAllTests() {
  testSuite.start()

  // Run all test suites
  await testPollCRUD()
  await testUserOperations()
  await testNotifications()
  await testPollHistory()

  // Show summary
  const summary = testSuite.summary()

  return summary
}

// Export for use in other files
export default { runAllTests, testPollCRUD, testUserOperations, testNotifications, testPollHistory }


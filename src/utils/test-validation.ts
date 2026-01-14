/**
 * Test Utility for AI Validation System
 * 
 * Use this in browser console to test the validation system
 */

import { pollValidator } from '../services/poll-validator'
import { validationWorker } from '../services/validation-worker'
import { SupabasePollzAPI } from '../database/supabase-api'
import { Poll } from '../types'

/**
 * Test Ollama connection
 */
export async function testOllamaConnection(): Promise<boolean> {
  console.log('🔍 Testing Ollama connection...')
  try {
    const available = await pollValidator.checkAvailability()
    if (available) {
      console.log('✅ Ollama is available and running!')
      return true
    } else {
      console.error('❌ Ollama is not available. Make sure Ollama is running on http://localhost:11434')
      return false
    }
  } catch (error) {
    console.error('❌ Error checking Ollama:', error)
    return false
  }
}

/**
 * Test validation on a sample poll
 */
export async function testValidation(pollData?: Partial<Poll>): Promise<void> {
  console.log('🧪 Testing poll validation...')
  
  const testPoll: Poll = {
    id: 'test-poll',
    title: pollData?.title || 'Pineapple on Pizza: Yes or No?',
    description: pollData?.description || 'The eternal debate',
    category: pollData?.category || 'Food',
    votes: 0,
    votesOptionA: 0,
    votesOptionB: 0,
    timeLeft: '1 day left',
    author: 'Test User',
    authorId: 'test-user-id',
    isVoted: false,
    isLiked: false,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    pollType: 'question',
    timerEnabled: true,
    notificationEnabled: false,
    isExpired: false,
    arguments: {
      optionA: pollData?.arguments?.optionA || 'Yes, delicious!',
      optionB: pollData?.arguments?.optionB || 'No, never!'
    },
    comments: [],
    isDeathmatch: false,
    ...pollData
  }

  try {
    const result = await pollValidator.validatePoll(testPoll)
    console.log('📊 Validation Result:', result)
    
    if (result.approved) {
      console.log('✅ Poll would be APPROVED')
    } else {
      console.log('❌ Poll would be REJECTED:', result.reason)
    }
  } catch (error) {
    console.error('❌ Validation error:', error)
  }
}

/**
 * Get validation worker statistics
 */
export function getWorkerStats() {
  const stats = validationWorker.getStats()
  console.log('📊 Validation Worker Stats:', stats)
  return stats
}

/**
 * Manually trigger validation of pending polls
 */
export async function processPendingPolls(): Promise<void> {
  console.log('🔄 Manually triggering validation of pending polls...')
  try {
    await validationWorker.processPendingPolls()
    console.log('✅ Validation cycle complete')
  } catch (error) {
    console.error('❌ Error processing polls:', error)
  }
}

/**
 * Get pending polls from database
 */
export async function getPendingPolls(): Promise<Poll[]> {
  console.log('📋 Fetching pending polls...')
  try {
    const polls = await SupabasePollzAPI.getPendingPolls(10)
    console.log(`✅ Found ${polls.length} pending polls:`)
    polls.forEach(poll => {
      console.log(`  - "${poll.title}" (${poll.id})`)
    })
    return polls
  } catch (error) {
    console.error('❌ Error fetching pending polls:', error)
    return []
  }
}

/**
 * Run all tests
 */
export async function runAllTests(): Promise<void> {
  console.log('🚀 Running all validation tests...\n')
  
  // Test 1: Ollama connection
  console.log('Test 1: Ollama Connection')
  const ollamaOk = await testOllamaConnection()
  console.log('')
  
  if (!ollamaOk) {
    console.error('❌ Ollama is not available. Please start Ollama and download a model.')
    return
  }
  
  // Test 2: Humorous poll (should approve)
  console.log('Test 2: Humorous Poll (Should Approve)')
  await testValidation({
    title: 'Pineapple on Pizza: Yes or No?',
    arguments: {
      optionA: 'Yes, delicious!',
      optionB: 'No, never!'
    }
  })
  console.log('')
  
  // Test 3: Country battle (should reject)
  console.log('Test 3: Country Battle (Should Reject)')
  await testValidation({
    title: 'France vs Germany: Which is better?',
    arguments: {
      optionA: 'France',
      optionB: 'Germany'
    }
  })
  console.log('')
  
  // Test 4: Get worker stats
  console.log('Test 4: Worker Statistics')
  getWorkerStats()
  console.log('')
  
  // Test 5: Get pending polls
  console.log('Test 5: Pending Polls')
  await getPendingPolls()
  console.log('')
  
  console.log('✅ All tests complete!')
}

// Make functions available in browser console
if (typeof window !== 'undefined') {
  (window as any).testValidation = {
    testOllamaConnection,
    testValidation,
    getWorkerStats,
    processPendingPolls,
    getPendingPolls,
    runAllTests
  }
  
  console.log('💡 Validation test utilities available in console!')
  console.log('   Usage:')
  console.log('   - await testValidation.testOllamaConnection()')
  console.log('   - await testValidation.testValidation()')
  console.log('   - testValidation.getWorkerStats()')
  console.log('   - await testValidation.processPendingPolls()')
  console.log('   - await testValidation.getPendingPolls()')
  console.log('   - await testValidation.runAllTests()')
}


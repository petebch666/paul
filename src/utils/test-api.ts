// Test utility to verify API integration
import { PollzAPI } from '../database/api'
import { initializeDatabase } from '../database/simple-db'

export async function testApiIntegration() {
  console.log('🧪 Testing API Integration...')
  
  try {
    // Initialize database
    console.log('1. Initializing database...')
    await initializeDatabase()
    console.log('✅ Database initialized')
    
    // Test getting all polls
    console.log('2. Testing getAllPolls...')
    const polls = await PollzAPI.getAllPolls()
    console.log(`✅ Retrieved ${polls.length} polls`)
    
    // Test getting user
    console.log('3. Testing getUserById...')
    const user = await PollzAPI.getUserById('user-1')
    console.log(`✅ Retrieved user: ${user?.name}`)
    
    // Test creating a poll
    console.log('4. Testing createPoll...')
    const newPoll = await PollzAPI.createPoll({
      title: 'Test Poll - Backend Integration',
      description: 'Testing if backend integration works',
      category: 'Technology',
      timeLeft: '24 hours left',
      authorId: 'user-1',
      author: 'Test User',
      context: 'This is a test poll to verify backend integration',
      arguments: {
        optionA: 'Backend works!',
        optionB: 'Backend needs fixing!'
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    })
    console.log(`✅ Created poll: ${newPoll.title}`)
    
    // Test voting
    console.log('5. Testing voteOnPoll...')
    await PollzAPI.voteOnPoll(newPoll.id, 'user-1', 'A')
    console.log(`✅ Vote recorded successfully`)
    
    console.log('🎉 All API tests passed!')
    return true
  } catch (error) {
    console.error('❌ API test failed:', error)
    return false
  }
}

// Auto-run test in development
if (import.meta.env.DEV) {
  // Run test after a short delay to ensure everything is loaded
  setTimeout(() => {
    testApiIntegration()
  }, 2000)
}

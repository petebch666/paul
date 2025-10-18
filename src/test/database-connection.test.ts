import { describe, it, expect } from 'vitest'
import { supabase, isSupabaseConfigured } from '../database/supabase'
import { SupabasePollzAPI } from '../database/supabase-api'

describe('Database Connection Test', () => {
  it('should verify Supabase connection', async () => {
    console.log('🔍 Testing Supabase connection...')
    
    expect(isSupabaseConfigured()).toBe(true)
    
    // Test basic connection by querying users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection error:', error)
      throw error
    }
    
    console.log('✅ Supabase connection successful')
    console.log(`📊 Found ${data?.length || 0} users in database`)
  })

  it('should create and retrieve a test user', async () => {
    console.log('👤 Testing user creation...')
    
    const testUser = {
      name: 'Test User',
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@pollz.app`,
      avatar: 'https://example.com/avatar.jpg'
    }
    
    try {
      const newUser = await SupabasePollzAPI.createUser(testUser)
      
      expect(newUser).toBeDefined()
      expect(newUser.id).toBeDefined()
      expect(newUser.name).toBe(testUser.name)
      expect(newUser.email).toBe(testUser.email)
      
      console.log(`✅ Created user: ${newUser.name} (ID: ${newUser.id})`)
      
      // Test retrieving the user
      const retrievedUser = await SupabasePollzAPI.getUserById(newUser.id)
      expect(retrievedUser).toBeDefined()
      expect(retrievedUser?.id).toBe(newUser.id)
      
      console.log('✅ User retrieval successful')
      
      return newUser.id
    } catch (error) {
      console.error('❌ User creation failed:', error)
      throw error
    }
  })

  it('should create and retrieve a test poll', async () => {
    console.log('📊 Testing poll creation...')
    
    // First create a test user
    const testUser = {
      name: 'Test Poll Creator',
      username: `pollcreator_${Date.now()}`,
      email: `pollcreator_${Date.now()}@pollz.app`,
      avatar: 'https://example.com/avatar.jpg'
    }
    
    const newUser = await SupabasePollzAPI.createUser(testUser)
    console.log(`✅ Created user for poll test: ${newUser.id}`)
    
    // Now create a poll with valid user ID
    const testPoll = {
      title: 'Database Connection Test Poll',
      description: 'This poll tests database connectivity',
      category: 'Technology',
      timeLeft: '7 days left',
      authorId: newUser.id,
      author: newUser.name,
      context: 'Testing database connection',
      arguments: {
        optionA: 'Database works',
        optionB: 'Database has issues'
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
    
    try {
      const newPoll = await SupabasePollzAPI.createPoll(testPoll)
      
      expect(newPoll).toBeDefined()
      expect(newPoll.id).toBeDefined()
      expect(newPoll.title).toBe(testPoll.title)
      expect(newPoll.authorId).toBe(newUser.id)
      
      console.log(`✅ Created poll: ${newPoll.title} (ID: ${newPoll.id})`)
      
      // Test retrieving the poll
      const retrievedPoll = await SupabasePollzAPI.getPollById(newPoll.id)
      expect(retrievedPoll).toBeDefined()
      expect(retrievedPoll?.id).toBe(newPoll.id)
      
      console.log('✅ Poll retrieval successful')
      
      return newPoll.id
    } catch (error) {
      console.error('❌ Poll creation failed:', error)
      throw error
    }
  })
})


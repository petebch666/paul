// Example of how to integrate the database with your existing App.tsx
// This shows how to replace mock data with real database calls

import { PollzAPI } from './api'
import { Poll, User } from './simple-db'

// Example: Replace mock polls with database polls
export async function loadPollsFromDatabase(): Promise<Poll[]> {
  try {
    const polls = await PollzAPI.getAllPolls()
    console.log('📊 Loaded polls from database:', polls.length)
    return polls
  } catch (error) {
    console.error('❌ Failed to load polls from database:', error)
    // Fallback to empty array or show error
    return []
  }
}

// Example: Replace mock voting with database voting
export async function voteInDatabase(pollId: string, userId: string, option: 'A' | 'B'): Promise<boolean> {
  try {
    const result = await PollzAPI.voteOnPoll(pollId, userId, option)
    if (result.success) {
      console.log('✅ Vote recorded in database')
      return true
    } else {
      console.error('❌ Vote failed:', result.message)
      return false
    }
  } catch (error) {
    console.error('❌ Database vote error:', error)
    return false
  }
}

// Example: Replace mock user with database user
export async function loadUserFromDatabase(userId: string): Promise<User | null> {
  try {
    const user = await PollzAPI.getUserById(userId)
    if (user) {
      console.log('👤 Loaded user from database:', user.name)
    }
    return user
  } catch (error) {
    console.error('❌ Failed to load user from database:', error)
    return null
  }
}

// Example: Replace mock trending with database trending
export async function loadTrendingFromDatabase(): Promise<Poll[]> {
  try {
    const trendingPolls = await PollzAPI.getTrendingPolls()
    console.log('🔥 Loaded trending polls from database:', trendingPolls.length)
    return trendingPolls
  } catch (error) {
    console.error('❌ Failed to load trending polls from database:', error)
    return []
  }
}

// Example: Replace mock category suggestions with database suggestions
export async function getCategorySuggestionsFromDatabase(question: string): Promise<Array<{
  category: string
  confidence: number
  keywords: string[]
}>> {
  try {
    const suggestions = await PollzAPI.getCategorySuggestions(question)
    console.log('🤖 Got category suggestions from database:', suggestions.length)
    return suggestions
  } catch (error) {
    console.error('❌ Failed to get category suggestions from database:', error)
    return []
  }
}

// Example: Replace mock duplicate check with database duplicate check
export async function checkDuplicatesInDatabase(question: string, optionA: string, optionB: string): Promise<{
  hasDuplicates: boolean
  similarPolls: Array<{
    id: string
    title: string
    similarity: number
    author: string
  }>
}> {
  try {
    const duplicates = await PollzAPI.checkForDuplicates(question, optionA, optionB)
    console.log('🔍 Checked duplicates in database:', duplicates.hasDuplicates)
    return duplicates
  } catch (error) {
    console.error('❌ Failed to check duplicates in database:', error)
    return { hasDuplicates: false, similarPolls: [] }
  }
}

// Example: Create a new poll in the database
export async function createPollInDatabase(pollData: {
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
}): Promise<Poll | null> {
  try {
    const newPoll = await PollzAPI.createPoll(pollData)
    console.log('✨ Created poll in database:', newPoll.id)
    return newPoll
  } catch (error) {
    console.error('❌ Failed to create poll in database:', error)
    return null
  }
}

// Example: Search polls in the database
export async function searchPollsInDatabase(query: string): Promise<Poll[]> {
  try {
    const results = await PollzAPI.searchPolls(query)
    console.log('🔍 Search results from database:', results.length)
    return results
  } catch (error) {
    console.error('❌ Failed to search polls in database:', error)
    return []
  }
}

// Example: Get polls by category from database
export async function getPollsByCategoryFromDatabase(category: string): Promise<Poll[]> {
  try {
    const polls = await PollzAPI.getPollsByCategory(category)
    console.log(`📂 Loaded ${polls.length} polls for category: ${category}`)
    return polls
  } catch (error) {
    console.error('❌ Failed to load polls by category from database:', error)
    return []
  }
}

// Example: Get user's polls from database
export async function getUserPollsFromDatabase(userId: string): Promise<Poll[]> {
  try {
    const polls = await PollzAPI.getUserPolls(userId)
    console.log(`👤 Loaded ${polls.length} polls for user: ${userId}`)
    return polls
  } catch (error) {
    console.error('❌ Failed to load user polls from database:', error)
    return []
  }
}


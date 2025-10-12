import { initializeDatabase } from './simple-db'
import UnifiedPollzAPI from './unified-api'
import { getAPIType, isUsingSupabase } from './unified-api'

// Initialize database on startup
export async function initializePollzDatabase() {
  try {
    console.log('🚀 Initializing Pollz Database...')
    console.log(`📍 Using ${getAPIType()} for data storage`)
    
    // Only initialize localStorage if not using Supabase
    if (!isUsingSupabase()) {
      console.log('📦 Initializing localStorage...')
      await initializeDatabase()
    } else {
      console.log('☁️ Using Supabase - skipping localStorage initialization')
    }
    
    // Update trending polls
    await UnifiedPollzAPI.updateTrendingPolls()
    
    console.log('✅ Pollz Database initialized successfully!')
    console.log('📊 Database contains:')
    
    const polls = await UnifiedPollzAPI.getAllPolls()
    console.log(`   - ${polls.length} polls`)
    
    const trendingPolls = await UnifiedPollzAPI.getTrendingPolls()
    console.log(`   - ${trendingPolls.length} trending polls`)
    
    return true
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
    return false
  }
}

// Auto-initialize when this module is imported (browser only)
if (typeof window !== 'undefined') {
  // Only run on client-side
  initializePollzDatabase().catch(console.error)
}


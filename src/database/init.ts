import { initializeDatabase } from './simple-db'
import { PollzAPI } from './api'

// Initialize database on startup
export async function initializePollzDatabase() {
  try {
    console.log('🚀 Initializing Pollz Database...')
    
    // Initialize the database
    await initializeDatabase()
    
    // Update trending polls
    await PollzAPI.updateTrendingPolls()
    
    console.log('✅ Pollz Database initialized successfully!')
    console.log('📊 Database contains:')
    
    const polls = await PollzAPI.getAllPolls()
    console.log(`   - ${polls.length} polls`)
    
    const trendingPolls = await PollzAPI.getTrendingPolls()
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


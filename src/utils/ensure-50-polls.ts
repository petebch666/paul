// Utility to ensure database has 50 polls
import { generate50Polls } from './generate-polls'

export function ensure50Polls() {
  try {
    const dbData = localStorage.getItem('paul-db')
    
    if (!dbData) {
      console.log('📊 No database found, will be created on first load')
      return
    }
    
    const db = JSON.parse(dbData)
    const currentPollCount = db.polls?.length || 0
    
    console.log(`📊 Current poll count: ${currentPollCount}`)
    
    if (currentPollCount < 50) {
      console.log(`🔄 Regenerating database with 50 polls...`)
      
      // Generate 50 new polls
      const newPolls = generate50Polls()
      db.polls = newPolls
      
      // Save back to localStorage
      localStorage.setItem('paul-db', JSON.stringify(db))
      
      console.log(`✅ Database updated with ${newPolls.length} polls!`)
      console.log('🔄 Reloading page...')
      
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      console.log(`✅ Database has ${currentPollCount} polls - all good!`)
    }
  } catch (error) {
    console.error('❌ Error checking polls:', error)
  }
}

// Auto-run on import
ensure50Polls()


// Utility to reset database and populate with 50 polls
export function resetAndPopulateDatabase() {
  console.log('🔄 Resetting database...')
  
  // Clear localStorage
  localStorage.clear()
  
  console.log('✅ Database cleared')
  console.log('🔄 Refreshing page to reinitialize with 50 polls...')
  
  // Reload page to trigger database initialization
  setTimeout(() => {
    window.location.reload()
  }, 500)
}

// Make available globally in development
if (import.meta.env.DEV) {
  try {
    (window as any).resetAndPopulateDatabase = resetAndPopulateDatabase
    console.log('💡 Run resetAndPopulateDatabase() to reset and create 50 polls')
  } catch (e) {
    // Ignore errors in strict mode
  }
}

export default resetAndPopulateDatabase


// Utility to reset the database
export function resetDatabase() {
  console.log('🔄 Resetting database...')
  localStorage.clear()
  console.log('✅ Database reset complete. Refreshing page in 2 seconds...')
  setTimeout(() => {
    window.location.reload()
  }, 2000)
}

// Auto-run on import in development
if (import.meta.env.DEV) {
  console.log('💡 To reset database, run: resetDatabase()')
  ;(window as any).resetDatabase = resetDatabase
}


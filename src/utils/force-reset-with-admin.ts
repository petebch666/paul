/**
 * Force Reset Database with Admin User
 * Run this to clear everything and create fresh database with admin
 */

export async function forceResetWithAdmin() {
  console.log('🔄 FORCE RESETTING DATABASE...')
  
  // Clear everything
  localStorage.clear()
  sessionStorage.clear()
  
  console.log('✅ Storage cleared')
  console.log('🔄 Refreshing page to initialize with admin user...')
  
  // Refresh after a delay
  setTimeout(() => {
    window.location.reload()
  }, 500)
}

// Make available globally
if (import.meta.env.DEV) {
  (window as any).forceResetWithAdmin = forceResetWithAdmin
  console.log('💡 Run forceResetWithAdmin() to reset database with admin user')
}

export default forceResetWithAdmin


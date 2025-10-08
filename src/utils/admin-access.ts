/**
 * Admin Access Utility
 * Provides easy access to admin dashboard and user data
 */

/**
 * Show all registered users
 */
export function showAllUsers() {
  console.log('👥 REGISTERED USERS')
  console.log('==================')
  
  const dbData = localStorage.getItem('paul-db')
  if (!dbData) {
    console.log('❌ No database found')
    return
  }

  const data = JSON.parse(dbData)
  const users = data.users || []

  if (users.length === 0) {
    console.log('No users registered yet')
    return
  }

  users.forEach((user: any, index: number) => {
    console.log(`\n${index + 1}. ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Username: ${user.username}`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Password Hash: ${user.password?.substring(0, 30)}...`)
    console.log(`   Joined: ${new Date(user.joinDate).toLocaleDateString()}`)
    console.log(`   Polls Created: ${user.pollCount || 0}`)
  })

  console.log(`\n📊 Total Users: ${users.length}`)
}

/**
 * Reset user password (admin only)
 */
export async function resetUserPassword(email: string, newPassword: string) {
  console.log('🔐 RESETTING PASSWORD...')
  
  const dbData = localStorage.getItem('paul-db')
  if (!dbData) {
    console.log('❌ No database found')
    return
  }

  const data = JSON.parse(dbData)
  const user = data.users.find((u: any) => u.email === email)

  if (!user) {
    console.log(`❌ User with email ${email} not found`)
    return
  }

  // Import bcrypt for hashing
  const bcrypt = await import('bcryptjs')
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  user.password = hashedPassword
  localStorage.setItem('paul-db', JSON.stringify(data))

  console.log(`✅ Password reset for ${user.name} (${email})`)
  console.log(`   New password: ${newPassword}`)
  console.log(`   Hash: ${hashedPassword.substring(0, 30)}...`)
}

/**
 * Open admin dashboard
 */
export function openAdminDashboard() {
  console.log('🔓 Opening Admin Dashboard...')
  console.log('Navigating to /admin...')
  
  window.location.href = '/admin'
}

/**
 * Get database statistics
 */
export function getStats() {
  const dbData = localStorage.getItem('paul-db')
  if (!dbData) {
    console.log('❌ No database found')
    return
  }

  const data = JSON.parse(dbData)
  
  const stats = {
    users: data.users?.length || 0,
    polls: data.polls?.length || 0,
    votes: data.polls?.reduce((sum: number, poll: any) => sum + (poll.votes || 0), 0) || 0,
    notifications: data.notifications?.length || 0,
    dbSize: `${(JSON.stringify(data).length / 1024).toFixed(2)} KB`
  }

  console.log('📊 DATABASE STATISTICS')
  console.log('=====================')
  console.log(`Users: ${stats.users}`)
  console.log(`Polls: ${stats.polls}`)
  console.log(`Total Votes: ${stats.votes}`)
  console.log(`Notifications: ${stats.notifications}`)
  console.log(`Database Size: ${stats.dbSize}`)

  return stats
}

/**
 * Export all data
 */
export function exportAllData() {
  const dbData = localStorage.getItem('paul-db')
  if (!dbData) {
    console.log('❌ No database found')
    return
  }

  const data = JSON.parse(dbData)
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pollz-backup-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)

  console.log('✅ Database exported successfully')
}

// Make available globally in development
if (import.meta.env.DEV) {
  try {
    (window as any).showAllUsers = showAllUsers
    (window as any).resetUserPassword = resetUserPassword
    (window as any).openAdminDashboard = openAdminDashboard
    (window as any).getStats = getStats
    (window as any).exportAllData = exportAllData

    console.log('🔑 ADMIN COMMANDS AVAILABLE:')
    console.log('  • showAllUsers() - List all registered users')
    console.log('  • resetUserPassword(email, newPassword) - Reset user password')
    console.log('  • openAdminDashboard() - Open admin dashboard')
    console.log('  • getStats() - Show database statistics')
    console.log('  • exportAllData() - Export database as JSON')
  } catch (e) {
    // Ignore errors in strict mode
  }
}

export default {
  showAllUsers,
  resetUserPassword,
  openAdminDashboard,
  getStats,
  exportAllData
}


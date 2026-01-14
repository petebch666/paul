import React, { useState } from 'react'
import { Home, Plus, User, RotateCcw, Shield } from 'lucide-react'
import '../components/Navigation.css'
import UnifiedPollzAPI from '../database/unified-api'

const PollzAPI = UnifiedPollzAPI

type NavigationPage = 'home' | 'create' | 'profile' | 'admin'

interface NavigationProps {
  currentPage: NavigationPage
  onNavigate: (page: NavigationPage) => void
  onReset?: () => void
  userRole?: 'user' | 'admin'
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate, onReset, userRole }) => {
  const baseNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'create', label: 'Create', icon: Plus },
    { id: 'profile', label: 'Profile', icon: User }
  ] as const

  // Add admin item if user is admin
  const navItems = userRole === 'admin' 
    ? [...baseNavItems, { id: 'admin' as const, label: 'Admin', icon: Shield }]
    : baseNavItems

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <div className="nav-logo">
          <span className="brand-text">PAUL</span>
        </div>
      </div>
      
      <div className="nav-items">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${currentPage === id ? 'active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <Icon className="nav-icon" />
            <span className="nav-label">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

// Separate component for the dev reset button so it can be rendered independently
export const DevResetButton: React.FC<{ onReset?: () => void; userRole?: 'user' | 'admin' }> = ({ onReset, userRole }) => {
  const [isResetting, setIsResetting] = useState(false)

  const handleDevReset = async () => {
    if (isResetting) return

    // Safety check 1: Admin only
    if (userRole !== 'admin') {
      alert('🔒 ACCESS DENIED\n\nThis feature is only available to administrators.')
      return
    }

    // Safety check 2: Production environment
    if (import.meta.env.PROD) {
      alert('⚠️ DISABLED IN PRODUCTION\n\nDevelopment reset is not available in production environments.')
      return
    }
    
    // Two-step confirmation for extra safety
    const firstConfirmation = window.confirm(
      '⚠️ DEVELOPMENT RESET - STEP 1/2\n\n' +
      '🔴 DESTRUCTIVE OPERATION - CANNOT BE UNDONE!\n\n' +
      'This will PERMANENTLY:\n' +
      '• DELETE all votes from database\n' +
      '• RESET all poll statistics to 0\n' +
      '• RESET all polls to expire in 7 days\n' +
      '• RESET user win rates and reputation\n' +
      '• CLEAR all notifications and history\n\n' +
      'Are you ABSOLUTELY sure you want to continue?'
    )
    
    if (!firstConfirmation) return

    // Second confirmation with typing requirement
    const secondConfirmation = window.prompt(
      '⚠️ DEVELOPMENT RESET - STEP 2/2\n\n' +
      'Type "RESET" (all caps) to confirm this destructive operation:'
    )
    
    if (secondConfirmation !== 'RESET') {
      if (secondConfirmation !== null) {
        alert('❌ Confirmation failed. Reset cancelled.')
      }
      return
    }

    setIsResetting(true)
    const startTime = Date.now()
    
    try {
      console.log('🚨 DEV RESET INITIATED by admin')
      console.log('📅 Timestamp:', new Date().toISOString())
      
      await PollzAPI.resetPollsForDevelopment()
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      console.log(`✅ Reset completed in ${duration}s`)
      
      alert(
        '✅ DEVELOPMENT RESET SUCCESSFUL!\n\n' +
        `Completed in ${duration} seconds.\n\n` +
        'All polls and votes have been reset.\n' +
        'The page will now reload to reflect changes.'
      )
      
      // Notify parent component to refresh data
      if (onReset) {
        onReset()
      }
      
      // Reload the page to refresh all data
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error('❌ Reset failed:', error)
      alert(
        '❌ RESET FAILED!\n\n' +
        'Error: ' + (error instanceof Error ? error.message : 'Unknown error') + '\n\n' +
        'Please check the console for details.'
      )
    } finally {
      setIsResetting(false)
    }
  }

  // Hide button if not admin
  if (userRole !== 'admin') {
    return null
  }

  return (
    <button
      className="dev-reset-button"
      onClick={handleDevReset}
      disabled={isResetting}
      title="Development: Reset all polls and statistics (ADMIN ONLY)"
    >
      <RotateCcw className={isResetting ? 'spinning' : ''} size={18} />
      <span>{isResetting ? 'RESETTING...' : 'DEV RESET'}</span>
    </button>
  )
}

// Separate component for generating additional polls
export const DevGeneratePollsButton: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGeneratePolls = async () => {
    if (isGenerating) return
    
    const confirmed = window.confirm(
      '➕ GENERATE 50 POLLS\n\n' +
      'This will create:\n' +
      '• 25 polls for Admin user\n' +
      '• 25 polls for other users\n' +
      '• All polls will be active (1-7 days left)\n\n' +
      'User poll counts will be updated.\n\n' +
      'Continue?'
    )
    
    if (!confirmed) return

    setIsGenerating(true)
    try {
      await PollzAPI.generate50AdditionalPolls()
      
      alert(
        '✅ 50 polls generated successfully!\n\n' +
        '📊 Check console (F12) for detailed breakdown:\n' +
        '• Polls by author\n' +
        '• Active vs Expired counts\n' +
        '• Total polls in database\n\n' +
        'Page will reload to show new polls...'
      )
      
      // Reload the page to show new polls
      window.location.reload()
    } catch (error) {
      console.error('Generate polls failed:', error)
      alert('❌ Failed to generate polls. Please check the console for details.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button
      className="dev-generate-button"
      onClick={handleGeneratePolls}
      disabled={isGenerating}
      title="Development: Generate 50 additional polls"
    >
      <Plus className={isGenerating ? 'spinning' : ''} size={18} />
      <span>GEN POLLS</span>
    </button>
  )
}

export default Navigation


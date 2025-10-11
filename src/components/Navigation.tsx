import React, { useState } from 'react'
import { Home, Plus, User, RotateCcw } from 'lucide-react'
import '../components/Navigation.css'
import PollzAPI from '../database/api'

type NavigationPage = 'home' | 'create' | 'profile'

interface NavigationProps {
  currentPage: NavigationPage
  onNavigate: (page: NavigationPage) => void
  onReset?: () => void
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate, onReset }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'create', label: 'Create', icon: Plus },
    { id: 'profile', label: 'Profile', icon: User }
  ] as const

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
export const DevResetButton: React.FC<{ onReset?: () => void }> = ({ onReset }) => {
  const [isResetting, setIsResetting] = useState(false)

  const handleDevReset = async () => {
    if (isResetting) return
    
    const confirmed = window.confirm(
      '⚠️ DEVELOPMENT RESET\n\n' +
      'This will reset:\n' +
      '• All poll votes and statistics\n' +
      '• All polls to "Last" category (7 days left)\n' +
      '• User win rate and reputation\n' +
      '• Poll history and notifications\n\n' +
      'Poll count will be preserved.\n\n' +
      'Are you sure you want to continue?'
    )
    
    if (!confirmed) return

    setIsResetting(true)
    try {
      await PollzAPI.resetPollsForDevelopment()
      alert('✅ Development reset successful!\n\nAll polls have been reset to their initial state.')
      
      // Notify parent component to refresh data
      if (onReset) {
        onReset()
      }
      
      // Reload the page to refresh all data
      window.location.reload()
    } catch (error) {
      console.error('Reset failed:', error)
      alert('❌ Reset failed. Please check the console for details.')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <button
      className="dev-reset-button"
      onClick={handleDevReset}
      disabled={isResetting}
      title="Development: Reset all polls and statistics"
    >
      <RotateCcw className={isResetting ? 'spinning' : ''} size={18} />
      <span>DEV RESET</span>
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


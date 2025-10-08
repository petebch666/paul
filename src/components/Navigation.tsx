import React from 'react'
import { Home, Plus, TrendingUp, User } from 'lucide-react'
import { NavigationProps } from '../types'
import '../components/Navigation.css'

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'create', label: 'Create', icon: Plus },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User }
  ] as const

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <div className="nav-logo">
          <div className="red-dot"></div>
          <span className="brand-text">POLLZ</span>
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
      
      <div className="nav-footer">
        <div className="red-dot-large"></div>
      </div>
    </nav>
  )
}

export default Navigation


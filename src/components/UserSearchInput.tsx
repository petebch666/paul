import React, { useState, useEffect, useRef } from 'react'
import { IonIcon, IonSpinner } from '@ionic/react'
import { searchOutline, personOutline, closeCircle } from 'ionicons/icons'
import { User } from '../types'
import UnifiedPollzAPI from '../database/unified-api'
import './UserSearchInput.css'

const PollzAPI = UnifiedPollzAPI

interface UserSearchInputProps {
  label: string
  value?: string  // Selected user ID
  onChange: (userId: string | undefined) => void
  placeholder?: string
  excludeUserId?: string  // User to exclude from results (current user)
}

const UserSearchInput: React.FC<UserSearchInputProps> = ({
  label,
  value,
  onChange,
  placeholder = "@username or name",
  excludeUserId
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load selected user if value is provided
  useEffect(() => {
    if (value && !selectedUser) {
      loadUserById(value)
    } else if (!value && selectedUser) {
      setSelectedUser(null)
    }
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadUserById = async (userId: string) => {
    try {
      const user = await PollzAPI.getUserById(userId)
      if (user) {
        setSelectedUser(user)
      }
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const handleSearch = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      // Remove @ symbol if present
      const cleanQuery = query.replace(/^@/, '')
      const results = await PollzAPI.searchUsers(cleanQuery, 10)
      
      // Filter out excluded user
      const filteredResults = excludeUserId 
        ? results.filter(user => user.id !== excludeUserId)
        : results
      
      setSearchResults(filteredResults)
      setShowDropdown(true)
    } catch (error) {
      console.error('Error searching users:', error)
      setError('Failed to search users')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (query.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(query)
      }, 300)
    } else {
      setSearchResults([])
      setShowDropdown(false)
    }
  }

  const handleSelectUser = (user: User) => {
    setSelectedUser(user)
    setSearchQuery('')
    setSearchResults([])
    setShowDropdown(false)
    onChange(user.id)
  }

  const handleRemoveUser = () => {
    setSelectedUser(null)
    setSearchQuery('')
    onChange(undefined)
  }

  return (
    <div className="user-search-input">
      <div className="search-label">{label}</div>
      
      {selectedUser ? (
        // Show selected user chip
        <div className="selected-user-chip">
          <img src={selectedUser.avatar} alt={selectedUser.name} className="user-avatar-small" />
          <span className="user-name-small">{selectedUser.name}</span>
          <span className="user-username-small">{selectedUser.username}</span>
          <button
            type="button"
            className="remove-user-btn"
            onClick={handleRemoveUser}
            title="Remove user"
          >
            <IonIcon icon={closeCircle} />
          </button>
        </div>
      ) : (
        // Show search input
        <div className="search-input-wrapper" ref={dropdownRef}>
          <div className="search-input-container">
            <IonIcon icon={searchOutline} className="search-icon" />
            <input
              type="text"
              className="search-input"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
              placeholder={placeholder}
            />
            {isSearching && (
              <IonSpinner name="circular" className="search-spinner" />
            )}
          </div>

          {/* Dropdown with search results */}
          {showDropdown && searchResults.length > 0 && (
            <div className="search-dropdown">
              {searchResults.map(user => (
                <div
                  key={user.id}
                  className="search-result-item"
                  onClick={() => handleSelectUser(user)}
                >
                  <img src={user.avatar} alt={user.name} className="result-avatar" />
                  <div className="result-info">
                    <div className="result-name">{user.name}</div>
                    <div className="result-username">{user.username}</div>
                  </div>
                  <IonIcon icon={personOutline} className="result-icon" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="search-error">{error}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default UserSearchInput

import React, { useState } from 'react'
import { User, Badge, Poll } from '../types'
import { Crown, Target, Trophy, Star, Plus, Users } from 'lucide-react'
import PollCard from '../components/PollCard'
import '../pages/ProfilePage.css'

interface ProfilePageProps {
  user: User
  polls: Poll[]
  onVote: (pollId: string, option: 'A' | 'B') => void
  onLike: (pollId: string) => void
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, polls, onVote, onLike }) => {
  const [activeTab, setActiveTab] = useState<'polls' | 'badges' | 'stats'>('polls')
  
  const userPolls = polls.filter(poll => poll.authorId === user.id || poll.author === user.name)
  
  const badgeIcons: { [key: string]: React.ReactNode } = {
    Crown: <Crown className="badge-icon-component" />,
    Target: <Target className="badge-icon-component" />,
    Trophy: <Trophy className="badge-icon-component" />,
    Star: <Star className="badge-icon-component" />,
    Plus: <Plus className="badge-icon-component" />,
    Users: <Users className="badge-icon-component" />
  }

  const getReputationLevel = (reputation: number) => {
    if (reputation >= 5000) return { level: 'Legendary', color: '#ff0000' }
    if (reputation >= 2000) return { level: 'Master', color: '#800080' }
    if (reputation >= 1000) return { level: 'Expert', color: '#0000ff' }
    if (reputation >= 500) return { level: 'Advanced', color: '#008000' }
    if (reputation >= 100) return { level: 'Intermediate', color: '#ffa500' }
    return { level: 'Beginner', color: '#808080' }
  }

  const reputationLevel = getReputationLevel(user.reputation)

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1 className="pixelated">PROFILE</h1>
        <p>YOUR DEBATE JOURNEY</p>
      </div>

      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar-section">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="profile-main-avatar"
            />
            <div className="reputation-badge">
              <div className="reputation-icon">🏆</div>
              <div className="reputation-level" style={{ color: reputationLevel.color }}>
                {reputationLevel.level}
              </div>
            </div>
          </div>
          
          <div className="profile-info">
            <h2 className="username">{user.name}</h2>
            <p className="join-date">Joined {user.joinDate.toLocaleDateString()}</p>
            
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-number">{user.pollCount}</span>
                <span className="stat-label">Polls Created</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{Math.round(user.winRate * 100)}%</span>
                <span className="stat-label">Win Rate</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{user.reputation}</span>
                <span className="stat-label">Reputation</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{user.followers}</span>
                <span className="stat-label">Followers</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'polls' ? 'active' : ''}`}
            onClick={() => setActiveTab('polls')}
          >
            My Polls ({userPolls.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'badges' ? 'active' : ''}`}
            onClick={() => setActiveTab('badges')}
          >
            Badges ({user.badges.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'polls' && (
            <div className="polls-section">
              <h3>My Polls</h3>
              <div className="polls-grid">
                {userPolls.length > 0 ? (
                  userPolls.map(poll => (
                    <PollCard
                      key={poll.id}
                      poll={poll}
                      onVote={onVote}
                      onLike={onLike}
                      currentUser={user}
                    />
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No polls created yet. Start a debate!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="badges-section">
              <h3>Achievement Badges</h3>
              <div className="badges-grid">
                {user.badges.map(badge => (
                  <div key={badge.id} className={`badge-card ${badge.rarity}`}>
                    <div className="badge-icon">
                      {badgeIcons[badge.icon] || <Star className="badge-icon-component" />}
                    </div>
                    <div className="badge-info">
                      <h4 className="badge-name">{badge.name}</h4>
                      <p className="badge-description">{badge.description}</p>
                      <span className="badge-date">
                        Earned {badge.earnedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="stats-section">
              <h3>Detailed Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Debate Performance</h4>
                  <div className="stat-details">
                    <div className="stat-row">
                      <span>Total Debates</span>
                      <span>{userPolls.reduce((sum, poll) => sum + (poll.debateHistory?.totalDebates || 0), 0)}</span>
                    </div>
                    <div className="stat-row">
                      <span>Wins</span>
                      <span>{userPolls.reduce((sum, poll) => sum + (poll.debateHistory?.creatorWins || 0), 0)}</span>
                    </div>
                    <div className="stat-row">
                      <span>Losses</span>
                      <span>{userPolls.reduce((sum, poll) => sum + (poll.debateHistory?.opponentWins || 0), 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <h4>Engagement</h4>
                  <div className="stat-details">
                    <div className="stat-row">
                      <span>Total Votes Received</span>
                      <span>{userPolls.reduce((sum, poll) => sum + poll.votes, 0)}</span>
                    </div>
                    <div className="stat-row">
                      <span>Average Votes per Poll</span>
                      <span>{userPolls.length > 0 ? Math.round(userPolls.reduce((sum, poll) => sum + poll.votes, 0) / userPolls.length) : 0}</span>
                    </div>
                    <div className="stat-row">
                      <span>Most Popular Category</span>
                      <span>{userPolls.length > 0 ? userPolls.reduce((acc, poll) => {
                        acc[poll.category] = (acc[poll.category] || 0) + 1
                        return acc
                      }, {} as { [key: string]: number }) ? Object.entries(userPolls.reduce((acc, poll) => {
                        acc[poll.category] = (acc[poll.category] || 0) + 1
                        return acc
                      }, {} as { [key: string]: number })).sort(([,a], [,b]) => b - a)[0][0] : 'None' : 'None'}</span>
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <h4>Community</h4>
                  <div className="stat-details">
                    <div className="stat-row">
                      <span>Followers</span>
                      <span>{user.followers}</span>
                    </div>
                    <div className="stat-row">
                      <span>Following</span>
                      <span>{user.following}</span>
                    </div>
                    <div className="stat-row">
                      <span>Reputation Level</span>
                      <span style={{ color: reputationLevel.color }}>{reputationLevel.level}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage


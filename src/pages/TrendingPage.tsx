import React, { useState, useEffect } from 'react'
import { TrendingUp, RefreshCw, Zap } from 'lucide-react'
import PollCard from '../components/PollCard'
import { Poll, User } from '../types'
import '../pages/TrendingPage.css'

interface TrendingPageProps {
  polls: Poll[]
  user: User
  onVote: (pollId: string, option: 'A' | 'B') => void
  onLike: (pollId: string) => void
}

const TrendingPage: React.FC<TrendingPageProps> = ({ polls, user, onVote, onLike }) => {
  const [trendingPolls, setTrendingPolls] = useState<Poll[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // Sort polls by trending score and take top polls
    const sorted = [...polls]
      .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0))
      .slice(0, 10)
    setTrendingPolls(sorted)
  }, [polls])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Recalculate trending scores (mock)
    const updatedPolls = polls.map(poll => ({
      ...poll,
      trendingScore: Math.random() * 100
    }))
    
    const sorted = [...updatedPolls]
      .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0))
      .slice(0, 10)
    
    setTrendingPolls(sorted)
    setRefreshing(false)
  }

  return (
    <div className="trending-page">
      <div className="page-header">
        <h1 className="pixelated">TRENDING POLLS</h1>
        <p>SEE WHAT'S HOT RIGHT NOW</p>
      </div>

      <div className="trending-content">
        <div className="trending-header">
          <div className="trending-info">
            <TrendingUp className="trending-icon" />
            <div className="trending-details">
              <h2>TRENDING ALGORITHM</h2>
              <p>Based on vote velocity, engagement rate, and category boost</p>
            </div>
          </div>
          <button 
            onClick={handleRefresh}
            className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
            disabled={refreshing}
          >
            <RefreshCw className="refresh-icon" />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="trending-polls-section">
          <div className="trending-polls-grid">
            {trendingPolls.map((poll, index) => (
              <div key={poll.id} className="trending-poll-card">
                <div className="trending-rank">
                  <span className="rank-number">#{index + 1}</span>
                  <Zap className="trending-icon" />
                </div>
                
                <div className="trending-content-main">
                  <div className="trending-metrics">
                    <div className="metric-item">
                      <span className="metric-label">Trending Score</span>
                      <span className="metric-value">
                        {Math.round(poll.trendingScore || 0)}
                      </span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Votes</span>
                      <span className="metric-value">{poll.votes}</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Category</span>
                      <span className="trending-category">{poll.category}</span>
                    </div>
                  </div>
                </div>

                <PollCard
                  poll={poll}
                  onVote={onVote}
                  onLike={onLike}
                  currentUser={user}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="suggestions-section">
          <h3>POLL SUGGESTIONS</h3>
          <button className="refresh-suggestions-btn">
            <RefreshCw className="refresh-icon" />
            Get New Suggestions
          </button>
          
          <div className="suggestions-grid">
            {trendingPolls.slice(0, 3).map((poll, index) => (
              <div key={poll.id} className="suggestion-card">
                <div className="suggestion-reason">
                  <Zap className="reason-icon" />
                  <span>Hot in {poll.category}</span>
                </div>
                <h4>{poll.title}</h4>
                <div className="suggestion-stats">
                  <span>{poll.votes} votes</span>
                  <span>{Math.round(poll.trendingScore || 0)} trending</span>
                </div>
                <div className="suggestion-actions">
                  <button 
                    onClick={() => onVote(poll.id, 'A')}
                    disabled={poll.isVoted}
                    className="suggestion-vote-btn"
                  >
                    Vote A
                  </button>
                  <button 
                    onClick={() => onVote(poll.id, 'B')}
                    disabled={poll.isVoted}
                    className="suggestion-vote-btn"
                  >
                    Vote B
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrendingPage


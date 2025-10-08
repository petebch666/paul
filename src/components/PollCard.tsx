import React from 'react'
import { PollCardProps } from '../types'
import '../components/PollCard.css'

const PollCard: React.FC<PollCardProps> = ({ poll, onVote, onLike, currentUser }) => {
  const handleVote = (option: 'A' | 'B') => {
    onVote(poll.id, option)
  }

  const handleLike = () => {
    onLike(poll.id)
  }

  const isCreator = poll.author === currentUser.name
  const showResults = poll.isVoted && !isCreator

  return (
    <div className="poll-card" data-poll-id={poll.id}>
      <div className="poll-header">
        <span className="poll-category">{poll.category}</span>
        <span className="poll-time">{poll.timeLeft}</span>
      </div>
      
      <h3 className="poll-title">{poll.title}</h3>
      
      <div className="poll-options-simple">
        <button 
          className={`option-btn option-a ${poll.isVoted ? 'voted' : ''}`}
          onClick={() => handleVote('A')}
          disabled={poll.isVoted}
        >
          <div className="option-content">
            <div className="option-text">
              {poll.arguments?.optionA || 'Option A'}
            </div>
            {showResults && (
              <div className="vote-results">
                <div className="vote-percentage">
                  {Math.round((poll.votesOptionA / poll.votes) * 100)}%
                </div>
                <div className="vote-count">{poll.votesOptionA} votes</div>
              </div>
            )}
          </div>
        </button>
        
        <div className="vs-divider">VS</div>
        
        <button 
          className={`option-btn option-b ${poll.isVoted ? 'voted' : ''}`}
          onClick={() => handleVote('B')}
          disabled={poll.isVoted}
        >
          <div className="option-content">
            <div className="option-text">
              {poll.arguments?.optionB || 'Option B'}
            </div>
            {showResults && (
              <div className="vote-results">
                <div className="vote-percentage">
                  {Math.round((poll.votesOptionB / poll.votes) * 100)}%
                </div>
                <div className="vote-count">{poll.votesOptionB} votes</div>
              </div>
            )}
          </div>
        </button>
      </div>
      
      <div className="poll-stats-simple">
        <span className="poll-votes">{poll.votes} VOTES</span>
        <span className="poll-author-name">{poll.author}</span>
      </div>
    </div>
  )
}

export default PollCard


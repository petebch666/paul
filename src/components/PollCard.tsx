import React from 'react'
import { 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonButton,
  IonChip,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react'
import { PollCardProps } from '../types'

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
    <div className="poll-card-minimal" data-poll-id={poll.id}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <IonChip color="primary" style={{ fontSize: '9px' }}>{poll.category}</IonChip>
        <IonBadge color="light" style={{ fontSize: '9px' }}>{poll.timeLeft}</IonBadge>
      </div>
      <div className="poll-title">
        {poll.title}
      </div>
      
      <div className="poll-options">
        <button 
          className={`option-button ${poll.isVoted && poll.votesOptionA > poll.votesOptionB ? 'selected' : ''}`}
          onClick={() => handleVote('A')}
          disabled={poll.isVoted}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '11px',
              fontWeight: '400',
              marginBottom: '4px'
            }}>
              {poll.arguments?.optionA || 'Option A'}
            </div>
            {showResults && (
              <div style={{ fontSize: '9px', color: '#666666' }}>
                {Math.round((poll.votesOptionA / poll.votes) * 100)}%
                <br />
                {poll.votesOptionA} votes
              </div>
            )}
          </div>
        </button>
        
        <div className="vs-divider">VS</div>
        
        <button 
          className={`option-button ${poll.isVoted && poll.votesOptionB > poll.votesOptionA ? 'selected' : ''}`}
          onClick={() => handleVote('B')}
          disabled={poll.isVoted}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '11px',
              fontWeight: '400',
              marginBottom: '4px'
            }}>
              {poll.arguments?.optionB || 'Option B'}
            </div>
            {showResults && (
              <div style={{ fontSize: '9px', color: '#666666' }}>
                {Math.round((poll.votesOptionB / poll.votes) * 100)}%
                <br />
                {poll.votesOptionB} votes
              </div>
            )}
          </div>
        </button>
      </div>
        
      <div className="poll-stats">
        <span>{poll.votes} VOTES</span>
        <span>by {poll.author}</span>
      </div>
    </div>
  )
}

export default PollCard


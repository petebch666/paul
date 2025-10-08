import React, { useState, useRef, useEffect } from 'react'
import { IonCard, IonChip, IonBadge, IonIcon } from '@ionic/react'
import { thumbsUp, thumbsDown, checkmark, close } from 'ionicons/icons'
import { Poll, User } from '../types'

interface SwipePollCardProps {
  poll: Poll
  onVote: (pollId: string, option: 'A' | 'B') => void
  user: User
  onLike: (pollId: string) => void
  isActive?: boolean
  onVoteComplete?: () => void
  'data-poll-index'?: number
  style?: React.CSSProperties
}

const SwipePollCard: React.FC<SwipePollCardProps> = ({ 
  poll, 
  onVote, 
  user, 
  onLike,
  isActive = true,
  onVoteComplete,
  'data-poll-index': dataPollIndex,
  style
}) => {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [voteDirection, setVoteDirection] = useState<'A' | 'B' | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [hasVoted, setHasVoted] = useState(poll.isVoted)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const startPos = useRef({ x: 0, y: 0 })

  // Update hasVoted when poll changes
  useEffect(() => {
    setHasVoted(poll.isVoted)
  }, [poll.isVoted])

  const isCreator = poll.author === user.name
  const canVote = !hasVoted && !isCreator && isActive

  // Debug logging for swipe issues
  useEffect(() => {
    console.log(`Poll "${poll.title}":`, {
      hasVoted,
      isCreator,
      isActive,
      canVote,
      pollAuthor: poll.author,
      userName: user.name
    })
  }, [poll.title, hasVoted, isCreator, isActive, canVote, poll.author, user.name])

  // Touch event handlers with improved scroll detection
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!canVote) {
      console.log(`Cannot vote on "${poll.title}": hasVoted=${hasVoted}, isCreator=${isCreator}, isActive=${isActive}`)
      return
    }
    const touch = e.touches[0]
    startPos.current = { x: touch.clientX, y: touch.clientY }
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!canVote || !isDragging) return
    const touch = e.touches[0]
    const deltaX = touch.clientX - startPos.current.x
    const deltaY = touch.clientY - startPos.current.y
    
    // Only start swipe if horizontal movement is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      e.preventDefault() // Prevent scroll when swiping
      setDragOffset({ x: deltaX, y: 0 })
      
      // Determine vote direction based on swipe
      // Swipe LEFT (negative) = Option A (left), Swipe RIGHT (positive) = Option B (right)
      if (Math.abs(deltaX) > 50) {
        setVoteDirection(deltaX > 0 ? 'B' : 'A')
      } else {
        setVoteDirection(null)
      }
    }
  }

  const handleTouchEnd = () => {
    if (!canVote || !isDragging) return
    
    const swipeThreshold = 100
    const isSwipeLeft = dragOffset.x < -swipeThreshold
    const isSwipeRight = dragOffset.x > swipeThreshold
    
    if (isSwipeLeft || isSwipeRight) {
      // Swipe LEFT = Option A (left), Swipe RIGHT = Option B (right)
      const vote = isSwipeLeft ? 'A' : 'B'
      handleVote(vote)
    } else {
      // Reset position if not enough swipe
      setDragOffset({ x: 0, y: 0 })
      setVoteDirection(null)
    }
    
    setIsDragging(false)
  }

  // Mouse event handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canVote) return
    startPos.current = { x: e.clientX, y: e.clientY }
    setIsDragging(true)
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canVote || !isDragging) return
    const deltaX = e.clientX - startPos.current.x
    const deltaY = e.clientY - startPos.current.y
    
    setDragOffset({ x: deltaX, y: deltaY })
    
    // Swipe LEFT (negative) = Option A (left), Swipe RIGHT (positive) = Option B (right)
    if (Math.abs(deltaX) > 50) {
      setVoteDirection(deltaX > 0 ? 'B' : 'A')
    } else {
      setVoteDirection(null)
    }
  }

  const handleMouseUp = () => {
    if (!canVote || !isDragging) return
    
    const swipeThreshold = 100
    const isSwipeLeft = dragOffset.x < -swipeThreshold
    const isSwipeRight = dragOffset.x > swipeThreshold
    
    if (isSwipeLeft || isSwipeRight) {
      // Swipe LEFT = Option A (left), Swipe RIGHT = Option B (right)
      const vote = isSwipeLeft ? 'A' : 'B'
      handleVote(vote)
    } else {
      setDragOffset({ x: 0, y: 0 })
      setVoteDirection(null)
    }
    
    setIsDragging(false)
  }

  const handleVote = async (option: 'A' | 'B') => {
    if (hasVoted) return
    
    setHasVoted(true)
    setShowResults(true)
    
    // Call the vote function
    onVote(poll.id, option)
    
    // Trigger completion callback after animation
    setTimeout(() => {
      onVoteComplete?.()
    }, 1500)
  }

  // Click handlers for direct voting
  const handleOptionClick = (option: 'A' | 'B') => {
    if (canVote) {
      handleVote(option)
    }
  }

  // Keyboard navigation for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!canVote) return
      
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handleVote('B')
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleVote('A')
      }
    }

    if (canVote) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [canVote])

  // Calculate transform and opacity based on drag
  const getCardTransform = () => {
    const rotate = dragOffset.x * 0.1
    const scale = isDragging ? 0.95 : 1
    return `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotate}deg) scale(${scale})`
  }

  const getCardOpacity = () => {
    if (isDragging) {
      const opacity = 1 - Math.abs(dragOffset.x) / 300
      return Math.max(0.7, opacity)
    }
    return 1
  }

  return (
    <div 
      ref={cardRef}
      className="swipe-poll-card"
      data-poll-index={dataPollIndex}
      style={{
        transform: getCardTransform(),
        opacity: getCardOpacity(),
        transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        zIndex: isDragging ? 100 : 1, // Bring to front when dragging
        margin: '8px auto',
        padding: '24px',
        background: isHovered ? '#000000' : '#ffffff',
        border: '3px solid #000000',
        borderRadius: '0',
        cursor: canVote ? (isDragging ? 'grabbing' : 'grab') : 'default',
        userSelect: 'none',
        touchAction: 'pan-y pinch-zoom', // Allow vertical scroll, prevent horizontal interference
        maxWidth: '600px',
        width: '100%',
        boxSizing: 'border-box',
        isolation: 'isolate', // Create new stacking context for each card
        color: isHovered ? '#ffffff' : '#000000',
        boxShadow: isHovered ? '0 8px 16px rgba(0, 0, 0, 0.3)' : 'none',
        ...style
      }}
      onTouchStart={(e) => {
        setIsHovered(true)
        handleTouchStart(e)
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={(e) => {
        setIsHovered(false)
        handleTouchEnd()
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={(e) => {
        setIsHovered(false)
        handleMouseUp()
      }}
      onMouseEnter={() => setIsHovered(true)}
    >
      {/* Vote direction indicators */}
      {isDragging && voteDirection && (
        <>
          {/* Thumbs UP for chosen option */}
          <div 
            className={`vote-indicator chosen`}
            style={{
              position: 'absolute',
              top: '50%',
              [voteDirection === 'A' ? 'left' : 'right']: '20px',
              transform: 'translateY(-50%)',
              fontSize: '48px',
              fontWeight: '700',
              color: '#00ff00',
              opacity: Math.min(1, Math.abs(dragOffset.x) / 100),
              zIndex: 10
            }}
          >
            👍
          </div>
          
          {/* Thumbs DOWN for rejected option */}
          <div 
            className={`vote-indicator rejected`}
            style={{
              position: 'absolute',
              top: '50%',
              [voteDirection === 'A' ? 'right' : 'left']: '20px',
              transform: 'translateY(-50%)',
              fontSize: '48px',
              fontWeight: '700',
              color: '#ff0000',
              opacity: Math.min(0.5, Math.abs(dragOffset.x) / 150),
              zIndex: 10
            }}
          >
            👎
          </div>
        </>
      )}

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <IonChip 
          color="primary" 
          style={{ 
            fontSize: '10px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          {poll.category}
        </IonChip>
        <IonBadge 
          color="light" 
          style={{ 
            fontSize: '10px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          {poll.timeLeft}
        </IonBadge>
      </div>

      {/* Question */}
      <div 
        className="poll-title"
        style={{
          fontFamily: 'Courier New, Courier, monospace',
          fontWeight: '700',
          fontSize: '18px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          color: isHovered ? '#ffffff' : '#000000',
          marginBottom: '24px',
          lineHeight: '1.2',
          textAlign: 'center'
        }}
      >
        {poll.title}
      </div>

      {/* Context */}
      {poll.context && (
        <div 
          style={{
            fontFamily: 'Courier New, Courier, monospace',
            fontSize: '12px',
            color: isHovered ? '#cccccc' : '#666666',
            marginBottom: '24px',
            textAlign: 'center',
            fontStyle: 'italic'
          }}
        >
          "{poll.context}"
        </div>
      )}

      {/* Options */}
      <div 
        className="poll-options"
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        {/* Option A */}
        <div 
          className={`option-container ${voteDirection === 'A' ? 'highlight' : ''} ${hasVoted && poll.votesOptionA > poll.votesOptionB ? 'winning' : ''}`}
          style={{
            flex: 1,
            padding: '20px',
            background: voteDirection === 'A' ? '#0066ff' : (isHovered ? '#333333' : '#ffffff'),
            border: isHovered ? '3px solid #ffffff' : '3px solid #000000',
            cursor: canVote ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            position: 'relative',
            textAlign: 'center'
          }}
          onClick={() => handleOptionClick('A')}
        >
          {hasVoted && poll.votesOptionA > poll.votesOptionB && (
            <IonIcon 
              icon={checkmark} 
              style={{ 
                position: 'absolute',
                top: '8px',
                right: '8px',
                fontSize: '20px',
                color: '#000000'
              }} 
            />
          )}
          
          <div 
            style={{
              fontSize: '13px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: voteDirection === 'A' ? '#ffffff' : (isHovered ? '#ffffff' : '#000000'),
              marginBottom: '8px'
            }}
          >
            {poll.arguments?.optionA || 'Option A'}
          </div>
          
          {showResults && (
            <div 
              style={{
                fontSize: '16px',
                fontWeight: '700',
                color: voteDirection === 'A' ? '#ffffff' : '#000000'
              }}
            >
              {Math.round((poll.votesOptionA / poll.votes) * 100)}%
              <div style={{ fontSize: '10px', opacity: 0.8 }}>
                {poll.votesOptionA} votes
              </div>
            </div>
          )}
        </div>

        {/* VS Divider */}
        <div 
          className="vs-divider"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Courier New, Courier, monospace',
            fontWeight: '700',
            fontSize: '14px',
            color: '#000000',
            textTransform: 'uppercase',
            letterSpacing: '3px'
          }}
        >
          VS
        </div>

        {/* Option B */}
        <div 
          className={`option-container ${voteDirection === 'B' ? 'highlight' : ''} ${hasVoted && poll.votesOptionB > poll.votesOptionA ? 'winning' : ''}`}
          style={{
            flex: 1,
            padding: '20px',
            background: voteDirection === 'B' ? '#ff0000' : (isHovered ? '#333333' : '#ffffff'),
            border: isHovered ? '3px solid #ffffff' : '3px solid #000000',
            cursor: canVote ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            position: 'relative',
            textAlign: 'center'
          }}
          onClick={() => handleOptionClick('B')}
        >
          {hasVoted && poll.votesOptionB > poll.votesOptionA && (
            <IonIcon 
              icon={checkmark} 
              style={{ 
                position: 'absolute',
                top: '8px',
                right: '8px',
                fontSize: '20px',
                color: '#000000'
              }} 
            />
          )}
          
          <div 
            style={{
              fontSize: '13px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: voteDirection === 'B' ? '#ffffff' : (isHovered ? '#ffffff' : '#000000'),
              marginBottom: '8px'
            }}
          >
            {poll.arguments?.optionB || 'Option B'}
          </div>
          
          {showResults && (
            <div 
              style={{
                fontSize: '16px',
                fontWeight: '700',
                color: voteDirection === 'B' ? '#ffffff' : '#000000'
              }}
            >
              {Math.round((poll.votesOptionB / poll.votes) * 100)}%
              <div style={{ fontSize: '10px', opacity: 0.8 }}>
                {poll.votesOptionB} votes
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div 
        className="poll-stats"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '16px',
          borderTop: '2px solid #000000',
          fontFamily: 'Courier New, Courier, monospace',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: '#000000',
          fontWeight: '700'
        }}
      >
        <span>{poll.votes} VOTES</span>
        <span>by {poll.author}</span>
      </div>

      {/* Instruction overlay */}
      {canVote && !isDragging && (
        <div 
          style={{
            position: 'absolute',
            bottom: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            color: '#666666',
            textAlign: 'center',
            fontFamily: 'Courier New, Courier, monospace',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          <div>SWIPE LEFT OR RIGHT TO VOTE</div>
          <div style={{ fontSize: '8px', marginTop: '4px', opacity: 0.7 }}>
            DESKTOP: CLICK, DRAG, OR USE ARROW KEYS
          </div>
        </div>
      )}
    </div>
  )
}

export default SwipePollCard

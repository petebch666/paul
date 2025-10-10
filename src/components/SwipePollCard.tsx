import React, { useState, useRef, useEffect } from 'react'
import { IonCard, IonChip, IonBadge, IonIcon } from '@ionic/react'
import { 
  thumbsUp, 
  thumbsDown, 
  checkmark, 
  close, 
  timeOutline, 
  hourglassOutline,
  fastFoodOutline,
  laptopOutline,
  heartOutline,
  briefcaseOutline,
  gameControllerOutline,
  musicalNotesOutline,
  schoolOutline,
  fitnessOutline,
  globeOutline
} from 'ionicons/icons'
import { Poll, User } from '../types'

// Category icon mapping
const getCategoryIcon = (category: string): string => {
  const categoryLower = category.toLowerCase()
  if (categoryLower.includes('food')) return fastFoodOutline
  if (categoryLower.includes('tech') || categoryLower.includes('programming')) return laptopOutline
  if (categoryLower.includes('lifestyle') || categoryLower.includes('life')) return heartOutline
  if (categoryLower.includes('work') || categoryLower.includes('business')) return briefcaseOutline
  if (categoryLower.includes('entertainment') || categoryLower.includes('game')) return gameControllerOutline
  if (categoryLower.includes('music')) return musicalNotesOutline
  if (categoryLower.includes('education') || categoryLower.includes('learning')) return schoolOutline
  if (categoryLower.includes('health') || categoryLower.includes('fitness')) return fitnessOutline
  return globeOutline // Default icon
}

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
  const [showResults, setShowResults] = useState(poll.isExpired || poll.isVoted)
  const [hasVoted, setHasVoted] = useState(poll.isVoted)
  const [isHovered, setIsHovered] = useState(false)
  const [justVoted, setJustVoted] = useState(false)
  const [isDisappearing, setIsDisappearing] = useState(false)
  const [gaugeProgress, setGaugeProgress] = useState(poll.isVoted || poll.isExpired ? 100 : 0) // Start at 100 if already voted
  const cardRef = useRef<HTMLDivElement>(null)
  const startPos = useRef({ x: 0, y: 0 })

  // Update hasVoted and showResults when poll changes
  useEffect(() => {
    setHasVoted(poll.isVoted)
    setShowResults(poll.isExpired || poll.isVoted)
    // If poll is already voted, set gauge to 100% immediately
    if (poll.isVoted || poll.isExpired) {
      setGaugeProgress(100)
    }
  }, [poll.isVoted, poll.isExpired])

  const isCreator = poll.author === user.name
  const canVote = !hasVoted && isActive && !poll.isExpired // Removed isCreator check - users can vote on their own polls

  // Calculate if poll is "HOT" (time remaining < 1 hour AND vote difference < 10%)
  const isHotPoll = () => {
    // Parse time remaining
    const timeMatch = poll.timeLeft.match(/(\d+)([hm])/)
    if (!timeMatch) return false
    
    const value = parseInt(timeMatch[1])
    const unit = timeMatch[2]
    
    // Check if less than 1 hour
    const isLowTime = (unit === 'm') || (unit === 'h' && value < 1)
    
    // Calculate vote difference percentage
    const totalVotes = poll.votesOptionA + poll.votesOptionB
    if (totalVotes === 0) return false
    
    const percentageA = (poll.votesOptionA / totalVotes) * 100
    const percentageB = (poll.votesOptionB / totalVotes) * 100
    const difference = Math.abs(percentageA - percentageB)
    
    // Check if difference is less than 10 percentage points
    const isClosePoll = difference < 10
    
    return isLowTime && isClosePoll && !poll.isExpired
  }

  const isHot = isHotPoll()

  // Debug logging for swipe issues
  useEffect(() => {
    console.log(`Poll "${poll.title}" (ID: ${poll.id}):`, {
      hasVoted,
      isCreator,
      isActive,
      canVote,
      isExpired: poll.isExpired,
      pollAuthor: poll.author,
      userName: user.name,
      authorMatch: poll.author === user.name
    })
  }, [poll.title, poll.id, hasVoted, isCreator, isActive, canVote, poll.author, user.name, poll.isExpired])

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
    if (!canVote) {
      console.log(`Mouse down blocked on "${poll.title}": canVote=${canVote}`)
      return
    }
    console.log(`Mouse down on "${poll.title}"`)
    startPos.current = { x: e.clientX, y: e.clientY }
    setIsDragging(true)
    e.preventDefault()
  }

  // Use document-level mouse events for better tracking
  useEffect(() => {
    if (!isDragging || !canVote) return

    const handleMouseMove = (e: MouseEvent) => {
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
      const currentOffset = { x: 0, y: 0 }
      setDragOffset(prev => {
        currentOffset.x = prev.x
        currentOffset.y = prev.y
        return prev
      })
      
      const swipeThreshold = 100
      const isSwipeLeft = currentOffset.x < -swipeThreshold
      const isSwipeRight = currentOffset.x > swipeThreshold
      
      if (isSwipeLeft || isSwipeRight) {
        // Swipe LEFT = Option A (left), Swipe RIGHT = Option B (right)
        const vote = isSwipeLeft ? 'A' : 'B'
        console.log(`Mouse vote on "${poll.title}": ${vote}`)
        handleVote(vote)
      } else {
        setDragOffset({ x: 0, y: 0 })
        setVoteDirection(null)
      }
      
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, canVote])

  const handleVote = async (option: 'A' | 'B') => {
    if (hasVoted) return
    
    console.log(`✅ Voting on "${poll.title}": Option ${option}`)
    
    // Step 1: Card disappears (200ms)
    setIsDisappearing(true)
    setDragOffset({ x: 0, y: 0 })
    setVoteDirection(null)
    setIsDragging(false)
    
    setTimeout(() => {
      // Step 2: Card reappears with results (100ms delay)
      setIsDisappearing(false)
      setJustVoted(true)
      setHasVoted(true)
      setShowResults(true)
      
      // Call the vote function
      onVote(poll.id, option)
      
      // Step 3: Animate gauges filling (1200ms)
      let progress = 0
      const gaugeInterval = setInterval(() => {
        progress += 5
        setGaugeProgress(progress)
        if (progress >= 100) {
          clearInterval(gaugeInterval)
        }
      }, 12) // 12ms * 100 steps = 1200ms total
      
      // Step 4: Remove animation class after gauges fill
      setTimeout(() => {
        setJustVoted(false)
      }, 1200)
      
      // Step 5: Auto-scroll to next poll after showing results (2200ms total)
      setTimeout(() => {
        console.log(`🔄 Auto-scrolling after vote on "${poll.title}"`)
        onVoteComplete?.()
        setGaugeProgress(0) // Reset for next time
      }, 2200)
    }, 200)
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
    if (isDisappearing) return 0 // Disappear for vote animation
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
        opacity: hasVoted ? 0.85 : getCardOpacity(), // Slightly transparent for voted polls
        transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        zIndex: isDragging ? 100 : 1, // Bring to front when dragging
        margin: '8px auto',
        padding: '24px',
        background: hasVoted ? '#f5f5f5' : (isHovered ? '#000000' : '#ffffff'), // Light grey background for voted
        border: `3px solid ${hasVoted ? '#cccccc' : '#000000'}`, // Grey border for voted
        borderRadius: '0',
        cursor: canVote ? (isDragging ? 'grabbing' : 'grab') : 'default',
        userSelect: 'none',
        touchAction: 'pan-y pinch-zoom', // Allow vertical scroll, prevent horizontal interference
        maxWidth: '600px',
        width: '100%',
        boxSizing: 'border-box',
        isolation: 'isolate', // Create new stacking context for each card
        color: hasVoted ? '#999999' : (isHovered ? '#ffffff' : '#000000'), // Grey text for voted
        boxShadow: isHovered ? '0 8px 16px rgba(0, 0, 0, 0.3)' : 'none',
        // Removed grayscale filter to keep gauges colored
        animation: justVoted ? 'voteSuccess 0.6s ease-out' : 'none', // Pulse animation on vote
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
      onMouseLeave={(e) => {
        setIsHovered(false)
        if (isDragging) {
          setIsDragging(false)
          setDragOffset({ x: 0, y: 0 })
          setVoteDirection(null)
        }
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
        marginBottom: '16px',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <IonChip 
            color="primary" 
            style={{ 
              fontSize: '10px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px'
            }}
          >
            <IonIcon icon={getCategoryIcon(poll.category)} style={{ fontSize: '16px' }} />
          </IonChip>
          
          {/* HOT badge for close polls with low time */}
          {isHot && (
            <IonChip 
              style={{ 
                fontSize: '10px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                background: '#ff0000',
                color: '#ffffff',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}
            >
              🔥 HOT
            </IonChip>
          )}
          
          {/* EXPIRED badge */}
          {poll.isExpired && (
            <IonChip 
              style={{ 
                fontSize: '10px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                background: '#666666',
                color: '#ffffff'
              }}
            >
              EXPIRED
            </IonChip>
          )}
        </div>
        
        {/* Time remaining with icon */}
        <IonBadge 
          color="light" 
          style={{ 
            fontSize: '10px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px'
          }}
        >
          <IonIcon 
            icon={poll.isExpired ? timeOutline : hourglassOutline} 
            style={{ fontSize: '14px' }}
          />
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
            <div style={{ width: '100%', marginTop: '12px' }}>
              {/* Animated Gauge */}
              <div style={{
                width: '100%',
                height: '40px',
                background: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: `${Math.round((poll.votesOptionA / poll.votes) * gaugeProgress)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #0066ff 0%, #0099ff 100%)',
                  transition: 'width 0.05s linear',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {gaugeProgress > 20 && (
                    <span style={{
                      color: '#ffffff',
                      fontWeight: '700',
                      fontSize: '14px'
                    }}>
                      {Math.round((poll.votesOptionA / poll.votes) * 100)}%
                    </span>
                  )}
                </div>
              </div>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: '700',
                color: voteDirection === 'A' ? '#ffffff' : '#666666',
                textAlign: 'center'
              }}>
                {poll.votesOptionA} VOTES
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
            <div style={{ width: '100%', marginTop: '12px' }}>
              {/* Animated Gauge */}
              <div style={{
                width: '100%',
                height: '40px',
                background: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: `${Math.round((poll.votesOptionB / poll.votes) * gaugeProgress)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #ff0000 0%, #ff3333 100%)',
                  transition: 'width 0.05s linear',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {gaugeProgress > 20 && (
                    <span style={{
                      color: '#ffffff',
                      fontWeight: '700',
                      fontSize: '14px'
                    }}>
                      {Math.round((poll.votesOptionB / poll.votes) * 100)}%
                    </span>
                  )}
                </div>
              </div>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: '700',
                color: voteDirection === 'B' ? '#ffffff' : '#666666',
                textAlign: 'center'
              }}>
                {poll.votesOptionB} VOTES
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

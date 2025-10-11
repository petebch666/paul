import React, { useState, useRef, useEffect, useCallback } from 'react'
import { IonContent } from '@ionic/react'
import SwipePollCard from './SwipePollCard'
import { Poll, User } from '../types'

interface PollCarouselProps {
  polls: Poll[]
  user: User | null
  onVote: (pollId: string, option: 'A' | 'B') => void | Promise<void>
  onLike: (pollId: string) => void
  contentRef?: React.RefObject<HTMLIonContentElement>
  onVoteComplete?: (pollId: string) => void
  className?: string
}

const PollCarousel: React.FC<PollCarouselProps> = ({
  polls,
  user,
  onVote,
  onLike,
  contentRef,
  onVoteComplete,
  className
}) => {
  const [focusedPollIndex, setFocusedPollIndex] = useState<number>(0)
  const pollRefs = useRef<(HTMLDivElement | null)[]>([])
  const localContentRef = useRef<HTMLIonContentElement>(null)
  const activeContentRef = contentRef || localContentRef

  // Detect which poll is at the center of the screen
  const updateFocusedPoll = useCallback(() => {
    if (!activeContentRef.current) return

    const scrollElement = activeContentRef.current as any
    scrollElement.getScrollElement().then((element: HTMLElement) => {
      const scrollTop = element.scrollTop
      const viewportHeight = element.clientHeight
      const centerY = scrollTop + viewportHeight / 2

      // Find which poll is closest to center
      let closestIndex = 0
      let closestDistance = Infinity

      pollRefs.current.forEach((pollEl, index) => {
        if (!pollEl) return

        const rect = pollEl.getBoundingClientRect()
        const pollTop = rect.top + scrollTop
        const pollCenter = pollTop + rect.height / 2
        const distance = Math.abs(pollCenter - centerY)

        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })

      if (closestIndex !== focusedPollIndex) {
        setFocusedPollIndex(closestIndex)
      }
    })
  }, [focusedPollIndex, activeContentRef])

  // Update focused poll on scroll
  useEffect(() => {
    const ionContent = activeContentRef.current
    if (!ionContent) return

    const handleScroll = () => {
      updateFocusedPoll()
    }

    ionContent.addEventListener('ionScroll', handleScroll as any)

    // Initial update
    setTimeout(() => updateFocusedPoll(), 100)

    return () => {
      ionContent.removeEventListener('ionScroll', handleScroll as any)
    }
  }, [updateFocusedPoll, polls])

  // Reset focused index when polls change
  useEffect(() => {
    setFocusedPollIndex(0)
    pollRefs.current = []
  }, [polls.length])

  // Handle vote completion with animation
  const handleVoteCompleteInternal = (pollId: string) => {
    console.log(`📜 Vote completed for poll: ${pollId}`)
    
    // Add slide-out animation to voted poll card
    const votedPollCard = document.querySelector(`[data-poll-id="${pollId}"]`)
    if (votedPollCard) {
      votedPollCard.classList.add('poll-voted-animation')
      
      setTimeout(() => {
        votedPollCard.classList.remove('poll-voted-animation')
      }, 1000)
    }
    
    // Find the index of the voted poll
    const votedIndex = polls.findIndex(p => p.id === pollId)
    if (votedIndex !== -1 && votedIndex < polls.length - 1) {
      // Scroll to next poll after animation delay
      setTimeout(() => {
        const nextIndex = votedIndex + 1
        const nextPollElement = document.querySelector(`[data-poll-index="${nextIndex}"]`)
        if (nextPollElement) {
          nextPollElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          })
        }
      }, 800) // Delay scroll to let gauge animation finish
    }

    // Call parent's onVoteComplete if provided
    if (onVoteComplete) {
      onVoteComplete(pollId)
    }
  }

  return (
    <div 
      className={className}
      style={{ 
        padding: '8px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        scrollSnapType: 'y mandatory',
        paddingTop: '20px',
        paddingBottom: 'calc(50vh - 200px)'
      }}
    >
      {polls.map((poll, index) => {
        const isFocused = index === focusedPollIndex
        const isAboveFocused = index === focusedPollIndex - 1
        const isBelowFocused = index === focusedPollIndex + 1
        const isNearFocused = isAboveFocused || isBelowFocused
        
        return (
          <div
            key={poll.id}
            ref={(el) => (pollRefs.current[index] = el)}
            data-poll-wrapper={index}
            style={{
              filter: isNearFocused ? 'blur(4px)' : (isFocused ? 'none' : 'blur(2px)'),
              opacity: isFocused ? 1 : (isNearFocused ? 0.4 : 0.2),
              transition: 'filter 0.4s ease, opacity 0.4s ease, transform 0.4s ease',
              pointerEvents: isFocused ? 'auto' : 'none',
              scrollSnapAlign: 'center',
              scrollSnapStop: 'always',
              transform: isFocused ? 'scale(1)' : 'scale(0.95)',
              transformOrigin: 'center'
            }}
          >
            <SwipePollCard
              poll={poll}
              user={user}
              onVote={onVote}
              onLike={onLike}
              isActive={!poll.isExpired}
              isFocused={isFocused && !poll.isVoted}
              onVoteComplete={() => handleVoteCompleteInternal(poll.id)}
              data-poll-index={index}
            />
          </div>
        )
      })}

      <style>{`
        /* Animation for poll cards when voted - slide out to the right */
        .poll-voted-animation {
          animation: voteSlideOut 0.8s ease-out forwards;
        }

        @keyframes voteSlideOut {
          0% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateX(20px) scale(0.95);
            opacity: 0.7;
          }
          100% {
            transform: translateX(100vw) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default PollCarousel


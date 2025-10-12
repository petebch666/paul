import React, { useState, useRef, useEffect } from 'react'
import SwipePollCard from './SwipePollCard'
import { Poll, User } from '../types'

interface PollCarouselProps {
  polls: Poll[]
  user: User | null
  onVote: (pollId: string, option: 'A' | 'B') => void | Promise<void>
  onLike: (pollId: string) => void
  contentRef?: React.RefObject<HTMLIonContentElement | null>
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
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Use Intersection Observer to detect which poll is in view
  useEffect(() => {
    // Don't set up observer if there are no polls
    if (polls.length === 0) {
      console.log('⚠️ No polls to observe')
      return
    }

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // Create new observer with more sensitive settings
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with the highest intersection ratio (most visible)
        let maxRatio = 0
        let maxIndex = -1

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const ratio = entry.intersectionRatio
            if (ratio > maxRatio) {
              maxRatio = ratio
              const index = pollRefs.current.findIndex(ref => ref === entry.target)
              if (index !== -1) {
                maxIndex = index
              }
            }
          }
        })

        // Update focused index if we found a visible poll
        if (maxIndex >= 0 && maxRatio > 0.1) {
          setFocusedPollIndex(prevIndex => {
            if (prevIndex !== maxIndex) {
              console.log(`📍 Focus changed from ${prevIndex} to ${maxIndex} (ratio: ${maxRatio.toFixed(2)})`)
              return maxIndex
            }
            return prevIndex
          })
        }
      },
      {
        root: null, // Use viewport as root
        threshold: Array.from({ length: 21 }, (_, i) => i * 0.05), // 0, 0.05, 0.1, ... 1.0 for very smooth detection
        rootMargin: '-40% 0px -40% 0px' // Focus on center 20% of viewport - smaller zone = more sensitive
      }
    )

    observerRef.current = observer

    // Observe all poll elements - use requestAnimationFrame to ensure refs are set
    requestAnimationFrame(() => {
      const validRefs = pollRefs.current.filter(ref => ref !== null)
      console.log(`🔄 Setting up Intersection Observer for ${validRefs.length} polls (total: ${polls.length})`)
      
      validRefs.forEach((pollEl) => {
        if (pollEl && observer) {
          observer.observe(pollEl)
        }
      })

      if (validRefs.length === 0) {
        console.warn('⚠️ No valid refs found! Retrying in 300ms...')
        setTimeout(() => {
          const retryRefs = pollRefs.current.filter(ref => ref !== null)
          console.log(`🔄 Retry: Found ${retryRefs.length} refs`)
          retryRefs.forEach((pollEl) => {
            if (pollEl && observer) {
              observer.observe(pollEl)
            }
          })
          
          // Final fallback - if still no refs, try one more time
          if (retryRefs.length === 0) {
            console.warn('⚠️ Still no refs! Final retry in 500ms...')
            setTimeout(() => {
              const finalRefs = pollRefs.current.filter(ref => ref !== null)
              console.log(`🔄 Final retry: Found ${finalRefs.length} refs`)
              finalRefs.forEach((pollEl) => {
                if (pollEl && observer) {
                  observer.observe(pollEl)
                }
              })
            }, 500)
          }
        }, 300)
      }
    })

    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [polls.length]) // Only re-run when number of polls changes, not on every render

  // Reset focused index when polls change (but don't clear refs - they're set by React render)
  useEffect(() => {
    setFocusedPollIndex(0)
  }, [polls.length])

  // Handle vote completion with animation
  const handleVoteCompleteInternal = (pollId: string) => {
    console.log(`📜 Vote completed for poll: ${pollId}`)
    
    // Find the index of the voted poll
    const votedIndex = polls.findIndex(p => p.id === pollId)
    
    // Wait for gauge animation to complete (300ms) + a bit for user to see results
    setTimeout(() => {
      console.log(`🎯 Auto-scrolling to next poll after vote`)
      
      if (votedIndex !== -1 && votedIndex < polls.length - 1) {
        // Scroll to next poll wrapper element
        const nextPollWrapper = pollRefs.current[votedIndex + 1]
        if (nextPollWrapper) {
          nextPollWrapper.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          })
          console.log(`✅ Scrolled to poll ${votedIndex + 1}`)
        } else {
          console.warn(`⚠️ Could not find next poll wrapper`)
        }
      } else {
        console.log(`ℹ️ This was the last poll`)
      }
    }, 1200) // 300ms gauge animation + 900ms to see results

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
        gap: '20px',
        paddingTop: 'max(20vh, 200px)',
        paddingBottom: 'max(20vh, 200px)',
        minHeight: '100vh'
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
            data-poll-id={poll.id}
            style={{
              filter: isFocused ? 'none' : (isNearFocused ? 'blur(4px)' : 'blur(6px)'),
              opacity: isFocused ? 1 : (isNearFocused ? 0.5 : 0.3),
              transition: 'filter 0.3s ease, opacity 0.3s ease, transform 0.3s ease',
              pointerEvents: isFocused ? 'auto' : 'none',
              scrollSnapAlign: 'center',
              scrollSnapStop: 'always',
              transform: isFocused ? 'scale(1)' : 'scale(0.92)',
              transformOrigin: 'center',
              willChange: isFocused ? 'filter, opacity, transform' : 'auto', // Only apply to focused card to reduce memory
              marginBottom: '8px'
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

    </div>
  )
}

export default PollCarousel


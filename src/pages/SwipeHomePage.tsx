import React, { useState, useEffect, useRef } from 'react'
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonChip
} from '@ionic/react'
import { chevronForward, refresh, list } from 'ionicons/icons'
import SwipePollCard from '../components/SwipePollCard'
import { Poll, User } from '../types'
import { PollzAPI } from '../database/api'

interface SwipeHomePageProps {
  polls: Poll[]
  user: User
  onVote: (pollId: string, option: 'A' | 'B') => void
  onLike: (pollId: string) => void
  loadPolls: () => void
  loading: boolean
  error: string | null
}

const SwipeHomePage: React.FC<SwipeHomePageProps> = ({ 
  polls, 
  user, 
  onVote, 
  onLike, 
  loadPolls,
  loading,
  error
}) => {
  const [currentPollIndex, setCurrentPollIndex] = useState(0)
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set())
  const [isAutoScrolling, setIsAutoScrolling] = useState(false)
  const [showListMode, setShowListMode] = useState(false)
  const contentRef = useRef<HTMLIonContentElement>(null)
  const pollStackRef = useRef<HTMLDivElement>(null)

  // Filter polls that haven't been voted on
  const availablePolls = polls.filter(poll => !votedPolls.has(poll.id))
  const currentPoll = availablePolls[currentPollIndex]

  // Auto-scroll to next poll
  const scrollToNextPoll = async () => {
    if (isAutoScrolling) return
    
    setIsAutoScrolling(true)
    
    // Scroll to next poll
    if (contentRef.current && pollStackRef.current) {
      const pollCards = pollStackRef.current.children
      const nextIndex = currentPollIndex + 1
      
      if (nextIndex < availablePolls.length && pollCards[nextIndex]) {
        // For desktop, scroll to the next poll
        await pollCards[nextIndex].scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    }
    
    // Update index after scroll
    setTimeout(() => {
      setCurrentPollIndex(prev => Math.min(prev + 1, availablePolls.length - 1))
      setIsAutoScrolling(false)
    }, 600)
  }

  // Handle vote completion
  const handleVoteComplete = () => {
    if (currentPoll) {
      setVotedPolls(prev => new Set([...prev, currentPoll.id]))
    }
    scrollToNextPoll()
  }

  // Handle direct voting
  const handleVote = async (pollId: string, option: 'A' | 'B') => {
    onVote(pollId, option)
  }

  // Reset to first poll when polls change
  useEffect(() => {
    setCurrentPollIndex(0)
    setVotedPolls(new Set())
  }, [polls])

  // Load more polls when near the end
  useEffect(() => {
    if (currentPollIndex >= availablePolls.length - 3 && !loading) {
      loadPolls()
    }
  }, [currentPollIndex, availablePolls.length, loading, loadPolls])

  // Haptic feedback for mobile
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }

  // Handle vote with haptic feedback
  const handleVoteWithFeedback = (pollId: string, option: 'A' | 'B') => {
    triggerHaptic()
    handleVote(pollId, option)
  }

  if (loading && polls.length === 0) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Pollz</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            fontFamily: 'Courier New, Courier, monospace',
            fontSize: '16px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#000000'
          }}>
            LOADING POLLS...
          </div>
        </IonContent>
      </IonPage>
    )
  }

  if (error) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Pollz</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontFamily: 'Courier New, Courier, monospace',
              fontSize: '16px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#ff0000',
              marginBottom: '20px'
            }}>
              ERROR LOADING POLLS
            </div>
            <IonButton 
              onClick={loadPolls}
              color="primary"
              style={{ marginTop: '20px' }}
            >
              RETRY
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  if (availablePolls.length === 0) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Pollz</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontFamily: 'Courier New, Courier, monospace',
              fontSize: '20px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              color: '#000000',
              marginBottom: '16px'
            }}>
              ALL CAUGHT UP!
            </div>
            <div style={{ 
              fontFamily: 'Courier New, Courier, monospace',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#666666',
              marginBottom: '20px'
            }}>
              You've voted on all available polls
            </div>
            <IonButton 
              onClick={() => {
                setVotedPolls(new Set())
                setCurrentPollIndex(0)
              }}
              color="primary"
            >
              START OVER
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pollz</IonTitle>
          <div slot="end" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IonChip 
              color="primary"
              style={{ fontSize: '10px', fontWeight: '700' }}
            >
              {availablePolls.length} LEFT
            </IonChip>
            <IonButton 
              fill="clear" 
              size="small"
              onClick={() => setShowListMode(!showListMode)}
            >
              <IonIcon icon={list} />
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>
      
      <IonContent ref={contentRef}>
        {/* Header */}
        <div 
          style={{ 
            textAlign: 'center',
            padding: '20px 16px',
            background: '#ffffff',
            borderBottom: '3px solid #000000'
          }}
        >
          <h1 style={{ 
            fontFamily: 'Courier New, Courier, monospace',
            fontWeight: '700',
            fontSize: '24px',
            textTransform: 'uppercase',
            letterSpacing: '4px',
            color: '#000000',
            marginBottom: '8px',
            lineHeight: '1.1'
          }}>
            SWIPE TO VOTE
          </h1>
          <p style={{ 
            fontFamily: 'Courier New, Courier, monospace',
            fontWeight: '700',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#000000',
            margin: '0'
          }}>
            DISCOVER POLLS AND SETTLE ARGUMENTS
          </p>
        </div>

        {/* Poll Stack */}
        <div 
          ref={pollStackRef}
          className="poll-stack-container"
          style={{
            padding: '0',
            minHeight: 'calc(100vh - 200px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {availablePolls.map((poll, index) => (
            <SwipePollCard
              key={poll.id}
              poll={poll}
              onVote={handleVoteWithFeedback}
              user={user}
              onLike={onLike}
              isActive={index === currentPollIndex}
              onVoteComplete={handleVoteComplete}
            />
          ))}
        </div>

        {/* Floating Action Buttons */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton 
            onClick={() => {
              setVotedPolls(new Set())
              setCurrentPollIndex(0)
              if (contentRef.current) {
                contentRef.current.scrollToTop(300)
              }
            }}
            style={{
              '--background': '#000000',
              '--color': '#ffffff',
              '--border-radius': '0',
              '--border': '3px solid #000000'
            }}
          >
            <IonIcon icon={refresh} />
          </IonFabButton>
        </IonFab>

        {/* Progress indicator */}
        <div 
          style={{
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '4px',
            zIndex: 1000
          }}
        >
          {Array.from({ length: Math.min(availablePolls.length, 10) }, (_, i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                background: i === currentPollIndex ? '#000000' : '#cccccc',
                border: '1px solid #000000',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </IonContent>
    </IonPage>
  )
}

export default SwipeHomePage

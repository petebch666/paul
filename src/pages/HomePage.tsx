import React, { useState, useRef, useEffect } from 'react'
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton,
  IonIcon,
  IonSpinner,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react'
import { chevronForward, chevronDownCircleOutline } from 'ionicons/icons'
import SwipePollCard from '../components/SwipePollCard'
import { Poll, User } from '../types'

interface HomePageProps {
  polls: Poll[]
  user: User
  onVote: (pollId: string, option: 'A' | 'B') => Promise<void>
  onLike: (pollId: string) => void
  loadPolls: (reset?: boolean) => Promise<void>
  loading: boolean
  error: string | null
}

const HomePage: React.FC<HomePageProps> = ({ 
  polls, 
  user, 
  onVote, 
  onLike, 
  loadPolls, 
  loading, 
  error 
}) => {
  const [currentPollIndex, setCurrentPollIndex] = useState(0)
  const contentRef = useRef<HTMLIonContentElement>(null)

  // Show all polls - user can scroll and vote on any poll
  const availablePolls = polls

  // Handle pull-to-refresh
  const handleRefresh = async (event: CustomEvent) => {
    console.log('🔄 Refreshing polls...')
    await loadPolls(true)
    event.detail.complete()
  }

  // Scroll to top
  const scrollToTop = () => {
    contentRef.current?.scrollToTop(500)
  }

  // Handle vote completion and scroll to next poll
  const handleVoteComplete = (pollId: string) => {
    console.log(`📜 Vote completed for poll: ${pollId}`)
    
    // Find the index of the voted poll
    const votedIndex = availablePolls.findIndex(p => p.id === pollId)
    if (votedIndex !== -1 && votedIndex < availablePolls.length - 1) {
      // Scroll to next poll after showing results for 2 seconds
      const nextIndex = votedIndex + 1
      console.log(`⬇️ Will scroll to next poll at index: ${nextIndex} in 2 seconds`)
      
      setTimeout(() => {
        const nextPollElement = document.querySelector(`[data-poll-index="${nextIndex}"]`)
        if (nextPollElement) {
          console.log(`📍 Scrolling to poll at index: ${nextIndex}`)
          nextPollElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
        }
      }, 2100) // Wait for results to show (2 seconds) + small buffer
    }
  }

  // Reset current index when polls change
  useEffect(() => {
    setCurrentPollIndex(0)
  }, [polls])

  if (loading && polls.length === 0) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>PAUL</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <IonSpinner name="crescent" />
            <div style={{
              fontFamily: 'Courier New, Courier, monospace',
              fontSize: '16px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#666666'
            }}>
              LOADING POLLS...
            </div>
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
            <IonTitle>PAUL</IonTitle>
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
              onClick={() => loadPolls(true)}
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>PAUL</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent ref={contentRef} scrollEvents={true}>
        {/* Pull to Refresh */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={chevronDownCircleOutline}
            pullingText="Pull to refresh"
            refreshingSpinner="circles"
            refreshingText="Refreshing..."
          />
        </IonRefresher>

        {/* Header */}
        <div className="page-header-minimal">
          <h1>SWIPE TO VOTE</h1>
          <p>DISCOVER POLLS AND SETTLE ARGUMENTS</p>
        </div>

        {/* Polls Stack */}
        {availablePolls.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            fontFamily: 'Courier New, Courier, monospace',
            fontSize: '16px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#666666'
          }}>
            ALL CAUGHT UP!
          </div>
        ) : (
          <div style={{ 
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {availablePolls.map((poll, index) => (
              <SwipePollCard
                key={poll.id}
                poll={poll}
                user={user}
                onVote={onVote}
                onLike={onLike}
                isActive={true} // Make all polls swipable
                onVoteComplete={() => handleVoteComplete(poll.id)}
                data-poll-index={index}
              />
            ))}
          </div>
        )}
      </IonContent>
    </IonPage>
  )
}

export default HomePage
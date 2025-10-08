import React, { useState, useRef, useEffect } from 'react'
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/react'
import { chevronForward } from 'ionicons/icons'
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
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set())
  const [currentPollIndex, setCurrentPollIndex] = useState(0)
  const contentRef = useRef<HTMLIonContentElement>(null)

  // Filter polls that haven't been voted on
  const availablePolls = polls.filter(poll => !votedPolls.has(poll.id))

  // Handle vote completion and scroll to next poll
  const handleVoteComplete = async (pollId: string) => {
    setVotedPolls(prev => new Set([...prev, pollId]))
    
    // Scroll to next poll after a short delay
    setTimeout(() => {
      setCurrentPollIndex(prev => prev + 1)
      scrollToNextPoll()
    }, 500)
  }

  // Scroll to next poll
  const scrollToNextPoll = async () => {
    if (contentRef.current) {
      const nextPollElement = document.querySelector(`[data-poll-index="${currentPollIndex + 1}"]`)
      if (nextPollElement) {
        nextPollElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }
    }
  }

  // Reset voted polls when polls change
  useEffect(() => {
    setVotedPolls(new Set())
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
                onVote={(pollId, option) => {
                  onVote(pollId, option)
                  handleVoteComplete(pollId)
                }}
                onLike={onLike}
                isActive={true} // Make all polls swipable
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
import React, { useState, useRef, useEffect } from 'react'
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButton,
  IonIcon,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonChip,
  IonSelect,
  IonSelectOption
} from '@ionic/react'
import { chevronDownCircleOutline, flame, star, checkmark, time, checkmarkCircle } from 'ionicons/icons'
import SwipePollCard from '../components/SwipePollCard'
import { Poll, User } from '../types'

interface HomePageProps {
  polls: Poll[]
  user: User | null
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
  const [activeSection, setActiveSection] = useState<'last' | 'trending' | 'expired' | 'voted'>('last')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [expiringSoonFilter, setExpiringSoonFilter] = useState<boolean>(false)
  const [expiredSortBy, setExpiredSortBy] = useState<'category' | 'votes' | 'closest' | 'furthest'>('votes')
  const contentRef = useRef<HTMLIonContentElement>(null)

  // Get unique categories from polls
  const categories = ['all', ...Array.from(new Set(polls.map(poll => poll.category)))]

  // Filter and sort polls based on active section
  const getFilteredPolls = () => {
    let filteredPolls = [...polls]

    switch (activeSection) {
      case 'last':
        // Active polls sorted by date (most recent first) - exclude voted polls
        filteredPolls = polls
          .filter(poll => !poll.isExpired && !poll.isVoted)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break

      case 'trending':
        // Highly voted polls, optionally filtered by expiring soon - exclude voted polls
        filteredPolls = polls
          .filter(poll => !poll.isExpired && !poll.isVoted)
          .sort((a, b) => b.votes - a.votes)
        
        if (expiringSoonFilter) {
          const now = new Date()
          const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
          filteredPolls = filteredPolls.filter(poll => 
            new Date(poll.expiresAt) <= oneDayFromNow
          )
        }
        break

      case 'voted':
        // Polls the user has voted on (sorted by most recent)
        filteredPolls = polls
          .filter(poll => poll.isVoted)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break

      case 'expired':
        // Expired polls with various sorting options
        filteredPolls = polls.filter(poll => poll.isExpired)
        
        switch (expiredSortBy) {
          case 'category':
            filteredPolls.sort((a, b) => a.category.localeCompare(b.category))
            break
          case 'votes':
            filteredPolls.sort((a, b) => b.votes - a.votes)
            break
          case 'closest':
            filteredPolls.sort((a, b) => {
              const aRatio = Math.abs(a.votesOptionA - a.votesOptionB) / Math.max(a.votes, 1)
              const bRatio = Math.abs(b.votesOptionA - b.votesOptionB) / Math.max(b.votes, 1)
              return aRatio - bRatio // Lower ratio = closer fight
            })
            break
          case 'furthest':
            filteredPolls.sort((a, b) => {
              const aRatio = Math.abs(a.votesOptionA - a.votesOptionB) / Math.max(a.votes, 1)
              const bRatio = Math.abs(b.votesOptionA - b.votesOptionB) / Math.max(b.votes, 1)
              return bRatio - aRatio // Higher ratio = further apart
            })
            break
        }
        break
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filteredPolls = filteredPolls.filter(poll => poll.category === categoryFilter)
    }

    return filteredPolls
  }

  const filteredPolls = getFilteredPolls()

  // Calculate poll counts for each category
  const pollCounts = {
    last: polls.filter(poll => !poll.isExpired && !poll.isVoted).length,
    trending: polls.filter(poll => !poll.isExpired && !poll.isVoted).length, // Same as last, but with different sorting
    voted: polls.filter(poll => poll.isVoted).length,
    expired: polls.filter(poll => poll.isExpired).length,
    total: polls.length
  }

  // Handle pull-to-refresh
  const handleRefresh = async (event: CustomEvent) => {
    console.log('🔄 Refreshing polls...')
    await loadPolls(true)
    event.detail.complete()
  }

  // Handle vote completion and scroll to next poll
  const handleVoteComplete = (pollId: string) => {
    console.log(`📜 Vote completed for poll: ${pollId}`)
    
    // Add fade-out animation to voted poll card
    const votedPollCard = document.querySelector(`[data-poll-id="${pollId}"]`)
    if (votedPollCard) {
      votedPollCard.classList.add('poll-voted-animation')
      
      // After animation, remove the class
      setTimeout(() => {
        votedPollCard.classList.remove('poll-voted-animation')
      }, 1000)
    }
    
    // Find the index of the voted poll
    const votedIndex = filteredPolls.findIndex(p => p.id === pollId)
    if (votedIndex !== -1 && votedIndex < filteredPolls.length - 1) {
      // Scroll to next poll after animation delay
      setTimeout(() => {
        const nextIndex = votedIndex + 1
        console.log(`⬇️ Scrolling to next poll at index: ${nextIndex}`)
        
        const nextPollElement = document.querySelector(`[data-poll-index="${nextIndex}"]`)
        if (nextPollElement) {
          console.log(`📍 Scrolling to poll at index: ${nextIndex}`)
          nextPollElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          })
        }
      }, 800) // Delay scroll to let gauge animation finish
    }
  }

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
          <div slot="end" style={{ 
            padding: '0 16px', 
            fontSize: '10px', 
            color: '#666',
            fontFamily: 'Courier New, monospace',
            fontWeight: 'bold'
          }}>
            📊 {pollCounts.total} polls
          </div>
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

        {/* Section Selector */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '20px 16px',
          gap: '24px'
        }}>
          <button
            onClick={() => setActiveSection('last')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 12px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: activeSection === 'last' ? 'scale(1.1)' : 'scale(1)',
              minWidth: '60px'
            }}
          >
            <IonIcon 
              icon={star} 
              style={{ 
                fontSize: '28px', 
                marginBottom: '6px',
                color: '#667eea',
                animation: activeSection === 'last' ? 'pulse 2s infinite' : 'none'
              }} 
            />
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: activeSection === 'last' ? '#667eea' : '#666666'
            }}>
              Last ({pollCounts.last})
            </span>
          </button>

          <button
            onClick={() => setActiveSection('trending')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 12px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: activeSection === 'trending' ? 'scale(1.1)' : 'scale(1)',
              minWidth: '60px'
            }}
          >
            <IonIcon 
              icon={flame} 
              style={{ 
                fontSize: '28px', 
                marginBottom: '6px',
                color: '#ff6b6b',
                animation: activeSection === 'trending' ? 'flicker 1.5s infinite' : 'none'
              }} 
            />
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: activeSection === 'trending' ? '#ff6b6b' : '#666666'
            }}>
              Trending ({pollCounts.trending})
            </span>
          </button>

          <button
            onClick={() => setActiveSection('voted')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 12px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: activeSection === 'voted' ? 'scale(1.1)' : 'scale(1)',
              minWidth: '60px'
            }}
          >
            <IonIcon 
              icon={checkmarkCircle} 
              style={{ 
                fontSize: '28px', 
                marginBottom: '6px',
                color: '#5f27cd',
                animation: activeSection === 'voted' ? 'pulse 2s infinite' : 'none'
              }} 
            />
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: activeSection === 'voted' ? '#5f27cd' : '#666666'
            }}>
              My Votes ({pollCounts.voted})
            </span>
          </button>

          <button
            onClick={() => setActiveSection('expired')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 12px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: activeSection === 'expired' ? 'scale(1.1)' : 'scale(1)',
              minWidth: '60px'
            }}
          >
            <IonIcon 
              icon={checkmark} 
              style={{ 
                fontSize: '28px', 
                marginBottom: '6px',
                color: '#2ed573',
                animation: activeSection === 'expired' ? 'bounce 2s infinite' : 'none'
              }} 
            />
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: activeSection === 'expired' ? '#2ed573' : '#666666'
            }}>
              Expired ({pollCounts.expired})
            </span>
          </button>
        </div>

        <style>{`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          
          @keyframes flicker {
            0%, 100% { opacity: 1; transform: scale(1); }
            25% { opacity: 0.8; transform: scale(1.05); }
            50% { opacity: 1; transform: scale(1); }
            75% { opacity: 0.9; transform: scale(1.02); }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }

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

        {/* Filters */}
        <div style={{ 
          padding: '0 16px 16px',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Category Filter - Always visible */}
          <IonSelect
            value={categoryFilter}
            placeholder="Category"
            onIonChange={e => setCategoryFilter(e.detail.value)}
            style={{ 
              minWidth: '100px', 
              maxWidth: '140px',
              flex: '1 1 auto'
            }}
          >
            {categories.map(category => (
              <IonSelectOption key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </IonSelectOption>
            ))}
          </IonSelect>

          {/* Trending-specific filter - Same row as category */}
          {activeSection === 'trending' && (
            <IonButton
              fill={expiringSoonFilter ? 'solid' : 'outline'}
              color={expiringSoonFilter ? 'warning' : 'medium'}
              onClick={() => setExpiringSoonFilter(!expiringSoonFilter)}
              style={{ 
                fontFamily: 'Courier New, Courier, monospace',
                fontSize: '10px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                padding: '6px 8px',
                flex: '1 1 auto',
                minWidth: '80px',
                maxWidth: '120px',
                whiteSpace: 'nowrap'
              }}
            >
              <IonIcon icon={flame} style={{ fontSize: '12px' }} />
              <IonIcon icon={time} style={{ fontSize: '12px' }} />
              <span>Expiring</span>
            </IonButton>
          )}

          {/* Expired-specific sort - Same row as category */}
          {activeSection === 'expired' && (
            <IonSelect
              value={expiredSortBy}
              placeholder="Sort by"
              onIonChange={e => setExpiredSortBy(e.detail.value)}
              style={{ 
                minWidth: '100px', 
                maxWidth: '140px',
                flex: '1 1 auto'
              }}
            >
              <IonSelectOption value="votes">Most Votes</IonSelectOption>
              <IonSelectOption value="category">Category</IonSelectOption>
              <IonSelectOption value="closest">Closest Fight</IonSelectOption>
              <IonSelectOption value="furthest">Furthest Fight</IonSelectOption>
            </IonSelect>
          )}
        </div>

        {/* Polls List */}
        {filteredPolls.length === 0 ? (
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
            {activeSection === 'last' && 'NO ACTIVE POLLS'}
            {activeSection === 'trending' && 'NO TRENDING POLLS'}
            {activeSection === 'expired' && 'NO EXPIRED POLLS'}
          </div>
        ) : (
          <div style={{ 
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {filteredPolls.map((poll, index) => (
              <SwipePollCard
                key={poll.id}
                poll={poll}
                user={user}
                onVote={onVote}
                onLike={onLike}
                isActive={!poll.isExpired}
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
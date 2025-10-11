import React, { useState, useRef, useEffect, useCallback } from 'react'
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
import PollCarousel from '../components/PollCarousel'
import CategoryIcon from '../components/CategoryIcon'
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
  const [categoryFilter, setCategoryFilter] = useState<string>('')
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

    // Apply category filter (empty string means show all)
    if (categoryFilter && categoryFilter !== '') {
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
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ 
          '--border-width': '0',
          '--border-style': 'none'
        }}>
          <IonTitle style={{
            fontFamily: 'Courier New, monospace',
            fontSize: '32px',
            fontWeight: '900',
            letterSpacing: '4px',
            textAlign: 'center'
          }}>
            PAUL
          </IonTitle>
          <div slot="end" style={{ 
            padding: '0 16px', 
            fontSize: '10px', 
            color: '#666',
            fontFamily: 'Courier New, monospace',
            fontWeight: 'bold'
          }}>
            📊 {pollCounts.total}
          </div>
        </IonToolbar>
      </IonHeader>
      
      <IonContent 
        ref={contentRef} 
        scrollEvents={true}
        className="carousel-scroll"
      >
        {/* Pull to Refresh */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={chevronDownCircleOutline}
            pullingText="Pull to refresh"
            refreshingSpinner="circles"
            refreshingText="Refreshing..."
          />
        </IonRefresher>

        {/* Section Selector - Poll Status */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '16px 16px 12px',
          gap: '24px',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          borderBottom: '1px solid #e9ecef'
        }}>
          <button
            onClick={() => setActiveSection('last')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '12px 16px',
              border: 'none',
              background: activeSection === 'last' ? '#ffffff' : 'transparent',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: activeSection === 'last' ? 'scale(1.05)' : 'scale(1)',
              minWidth: '70px',
              boxShadow: activeSection === 'last' ? '0 2px 8px rgba(102, 126, 234, 0.15)' : 'none'
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
              padding: '12px 16px',
              border: 'none',
              background: activeSection === 'trending' ? '#ffffff' : 'transparent',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: activeSection === 'trending' ? 'scale(1.05)' : 'scale(1)',
              minWidth: '70px',
              boxShadow: activeSection === 'trending' ? '0 2px 8px rgba(255, 107, 107, 0.15)' : 'none'
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
              padding: '12px 16px',
              border: 'none',
              background: activeSection === 'voted' ? '#ffffff' : 'transparent',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: activeSection === 'voted' ? 'scale(1.05)' : 'scale(1)',
              minWidth: '70px',
              boxShadow: activeSection === 'voted' ? '0 2px 8px rgba(95, 39, 205, 0.15)' : 'none'
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
              padding: '12px 16px',
              border: 'none',
              background: activeSection === 'expired' ? '#ffffff' : 'transparent',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: activeSection === 'expired' ? 'scale(1.05)' : 'scale(1)',
              minWidth: '70px',
              boxShadow: activeSection === 'expired' ? '0 2px 8px rgba(46, 213, 115, 0.15)' : 'none'
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

        {/* Visual Separator */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, #dee2e6 50%, transparent 100%)',
          margin: '0 20px'
        }}></div>

        {/* Category Section Label */}
        <div style={{
          padding: '16px 16px 8px',
          textAlign: 'center'
        }}>
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#6c757d',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontFamily: 'Courier New, monospace'
          }}>
            Filter by Category
          </span>
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

          /* Carousel scroll behavior */
          .carousel-scroll {
            scroll-behavior: smooth;
          }

          .carousel-scroll::part(scroll) {
            scroll-snap-type: y mandatory;
            scroll-padding: 50vh;
          }

          /* Hide scrollbar for category filters */
          .category-filter-container {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .category-filter-container::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Category Filters - Single Row */}
        <div style={{ 
          padding: '8px 16px 12px',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          maxWidth: '600px',
          margin: '0 auto',
          background: '#ffffff',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {/* Individual category filters */}
          {categories.filter(c => c !== 'all').map(category => (
            <button
              key={category}
              onClick={() => setCategoryFilter(categoryFilter === category ? '' : category)}
            style={{
              background: categoryFilter === category ? '#000000' : '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              boxShadow: categoryFilter === category ? '4px 4px 0 #000000' : 'none',
              transform: categoryFilter === category ? 'translate(-2px, -2px)' : 'none',
              minWidth: '60px',
              flexShrink: 0
            }}
            >
              <div style={{
                filter: categoryFilter === category ? 'brightness(3) saturate(0) invert(1)' : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CategoryIcon category={category} size={36} />
              </div>
              <span style={{
                fontFamily: 'Courier New, monospace',
                fontSize: '8px',
                fontWeight: '700',
                color: categoryFilter === category ? '#ffffff' : '#666666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}>
                {category.substring(0, 7)}
              </span>
            </button>
          ))}
        </div>

        {/* Additional Filters (below category grid) */}
        {(activeSection === 'trending' || activeSection === 'expired') && (
          <div style={{
            padding: '0 16px 16px',
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {/* Trending-specific filter */}
            {activeSection === 'trending' && (
              <IonButton
                fill={expiringSoonFilter ? 'solid' : 'outline'}
                color={expiringSoonFilter ? 'warning' : 'medium'}
                onClick={() => setExpiringSoonFilter(!expiringSoonFilter)}
                style={{ 
                  fontFamily: 'Courier New, Courier, monospace',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                <IonIcon icon={time} style={{ marginRight: '8px' }} />
                {expiringSoonFilter ? 'EXPIRING SOON' : 'ALL TIME'}
              </IonButton>
            )}

            {/* Expired-specific sort */}
            {activeSection === 'expired' && (
              <IonSelect
                value={expiredSortBy}
                placeholder="Sort by"
                onIonChange={e => setExpiredSortBy(e.detail.value)}
                style={{ 
                  minWidth: '140px',
                  maxWidth: '200px'
                }}
              >
                <IonSelectOption value="votes">Most Votes</IonSelectOption>
                <IonSelectOption value="category">Category</IonSelectOption>
                <IonSelectOption value="closest">Closest Fight</IonSelectOption>
                <IonSelectOption value="furthest">Furthest Fight</IonSelectOption>
              </IonSelect>
            )}
          </div>
        )}

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
          <PollCarousel
            polls={filteredPolls}
            user={user}
            onVote={onVote}
            onLike={onLike}
            contentRef={contentRef}
          />
        )}
      </IonContent>
    </IonPage>
  )
}

export default HomePage
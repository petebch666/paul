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
  IonChip,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
  IonMenu,
  IonMenuButton,
  IonButtons,
  useIonRouter
} from '@ionic/react'
import { 
  chevronForward, 
  refresh, 
  list, 
  add, 
  trendingUp, 
  person, 
  search,
  menu,
  close
} from 'ionicons/icons'
import SwipePollCard from '../components/SwipePollCard'
import { Poll, User } from '../types'
import { PollzAPI } from '../database/api'

interface DesktopHomePageProps {
  polls: Poll[]
  user: User
  onVote: (pollId: string, option: 'A' | 'B') => void
  onLike: (pollId: string) => void
  loadPolls: (reset?: boolean) => void
  loadMorePolls: () => void
  loading: boolean
  loadingMore: boolean
  hasMorePolls: boolean
  totalPolls: number
  currentPage: number
  error: string | null
  onNavigate: (path: string) => void
}

const DesktopHomePage: React.FC<DesktopHomePageProps> = ({ 
  polls, 
  user, 
  onVote, 
  onLike, 
  loadPolls,
  loadMorePolls,
  loading,
  loadingMore,
  hasMorePolls,
  totalPolls,
  currentPage,
  error,
  onNavigate
}) => {
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [showSidebar, setShowSidebar] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const contentRef = useRef<HTMLIonContentElement>(null)
  const router = useIonRouter() // Get router instance inside component

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 1024)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Filter polls by search query (show all polls, including voted ones)
  const availablePolls = polls.filter(poll => 
    (searchQuery === '' || 
     poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     poll.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
     poll.context?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Calculate polls per row based on screen size
  const pollsPerRow = isMobile ? 1 : 3

  // Handle vote completion and auto-scroll when row is complete
  const handleVoteComplete = (pollId: string) => {
    setVotedPolls(prev => {
      const newVotedPolls = new Set([...prev, pollId])
      
      // Check if we've completed a row
      const votedInCurrentView = availablePolls.filter(p => newVotedPolls.has(p.id)).length
      
      // Auto-scroll to next row if current row is complete
      if (votedInCurrentView > 0 && votedInCurrentView % pollsPerRow === 0 && !isMobile) {
        setTimeout(() => {
          const nextPollIndex = votedInCurrentView
          const nextPollElement = document.querySelector(`[data-poll-index="${nextPollIndex}"]`)
          if (nextPollElement) {
            nextPollElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            })
          }
        }, 2100) // Wait for results to show (2 seconds) + small buffer
      }
      
      return newVotedPolls
    })
  }

  // Handle direct voting
  const handleVote = async (pollId: string, option: 'A' | 'B') => {
    onVote(pollId, option)
  }

  // Reset voted polls when polls change
  useEffect(() => {
    setVotedPolls(new Set())
  }, [polls])

  // Load more polls when scrolling near bottom
  useEffect(() => {
    const handleScroll = async () => {
      if (contentRef.current && hasMorePolls && !loadingMore) {
        const scrollElement = await contentRef.current.getScrollElement()
        if (scrollElement) {
          const { scrollTop, scrollHeight, clientHeight } = scrollElement
          // Trigger when user scrolls to bottom
          if (scrollTop + clientHeight >= scrollHeight - 100) {
            console.log('Triggering loadMorePolls from scroll')
            loadMorePolls()
          }
        }
      }
    }

    const setupScrollListener = async () => {
      if (contentRef.current) {
        const scrollElement = await contentRef.current.getScrollElement()
        if (scrollElement) {
          scrollElement.addEventListener('scroll', handleScroll)
          return () => scrollElement.removeEventListener('scroll', handleScroll)
        }
      }
    }

    setupScrollListener()
  }, [hasMorePolls, loadingMore, loadMorePolls])

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

  // Only show error if not searching and there's an actual error
  if (error && !searchQuery && polls.length === 0) {
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
      {/* Sidebar */}
      <div 
        className={`sidebar ${showSidebar ? 'sidebar-open' : ''}`}
        style={{
          position: 'fixed',
          left: showSidebar ? '0' : '-300px',
          top: '0',
          width: '300px',
          height: '100vh',
          background: '#ffffff',
          borderRight: '3px solid #000000',
          zIndex: 1000,
          transition: 'left 0.3s ease',
          padding: '20px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h2 style={{ 
            fontFamily: 'Courier New, Courier, monospace',
            fontWeight: '700',
            fontSize: '18px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#000000',
            margin: '0'
          }}>
            NAVIGATION
          </h2>
          <IonButton 
            fill="clear" 
            size="small"
            onClick={() => setShowSidebar(false)}
          >
            <IonIcon icon={close} />
          </IonButton>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <IonButton 
            expand="block" 
            fill="outline"
            onClick={() => {
              router.push('/home')
              setShowSidebar(false)
            }}
            style={{
              '--border-color': '#000000',
              '--color': '#000000',
              '--border-width': '2px',
              '--border-radius': '0',
              fontFamily: 'Courier New, Courier, monospace',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            <IonIcon icon={list} slot="start" />
            HOME
          </IonButton>

          <IonButton 
            expand="block" 
            fill="outline"
            onClick={() => {
              router.push('/create')
              setShowSidebar(false)
            }}
            style={{
              '--border-color': '#000000',
              '--color': '#000000',
              '--border-width': '2px',
              '--border-radius': '0',
              fontFamily: 'Courier New, Courier, monospace',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            <IonIcon icon={add} slot="start" />
            CREATE POLL
          </IonButton>

          <IonButton 
            expand="block" 
            fill="outline"
            onClick={() => {
              router.push('/trending')
              setShowSidebar(false)
            }}
            style={{
              '--border-color': '#000000',
              '--color': '#000000',
              '--border-width': '2px',
              '--border-radius': '0',
              fontFamily: 'Courier New, Courier, monospace',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            <IonIcon icon={trendingUp} slot="start" />
            TRENDING
          </IonButton>

          <IonButton 
            expand="block" 
            fill="outline"
            onClick={() => {
              router.push('/profile')
              setShowSidebar(false)
            }}
            style={{
              '--border-color': '#000000',
              '--color': '#000000',
              '--border-width': '2px',
              '--border-radius': '0',
              fontFamily: 'Courier New, Courier, monospace',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            <IonIcon icon={person} slot="start" />
            PROFILE
          </IonButton>
        </nav>

        <div style={{ 
          marginTop: '40px',
          padding: '20px',
          border: '2px solid #000000',
          background: '#f8f8f8'
        }}>
          <h3 style={{ 
            fontFamily: 'Courier New, Courier, monospace',
            fontWeight: '700',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#000000',
            marginBottom: '12px'
          }}>
            QUICK STATS
          </h3>
          <div style={{ 
            fontFamily: 'Courier New, Courier, monospace',
            fontSize: '10px',
            color: '#666666',
            lineHeight: '1.4'
          }}>
            <div>Total Polls: {polls.length}</div>
            <div>Available: {availablePolls.length}</div>
            <div>Voted: {votedPolls.size}</div>
            <div>User: {user.name}</div>
          </div>
        </div>
      </div>

      {/* Sidebar overlay */}
      {showSidebar && (
        <div 
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
          onClick={() => setShowSidebar(false)}
        />
      )}

      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => setShowSidebar(true)}>
              <IonIcon icon={menu} />
            </IonButton>
          </IonButtons>
          <IonTitle>Pollz</IonTitle>
          <div slot="end" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IonChip 
              color="primary"
              style={{ fontSize: '10px', fontWeight: '700' }}
            >
              PAGE {currentPage} OF {Math.ceil(totalPolls / 10)}
            </IonChip>
            <IonChip 
              color="secondary"
              style={{ fontSize: '10px', fontWeight: '700' }}
            >
              {polls.length}/10 POLLS
            </IonChip>
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
            fontSize: isMobile ? '20px' : '28px',
            textTransform: 'uppercase',
            letterSpacing: '4px',
            color: '#000000',
            marginBottom: '16px',
            lineHeight: '1.1'
          }}>
            {isMobile ? 'SWIPE TO VOTE' : 'DESKTOP POLL BROWSER'}
          </h1>
          <p style={{ 
            fontFamily: 'Courier New, Courier, monospace',
            fontWeight: '700',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#000000',
            margin: '0 0 20px 0'
          }}>
            DISCOVER POLLS AND SETTLE ARGUMENTS
          </p>

          {/* Search Bar */}
          <IonSearchbar
            value={searchQuery}
            onIonInput={(e) => setSearchQuery(e.detail.value!)}
            placeholder="Search polls..."
            style={{
              '--background': '#ffffff',
              '--color': '#000000',
              '--border-radius': '0',
              '--border': '2px solid #000000',
              '--padding-start': '16px',
              '--padding-end': '16px',
              fontFamily: 'Courier New, Courier, monospace',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          />
        </div>

        {/* Poll Grid */}
        <div className="desktop-grid" style={{ padding: isMobile ? '20px' : '0' }}>
          {availablePolls.length === 0 ? (
            <div style={{ 
              textAlign: 'center',
              padding: '60px 20px',
              fontFamily: 'Courier New, Courier, monospace',
              fontSize: '16px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#666666',
              gridColumn: '1 / -1'
            }}>
              {searchQuery ? 'NO POLLS FOUND' : 'ALL CAUGHT UP!'}
            </div>
          ) : (
            <>
              {availablePolls.map((poll, index) => (
                <div 
                  key={poll.id}
                  className="desktop-poll-card"
                  style={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <SwipePollCard
                    poll={poll}
                    onVote={handleVote}
                    user={user}
                    onLike={onLike}
                    isActive={true}
                    onVoteComplete={() => handleVoteComplete(poll.id)}
                  />
                </div>
              ))}
            </>
          )}

          {/* Loading more indicator */}
          {loadingMore && (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '40px 20px',
              fontFamily: 'Courier New, Courier, monospace',
              fontSize: '14px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#666666'
            }}>
              LOADING NEXT PAGE...
            </div>
          )}

          {/* End of polls indicator */}
          {!hasMorePolls && polls.length > 0 && (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '40px 20px',
              fontFamily: 'Courier New, Courier, monospace',
              fontSize: '14px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#000000',
              borderTop: '2px solid #000000',
              marginTop: '20px'
            }}>
              ALL POLLS VIEWED! ({totalPolls} TOTAL POLLS)
            </div>
          )}
        </div>

        {/* Floating Action Buttons */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton 
            onClick={() => {
              setVotedPolls(new Set())
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
      </IonContent>
    </IonPage>
  )
}

export default DesktopHomePage

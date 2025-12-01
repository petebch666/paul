import React, { useState, useEffect } from 'react'
import { IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react'
import { useIonRouter } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Route, Redirect } from 'react-router-dom'
import { home, add, person, shield } from 'ionicons/icons'
import { useAppState } from './hooks/useAppState'
import HomePage from './pages/HomePage'
import CreatePage from './pages/CreatePage'
import ProfilePage from './pages/ProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import PollHistoryPage from './pages/PollHistoryPage'
import AdminDashboard from './pages/AdminDashboard'
import MigrationPage from './pages/MigrationPage'
import AuthenticationWrapper from './components/AuthenticationWrapper'
import SecurityBadge from './components/SecurityBadge'
import { useAuth } from './hooks/useAuth'
import './App.css'

// Import utilities for development (DISABLED - Using real data only)
if (import.meta.env.DEV) {
  // Removed auto-population scripts - we're using real data now!
  // Migration to Supabase complete
  
  // Make functions available in console for manual testing only
  import('./database/unified-api').then(module => {
    (window as any).PollzAPI = module.default
    console.log('💡 PollzAPI available in console for testing')
  })
}

// Mock data (kept for reference, but no longer used)
const mockPolls = [
  {
    id: '1',
    title: 'Pineapple on Pizza: Crime or Genius?',
    description: 'The eternal debate that divides families and destroys friendships',
    votes: 1247,
    votesOptionA: 534,
    votesOptionB: 713,
    category: 'Food',
    timeLeft: '2 days left',
    authorId: 'user-2',
    author: 'PizzaMaster',
    isVoted: false,
    isLiked: true,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    context: 'My Italian grandmother is rolling in her grave, but I need to know the truth!',
    arguments: {
      optionA: 'Pineapple adds the perfect sweet contrast to salty toppings',
      optionB: 'Fruit has no place on pizza - it\'s basically a crime against Italy'
    },
    evidence: {
      optionA: [
        {
          id: '1',
          type: 'text',
          title: 'Hawaiian Pizza Facts',
          content: 'Hawaiian pizza was invented in Canada by a Greek immigrant in 1962',
          submittedBy: 'PizzaMaster',
          submittedAt: new Date()
        }
      ],
      optionB: [
        {
          id: '2',
          type: 'text',
          title: 'Italian Pizza Purists',
          content: 'Real Italians would rather eat their nonna\'s cooking than pineapple pizza',
          submittedBy: 'PizzaPurist',
          submittedAt: new Date()
        }
      ]
    },
    comments: [
      {
        id: '1',
        pollId: '1',
        userId: 'user-1',
        username: 'ChefMario',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        content: 'As an Italian, I\'m offended this is even a question! 🇮🇹',
        timestamp: new Date(),
        likes: 12,
        isLiked: true
      }
    ],
    debateHistory: {
      creatorWins: 8,
      opponentWins: 3,
      totalDebates: 11
    },
    trendingScore: 95.2
  },
  {
    id: '2',
    title: 'Cats vs Dogs: Who Rules the Internet?',
    description: 'Which furry overlord deserves the crown of viral supremacy?',
    votes: 892,
    votesOptionA: 445,
    votesOptionB: 447,
    category: 'Animals',
    timeLeft: '5 hours left',
    authorId: 'user-1',
    author: 'PetInfluencer',
    isVoted: true,
    isLiked: false,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 5 * 60 * 60 * 1000),
    context: 'My cat just knocked over my coffee again while my dog watched with judgmental eyes',
    arguments: {
      optionA: 'Cats are mysterious, elegant, and perfect meme material',
      optionB: 'Dogs are loyal, goofy, and always ready for adventure'
    },
    evidence: {
      optionA: [],
      optionB: []
    },
    comments: [],
    debateHistory: {
      creatorWins: 5,
      opponentWins: 2,
      totalDebates: 7
    },
    trendingScore: 87.4
  },
  {
    id: '3',
    title: 'Socks: One Big or Two Small?',
    description: 'The most controversial question in laundry history',
    votes: 2156,
    votesOptionA: 892,
    votesOptionB: 1264,
    category: 'Lifestyle',
    timeLeft: '1 week left',
    authorId: 'user-2',
    author: 'LaundryGuru',
    isVoted: false,
    isLiked: true,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    context: 'I\'m tired of losing socks in the dryer. Time to settle this scientifically!',
    arguments: {
      optionA: 'One big sock for both feet - efficiency and warmth combined',
      optionB: 'Two small socks - tradition and individual toe freedom'
    },
    evidence: {
      optionA: [
        {
          id: '3',
          type: 'text',
          title: 'Sock Efficiency Study',
          content: 'Studies show 47% less sock loss with the one-big-sock method',
          submittedBy: 'LaundryGuru',
          submittedAt: new Date()
        }
      ],
      optionB: [
        {
          id: '4',
          type: 'text',
          title: 'Traditional Sock Wisdom',
          content: 'Your ancestors wore two socks for a reason - don\'t break tradition!',
          submittedBy: 'SockTraditionalist',
          submittedAt: new Date()
        }
      ]
    },
    comments: [
      {
        id: '2',
        pollId: '3',
        userId: 'user-1',
        username: 'SockCollector',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
        content: 'I have 47 single socks. This debate is personal!',
        timestamp: new Date(),
        likes: 8,
        isLiked: false
      }
    ],
    debateHistory: {
      creatorWins: 12,
      opponentWins: 7,
      totalDebates: 19
    },
    trendingScore: 92.8
  },
  {
    id: '4',
    title: 'Cereal: Milk First or Cereal First?',
    description: 'The breakfast debate that\'s tearing families apart',
    votes: 1834,
    votesOptionA: 1123,
    votesOptionB: 711,
    category: 'Food',
    timeLeft: '3 days left',
    authorId: 'user-2',
    author: 'BreakfastBandit',
    isVoted: false,
    isLiked: true,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    context: 'My roommate just poured milk before cereal and I need to know if I should move out',
    arguments: {
      optionA: 'Cereal first - proper layering prevents sogginess',
      optionB: 'Milk first - pre-chilled milk keeps cereal crisp longer'
    },
    evidence: {
      optionA: [],
      optionB: []
    },
    comments: [],
    debateHistory: {
      creatorWins: 6,
      opponentWins: 4,
      totalDebates: 10
    },
    trendingScore: 78.5
  },
  {
    id: '5',
    title: 'Shower Thoughts: Hot vs Cold Water',
    description: 'Which temperature leads to better philosophical breakthroughs?',
    votes: 967,
    votesOptionA: 623,
    votesOptionB: 344,
    category: 'Lifestyle',
    timeLeft: '6 hours left',
    authorId: 'user-1',
    author: 'ShowerPhilosopher',
    isVoted: true,
    isLiked: false,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
    context: 'I had my best idea ever in a hot shower, but maybe cold showers make you smarter?',
    arguments: {
      optionA: 'Hot showers relax the mind and unlock creativity',
      optionB: 'Cold showers shock the system and enhance focus'
    },
    evidence: {
      optionA: [],
      optionB: []
    },
    comments: [],
    debateHistory: {
      creatorWins: 3,
      opponentWins: 1,
      totalDebates: 4
    },
    trendingScore: 65.2
  }
]

// Inner component that has access to router context
function AppContent() {
  const [currentPage, setCurrentPage] = useState<'home' | 'notifications' | 'history'>('home')
  const [currentTab, setCurrentTab] = useState<'home' | 'create' | 'profile' | 'admin'>('home')
  const { logout: authLogout } = useAuth()
  const router = useIonRouter()

  const {
    polls,
    allPolls,
    user,
    loading,
    loadingMore,
    error,
    hasMorePolls,
    totalPolls,
    notifications,
    pollHistory,
    handleVote,
    handleLike,
    createPoll,
    loadPolls,
    loadMorePolls,
    loadNotifications,
    loadPollHistory,
    markNotificationAsRead,
    updatePollTimers
  } = useAppState()

  // Debug: Log user role when it changes
  useEffect(() => {
    if (user) {
      console.log('👤 User loaded:', user.name, 'Role:', user.role)
      console.log('🔐 Show Admin Tab:', user.role === 'admin')
    }
  }, [user])

  // Navigation functions
  const navigateToNotifications = () => {
    setCurrentPage('notifications')
  }

  const navigateToHistory = () => {
    setCurrentPage('history')
  }

  const navigateToHome = () => {
    setCurrentPage('home')
  }

  // Navigation handler - will be used inside IonReactRouter context
  const handleNavigate = (path: string) => {
    // Navigation will be handled by child components with access to router
    console.log('Navigate to:', path)
  }

  // Handle tab click - scroll to top if already on that tab
  const handleTabClick = (tab: 'home' | 'create' | 'profile' | 'admin') => {
    if (!router.routeInfo) return
    
    const currentPath = router.routeInfo.pathname
    const tabPath = `/${tab}`
    
    if (currentPath === tabPath) {
      // Already on this tab, scroll to top
      const content = document.querySelector('ion-content')
      if (content) {
        content.scrollToTop(500)
        console.log(`📍 Scrolled to top of ${tab}`)
      }
    } else {
      // Navigate to new tab
      setCurrentTab(tab)
    }
  }

  return (
    <>
            {currentPage === 'notifications' ? (
              <div className="main-content">
                <NotificationsPage
                  notifications={notifications}
                  loading={loading}
                  onRefresh={loadNotifications}
                  onMarkAsRead={markNotificationAsRead}
                />
              </div>
            ) : currentPage === 'history' ? (
              <div className="main-content">
                <PollHistoryPage
                  pollHistory={pollHistory}
                  loading={loading}
                  onRefresh={loadPollHistory}
                />
              </div>
            ) : (
              <IonTabs>
              <IonRouterOutlet>
            <Route exact path="/home">
              <HomePage
                polls={polls}
                allPolls={allPolls}
                user={user}
                onVote={handleVote}
                onLike={handleLike}
                loadPolls={loadPolls}
                loadMorePolls={loadMorePolls}
                loading={loading}
                loadingMore={loadingMore}
                hasMorePolls={hasMorePolls}
                error={error}
              />
            </Route>
            <Route exact path="/create">
              <CreatePage
                onCreatePoll={createPoll}
              />
            </Route>
            <Route exact path="/profile">
              <ProfilePage
                user={user}
                polls={polls}
                onVote={handleVote}
                onLike={handleLike}
                onNavigateToNotifications={navigateToNotifications}
                onNavigateToHistory={navigateToHistory}
                onLogout={authLogout}
              />
            </Route>
            <Route exact path="/admin">
              <AdminDashboard />
            </Route>
            <Route exact path="/migrate">
              <MigrationPage />
            </Route>
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
          </IonRouterOutlet>
          
          <IonTabBar slot="bottom">
            <IonTabButton 
              tab="home" 
              href="/home"
              onClick={() => handleTabClick('home')}
            >
              <IonIcon icon={home} />
              <IonLabel>Home</IonLabel>
            </IonTabButton>
            <IonTabButton 
              tab="create" 
              href="/create"
              onClick={() => handleTabClick('create')}
            >
              <IonIcon icon={add} />
              <IonLabel>Create</IonLabel>
            </IonTabButton>
            <IonTabButton 
              tab="profile" 
              href="/profile"
              onClick={() => handleTabClick('profile')}
            >
              <IonIcon icon={person} />
              <IonLabel>Profile</IonLabel>
            </IonTabButton>
            {user?.role === 'admin' && (
              <IonTabButton 
                tab="admin" 
                href="/admin"
                onClick={() => handleTabClick('admin' as any)}
              >
                <IonIcon icon={shield} />
                <IonLabel>Admin</IonLabel>
              </IonTabButton>
            )}
              </IonTabBar>
            </IonTabs>
            )}
            
            {error && (
              <div className="error-banner">
                <p>⚠️ {error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
              </div>
            )}
            
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading...</div>
        </div>
      )}
    </>
  )
}

// Main App wrapper that provides router context
function App() {
  return (
    <IonReactRouter>
      <IonApp>
        <AuthenticationWrapper>
          <AppContent />
        </AuthenticationWrapper>
      </IonApp>
    </IonReactRouter>
  )
}

export default App
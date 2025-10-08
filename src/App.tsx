import React, { useState, useEffect } from 'react'
import { IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react'
import { useIonRouter } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Route, Redirect } from 'react-router-dom'
import { home, add, trendingUp, person } from 'ionicons/icons'
import { useAppState } from './hooks/useAppState'
import HomePage from './pages/HomePage'
import SwipeHomePage from './pages/SwipeHomePage'
import DesktopHomePage from './pages/DesktopHomePage'
import CreatePage from './pages/CreatePage'
import TrendingPage from './pages/TrendingPage'
import ProfilePage from './pages/ProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import PollHistoryPage from './pages/PollHistoryPage'
import AuthenticationWrapper from './components/AuthenticationWrapper'
import { useAuth } from './hooks/useAuth'
import './App.css'

// Import test utility for development
if (process.env.NODE_ENV === 'development') {
  import('./utils/test-api')
  import('./utils/populate-humorous-polls')
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

function App() {
  const [isDesktop, setIsDesktop] = useState(false)
  const [currentPage, setCurrentPage] = useState<'home' | 'notifications' | 'history'>('home')
  const router = useIonRouter()
  const { logout } = useAuth()

  const {
    polls,
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

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth > 1024)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

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

  // Navigation handler
  const handleNavigate = (path: string) => {
    router.push(path)
  }

  return (
    <IonReactRouter>
      <IonApp>
        <AuthenticationWrapper>
          {currentPage === 'notifications' ? (
            <NotificationsPage
              notifications={notifications}
              loading={loading}
              onRefresh={loadNotifications}
              onMarkAsRead={markNotificationAsRead}
            />
          ) : currentPage === 'history' ? (
            <PollHistoryPage
              pollHistory={pollHistory}
              loading={loading}
              onRefresh={loadPollHistory}
            />
          ) : (
            <IonTabs>
              <IonRouterOutlet>
            <Route exact path="/home">
              {isDesktop ? (
                <DesktopHomePage
                  polls={polls}
                  user={user}
                  onVote={handleVote}
                  onLike={handleLike}
                  loadPolls={loadPolls}
                  loadMorePolls={loadMorePolls}
                  loading={loading}
                  loadingMore={loadingMore}
                  hasMorePolls={hasMorePolls}
                  totalPolls={totalPolls}
                  currentPage={0}
                  error={error}
                  onNavigate={handleNavigate}
                />
              ) : (
                <HomePage
                  polls={polls}
                  user={user}
                  onVote={handleVote}
                  onLike={handleLike}
                  loadPolls={loadPolls}
                  loading={loading}
                  error={error}
                />
              )}
            </Route>
            <Route exact path="/create">
              <CreatePage
                onCreatePoll={createPoll}
              />
            </Route>
            <Route exact path="/trending">
              <TrendingPage
                polls={polls}
                user={user}
                onVote={handleVote}
                onLike={handleLike}
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
                onLogout={logout}
              />
            </Route>
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
          </IonRouterOutlet>
          
          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/home">
              <IonIcon icon={home} />
              <IonLabel>Home</IonLabel>
            </IonTabButton>
            <IonTabButton tab="create" href="/create">
              <IonIcon icon={add} />
              <IonLabel>Create</IonLabel>
            </IonTabButton>
            <IonTabButton tab="trending" href="/trending">
              <IonIcon icon={trendingUp} />
              <IonLabel>Trending</IonLabel>
            </IonTabButton>
            <IonTabButton tab="profile" href="/profile">
              <IonIcon icon={person} />
              <IonLabel>Profile</IonLabel>
            </IonTabButton>
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
        </AuthenticationWrapper>
      </IonApp>
    </IonReactRouter>
  )
}

export default App
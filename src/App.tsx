import React, { useEffect } from 'react'
import { useAppState } from './hooks/useAppState'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import CreatePage from './pages/CreatePage'
import TrendingPage from './pages/TrendingPage'
import ProfilePage from './pages/ProfilePage'
import { Poll, User } from './types'
import './App.css'

// Mock data
const mockPolls: Poll[] = [
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
  const {
    currentPage,
    polls,
    user,
    navigateTo,
    handleVote,
    handleLike,
    createPoll,
    setPolls
  } = useAppState()

  // Initialize with mock data
  useEffect(() => {
    setPolls(mockPolls)
  }, [setPolls])

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            polls={polls}
            user={user}
            onVote={handleVote}
            onLike={handleLike}
          />
        )
      case 'create':
        return (
          <CreatePage
            onCreatePoll={createPoll}
          />
        )
      case 'trending':
        return (
          <TrendingPage
            polls={polls}
            user={user}
            onVote={handleVote}
            onLike={handleLike}
          />
        )
      case 'profile':
        return (
          <ProfilePage
            user={user}
            polls={polls}
            onVote={handleVote}
            onLike={handleLike}
          />
        )
      default:
        return (
          <HomePage
            polls={polls}
            user={user}
            onVote={handleVote}
            onLike={handleLike}
          />
        )
    }
  }

  return (
    <div className="app">
      <Navigation
        currentPage={currentPage}
        onNavigate={navigateTo}
      />
      <main className="main-content">
        {renderCurrentPage()}
      </main>
    </div>
  )
}

export default App
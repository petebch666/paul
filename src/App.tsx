import React, { useState, useEffect } from 'react'
import { 
  Home, 
  Search, 
  Plus, 
  User, 
  Settings, 
  Heart, 
  MessageCircle, 
  Bell, 
  TrendingUp,
  Users,
  BarChart3,
  Zap,
  Star,
  ChevronRight,
  Menu,
  X,
  Link,
  Image,
  FileText,
  ThumbsUp,
  Clock,
  Trophy,
  Target,
  Eye,
  EyeOff,
  Share2,
  Twitter,
  Facebook,
  Copy,
  UserPlus,
  UserMinus,
  Award,
  Crown,
  Shield,
  Flame,
  TrendingUp as TrendingIcon,
  CheckCircle,
  Sparkles,
  Brain,
  TrendingUp as TrendingUpIcon,
  AlertTriangle,
  Lightbulb,
  Filter,
  Tag,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Zap as Lightning,
  Bookmark,
  BookmarkCheck
} from 'lucide-react'
import './App.css'

interface Poll {
  id: string
  title: string
  description: string
  votes: number
  category: string
  timeLeft: string
  author: string
  isVoted: boolean
  isLiked: boolean
  // Enhanced Debate Features
  context?: string
  arguments?: {
    optionA: string
    optionB: string
  }
  evidence?: {
    optionA: Evidence[]
    optionB: Evidence[]
  }
  comments: Comment[]
  debateHistory?: {
    creatorWins: number
    opponentWins: number
    totalDebates: number
  }
  // Smart Features
  trendingScore?: number
  createdAt?: Date
}

interface Evidence {
  id: string
  type: 'link' | 'image' | 'text'
  content: string
  title: string
  submittedBy: string
  submittedAt: Date
}

interface Comment {
  id: string
  pollId: string
  userId: string
  username: string
  avatar: string
  content: string
  timestamp: Date
  likes: number
  isLiked: boolean
}

interface User {
  id: string
  name: string
  username: string
  avatar: string
  followers: number
  following: number
  reputation: number
  badges: Badge[]
  isFollowing?: boolean
  pollCount: number
  winRate: number
  joinDate: Date
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'debate' | 'creation' | 'judgment' | 'social' | 'achievement'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  earnedAt: Date
  progress?: number
  maxProgress?: number
}

interface ReputationEvent {
  id: string
  userId: string
  type: 'poll_created' | 'poll_voted' | 'poll_won' | 'poll_lost' | 'comment_liked' | 'evidence_submitted'
  points: number
  description: string
  pollId?: string
  createdAt: Date
}

interface CategorySuggestion {
  category: string
  confidence: number
  keywords: string[]
}

interface PollSuggestion {
  id: string
  title: string
  reason: 'trending' | 'similar_interests' | 'category_match' | 'popular_user'
  confidence: number
  category: string
  votes: number
  author: string
}

interface DuplicateCheck {
  isDuplicate: boolean
  similarity: number
  similarPolls: Poll[]
  message?: string
}

interface TrendingScore {
  pollId: string
  score: number
  velocity: number
  recentVotes: number
  categoryBoost: number
}

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [polls, setPolls] = useState<Poll[]>([])
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [categorySuggestions, setCategorySuggestions] = useState<CategorySuggestion[]>([])
  const [pollSuggestions, setPollSuggestions] = useState<PollSuggestion[]>([])
  const [trendingPolls, setTrendingPolls] = useState<Poll[]>([])
  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateCheck | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [user, setUser] = useState<User>({
    id: 'user-1',
    name: 'Alex Johnson',
    username: '@alexjohnson',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    followers: 1234,
    following: 567,
    reputation: 2847,
    badges: [
      {
        id: 'badge-1',
        name: 'Master Debater',
        description: 'Won 25+ debates',
        icon: 'Crown',
        category: 'debate',
        rarity: 'legendary',
        earnedAt: new Date('2024-01-15')
      },
      {
        id: 'badge-2',
        name: 'Poll Creator',
        description: 'Created 50+ polls',
        icon: 'Plus',
        category: 'creation',
        rarity: 'epic',
        earnedAt: new Date('2024-02-01')
      },
      {
        id: 'badge-3',
        name: 'Fair Judge',
        description: 'Voted on 100+ polls',
        icon: 'Shield',
        category: 'judgment',
        rarity: 'rare',
        earnedAt: new Date('2024-02-10')
      },
      {
        id: 'badge-4',
        name: 'Trending Star',
        description: 'Had a poll go viral',
        icon: 'Flame',
        category: 'social',
        rarity: 'epic',
        earnedAt: new Date('2024-02-20')
      }
    ],
    pollCount: 52,
    winRate: 0.73,
    joinDate: new Date('2023-12-01')
  })

  const [allUsers, setAllUsers] = useState<User[]>([
    {
      id: 'user-2',
      name: 'Sarah Chen',
      username: '@sarahchen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      followers: 892,
      following: 234,
      reputation: 1956,
      badges: [
        {
          id: 'badge-5',
          name: 'Evidence Master',
          description: 'Submitted 30+ pieces of evidence',
          icon: 'Target',
          category: 'debate',
          rarity: 'rare',
          earnedAt: new Date('2024-01-20')
        }
      ],
      pollCount: 23,
      winRate: 0.68,
      joinDate: new Date('2024-01-01'),
      isFollowing: false
    },
    {
      id: 'user-3',
      name: 'Mike Rodriguez',
      username: '@mikerod',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      followers: 2156,
      following: 445,
      reputation: 3421,
      badges: [
        {
          id: 'badge-6',
          name: 'Viral Creator',
          description: 'Created 5+ viral polls',
          icon: 'Sparkles',
          category: 'social',
          rarity: 'legendary',
          earnedAt: new Date('2024-02-15')
        }
      ],
      pollCount: 78,
      winRate: 0.81,
      joinDate: new Date('2023-11-15'),
      isFollowing: true
    }
  ])

  useEffect(() => {
    // Simulate loading polls with enhanced debate features
    const mockPolls: Poll[] = [
      {
        id: '1',
        title: 'Best Programming Language 2024?',
        description: 'What do you think will be the most popular programming language this year?',
        votes: 1247,
        category: 'Technology',
        timeLeft: '2 days left',
        author: 'TechGuru',
        isVoted: false,
        isLiked: true,
        context: 'This debate started when my colleague and I couldn\'t agree on which language to use for our new project. We both have strong opinions!',
        arguments: {
          optionA: 'TypeScript offers better type safety and developer experience',
          optionB: 'Python has the best ecosystem and is easier to learn'
        },
        evidence: {
          optionA: [
            {
              id: '1',
              type: 'link',
              title: 'TypeScript 5.0 Release Notes',
              content: 'https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/',
              submittedBy: 'TechGuru',
              submittedAt: new Date()
            }
          ],
          optionB: [
            {
              id: '2',
              type: 'link',
              title: 'Python Developer Survey 2023',
              content: 'https://python.org/survey',
              submittedBy: 'PythonFan',
              submittedAt: new Date()
            }
          ]
        },
        comments: [
          {
            id: '1',
            pollId: '1',
            userId: 'user1',
            username: 'CodeMaster',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
            content: 'Both have their merits, but TypeScript is definitely gaining momentum!',
            timestamp: new Date(),
            likes: 12,
            isLiked: true
          }
        ],
        debateHistory: {
          creatorWins: 8,
          opponentWins: 3,
          totalDebates: 11
        }
      },
      {
        id: '2',
        title: 'Favorite Social Media Platform',
        description: 'Which platform do you use most for staying connected?',
        votes: 892,
        category: 'Social',
        timeLeft: '5 hours left',
        author: 'SocialBee',
        isVoted: true,
        isLiked: false,
        context: 'After a heated discussion at the office about social media preferences, we decided to settle this once and for all.',
        arguments: {
          optionA: 'Twitter/X has the best real-time conversations',
          optionB: 'Instagram is more visual and engaging'
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
        }
      },
      {
        id: '3',
        title: 'Remote vs Office Work',
        description: 'What\'s your preferred working arrangement?',
        votes: 2156,
        category: 'Work',
        timeLeft: '1 week left',
        author: 'WorkLife',
        isVoted: false,
        isLiked: true,
        context: 'This is a debate that never gets old. Let\'s see what the community thinks about the future of work.',
        arguments: {
          optionA: 'Remote work offers better work-life balance and flexibility',
          optionB: 'Office work provides better collaboration and team building'
        },
        evidence: {
          optionA: [
            {
              id: '3',
              type: 'text',
              title: 'Remote Work Productivity Study',
              content: 'Stanford study shows 13% increase in productivity for remote workers',
              submittedBy: 'WorkLife',
              submittedAt: new Date()
            }
          ],
          optionB: [
            {
              id: '4',
              type: 'link',
              title: 'Collaboration Benefits of Office Work',
              content: 'https://hbr.org/office-collaboration',
              submittedBy: 'OfficeAdvocate',
              submittedAt: new Date()
            }
          ]
        },
        comments: [
          {
            id: '2',
            pollId: '3',
            userId: 'user2',
            username: 'RemoteWorker',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
            content: 'I\'ve been remote for 3 years and love the flexibility!',
            timestamp: new Date(),
            likes: 8,
            isLiked: false
          }
        ],
        debateHistory: {
          creatorWins: 12,
          opponentWins: 7,
          totalDebates: 19
        }
      }
    ]
    setPolls(mockPolls)
    
    // Initialize smart features
    const suggestions = getPollSuggestions()
    setPollSuggestions(suggestions)
    
    // Calculate trending scores and sort polls
    const pollsWithTrending = mockPolls.map(poll => ({
      ...poll,
      trendingScore: calculateTrendingScore(poll).score
    })).sort((a, b) => b.trendingScore - a.trendingScore)
    
    setTrendingPolls(pollsWithTrending.slice(0, 5))
  }, [])

  const handleVote = (pollId: string) => {
    setPolls(prev => prev.map(poll => 
      poll.id === pollId 
        ? { ...poll, votes: poll.votes + 1, isVoted: true }
        : poll
    ))
  }

  const handleLike = (pollId: string) => {
    setPolls(prev => prev.map(poll => 
      poll.id === pollId 
        ? { ...poll, isLiked: !poll.isLiked }
        : poll
    ))
  }

  const handleAddComment = (pollId: string) => {
    if (!newComment.trim()) return
    
    const comment: Comment = {
      id: Date.now().toString(),
      pollId,
      userId: 'current-user',
      username: user.name,
      avatar: user.avatar,
      content: newComment,
      timestamp: new Date(),
      likes: 0,
      isLiked: false
    }

    setPolls(prev => prev.map(poll => 
      poll.id === pollId 
        ? { ...poll, comments: [...poll.comments, comment] }
        : poll
    ))
    setNewComment('')
  }

  const handleLikeComment = (pollId: string, commentId: string) => {
    setPolls(prev => prev.map(poll => 
      poll.id === pollId 
        ? {
            ...poll,
            comments: poll.comments.map(comment =>
              comment.id === commentId
                ? { 
                    ...comment, 
                    isLiked: !comment.isLiked,
                    likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
                  }
                : comment
            )
          }
        : poll
    ))
  }

  const handleViewPollDetails = (poll: Poll) => {
    setSelectedPoll(poll)
  }

  const handleFollowUser = (userId: string) => {
    setAllUsers(prev => prev.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            isFollowing: !user.isFollowing,
            followers: user.isFollowing ? user.followers - 1 : user.followers + 1
          }
        : user
    ))
  }

  const handleSharePoll = (poll: Poll) => {
    const shareUrl = `https://pollz.app/poll/${poll.id}`
    const shareText = `Check out this debate: "${poll.title}"`
    
    if (navigator.share) {
      navigator.share({
        title: poll.title,
        text: shareText,
        url: shareUrl
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
      // You could show a toast notification here
    }
  }

  const handleShareToSocial = (poll: Poll, platform: 'twitter' | 'facebook') => {
    const shareUrl = `https://pollz.app/poll/${poll.id}`
    const shareText = `Check out this debate: "${poll.title}"`
    
    let url = ''
    if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    } else if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    }
    
    window.open(url, '_blank', 'width=600,height=400')
  }

  const getBadgeIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      'Crown': Crown,
      'Plus': Plus,
      'Shield': Shield,
      'Flame': Flame,
      'Target': Target,
      'Sparkles': Sparkles,
      'Trophy': Trophy,
      'Award': Award,
      'Star': Star
    }
    return icons[iconName] || Award
  }

  const getReputationLevel = (reputation: number) => {
    if (reputation >= 5000) return { level: 'Legend', color: '#ffd700', icon: Crown }
    if (reputation >= 2500) return { level: 'Master', color: '#c0c0c0', icon: Award }
    if (reputation >= 1000) return { level: 'Expert', color: '#cd7f32', icon: Trophy }
    if (reputation >= 500) return { level: 'Advanced', color: '#667eea', icon: Star }
    return { level: 'Beginner', color: '#10b981', icon: CheckCircle }
  }

  // Smart Features Functions
  const autoCategorize = (question: string, optionA: string, optionB: string): CategorySuggestion[] => {
    const text = `${question} ${optionA} ${optionB}`.toLowerCase()
    
    const categoryKeywords = {
      'Technology': ['programming', 'code', 'software', 'tech', 'computer', 'ai', 'machine learning', 'python', 'javascript', 'typescript', 'react', 'app', 'website', 'digital', 'online', 'internet', 'mobile', 'desktop'],
      'Society': ['social', 'community', 'people', 'culture', 'tradition', 'modern', 'society', 'government', 'politics', 'democracy', 'freedom', 'rights', 'equality', 'justice', 'law', 'policy'],
      'Work': ['job', 'career', 'work', 'office', 'remote', 'salary', 'employment', 'business', 'company', 'team', 'meeting', 'productivity', 'management', 'leadership', 'professional'],
      'Lifestyle': ['life', 'living', 'home', 'family', 'health', 'fitness', 'food', 'travel', 'vacation', 'hobby', 'entertainment', 'music', 'movie', 'book', 'sport', 'exercise'],
      'Entertainment': ['movie', 'film', 'music', 'song', 'book', 'game', 'sport', 'team', 'player', 'actor', 'singer', 'artist', 'show', 'series', 'concert', 'festival'],
      'Sports': ['football', 'soccer', 'basketball', 'tennis', 'golf', 'baseball', 'hockey', 'cricket', 'olympics', 'championship', 'tournament', 'player', 'team', 'coach', 'stadium']
    }

    const suggestions: CategorySuggestion[] = []
    
    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      const matches = keywords.filter(keyword => text.includes(keyword)).length
      const confidence = Math.min(matches / keywords.length * 100, 100)
      
      if (confidence > 10) {
        suggestions.push({
          category,
          confidence,
          keywords: keywords.filter(keyword => text.includes(keyword))
        })
      }
    })

    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3)
  }

  const calculateTrendingScore = (poll: Poll): TrendingScore => {
    const now = new Date()
    const createdAt = new Date(poll.createdAt || now)
    const timeElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60) // minutes
    
    // Recent votes get higher weight (votes in last hour)
    const recentVotes = Math.floor(poll.votes * 0.3) // Simulate recent votes
    const velocity = recentVotes / Math.max(timeElapsed / 60, 1) // votes per hour
    
    // Category boost (some categories trend more)
    const categoryBoosts = {
      'Technology': 1.5,
      'Society': 1.3,
      'Entertainment': 1.8,
      'Sports': 1.6,
      'Work': 1.2,
      'Lifestyle': 1.1
    }
    const categoryBoost = categoryBoosts[poll.category as keyof typeof categoryBoosts] || 1.0
    
    // Calculate trending score
    const score = (poll.votes * 0.4) + (velocity * 0.6) * categoryBoost
    
    return {
      pollId: poll.id,
      score,
      velocity,
      recentVotes,
      categoryBoost
    }
  }

  const checkDuplicates = (question: string, optionA: string, optionB: string): DuplicateCheck => {
    const newText = `${question} ${optionA} ${optionB}`.toLowerCase()
    const similarPolls: Poll[] = []
    
    polls.forEach(poll => {
      const existingText = `${poll.title} ${poll.description}`.toLowerCase()
      
      // Simple similarity check (in real app, use more sophisticated NLP)
      const words1 = newText.split(' ')
      const words2 = existingText.split(' ')
      const commonWords = words1.filter(word => words2.includes(word))
      const similarity = (commonWords.length / Math.max(words1.length, words2.length)) * 100
      
      if (similarity > 60) {
        similarPolls.push(poll)
      }
    })
    
    const isDuplicate = similarPolls.length > 0
    const maxSimilarity = similarPolls.length > 0 
      ? Math.max(...similarPolls.map(() => 75)) // Simulate similarity scores
      : 0
    
    return {
      isDuplicate,
      similarity: maxSimilarity,
      similarPolls: similarPolls.slice(0, 3),
      message: isDuplicate 
        ? `Similar poll found with ${maxSimilarity.toFixed(0)}% similarity`
        : undefined
    }
  }

  const getPollSuggestions = (): PollSuggestion[] => {
    const userInterests = ['Technology', 'Work'] // Based on user's past polls
    const suggestions: PollSuggestion[] = []
    
    polls.forEach(poll => {
      let reason: PollSuggestion['reason'] = 'trending'
      let confidence = 0
      
      // Category match
      if (userInterests.includes(poll.category)) {
        reason = 'category_match'
        confidence = 85
      }
      // Trending polls
      else if (poll.votes > 1000) {
        reason = 'trending'
        confidence = 75
      }
      // Popular users
      else if (poll.author === 'TechGuru' || poll.author === 'Mike Rodriguez') {
        reason = 'popular_user'
        confidence = 70
      }
      // Similar interests
      else {
        reason = 'similar_interests'
        confidence = 60
      }
      
      if (confidence > 50) {
        suggestions.push({
          id: poll.id,
          title: poll.title,
          reason,
          confidence,
          category: poll.category,
          votes: poll.votes,
          author: poll.author
        })
      }
    })
    
    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5)
  }

  const handleQuestionChange = (question: string) => {
    if (question.length > 10) {
      const suggestions = autoCategorize(question, '', '')
      setCategorySuggestions(suggestions)
    }
  }

  const handlePollCheck = (question: string, optionA: string, optionB: string) => {
    const duplicateResult = checkDuplicates(question, optionA, optionB)
    setDuplicateCheck(duplicateResult)
  }

  // Swipe Voting Handlers
  const handleMouseDown = (e: React.MouseEvent, pollId: string) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setSwipeDirection(null)
  }

  const handleMouseMove = (e: React.MouseEvent, pollId: string) => {
    if (!isDragging || !dragStart) return
    
    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y
    
    // Only consider horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left')
    }
  }

  const handleMouseUp = (pollId: string) => {
    if (!isDragging || !swipeDirection) {
      setIsDragging(false)
      setDragStart(null)
      setSwipeDirection(null)
      return
    }

    // Handle the vote based on swipe direction
    if (swipeDirection === 'right') {
      handleVote(pollId)
    } else if (swipeDirection === 'left') {
      // Left swipe could be for "dislike" or "skip" - for now, just like
      handleLike(pollId)
    }

    setIsDragging(false)
    setDragStart(null)
    setSwipeDirection(null)
  }

  const handleTouchStart = (e: React.TouchEvent, pollId: string) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX, y: touch.clientY })
    setSwipeDirection(null)
  }

  const handleTouchMove = (e: React.TouchEvent, pollId: string) => {
    if (!isDragging || !dragStart) return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - dragStart.x
    const deltaY = touch.clientY - dragStart.y
    
    // Only consider horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left')
    }
  }

  const handleTouchEnd = (pollId: string) => {
    if (!isDragging || !swipeDirection) {
      setIsDragging(false)
      setDragStart(null)
      setSwipeDirection(null)
      return
    }

    // Handle the vote based on swipe direction
    if (swipeDirection === 'right') {
      handleVote(pollId)
    } else if (swipeDirection === 'left') {
      handleLike(pollId)
    }

    setIsDragging(false)
    setDragStart(null)
    setSwipeDirection(null)
  }

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'create', label: 'Create', icon: Plus },
    { id: 'notifications', label: 'Activity', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User }
  ]

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Zap className="logo-icon" />
            <span>Pollz</span>
          </div>
          
          <div className="search-bar">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="Search polls, topics, or users..." 
              className="search-input"
            />
          </div>
          
          <div className="header-actions">
            <div className="red-dot-large"></div>
            <button className="notification-btn">
              <Bell />
              <span className="notification-badge">3</span>
            </button>
            <button className="profile-btn">
              <img src={user.avatar} alt={user.name} className="profile-avatar" />
            </button>
            <button 
              className="menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      <div className="app-body">
        {/* Sidebar */}
        <aside className={`sidebar ${isMenuOpen ? 'sidebar-open' : ''}`}>
          <nav className="nav">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setIsMenuOpen(false)
                  }}
                >
                  <Icon className="nav-icon" />
                  <span className="nav-label">{tab.label}</span>
                  {tab.id === 'notifications' && (
                    <span className="nav-badge">3</span>
                  )}
                </button>
              )
            })}
          </nav>
          
          <div className="sidebar-footer">
            <div className="user-info">
              <img src={user.avatar} alt={user.name} className="user-avatar" />
              <div className="user-details">
                <span className="user-name">{user.name}</span>
                <span className="user-followers">{user.followers} followers</span>
              </div>
            </div>
            <button className="settings-btn">
              <Settings />
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Decorative Red Dots */}
          <div className="decorative-dots">
            <div className="red-dot"></div>
            <div className="red-dot"></div>
            <div className="red-dot"></div>
          </div>
          
          {activeTab === 'home' && (
            <div className="home-page">
              <div className="page-header">
                <h1 className="pixelated">SWIPE TO VOTE</h1>
                <p>DISCOVER POLLS AND SETTLE ARGUMENTS</p>
              </div>

              <div className="polls-section">
                <div className="section-header">
                  <h2>LATEST POLLS</h2>
                  <button className="see-all-btn">
                    See All <ChevronRight />
                  </button>
                </div>

                <div className="polls-grid">
                  {polls.map(poll => (
                    <div key={poll.id} className="poll-card">
                      <div className="poll-header">
                        <span className="poll-category">{poll.category}</span>
                        <span className="poll-time">{poll.timeLeft}</span>
                      </div>
                      
                      <h3 className="poll-title">{poll.title}</h3>
                      
                      <div className="poll-options-simple">
                        <button 
                          className="option-btn option-a" 
                          onClick={() => handleVote(poll.id)}
                        >
                          {poll.options[0]}
                        </button>
                        <div className="vs-divider">VS</div>
                        <button 
                          className="option-btn option-b" 
                          onClick={() => handleVote(poll.id)}
                        >
                          {poll.options[1]}
                        </button>
                      </div>
                      
                      <div className="poll-stats-simple">
                        <span className="poll-votes">{poll.votes} VOTES</span>
                        <span className="poll-author-name">{poll.author}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trending' && (
            <div className="trending-page">
              <div className="trending-header">
                <h1 className="pixelated">TRENDING</h1>
                <p>MOST POPULAR POLLS RIGHT NOW, WEIGHTED BY RECENT ACTIVITY</p>
                <div className="trending-algorithm-info">
                  <Lightning className="algorithm-icon" />
                  <span>SMART ALGORITHM CONSIDERS RECENT VOTES, CATEGORY POPULARITY, AND ENGAGEMENT VELOCITY</span>
                </div>
              </div>

              <div className="trending-polls-section">
                <h2>⚡ Hot Right Now</h2>
                <div className="trending-polls-grid">
                  {trendingPolls.map((poll, index) => {
                    const trendingData = calculateTrendingScore(poll)
                    return (
                      <div key={poll.id} className="trending-poll-card">
                        <div className="trending-rank">
                          <span className="rank-number">#{index + 1}</span>
                          <TrendingUpIcon className="trending-icon" />
                        </div>
                        
                        <div className="trending-content">
                          <h3>{poll.title}</h3>
                          <p>{poll.description}</p>
                          
                          <div className="trending-metrics">
                            <div className="metric-item">
                              <Users className="metric-icon" />
                              <span>{poll.votes.toLocaleString()} votes</span>
                            </div>
                            <div className="metric-item">
                              <Zap className="metric-icon" />
                              <span>{trendingData.velocity.toFixed(1)}/hr</span>
                            </div>
                            <div className="metric-item">
                              <BarChart3 className="metric-icon" />
                              <span>Score: {trendingData.score.toFixed(0)}</span>
                            </div>
                          </div>
                          
                          <div className="trending-category">
                            <Tag className="category-icon" />
                            <span>{poll.category}</span>
                            <span className="category-boost">+{(trendingData.categoryBoost * 100 - 100).toFixed(0)}% boost</span>
                          </div>
                        </div>
                        
                        <div className="trending-actions">
                          <button 
                            className={`vote-btn ${poll.isVoted ? 'voted' : ''}`}
                            onClick={() => handleVote(poll.id)}
                            disabled={poll.isVoted}
                          >
                            {poll.isVoted ? 'Voted ✓' : 'Vote'}
                          </button>
                          <button 
                            className="view-details-btn"
                            onClick={() => handleViewPollDetails(poll)}
                          >
                            <Eye className="view-icon" />
                            <span>View</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Poll Suggestions */}
              <div className="suggestions-section">
                <div className="suggestions-header">
                  <h2>💡 Recommended for You</h2>
                  <button 
                    className="refresh-suggestions-btn"
                    onClick={() => {
                      const suggestions = getPollSuggestions()
                      setPollSuggestions(suggestions)
                    }}
                  >
                    <RefreshCw className="refresh-icon" />
                    <span>Refresh</span>
                  </button>
                </div>
                
                <div className="suggestions-grid">
                  {pollSuggestions.map(suggestion => {
                    const poll = polls.find(p => p.id === suggestion.id)
                    if (!poll) return null
                    
                    return (
                      <div key={suggestion.id} className="suggestion-card">
                        <div className="suggestion-reason">
                          {suggestion.reason === 'trending' && (
                            <>
                              <TrendingUp className="reason-icon" />
                              <span>Trending</span>
                            </>
                          )}
                          {suggestion.reason === 'category_match' && (
                            <>
                              <Tag className="reason-icon" />
                              <span>Your Interest</span>
                            </>
                          )}
                          {suggestion.reason === 'popular_user' && (
                            <>
                              <Star className="reason-icon" />
                              <span>Popular User</span>
                            </>
                          )}
                          {suggestion.reason === 'similar_interests' && (
                            <>
                              <Lightbulb className="reason-icon" />
                              <span>Similar Interest</span>
                            </>
                          )}
                          <span className="confidence">{suggestion.confidence}% match</span>
                        </div>
                        
                        <h3>{suggestion.title}</h3>
                        <p>{poll.description}</p>
                        
                        <div className="suggestion-stats">
                          <span>{suggestion.votes} votes</span>
                          <span>{suggestion.category}</span>
                          <span>by {suggestion.author}</span>
                        </div>
                        
                        <div className="suggestion-actions">
                          <button 
                            className={`vote-btn ${poll.isVoted ? 'voted' : ''}`}
                            onClick={() => handleVote(poll.id)}
                            disabled={poll.isVoted}
                          >
                            {poll.isVoted ? 'Voted ✓' : 'Vote'}
                          </button>
                          <button 
                            className="view-details-btn"
                            onClick={() => handleViewPollDetails(poll)}
                          >
                            <Eye className="view-icon" />
                            <span>View</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <div className="create-page">
              <h1 className="pixelated">CREATE POLL</h1>
              <p>START A NEW CONVERSATION WITH YOUR COMMUNITY</p>
              
              <div className="create-poll-form">
                <div className="form-section">
                  <label className="form-label">Question</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="What's your debate question?"
                    onChange={(e) => handleQuestionChange(e.target.value)}
                  />
                  
                  {/* Auto-Categorization Suggestions */}
                  {categorySuggestions.length > 0 && (
                    <div className="category-suggestions">
                      <div className="suggestions-header">
                        <Brain className="suggestions-icon" />
                        <span>AI Category Suggestions</span>
                      </div>
                      <div className="suggestions-list">
                        {categorySuggestions.map((suggestion, index) => (
                          <div key={index} className="suggestion-item">
                            <div className="suggestion-category">
                              <Tag className="category-icon" />
                              <span>{suggestion.category}</span>
                              <span className="confidence">{suggestion.confidence.toFixed(0)}%</span>
                            </div>
                            <div className="suggestion-keywords">
                              {suggestion.keywords.slice(0, 3).map((keyword, i) => (
                                <span key={i} className="keyword-tag">{keyword}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-section">
                  <label className="form-label">Context (Optional)</label>
                  <textarea 
                    className="form-textarea"
                    placeholder="Provide background context for your debate..."
                    rows={3}
                  />
                </div>

                <div className="options-section">
                  <div className="form-section">
                    <label className="form-label">Option A</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="First option"
                    />
                  </div>
                  
                  <div className="form-section">
                    <label className="form-label">Option B</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="Second option"
                    />
                  </div>
                </div>

                <div className="arguments-section">
                  <div className="form-section">
                    <label className="form-label">Argument for Option A (Optional)</label>
                    <textarea 
                      className="form-textarea"
                      placeholder="Make your case for option A..."
                      rows={2}
                    />
                  </div>
                  
                  <div className="form-section">
                    <label className="form-label">Argument for Option B (Optional)</label>
                    <textarea 
                      className="form-textarea"
                      placeholder="Make your case for option B..."
                      rows={2}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <label className="form-label">Category</label>
                  <select className="form-select">
                    <option value="Technology">Technology</option>
                    <option value="Society">Society</option>
                    <option value="Work">Work</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div className="form-section">
                  <label className="form-label">Poll Duration</label>
                  <select className="form-select">
                    <option value="60">1 hour</option>
                    <option value="1440">1 day</option>
                    <option value="10080">1 week</option>
                    <option value="43200">1 month</option>
                  </select>
                </div>

                {/* Duplicate Detection */}
                <button 
                  type="button"
                  className="check-duplicate-btn"
                  onClick={() => {
                    const question = (document.querySelector('.form-input') as HTMLInputElement)?.value || ''
                    const optionA = (document.querySelectorAll('.form-input')[1] as HTMLInputElement)?.value || ''
                    const optionB = (document.querySelectorAll('.form-input')[2] as HTMLInputElement)?.value || ''
                    handlePollCheck(question, optionA, optionB)
                  }}
                >
                  <RefreshCw className="check-icon" />
                  <span>Check for Similar Polls</span>
                </button>

                {duplicateCheck && (
                  <div className={`duplicate-warning ${duplicateCheck.isDuplicate ? 'warning' : 'success'}`}>
                    <div className="warning-header">
                      {duplicateCheck.isDuplicate ? (
                        <>
                          <AlertTriangle className="warning-icon" />
                          <span>Similar Poll Detected</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="success-icon" />
                          <span>No Similar Polls Found</span>
                        </>
                      )}
                    </div>
                    {duplicateCheck.message && (
                      <p className="warning-message">{duplicateCheck.message}</p>
                    )}
                    {duplicateCheck.similarPolls.length > 0 && (
                      <div className="similar-polls">
                        <h4>Similar Polls:</h4>
                        {duplicateCheck.similarPolls.map(poll => (
                          <div key={poll.id} className="similar-poll-item">
                            <span className="similar-title">{poll.title}</span>
                            <span className="similar-author">by {poll.author}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button className="submit-poll-btn">
                  <Plus className="submit-icon" />
                  <span>Create Poll</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="notifications-page">
              <h1>🔔 Activity</h1>
              <p>Your recent notifications and updates</p>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-page">
              <div className="profile-header">
                <div className="profile-avatar-section">
                  <img src={user.avatar} alt={user.name} className="profile-main-avatar" />
                  <div className="reputation-badge">
                    {(() => {
                      const repLevel = getReputationLevel(user.reputation)
                      const IconComponent = repLevel.icon
                      return (
                        <>
                          <IconComponent className="reputation-icon" style={{ color: repLevel.color }} />
                          <span className="reputation-level" style={{ color: repLevel.color }}>
                            {repLevel.level}
                          </span>
                        </>
                      )
                    })()}
                  </div>
                </div>
                <div className="profile-info">
                  <h1>{user.name}</h1>
                  <p className="username">{user.username}</p>
                  <p className="join-date">Joined {user.joinDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  
                  <div className="profile-stats">
                    <div className="stat-item">
                      <span className="stat-number">{user.reputation.toLocaleString()}</span>
                      <span className="stat-label">Reputation</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{user.followers.toLocaleString()}</span>
                      <span className="stat-label">Followers</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{user.following.toLocaleString()}</span>
                      <span className="stat-label">Following</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{user.pollCount}</span>
                      <span className="stat-label">Polls</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{(user.winRate * 100).toFixed(0)}%</span>
                      <span className="stat-label">Win Rate</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="badges-section">
                <h2>🏆 Achievements</h2>
                <div className="badges-grid">
                  {user.badges.map(badge => {
                    const IconComponent = getBadgeIcon(badge.icon)
                    return (
                      <div key={badge.id} className={`badge-card ${badge.rarity}`}>
                        <div className="badge-icon">
                          <IconComponent className="badge-icon-component" />
                        </div>
                        <div className="badge-info">
                          <h3 className="badge-name">{badge.name}</h3>
                          <p className="badge-description">{badge.description}</p>
                          <span className="badge-date">
                            Earned {badge.earnedAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="discover-section">
                <h2>👥 Discover Users</h2>
                <div className="users-grid">
                  {allUsers.map(otherUser => (
                    <div key={otherUser.id} className="user-card">
                      <div className="user-card-header">
                        <img src={otherUser.avatar} alt={otherUser.name} className="user-card-avatar" />
                        <div className="user-card-info">
                          <h3>{otherUser.name}</h3>
                          <p>{otherUser.username}</p>
                          <div className="user-reputation">
                            {(() => {
                              const repLevel = getReputationLevel(otherUser.reputation)
                              const IconComponent = repLevel.icon
                              return (
                                <>
                                  <IconComponent className="user-rep-icon" style={{ color: repLevel.color }} />
                                  <span style={{ color: repLevel.color }}>{repLevel.level}</span>
                                  <span className="rep-points">({otherUser.reputation} pts)</span>
                                </>
                              )
                            })()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="user-card-stats">
                        <span>{otherUser.pollCount} polls</span>
                        <span>{(otherUser.winRate * 100).toFixed(0)}% win rate</span>
                      </div>
                      
                      <div className="user-card-badges">
                        {otherUser.badges.slice(0, 3).map(badge => {
                          const IconComponent = getBadgeIcon(badge.icon)
                          return (
                            <div key={badge.id} className={`mini-badge ${badge.rarity}`}>
                              <IconComponent className="mini-badge-icon" />
                            </div>
                          )
                        })}
                        {otherUser.badges.length > 3 && (
                          <span className="more-badges">+{otherUser.badges.length - 3}</span>
                        )}
                      </div>
                      
                      <button 
                        className={`follow-btn ${otherUser.isFollowing ? 'following' : ''}`}
                        onClick={() => handleFollowUser(otherUser.id)}
                      >
                        {otherUser.isFollowing ? (
                          <>
                            <UserMinus className="follow-icon" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="follow-icon" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        {tabs.slice(0, 4).map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={`bottom-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="bottom-nav-icon" />
              <span className="bottom-nav-label">{tab.label}</span>
              {tab.id === 'notifications' && (
                <span className="bottom-nav-badge">3</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Poll Details Modal */}
      {selectedPoll && (
        <div className="modal-overlay" onClick={() => setSelectedPoll(null)}>
          <div className="poll-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedPoll.title}</h2>
              <button 
                className="close-modal-btn"
                onClick={() => setSelectedPoll(null)}
              >
                <X />
              </button>
            </div>

            <div className="modal-content">
              {/* Context */}
              {selectedPoll.context && (
                <div className="modal-section">
                  <h3>Context</h3>
                  <p className="context-text">{selectedPoll.context}</p>
                </div>
              )}

              {/* Arguments */}
              {selectedPoll.arguments && (
                <div className="modal-section">
                  <h3>Arguments</h3>
                  <div className="arguments-grid">
                    <div className="argument-card option-a">
                      <h4>Option A</h4>
                      <p>{selectedPoll.arguments.optionA}</p>
                    </div>
                    <div className="argument-card option-b">
                      <h4>Option B</h4>
                      <p>{selectedPoll.arguments.optionB}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Evidence */}
              {selectedPoll.evidence && (selectedPoll.evidence.optionA.length > 0 || selectedPoll.evidence.optionB.length > 0) && (
                <div className="modal-section">
                  <h3>Evidence</h3>
                  <div className="evidence-grid">
                    <div className="evidence-column">
                      <h4>Option A Evidence</h4>
                      {selectedPoll.evidence.optionA.map(evidence => (
                        <div key={evidence.id} className="evidence-item">
                          <div className="evidence-header">
                            {evidence.type === 'link' && <Link className="evidence-type-icon" />}
                            {evidence.type === 'image' && <Image className="evidence-type-icon" />}
                            {evidence.type === 'text' && <FileText className="evidence-type-icon" />}
                            <span className="evidence-title">{evidence.title}</span>
                          </div>
                          <p className="evidence-content">{evidence.content}</p>
                          <div className="evidence-meta">
                            <span>by {evidence.submittedBy}</span>
                            <span>{evidence.submittedAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="evidence-column">
                      <h4>Option B Evidence</h4>
                      {selectedPoll.evidence.optionB.map(evidence => (
                        <div key={evidence.id} className="evidence-item">
                          <div className="evidence-header">
                            {evidence.type === 'link' && <Link className="evidence-type-icon" />}
                            {evidence.type === 'image' && <Image className="evidence-type-icon" />}
                            {evidence.type === 'text' && <FileText className="evidence-type-icon" />}
                            <span className="evidence-title">{evidence.title}</span>
                          </div>
                          <p className="evidence-content">{evidence.content}</p>
                          <div className="evidence-meta">
                            <span>by {evidence.submittedBy}</span>
                            <span>{evidence.submittedAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Live Commentary */}
              <div className="modal-section">
                <h3>Live Commentary</h3>
                <div className="comments-section">
                  {selectedPoll.comments.map(comment => (
                    <div key={comment.id} className="comment-item">
                      <img src={comment.avatar} alt={comment.username} className="comment-avatar" />
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-username">{comment.username}</span>
                          <span className="comment-time">
                            <Clock className="time-icon" />
                            {comment.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="comment-text">{comment.content}</p>
                        <button 
                          className={`comment-like-btn ${comment.isLiked ? 'liked' : ''}`}
                          onClick={() => handleLikeComment(selectedPoll.id, comment.id)}
                        >
                          <ThumbsUp className={comment.isLiked ? 'filled' : ''} />
                          <span>{comment.likes}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="add-comment-section">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="comment-input"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(selectedPoll.id)}
                    />
                    <button 
                      className="add-comment-btn"
                      onClick={() => handleAddComment(selectedPoll.id)}
                    >
                      <MessageCircle />
                    </button>
                  </div>
                </div>
              </div>

              {/* Debate History */}
              {selectedPoll.debateHistory && (
                <div className="modal-section">
                  <h3>Debate History</h3>
                  <div className="debate-stats">
                    <div className="stat-item">
                      <Trophy className="stat-icon" />
                      <span className="stat-number">{selectedPoll.debateHistory.creatorWins}</span>
                      <span className="stat-label">Wins</span>
                    </div>
                    <div className="stat-item">
                      <Target className="stat-icon" />
                      <span className="stat-number">{selectedPoll.debateHistory.opponentWins}</span>
                      <span className="stat-label">Losses</span>
                    </div>
                    <div className="stat-item">
                      <Users className="stat-icon" />
                      <span className="stat-number">{selectedPoll.debateHistory.totalDebates}</span>
                      <span className="stat-label">Total Debates</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Share Section */}
              <div className="modal-section">
                <h3>Share This Poll</h3>
                <div className="share-options">
                  <button 
                    className="share-option-btn"
                    onClick={() => handleSharePoll(selectedPoll)}
                  >
                    <Share2 className="share-option-icon" />
                    <span>Native Share</span>
                  </button>
                  <button 
                    className="share-option-btn twitter"
                    onClick={() => handleShareToSocial(selectedPoll, 'twitter')}
                  >
                    <Twitter className="share-option-icon" />
                    <span>Twitter</span>
                  </button>
                  <button 
                    className="share-option-btn facebook"
                    onClick={() => handleShareToSocial(selectedPoll, 'facebook')}
                  >
                    <Facebook className="share-option-icon" />
                    <span>Facebook</span>
                  </button>
                  <button 
                    className="share-option-btn copy"
                    onClick={() => {
                      const url = `https://pollz.app/poll/${selectedPoll.id}`
                      navigator.clipboard.writeText(url)
                    }}
                  >
                    <Copy className="share-option-icon" />
                    <span>Copy Link</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

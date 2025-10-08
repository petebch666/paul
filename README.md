# Pollz - Social Polling & Debate Platform

## 🎯 Project Overview

**Pollz** is a modern social polling and debate platform built with React and TypeScript. It enables users to create engaging polls, participate in debates, submit evidence, and track trending discussions across various categories.

### Core Concept
- **Social Polling**: Create and participate in binary choice polls with rich context
- **Evidence-Based Debates**: Submit supporting evidence for poll options
- **Trending System**: Smart algorithm to surface popular and engaging polls
- **User Reputation**: Gamified system with badges, reputation points, and win rates
- **Smart Features**: Auto-categorization, duplicate detection, and poll suggestions

## 🏗️ Architecture & Tech Stack

### Frontend Architecture
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Custom CSS with pixelated/retro aesthetic
- **Icons**: Lucide React
- **State Management**: Custom hooks (`useAppState`, `useDatabase`)

### Backend Architecture
- **Database**: LowDB (JSON-based local storage)
- **API Layer**: Custom API service (`PollzAPI`)
- **Data Persistence**: File-based storage in `data/db.json`

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Navigation.tsx   # Main navigation component
│   └── PollCard.tsx     # Individual poll display component
├── pages/              # Page components
│   ├── HomePage.tsx     # Main feed of polls
│   ├── CreatePage.tsx   # Poll creation form
│   ├── TrendingPage.tsx # Trending polls view
│   └── ProfilePage.tsx  # User profile and stats
├── hooks/              # Custom React hooks
│   ├── useAppState.ts   # Global app state management
│   └── useDatabase.ts   # Database operations hook
├── database/           # Backend services
│   ├── db.ts           # Database schema and operations
│   ├── api.ts          # API service layer
│   └── init.ts         # Database initialization
├── types/              # TypeScript type definitions
│   └── index.ts        # All interface definitions
└── utils/              # Utility functions
```

## 📊 Data Models

### Core Entities

#### Poll
```typescript
interface Poll {
  id: string
  title: string
  description: string
  votes: number
  votesOptionA: number
  votesOptionB: number
  category: string
  timeLeft: string
  authorId: string
  author: string
  isVoted: boolean
  isLiked: boolean
  createdAt: Date
  expiresAt: Date
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
  trendingScore?: number
}
```

#### User
```typescript
interface User {
  id: string
  name: string
  username: string
  email: string
  avatar: string
  followers: number
  following: number
  reputation: number
  badges: Badge[]
  pollCount: number
  winRate: number
  joinDate: Date
}
```

#### Evidence
```typescript
interface Evidence {
  id: string
  type: 'link' | 'image' | 'text'
  content: string
  title: string
  submittedBy: string
  submittedAt: Date
}
```

## 🚀 Current Implementation Status

### ✅ Completed Features (Frontend)

#### 1. **Core UI Components**
- **Navigation**: Multi-page navigation with active state
- **PollCard**: Interactive poll display with voting and results
- **HomePage**: Main feed displaying all polls
- **CreatePage**: Comprehensive poll creation form
- **TrendingPage**: Trending polls view (structure complete)
- **ProfilePage**: User profile and statistics (structure complete)

#### 2. **State Management**
- **useAppState**: Global state management for polls, user, navigation
- **Voting System**: Real-time vote updates with visual feedback
- **Like System**: Poll liking with state persistence
- **Poll Creation**: Form handling with validation

#### 3. **Smart Features (Frontend Ready)**
- **Auto-categorization**: Mock implementation for category suggestions
- **Duplicate Detection**: Mock duplicate checking system
- **Form Validation**: Complete form validation and error handling
- **Visual Feedback**: Success animations and state indicators

#### 4. **Styling & UX**
- **Pixelated Theme**: Retro/gaming aesthetic throughout
- **Responsive Design**: Mobile-first responsive layout
- **Interactive Elements**: Hover states, animations, transitions
- **Accessibility**: Proper form labels and keyboard navigation

### 🔄 Backend Implementation Status

#### ✅ Database Layer (Complete)
- **LowDB Integration**: JSON-based local storage setup
- **Schema Definition**: Complete data models and relationships
- **Database Service**: CRUD operations for all entities
- **Initialization**: Auto-population with mock data

#### ✅ API Layer (Complete)
- **PollzAPI Service**: Comprehensive API wrapper
- **Poll Operations**: Create, read, update, vote, search
- **User Operations**: CRUD operations for users
- **Analytics**: Poll analytics and trending calculations
- **Smart Features**: Category suggestions, duplicate checking

#### 🔄 Integration Status (In Progress)
- **Frontend-Backend Integration**: Mock data currently used
- **Real API Calls**: Need to replace mock data with actual API calls
- **Database Persistence**: Need to connect frontend state to database

## 🎯 Next Development Phase: Backend Integration

### Immediate Tasks (Today's Focus)

#### 1. **Replace Mock Data with Real API Calls**
- [ ] Update `useAppState.ts` to use `PollzAPI` instead of mock data
- [ ] Implement real-time data fetching in components
- [ ] Add error handling for API failures
- [ ] Implement loading states during API calls

#### 2. **Database Integration**
- [ ] Connect poll creation to database persistence
- [ ] Implement real voting with database updates
- [ ] Add user authentication and session management
- [ ] Implement data synchronization between frontend and backend

#### 3. **Enhanced Features**
- [ ] Real-time trending score calculations
- [ ] Evidence submission system
- [ ] Comment system implementation
- [ ] User reputation and badge system

### Future Enhancements

#### 1. **Advanced Smart Features**
- [ ] Machine learning for better categorization
- [ ] Advanced duplicate detection algorithms
- [ ] Personalized poll recommendations
- [ ] Sentiment analysis for poll content

#### 2. **Social Features**
- [ ] User following system
- [ ] Poll sharing and embedding
- [ ] Real-time notifications
- [ ] Poll moderation and reporting

#### 3. **Analytics & Insights**
- [ ] Detailed poll analytics dashboard
- [ ] User engagement metrics
- [ ] Trending algorithm improvements
- [ ] A/B testing for poll formats

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

### Database Setup
The database initializes automatically on first run and creates:
- `data/db.json` - Main database file
- Initial users and polls for testing
- Trending polls calculation

## 📝 Key Implementation Notes

### State Management Pattern
- Uses custom hooks for state management
- Centralized state in `useAppState`
- Local component state for forms and UI interactions

### Data Flow
1. **Poll Creation**: Form → `useAppState.createPoll()` → Database
2. **Voting**: UI → `useAppState.handleVote()` → Database → UI Update
3. **Navigation**: `useAppState.navigateTo()` → Component Rendering

### Error Handling
- API calls wrapped in try-catch blocks
- User-friendly error messages
- Graceful fallbacks for failed operations

### Performance Considerations
- Efficient re-rendering with React hooks
- Optimized database queries
- Lazy loading for large datasets

## 🎨 Design Philosophy

### Visual Style
- **Retro Gaming Aesthetic**: Pixelated fonts, bold colors, sharp edges
- **High Contrast**: Easy readability and accessibility
- **Minimalist Layout**: Focus on content, reduce visual clutter

### User Experience
- **Instant Feedback**: Immediate visual responses to user actions
- **Progressive Disclosure**: Show relevant information at the right time
- **Mobile-First**: Responsive design starting from mobile screens

## 🔧 Technical Debt & Known Issues

### Current Limitations
1. **Mock Data Usage**: Frontend still uses hardcoded mock data
2. **No Authentication**: User system is placeholder-based
3. **Limited Real-time**: No WebSocket implementation for live updates
4. **File-based Storage**: LowDB suitable for development, needs production solution

### Performance Optimizations Needed
1. **Database Indexing**: For large datasets
2. **Caching Strategy**: For frequently accessed data
3. **Image Optimization**: For user avatars and evidence
4. **Bundle Splitting**: For better loading performance

## 📈 Success Metrics

### User Engagement
- Poll creation rate
- Vote participation rate
- Evidence submission rate
- User retention and session duration

### Content Quality
- Trending score accuracy
- Duplicate detection effectiveness
- Category suggestion accuracy
- User satisfaction with poll results

## 🚀 Deployment Considerations

### Production Requirements
- **Database**: PostgreSQL or MongoDB for production
- **Authentication**: OAuth integration (Google, GitHub, etc.)
- **File Storage**: AWS S3 or similar for evidence files
- **CDN**: For static assets and images
- **Monitoring**: Error tracking and performance monitoring

### Environment Configuration
- Development: Local LowDB with mock data
- Staging: Production-like setup with test data
- Production: Full database and authentication system

---

## 📞 Session Context for AI Assistant

**Last Session**: Frontend structure and components completed
**Current Session**: Backend API integration and database connectivity
**Next Session**: Real-time features and advanced smart functionality

**Key Files to Focus On**:
- `src/hooks/useAppState.ts` - Replace mock data with API calls
- `src/database/api.ts` - Ensure all endpoints are properly implemented
- `src/database/db.ts` - Verify database operations work correctly
- `src/App.tsx` - Update to use real data instead of mock data

**Development Priority**: Backend integration is the current focus, with frontend structure already complete and functional.

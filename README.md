# 🎯 Pollz - Social Polling & Debate Platform

A modern, real-time polling platform built with React, TypeScript, and Supabase. Create polls, vote, debate, and track trending topics with a beautiful, minimalistic UI.

## 🚀 Project Status: Pre-Beta

**Current Version**: 0.9.0 (Beta Release Preparation)  
**Last Updated**: December 15, 2024  
**Database**: Supabase (PostgreSQL) ✅ Connected  
**Authentication**: Supabase Auth ✅ Implemented  

---

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Today's Accomplishments](#-todays-accomplishments)
- [Beta Release Roadmap](#-beta-release-roadmap)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)

---

## ✨ Features

### Core Functionality
- ✅ **Poll Creation & Voting** - Create binary polls with rich context
- ✅ **Real-time Statistics** - Live vote counts and trending scores
- ✅ **User Authentication** - Secure login with Supabase Auth
- ✅ **Category Filtering** - Filter polls by topic categories
- ✅ **Admin Dashboard** - Beautiful admin panel with live statistics
- ✅ **Modern UI/UX** - Gradient designs, smooth animations, intuitive navigation
- ✅ **Deathmatch Polls** - Head-to-head debates with assigned users defending options
- ✅ **Shadow Deathmatch** - Anonymous debates (usernames hidden until poll expires)
- ✅ **Username Display** - Author and defender usernames on poll cards

### User Features
- ✅ Create polls with custom options and timers
- ✅ Vote on active polls
- ✅ View poll history and voted polls
- ✅ Filter by categories (Food, Tech, Sports, etc.)
- ✅ See trending and expiring polls
- ✅ User profiles with statistics
- ✅ Create Deathmatch polls - Challenge users to defend options
- ✅ Shadow Deathmatch mode - Anonymous debates
- ✅ Accept/Reject deathmatch challenges with option modification
- ✅ See username placeholders on all poll cards

### Admin Features
- ✅ Real-time dashboard with live statistics
- ✅ Modern gradient-based tab navigation
- ✅ Database connection status
- ✅ System information display
- 🔄 User management (coming soon)
- 🔄 Poll moderation (coming soon)
- 🔄 API documentation (coming soon)

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **UI Library**: Ionic React 8
- **Build Tool**: Vite 5
- **Styling**: CSS3 with gradients and modern effects
- **Icons**: Ionicons
- **State Management**: Custom React Hooks

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime (ready for implementation)
- **Storage**: Supabase Storage (ready for implementation)

### Mobile
- **Framework**: Capacitor 6 (iOS & Android support)
- **Native Features**: Ready for native API integration

---

## 🎉 Recent Accomplishments

### December 15, 2024 - Deathmatch & UI Enhancements

#### 1. Deathmatch Feature Implementation 🥊
- **Deathmatch Poll System**
  - Users can create polls where two users defend opposing options
  - Opponent selection with user search (@username)
  - Polls start as "pending" until opponent accepts
  - Opponent can modify their option before accepting
  - Notification system for deathmatch challenges
  
- **Shadow Deathmatch Mode**
  - Anonymous debate feature
  - Usernames hidden as "@??????" until poll expires
  - Perfect for unbiased, anonymous discussions
  - Toggle available in deathmatch creation

- **Deathmatch UI**
  - Opponent selection grid with search functionality
  - Visual opponent assignment (avatars, names)
  - Option preview with "defends" labels
  - Accept/Reject modal for challenged users
  - Username display below each option in deathmatch polls

#### 2. Username Display System 👤
- **Poll Card Enhancements**
  - Author username shown in footer ("by @username")
  - Deathmatch polls show both defender usernames
  - Shadow mode masks usernames until expiration
  - Backward compatibility for existing polls

- **Database Updates**
  - Added `author_username` column to polls table
  - Added `is_shadow_deathmatch` column
  - Migration scripts for existing data
  - Automatic username loading for legacy polls

#### 3. Minimalist Ribbon Design ✨
- **Status Ribbon Redesign**
  - Text-only, icon-free design
  - Monospace typography (Courier New)
  - Retro pixel art icons for each status:
    - 🕐 Clock icon for "Last"
    - 🔥 Flame icon for "Trending"
    - 👤 Profile icon for "My Votes"
    - ⏳ Hourglass icon for "Expired"
  - Active state with underline animation
  - Smooth hover effects

- **Category Ribbon**
  - Minimalist text-only display
  - Clean spacing and typography
  - Active state highlighting
  - Responsive design

#### 4. Create Page Redesign 🎨
- **Modern Layout**
  - Mode selector at top (Normal Poll / Deathmatch)
  - Opponent-first workflow for deathmatches
  - Step-by-step guidance for deathmatch creation
  - Shadow deathmatch toggle
  - Redirect to home page after creation

#### 5. Bug Fixes & Improvements 🐛
- Fixed duplicate variable declaration in `getPollsWithVoteStatus`
- Fixed CSS duplicate key warnings in PixelIcon
- Improved poll fetching with username loading
- Enhanced error handling

### December 12, 2024

### 1. Admin Dashboard Transformation ✨
- **Modern UI Design**
  - Implemented gradient-based tab navigation with smooth animations
  - Created beautiful stat cards with hover effects
  - Added color-coded sections (Stats: Purple, Tools: Pink, Polls: Cyan, Users: Orange, API: Teal)
  - Minimalistic and sleek design matching the app's aesthetic

- **Live Supabase Integration**
  - Connected admin dashboard to real Supabase database
  - Display live statistics:
    - Total Polls
    - Total Votes (formatted with commas)
    - Active Polls (currently running)
    - Expired Polls (completed)
    - Average Votes per Poll
    - Number of Categories
    - Top Category with percentage
    - Top Creator with percentage
  - Real-time database connection status
  - System information display

- **Code Optimization**
  - Fixed critical static method context bug in Supabase API
  - Removed localStorage dependencies
  - Cleaned up unused functions
  - Improved error handling

### 2. Bug Fixes 🐛
- **Critical Fix**: Static method context issue
  - Fixed 18+ incorrect static method calls in `supabase-api.ts`
  - Changed `this.method()` to `SupabasePollzAPI.method()` throughout
  - All statistics now correctly pulling from Supabase

- **UI/UX Improvements**
  - Fixed tab navigation styling
  - Added loading states for admin dashboard
  - Improved responsive design for mobile devices

### 3. Code Cleanup 🧹
- Removed 10+ temporary documentation files
- Consolidated project documentation into README
- Cleaned up commented code and debug logs
- Organized project structure

---

## 🗓️ Beta Release Roadmap

### Phase 1: Testing & Validation (In Progress) ⚡
**Priority: Critical** 🔴

#### API Route Testing ✅
- [x] Test all poll CRUD operations
  - [x] Create poll endpoint
  - [x] Get polls endpoint (with pagination)
  - [x] Get single poll endpoint
  - [x] Vote on poll endpoint
  - [x] Get trending polls endpoint
- [x] Test user operations
  - [x] User registration
  - [x] User login
  - [x] User profile retrieval
  - [x] User updates
- [x] Test notification system
  - [x] Create notifications
  - [x] Get user notifications
  - [x] Mark as read
- [x] Test poll history
  - [x] Add history entry
  - [x] Get user history

#### Database Validation ✅
- [x] Verify RLS (Row Level Security) policies
- [x] Test database triggers (vote counting)
- [x] Validate data integrity constraints
- [x] Test database indexes performance
- [x] Verify foreign key relationships
- [x] Test concurrent voting scenarios

#### App Behavior Testing
- [ ] Poll creation flow
  - [ ] Form validation
  - [ ] Timer functionality
  - [ ] Category selection
  - [ ] Success/error handling
- [ ] Voting system
  - [ ] Prevent double voting
  - [ ] Real-time vote updates
  - [ ] Vote count accuracy
  - [ ] Expired poll handling
- [ ] Navigation & Routing
  - [ ] Page transitions
  - [ ] Deep linking
  - [ ] Back button behavior
- [ ] State management
  - [ ] State persistence
  - [ ] State synchronization
  - [ ] Error recovery

### Phase 2: Admin Panel Completion (In Progress) ⚡
**Priority: High** 🟡

#### Admin Features
- [x] User Management
  - [x] View all users
  - [x] User details display
  - [ ] User role management
  - [ ] Ban/suspend users
- [x] Poll Management
  - [x] View all polls
  - [x] Poll details display
  - [ ] Delete polls
  - [ ] Featured polls
- [ ] Content Moderation
  - [ ] Flagged content review
  - [ ] Moderation queue
  - [ ] Automated content checks
- [x] Analytics Dashboard ✅
- [x] User engagement metrics ✅
  - [x] Poll performance analytics
  - [x] Trend analysis
  - [ ] Export reports

### Phase 3: Content Moderation with Local LLM 🔒
**Priority: Critical** 🔴

#### Objective
Implement automated content moderation using a local LLM to ensure no sensitive, inappropriate, or harmful content is published in polls. This protects the platform and users while maintaining privacy (local processing).

#### Local LLM Integration
- [ ] **Model Research & Selection**
  - [ ] Evaluate lightweight models: TinyLlama, Phi-2, Gemma-2B, or similar
  - [ ] Consider performance vs size trade-offs
  - [ ] Test inference speed (< 500ms per check)
  - [ ] Memory requirements assessment
  - [ ] Accuracy benchmarking on moderation tasks

- [ ] **Server Setup**
  - [ ] Install LLM runtime (Ollama, llama.cpp, or vLLM)
  - [ ] Download and configure selected model
  - [ ] Create REST API wrapper for moderation endpoint
  - [ ] Setup model serving with GPU/CPU optimization
  - [ ] Implement request queuing for concurrent checks

- [ ] **Moderation Categories**
  - [ ] **Toxicity Detection**: Profanity, offensive language
  - [ ] **Hate Speech**: Discriminatory content, targeted harassment
  - [ ] **NSFW Content**: Sexual, violent, or explicit material
  - [ ] **Spam Detection**: Repetitive, low-quality, or promotional content
  - [ ] **Political Bias**: Extreme political content (configurable threshold)
  - [ ] **Privacy Violations**: Personal information, doxxing attempts
  - [ ] **Misinformation Flags**: Clearly false claims (optional)

- [ ] **Integration Flow**
  - [ ] Pre-submission validation in poll creation form
  - [ ] Real-time feedback to users during typing
  - [ ] Confidence scoring system (flag/reject thresholds)
  - [ ] Async processing queue for performance
  - [ ] Retry mechanism for failed checks
  - [ ] Fallback to manual review if LLM unavailable

- [ ] **User Experience**
  - [ ] Inline warnings for questionable content
  - [ ] Specific feedback messages (what needs to be changed)
  - [ ] Suggestion system for improving content
  - [ ] Appeal process for false positives
  - [ ] Transparent moderation policy

- [ ] **Admin Moderation Tools**
  - [ ] Review queue for flagged content
  - [ ] Override AI decisions
  - [ ] Pattern learning from admin actions
  - [ ] Moderation statistics dashboard
  - [ ] Custom rule configuration
  - [ ] Whitelist/blacklist management

- [ ] **Technical Architecture**
  - [ ] Docker containerization for LLM service
  - [ ] API rate limiting
  - [ ] Caching for repeated content
  - [ ] Logging and monitoring
  - [ ] Health checks and auto-recovery
  - [ ] Scalability planning for traffic spikes

#### Success Metrics
- **Response Time**: < 500ms per content check
- **Accuracy**: > 95% on test dataset
- **False Positive Rate**: < 5%
- **Coverage**: 100% of poll submissions checked
- **Uptime**: > 99.5% availability

### Phase 4: Mobile Packaging & Testing
**Priority: High** 🟡

#### iOS Build
- [ ] Update Capacitor configuration
- [ ] Configure app icons and splash screens
- [ ] Test on iOS simulator
- [ ] Build for physical device
- [ ] Test native features
  - [ ] Camera (for profile pictures)
  - [ ] Push notifications
  - [ ] Haptic feedback
- [ ] Performance optimization
- [ ] Submit to TestFlight

#### Android Build
- [ ] Update Capacitor configuration
- [ ] Configure app icons and splash screens
- [ ] Test on Android emulator
- [ ] Build APK/AAB
- [ ] Test on physical device
- [ ] Test native features
  - [ ] Camera (for profile pictures)
  - [ ] Push notifications
  - [ ] Haptic feedback
- [ ] Performance optimization
- [ ] Submit to Google Play (Internal Testing)

### Phase 5: UI/UX Redesign
**Priority: Medium** 🟢

#### Create Page Redesign
- [ ] Complete visual overhaul
  - [ ] Modern card-based layout
  - [ ] Gradient accent elements
  - [ ] Step-by-step wizard interface
  - [ ] Animated transitions between steps
  - [ ] Preview mode before submission
- [ ] Enhanced form experience
  - [ ] Real-time validation with inline feedback
  - [ ] Character counters with visual indicators
  - [ ] Emoji picker for poll titles
  - [ ] Drag-and-drop image upload (for future evidence feature)
  - [ ] Smart suggestions while typing
- [ ] Improved category selection
  - [ ] Visual category cards with icons
  - [ ] Hover animations and effects
  - [ ] Recently used categories
  - [ ] Custom category creation
- [ ] Timer & settings UI
  - [ ] Visual timer picker (slider + presets)
  - [ ] Duration presets (1h, 6h, 1d, 3d, 1w)
  - [ ] Custom duration picker
  - [ ] Visual countdown preview
- [ ] Success experience
  - [ ] Animated success screen
  - [ ] Share options immediately after creation
  - [ ] "View Poll" button with smooth transition
  - [ ] Confetti animation effect

### Phase 6: Pre-Beta Polish
**Priority: Medium** 🟢

#### Performance Optimization
- [ ] Bundle size optimization
- [ ] Image optimization
- [ ] Code splitting
- [ ] Database query optimization
- [ ] Caching strategy implementation

#### UX Improvements
- [ ] Add loading skeletons
- [ ] Improve error messages
- [ ] Add success animations
- [ ] Implement haptic feedback
- [ ] Add empty states

#### Documentation
- [ ] User guide
- [ ] API documentation
- [ ] Admin guide
- [ ] Deployment guide

### Phase 7: Beta Release
**Priority: Critical** 🔴

#### Pre-Release Checklist
- [ ] All critical bugs fixed
- [ ] All features tested
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Privacy policy created
- [ ] Terms of service created

#### Release
- [ ] Deploy to production
- [ ] Submit to app stores
- [ ] Announce beta to testers
- [ ] Setup feedback channels
- [ ] Monitor analytics

---

## 🏁 Getting Started

### Prerequisites
```bash
Node.js 18+
npm or yarn
```

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd pollz
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Setup Supabase Database**
- Go to [Supabase](https://supabase.com)
- Create a new project
- Run the SQL schema from `SUPABASE-SCHEMA.sql`
- Run `DEATHMATCH-DB-MIGRATION.sql` to add deathmatch features
- Run `UPDATE-EXISTING-POLLS-USERNAME.sql` to set usernames on existing polls
- Copy your project URL and anon key to `.env`

5. **Start development server**
```bash
npm run dev
```

6. **Build for production**
```bash
npm run build
```

### Default Admin Credentials
```
Email: admin@pollz.app
Password: Admin@123
```

---

## 📁 Project Structure

```
pollz/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── AuthenticationWrapper.tsx
│   │   ├── CategoryIcon.tsx
│   │   ├── DeathmatchAcceptModal.tsx  # ✨ New: Deathmatch acceptance UI
│   │   ├── Navigation.tsx
│   │   ├── PixelIcon.tsx              # ✨ New: Retro pixel art icons
│   │   ├── PollCarousel.tsx
│   │   ├── SecurityBadge.tsx
│   │   ├── SwipePollCard.tsx
│   │   └── UserSearchInput.tsx        # ✨ New: User search component
│   │
│   ├── pages/               # Page components
│   │   ├── AdminDashboard.tsx    # ✨ New modern admin panel
│   │   ├── AuthPage.tsx
│   │   ├── CreatePage.tsx
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── SignUpPage.tsx
│   │   ├── SwipeHomePage.tsx
│   │   └── TrendingPage.tsx
│   │
│   ├── database/            # Database layer
│   │   ├── supabase.ts          # Supabase client
│   │   ├── supabase-api.ts      # ✅ Fixed API layer
│   │   ├── unified-api.ts
│   │   └── simple-db.ts
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAppState.ts
│   │   ├── useAuth.ts
│   │   └── useDatabase.ts
│   │
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   │
│   ├── config/              # Configuration files
│   │   ├── oauth.ts
│   │   └── security-headers.ts
│   │
│   └── utils/               # Utility functions
│
├── android/                 # Android native project
├── ios/                     # iOS native project
├── dist/                    # Production build
├── DEATHMATCH-DB-MIGRATION.sql      # ✨ Database migration for deathmatch features
└── UPDATE-EXISTING-POLLS-USERNAME.sql # ✨ Script to update existing polls with usernames
```

---

## 🗄️ Database Schema

### Tables

#### `users`
- User accounts and profiles
- Authentication data
- Statistics (followers, reputation, poll count)

#### `polls`
- Poll questions and options
- Vote counts and statistics
- Expiration dates
- Trending scores
- Deathmatch features:
  - `is_deathmatch` - Boolean flag
  - `is_shadow_deathmatch` - Hide usernames until expired
  - `option_a_owner_id` - User defending Option A
  - `option_b_owner_id` - User defending Option B
  - `deathmatch_status` - pending/accepted/rejected
  - `author_username` - Creator's username

#### `votes`
- User votes on polls
- Ensures one vote per user per poll
- Tracks voting patterns

#### `notifications`
- User notifications
- Poll updates and mentions
- System messages

#### `poll_history`
- User interaction history
- Created, voted, liked actions
- Analytics data

### Database Features
- ✅ Row Level Security (RLS) enabled
- ✅ Automatic vote counting triggers
- ✅ Timestamp management triggers
- ✅ Foreign key constraints
- ✅ Indexes for performance

---

## 🎨 Design Philosophy

### Visual Style
- **Modern & Minimalistic**: Clean, gradient-based design
- **Intuitive Navigation**: Clear visual hierarchy
- **Smooth Animations**: Subtle transitions and hover effects
- **Mobile-First**: Responsive design for all screen sizes

### Color Palette
- **Primary Gradient**: Purple to Pink (`#667eea` → `#764ba2`)
- **Success Gradient**: Blue to Cyan (`#4facfe` → `#00f2fe`)
- **Warning Gradient**: Pink to Yellow (`#fa709a` → `#fee140`)
- **Danger Gradient**: Pink to Red (`#f093fb` → `#f5576c`)

### Typography
- **Primary Font**: Courier New (monospace)
- **Letter Spacing**: 1-2px for headings
- **Font Weights**: 600-700 for emphasis

---

## 🔐 Security

### Authentication
- Supabase Auth with JWT tokens
- Secure password hashing (bcrypt)
- Row Level Security policies

### Data Protection
- SQL injection prevention (parameterized queries)
- XSS protection (input sanitization)
- CSRF protection
- Rate limiting (to be implemented)

---

## 📊 Performance Metrics

### Current Performance
- **Build Size**: ~500KB (gzipped)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 2.5s
- **Lighthouse Score**: 90+ (target)

### Optimization Targets
- Bundle size < 400KB
- FCP < 1s
- TTI < 2s
- Lighthouse Score: 95+

---

## 🤝 Contributing

This project is currently in pre-beta. Contributions will be welcome after the initial beta release.

---

## 📝 License

Proprietary - All rights reserved

---

## 📞 Contact & Support

**Project Status**: Active Development  
**Target Release**: Q1 2025  
**Feedback**: Submit issues via GitHub (coming soon)

---

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- UI powered by [Ionic Framework](https://ionicframework.com/)
- Backend by [Supabase](https://supabase.com/)
- Icons by [Ionicons](https://ionic.io/ionicons)

---

**Last Updated**: December 15, 2024  
**Next Milestone**: LLM Content Moderation Integration  
**Version**: 0.9.0 (Pre-Beta)

---

## 📝 Latest Session Summary (December 15, 2024)

### ✅ Completed Features

1. **Deathmatch System** 🥊
   - Complete implementation of head-to-head debate polls
   - User search and opponent assignment
   - Pending → Accepted workflow
   - Option modification during acceptance
   - Notification system integration

2. **Shadow Deathmatch** 🔒
   - Anonymous debate mode
   - Username masking until poll expiration
   - Toggle in poll creation UI

3. **Username Display** 👤
   - Author usernames on all poll cards
   - Deathmatch defender usernames
   - Shadow mode implementation
   - Database migration scripts

4. **UI Redesign** ✨
   - Minimalist ribbon design (text-only)
   - Retro pixel art icons (clock, flame, profile, hourglass)
   - Create page improvements
   - Navigation after poll creation

5. **Database Enhancements** 🗄️
   - `author_username` column added
   - `is_shadow_deathmatch` column added
   - Migration scripts created
   - Backward compatibility maintained

### 🔄 Database Migrations Required

Before committing, run these SQL scripts in Supabase:
1. `DEATHMATCH-DB-MIGRATION.sql` - Adds deathmatch columns
2. `UPDATE-EXISTING-POLLS-USERNAME.sql` - Sets usernames on existing polls

### 🎯 Next Priority: LLM Content Moderation

The next major feature will be implementing local LLM-based content moderation to ensure safe, appropriate content across all polls.

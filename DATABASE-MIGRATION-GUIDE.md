# 🗄️ Database Migration Guide for Pollz

## Current Setup
- **Storage**: Browser localStorage
- **Key**: `paul-db`
- **Size**: ~50-100KB (depends on polls count)
- **Limitations**: 
  - No sync across devices
  - Cleared when browser cache is cleared
  - No real-time updates
  - No server-side validation
  - Storage limit: ~5-10MB

---

## 🎯 Recommended Solutions

### ⭐ Option 1: Supabase (HIGHLY RECOMMENDED)

**Why Supabase?**
- Built on PostgreSQL (battle-tested, reliable)
- Real-time subscriptions (perfect for live poll updates)
- Built-in authentication (replace your bcrypt implementation)
- Row Level Security (RLS) for data protection
- Free tier: 500MB database, 2GB bandwidth, unlimited API requests
- Auto-generated REST API
- TypeScript support
- Works perfectly with React/Ionic

**Setup Time**: 15-20 minutes

#### Migration Steps:

1. **Install Supabase Client**
```bash
npm install @supabase/supabase-js
```

2. **Create Supabase Project**
   - Go to https://supabase.com
   - Create free account
   - Create new project
   - Get API URL and anon key

3. **Create Database Schema**
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar TEXT,
  password_hash TEXT,
  role TEXT DEFAULT 'user',
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  reputation INTEGER DEFAULT 0,
  poll_count INTEGER DEFAULT 0,
  win_rate DECIMAL DEFAULT 0,
  join_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Polls table
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  votes_option_a INTEGER DEFAULT 0,
  votes_option_b INTEGER DEFAULT 0,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  context TEXT,
  is_expired BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  trending_score DECIMAL DEFAULT 0,
  poll_type TEXT DEFAULT 'question',
  timer_enabled BOOLEAN DEFAULT TRUE,
  notification_enabled BOOLEAN DEFAULT FALSE
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  option CHAR(1) CHECK (option IN ('A', 'B')),
  timestamp TIMESTAMP DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Poll history table
CREATE TABLE poll_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  poll_title TEXT,
  poll_category TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies (examples)
CREATE POLICY "Users can read all polls" ON polls FOR SELECT USING (true);
CREATE POLICY "Users can create polls" ON polls FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can vote once" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
```

4. **Create Supabase Client**
Create `src/database/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

5. **Update Environment Variables**
Create `.env`:
```
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

6. **Migrate Existing Data**
Create `src/utils/migrate-to-supabase.ts`:
```typescript
import { supabase } from '../database/supabase'

export async function migrateLocalStorageToSupabase() {
  try {
    const localData = localStorage.getItem('paul-db')
    if (!localData) {
      console.log('No local data to migrate')
      return
    }

    const data = JSON.parse(localData)
    
    // Migrate users
    for (const user of data.users) {
      const { error } = await supabase.from('users').insert({
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        followers: user.followers,
        following: user.following,
        reputation: user.reputation,
        poll_count: user.pollCount,
        win_rate: user.winRate,
        join_date: user.joinDate
      })
      
      if (error) console.error('Error migrating user:', error)
    }
    
    // Migrate polls
    for (const poll of data.polls) {
      const { error } = await supabase.from('polls').insert({
        title: poll.title,
        description: poll.description,
        category: poll.category,
        author_name: poll.author,
        option_a: poll.arguments?.optionA || '',
        option_b: poll.arguments?.optionB || '',
        context: poll.context,
        votes: poll.votes,
        votes_option_a: poll.votesOptionA,
        votes_option_b: poll.votesOptionB,
        is_expired: poll.isExpired,
        expires_at: poll.expiresAt,
        created_at: poll.createdAt,
        trending_score: poll.trendingScore || 0
      })
      
      if (error) console.error('Error migrating poll:', error)
    }
    
    console.log('✅ Migration completed!')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}
```

7. **Update API Layer**
Replace localStorage calls in `src/database/api.ts` with Supabase calls:
```typescript
// Before:
const polls = await db.getAllPolls()

// After:
const { data: polls, error } = await supabase
  .from('polls')
  .select('*')
  .order('created_at', { ascending: false })
```

**Cost**: FREE for starter (up to 500MB + 2GB bandwidth)
**Scaling**: $25/month for Pro (8GB database, 50GB bandwidth, daily backups)

---

### 🔥 Option 2: Firebase/Firestore

**Pros**:
- Real-time updates
- Offline support
- Google infrastructure
- Easy mobile integration
- Generous free tier

**Cons**:
- NoSQL (different data structure)
- More complex queries
- Vendor lock-in

**Setup**:
```bash
npm install firebase
```

**Free Tier**: 1GB storage, 10GB/month bandwidth, 50K reads/day

---

### 🏠 Option 3: Better-SQLite3 (Local Upgrade)

**Best for**: Desktop apps or if you want to keep data local

**Pros**:
- Fast SQLite database
- No internet required
- SQL queries
- File-based

**Cons**:
- No sync across devices
- No real-time updates
- Local only

**Setup**:
```bash
npm install better-sqlite3
```

---

### 🎨 Option 4: PocketBase (Self-hosted)

**Pros**:
- Single executable file
- Built-in admin UI
- Real-time subscriptions
- File storage
- Own your data

**Cons**:
- Need to host it somewhere
- Less mature than Supabase/Firebase

**Free**: Self-hosted (hosting costs apply)

---

## 📋 Migration Checklist

- [ ] Choose database solution
- [ ] Set up new database
- [ ] Create schema/tables
- [ ] Test connection
- [ ] Write migration script
- [ ] Export localStorage data
- [ ] Import to new database
- [ ] Update API layer
- [ ] Test all CRUD operations
- [ ] Update authentication
- [ ] Deploy changes
- [ ] Monitor for issues
- [ ] Remove localStorage backup after verification

---

## 🚀 Quick Start: Supabase Migration (15 minutes)

1. **Sign up**: https://supabase.com (free account)
2. **Create project**: Wait 2 minutes for setup
3. **Run SQL**: Copy the SQL schema above into SQL Editor
4. **Get credentials**: Project Settings → API → Copy URL & anon key
5. **Install**: `npm install @supabase/supabase-js`
6. **Configure**: Add credentials to `.env`
7. **Migrate**: Run migration script
8. **Update code**: Replace localStorage with Supabase calls
9. **Test**: Verify all features work
10. **Deploy**: Push to production

---

## 💡 Recommendations

**For Production App**: Use **Supabase** 🏆
- Best balance of features, ease of use, and cost
- Real-time updates perfect for polls
- Built-in auth
- Free tier is generous
- Easy to scale

**For Learning/Local**: Use **Better-SQLite3**
- Keep it simple
- No external dependencies
- Good for understanding databases

**For Mobile-First**: Consider **Firebase**
- Great mobile SDKs
- Offline support
- Google backing

---

## 📞 Need Help?

1. Supabase Docs: https://supabase.com/docs
2. Discord: https://discord.supabase.com
3. YouTube tutorials: "Supabase crash course"

---

## ⚡ Performance Comparison

| Feature | localStorage | Supabase | Firebase | SQLite |
|---------|-------------|----------|----------|--------|
| Setup Time | 0 min | 15 min | 20 min | 10 min |
| Real-time | ❌ | ✅ | ✅ | ❌ |
| Multi-device | ❌ | ✅ | ✅ | ❌ |
| Offline | ✅ | ⚠️ | ✅ | ✅ |
| Cost (free) | Free | 500MB | 1GB | Free |
| Scalability | Low | High | High | Medium |
| SQL Support | ❌ | ✅ | ❌ | ✅ |
| Auth Built-in | ❌ | ✅ | ✅ | ❌ |

---

**Decision**: Start with **Supabase** → It's the best fit for your polling app! 🎯


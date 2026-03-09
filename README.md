# PAUL
> Binary polls. Swipe to vote. Pure black.

## What is PAUL?
Binary polling app. Every question has two choices. Swipe right = A. Swipe left = B.
No noise. No ads. No algorithmic manipulation. Pure signal.

## Stack
React Native 0.81 + Expo SDK 54 | TypeScript | Supabase (PostgreSQL + Realtime)
Auth: Supabase Auth + SecureStore | Font: Inter | Navigation: React Navigation 7
Gestures: RNGH v2 + Reanimated v3 | Icons: Lucide

## Screens
```
AUTH          Login / Sign up / Forgot password
HOME          Carousel feed (swipe to vote) + List mode toggle
CREATE        New poll (title, options, category, timer) → UNDER REVIEW state
PROFILE       Stats + activity grid + poll history + bio edit
ADMIN         Stats dashboard · Users · Polls · Moderation queue · Audit log
```

## Features

### v1 (live)
- Email/username login + signup (with password confirm)
- Forgot password (Supabase email reset)
- Swipe carousel with snap + scale/opacity animations
- Vote A/B with swipe gesture (Reanimated) + optimistic rollback on failure
- Feed filters: ALL / TRENDING / 🔥 EXPIRING / EXPIRED / VOTED
- Category filter chips (10 categories, centralised in `src/constants/categories.ts`)
- Pull-to-refresh on home feed
- Contextual empty states per filter
- List/carousel toggle in home header
- Poll creation with timer → UNDER REVIEW state
- Profile: stats + poll history + voted history + bio edit + activity grid
- Admin: 5 tabs (Stats, Users, Polls, Queue, Audit Log) with pagination + audit logging

### v2 (in progress)
- Voting streaks + badges
- Real-time vote counts (Supabase Realtime)
- Public user profiles + follow system
- Notifications center
- LLM content moderation (Claude claude-haiku-4-5 via Supabase Edge Function)

### v3 (planned)
- Deathmatch polls (1v1 user challenge)
- Confession polls (anonymous author)
- Vote predictions (predict the split before voting)
- Leaderboards (rep / streak / prediction accuracy)
- Poll + user search
- Deep links / share
- Push notifications

## Content Moderation
Every poll goes through automated LLM review (Supabase Edge Function + Claude API)
before going live.

```
User submits poll → validation_status = 'pending'
      ↓
Edge Function: POST to Claude claude-haiku-4-5
  Checks: hate speech, illegal content, harassment, incitement, spam
      ↓
safe + confidence ≥ 80%  → approved (auto-live)
flagged OR confidence < 80% → pending (admin queue)
      ↓
Admin QUEUE tab: poll + LLM verdict + confidence + reason
[APPROVE] or [REJECT with reason]
```

## HTTPS
- All API traffic uses HTTPS only
- Android: `usesCleartextTraffic: false`
- iOS: `NSAllowsArbitraryLoads: false`
- Supabase URL validated to start with `https://` at runtime

## Design
```
Background: #000000  |  Text: #FFFFFF  |  Cards: #0A0A0A
Font: Inter (400/500/600/700)
Borders: 1px #333  |  borderRadius: xs–md (2–8px)
No gradients. No decoration. Pure signal.
```

## Getting started
```bash
npm install
npx expo start --clear
```

## Build
```bash
eas build --platform android
eas build --platform ios
```

## Project structure
```
App.tsx, app.json
src/
  constants/   categories.ts
  theme/       index.ts (design tokens)
  types/       index.ts
  hooks/       useAuth · usePolls · useBreakpoint
  database/    supabase.ts · supabase-api.ts
  navigation/  index.tsx (stack + bottom tabs)
  screens/     Auth · Home · Create · Profile · PublicProfile · Admin
  components/
    ui/        Screen · Card · Button · Input · TabBar · Chip · PixelBar
               StatBox · PollRow · UserRow · SectionHeader · ErrorBox
               Divider · ActivityGrid · MiniBarChart
supabase/
  functions/   moderate-poll/ (Edge Function — LLM content moderation)
MIGRATIONS-V2-ROADMAP.sql   DB migrations for v2
```

## Database tables
```
users           id, auth_id, name, username, email, avatar, role, status, bio
polls           id, title, option_a/b, votes_a/b, category, validation_status, moderation_result
votes           id, poll_id, user_id, option, created_at
notifications   id, user_id, type, message, is_read
poll_history    id, poll_id, user_id, voted_at
user_follows    id, follower_id, following_id  (migration: MIGRATIONS-V2-ROADMAP.sql)
user_streaks    id, user_id, current_streak, longest_streak
vote_predictions id, poll_id, user_id, predicted_pct_a, actual_pct_a, score
admin_audit_log id, admin_id, action_type, target_id, target_type, reason
```

## Branch strategy
```
go_live      Original Ionic/React web app (production)
move_to_v1   React Native rebuild (active development)
```

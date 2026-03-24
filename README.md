# PAUL
> Binary polls. Swipe to vote. Pure black.

## What is PAUL?
Binary polling app. Every question has two choices. Swipe right = A. Swipe left = B.
No noise. No ads. No algorithmic manipulation. Pure signal.

## Stack
React Native 0.81 + Expo SDK 54 | TypeScript | Supabase (PostgreSQL + Realtime)
Auth: Supabase Auth + SecureStore | Fonts: Silkscreen (UI chrome) + Inter (body)
Navigation: React Navigation 7 (root Stack + Bottom Tabs)
Gestures: RNGH v2 + Reanimated v3 | Icons: Lucide

## Screens
```
AUTH            Login (email or username) / Sign up / Forgot password
HOME            Vertical carousel feed (swipe to vote) + List mode toggle
CREATE          New poll (title, options, category, timer) → UNDER REVIEW state
PROFILE         Stats · poll history · voted history · bio edit · activity grid
PUBLIC PROFILE  Any user's public profile (stats, polls, activity) — read only
ADMIN           Stats dashboard · Users · Polls · Moderation queue · Audit log
```

## Features

### v1 (complete)
- Email **or** username login — username resolves to email before auth
- Signup with name, username, email, password confirmation
- Forgot password (Supabase email reset)
- Swipe carousel with snap + scale/opacity parallax animations
- Vote A/B via swipe gesture (Reanimated Pan) — optimistic rollback on failure
- Atomic vote RPC (`cast_vote`) — race-condition-free, server-side counter increment
- Feed filters: ALL / TRENDING / 🔥 EXPIRING / EXPIRED / VOTED
- Category filter chips (10 categories, centralised in `src/constants/categories.ts`)
- Pull-to-refresh on home feed + infinite scroll pagination
- List / carousel toggle in home header
- Poll creation with optional timer → UNDER REVIEW status
- Profile: stats · poll history · voted history (via `poll_history`) · bio edit · 30-day activity grid
- Public profiles: tap any `@username` in feed (carousel + list) or Profile/Admin tabs → full profile view
- Admin panel: 5 tabs (Stats, Users, Polls, Moderation Queue, Audit Log) with pagination
- Moderation queue: LLM verdict display (verdict, confidence %, reason) — approve / reject with reason
- Audit log: every admin action recorded with actor, target, reason, timestamp
- All traffic HTTPS only (Android `usesCleartextTraffic: false`, iOS `NSAllowsArbitraryLoads: false`)

### v2 (planned)
- Follow system (schema ready — `user_follows` table migrated)
- LLM content moderation auto-pipeline (Edge Function + Claude API — schema ready, deploy pending)
- Real-time vote counts (Supabase Realtime subscriptions)
- Voting streaks + badges
- Notifications centre
- Poll search (GIN index already in place)
- Deep links / share sheet

### v3 (planned)
- Deathmatch polls (1v1 user challenge)
- Shadow Deathmatch (anonymous challenger)
- Confession polls (anonymous author)
- Vote predictions (predict the split before voting)
- Leaderboards (reputation / streak / prediction accuracy)
- Push notifications (EAS Notifications)

## Content Moderation
Every poll goes through automated LLM review (Supabase Edge Function + Claude API)
before going live. Edge Function is written and ready — deploy when v2 ships.

```
User submits poll → validation_status = 'pending'
      ↓
Edge Function: POST to Claude Haiku
  Checks: hate speech, illegal content, harassment, incitement, spam
      ↓
safe + confidence ≥ 80%  → approved (auto-live)
flagged OR confidence < 80% → pending (admin queue)
      ↓
Admin QUEUE tab: poll + LLM verdict + confidence + reason
[APPROVE] or [REJECT with reason]
```

## Design
```
Background: #000000  |  Text: #FFFFFF  |  Cards: #0A0A0A
Silkscreen = UI chrome (labels, headings, all-caps elements)
Inter       = readable content (body text, poll titles, counts)
Borders: 1px #333  |  borderRadius: xs–md (2–8px)
No gradients. No decoration. Pure signal.
```

## Getting started
```bash
npm install
npx expo start --clear
```

## Testing
```bash
npm test              # run all tests once
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

131 unit tests across 3 suites — no network, no emulator required:

| Suite | What it covers |
|---|---|
| `auth-logic.test.ts` | Email regex, username/password/name validation (pure logic) |
| `supabase-api.test.ts` | All DB functions — getUserBy*, castVote (RPC + fallback), getPollsWithVoteStatus, getUserVoteHistory, getUserActivity |
| `transforms.test.ts` | transformPoll (timeLeft, isExpired, vote counts, field mapping) and transformUser |

All Supabase calls are intercepted by Jest mocks — tests run offline and in milliseconds.

## Build (EAS)
```bash
# Internal preview (APK — fast for testing)
eas build --platform android --profile preview

# Production
eas build --platform all --profile production
```

`eas.json` defines three profiles: `development` (dev client), `preview` (APK), `production` (AAB + iOS).

## Project structure
```
App.tsx, app.json, eas.json
src/
  constants/   categories.ts
  theme/       index.ts (design tokens — single source of truth)
  types/       index.ts
  hooks/       useAuth · usePolls · useBreakpoint
  database/    supabase.ts · supabase-api.ts
  navigation/  index.tsx (RootStack → MainTabs + PublicProfile)
  screens/     Auth · Home · Create · Profile · PublicProfile · Admin
  components/
    ui/        Screen · Card · Button · Input · TabBar · Chip · PixelBar
               StatBox · PollRow · UserRow · SectionHeader · ErrorBox
               Divider · ActivityGrid · MiniBarChart
supabase/
  functions/   moderate-poll/   (Edge Function — LLM content moderation)
SUPABASE-SCHEMA.sql          Base schema
MIGRATIONS-V2-ROADMAP.sql    Applied migrations (votes.created_at, cast_vote RPC,
                              user_follows, bio, moderation_result, indexes)
```

## Database tables
```
users           id, auth_id, name, username, email, avatar, role, status, bio
polls           id, title, option_a/b, votes_a/b, category, timer_enabled,
                expires_at, is_expired, validation_status, moderation_result,
                is_deathmatch, is_confession, trending_score
votes           id, poll_id, user_id, option, timestamp, created_at
poll_history    id, poll_id, user_id, action, poll_title, poll_category, timestamp
notifications   id, user_id, type, message, is_read, created_at
user_follows    id, follower_id, following_id, created_at
admin_audit_log id, admin_id, admin_username, action_type, target_id, target_type,
                reason, previous_value, new_value, created_at
```

## Navigation structure
```
RootStack (headerShown: false)
  ├── Main → BottomTabs
  │     ├── Home
  │     ├── Create
  │     ├── Profile
  │     └── Admin  (admin role only)
  └── PublicProfile  { userId: string }
```

## Branch strategy
```
go_live      Original Ionic/React web app (production)
move_to_v1   React Native rebuild (v1 complete)
```

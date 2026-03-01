# PAUL

> Binary polls. Swipe to vote. Pure black.

A mobile-first polling app built with **React Native (Expo)**, **Supabase**, and a brutal 8-bit aesthetic. No gradients. No noise. Just questions and answers.

---

## STACK

| Layer | Tech |
|---|---|
| Mobile | React Native 0.76 (Expo SDK 52) |
| Language | TypeScript |
| Backend | Supabase (PostgreSQL + Realtime) |
| Auth | bcryptjs + SecureStore |
| Font | Silkscreen (Google Fonts) |
| Navigation | React Navigation 6 (Bottom Tabs) |

---

## SCREENS

```
AUTH      Login / Sign up
HOME      Swipe-based poll feed
CREATE    New poll form
PROFILE   User stats + poll history
ADMIN     User management + moderation (admin only)
```

---

## DESIGN

- Background: `#000000`
- Text: `#FFFFFF`
- Font: **Silkscreen** — 8-bit pixel typeface
- Borders: 1px white, zero border radius
- No icons, no gradients, no color accents

### Voting UI

Swipe right to vote **A**. Swipe left to vote **B**.

```
+-------------------------------+
| SPORTS            ⏱ 5H 20M  |
|                               |
| Is Messi better than Ronaldo? |
|                               |
|  [ A ]          [ B ]        |
|                               |
| <- VOTE B        VOTE A ->   |
+-------------------------------+
```

After voting, results appear as pixel bars:

```
A  ████████░░  65%
B  ████░░░░░░  35%
             247 VOTES
```

---

## FEATURES (v1 — Core)

- Email/username login and sign up
- Swipe left/right to vote on polls
- Filter feed: ALL / TRENDING / EXPIRED / VOTED
- Create polls with options, category, and timer
- Profile page with stats (polls, followers, reputation, win rate)
- Admin panel: stats dashboard, user management, poll deletion

---

## GETTING STARTED

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (for testing)

### Install

```bash
git clone <repo>
cd paul
git checkout move_to_v1
npm install
```

### Run

```bash
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android) to run on your device.

### Build (production)

```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

---

## PROJECT STRUCTURE

```
App.tsx                    Entry point — fonts, providers, auth gate
app.json                   Expo config
babel.config.js

src/
  theme/index.ts           Design tokens (colors, fonts, spacing)
  types/index.ts           TypeScript interfaces

  database/
    supabase.ts            Supabase client (AsyncStorage for RN)
    supabase-api.ts        Polls, users, votes, admin operations

  hooks/
    useAuth.ts             Auth context + provider (SecureStore session)
    usePolls.ts            Poll state management

  navigation/
    index.tsx              Bottom tab navigator

  screens/
    AuthScreen.tsx         Login + signup
    HomeScreen.tsx         Swipe poll feed
    CreateScreen.tsx       Poll creation
    ProfileScreen.tsx      User profile + history
    AdminScreen.tsx        Admin dashboard
```

---

## DATABASE

Connects to the existing Supabase project. Schema unchanged from `go_live`.

Key tables: `users`, `polls`, `votes`, `notifications`, `poll_history`, `admin_audit_log`

---

## ENVIRONMENT

Supabase credentials are stored in `app.json` under `expo.extra`. For production builds, move these to EAS Secrets.

---

## BRANCH STRATEGY

| Branch | Purpose |
|---|---|
| `go_live` | Original Ionic/React web app |
| `move_to_v1` | React Native rebuild (this branch) |

---

## ROADMAP (post v1)

- Deathmatch polls
- Shadow Deathmatch (anonymous)
- Voting streaks
- Live vote animations (Supabase Realtime)
- Predictions system
- Confession polls
- Push notifications
- EAS Build + App Store submission

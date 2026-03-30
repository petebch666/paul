# PAUL v1 — Test Plan

This document defines the full validation methodology for the v1 release of PAUL.
It covers automated unit tests, manual functional testing, and cross-feature integration
scenarios. Work through each phase in order — earlier phases establish the state that later
phases depend on.

---

## Methodology

Two testing layers are used in combination:

**1. Automated unit tests (Jest + jest-expo)**
Pure logic — auth rules, API transforms, hook state machines. No network, no device.
Run on every branch before merging.

**2. Manual functional testing**
Real app on a real device or simulator, real Supabase database.
Requires at least two test accounts and one admin account.

An issue is only "done" when it passes both layers.

---

## Prerequisites

### 1. Environment

| Requirement | Detail |
|---|---|
| Node.js | 18+ |
| Expo CLI | `npx expo` (no global install needed) |
| Physical device or simulator | iOS 16+ or Android 12+ recommended |
| Expo Go app | For quick iteration (or dev build for gesture handler) |
| Supabase account | Project credentials in `app.json` → `expo.extra` |

> **Gesture note**: `react-native-gesture-handler` requires a dev build for full swipe
> fidelity. `npx expo run:android` or `npx expo run:ios` is strongly preferred over Expo Go
> for HomeScreen testing.

### 2. Database — required state before starting

Run the following in the Supabase SQL Editor before any manual testing:

```sql
-- Allow 'completed' as a valid deathmatch_status (required for Deathmatch phase)
ALTER TABLE polls DROP CONSTRAINT IF EXISTS polls_deathmatch_status_check;
ALTER TABLE polls ADD CONSTRAINT polls_deathmatch_status_check
  CHECK (deathmatch_status IN ('pending', 'accepted', 'rejected', 'completed'));
```

Verify Realtime is enabled for the `polls` table:
Supabase dashboard → Database → Replication → enable `polls` table for INSERT + UPDATE events.

### 3. Test accounts

Create the following accounts before running manual tests:

| Account | Role | Purpose |
|---|---|---|
| `@tester_a` | user | Primary tester (creates polls, votes, follows) |
| `@tester_b` | user | Secondary tester (challenge opponent, second device) |
| `@admin_user` | admin | Admin panel validation |

To make a user an admin: Supabase dashboard → Table Editor → `users` → set `role = 'admin'` for that row.

`@tester_a` and `@tester_b` must follow each other (mutual follows) before the Deathmatch
phase — this is required for the opponent picker to surface them.

### 4. Running the automated suite

```bash
npx jest --no-coverage
```

Expected baseline: **286 tests passing, 0 failing**.

To run a single domain:

```bash
npx jest --testPathPattern="auth-logic"       # auth rules
npx jest --testPathPattern="supabase-api\.test"  # core API
npx jest --testPathPattern="supabase-api-deathmatch"  # follow + deathmatch
npx jest --testPathPattern="transforms"       # field transforms
npx jest --testPathPattern="useFriends"       # follow hook
npx jest --testPathPattern="useNotifications" # notification hook
```

---

## Phase 1 — Authentication

**Automated coverage**: `auth-logic.test.ts` (57 tests)
**Goal**: Confirm signup, login, and session persistence work end-to-end.

### 1.1 Signup

| Step | Action | Expected result |
|---|---|---|
| S1 | Open app fresh (no session) | AuthScreen shown in LOGIN mode |
| S2 | Tap "SIGN UP" | Form switches to SIGNUP mode |
| S3 | Submit empty form | Validation errors appear on all fields |
| S4 | Enter name < 2 chars (e.g. "A") | "NAME TOO SHORT" error |
| S5 | Enter username < 3 chars (e.g. "ab") | "USERNAME TOO SHORT" error |
| S6 | Enter username with spaces or special chars (e.g. "test user!") | "INVALID USERNAME" error |
| S7 | Enter an invalid email (e.g. "notanemail") | "INVALID EMAIL" error |
| S8 | Enter password < 8 chars | "PASSWORD TOO SHORT" error |
| S9 | Enter mismatched passwords | "PASSWORDS DO NOT MATCH" error |
| S10 | Fill all fields correctly → submit | Account created, navigates to HomeScreen |
| S11 | Check Supabase `users` table | New row with correct name, username, email, random avatar |

### 1.2 Login

| Step | Action | Expected result |
|---|---|---|
| L1 | Login with **email** + correct password | Navigates to HomeScreen |
| L2 | Login with **username** + correct password | Navigates to HomeScreen (same user) |
| L3 | Login with wrong password | "INVALID CREDENTIALS" error, stays on AuthScreen |
| L4 | Login with non-existent email | Error shown, stays on screen |
| L5 | Login with non-existent username | Error shown, stays on screen |

### 1.3 Session persistence

| Step | Action | Expected result |
|---|---|---|
| P1 | Login → force-close the app → reopen | User still authenticated, goes directly to HomeScreen |
| P2 | Logout → reopen app | AuthScreen shown |

### 1.4 Account restrictions

| Step | Action | Expected result |
|---|---|---|
| R1 | Set `@tester_a` status = 'banned' in Supabase | On next login attempt: signed out immediately |
| R2 | Restore status = 'active' | Login works normally again |

---

## Phase 2 — Poll Feed (HomeScreen)

**Automated coverage**: `supabase-api.test.ts` (transforms, vote, pagination)
**Goal**: Confirm the feed loads, filters correctly, and voting works.

### 2.1 Feed loading

| Step | Action | Expected result |
|---|---|---|
| F1 | Open HomeScreen | Poll cards load, spinner shown during fetch |
| F2 | Pull down to refresh | Feed reloads, spinner visible |
| F3 | Scroll to bottom of carousel | Additional polls load (if hasMore=true) |
| F4 | Switch to list mode (icon top-right) | All polls render as PollRows |
| F5 | Switch back to carousel mode | Carousel resumes at first poll |

### 2.2 Filter tabs

| Step | Action | Expected result |
|---|---|---|
| FT1 | Tap "TRENDING" | Only polls with trendingScore > 0 and not expired |
| FT2 | Tap "🔥" (EXPIRING) | Only polls expiring within 2 hours |
| FT3 | Tap "EXPIRED" | Only expired polls, no timer showing |
| FT4 | Tap "VOTED" | Only polls where current user has voted |
| FT5 | Tap "ALL" | All polls visible again |
| FT6 | Switch filter while on page > 1 | Returns to first poll, offset resets |

### 2.3 Category chips

| Step | Action | Expected result |
|---|---|---|
| C1 | Tap a category chip (e.g. "TECH") | Feed filters to that category only |
| C2 | Tap "ALL" category chip | All categories shown |
| C3 | Combine category + type filter | Both filters applied simultaneously |

### 2.4 Voting — carousel swipe

Create at least 3 unvoted polls before this section.

| Step | Action | Expected result |
|---|---|---|
| V1 | Swipe right on a card (past 35% threshold) | Card flies off right, vote A recorded |
| V2 | Swipe left on a card | Card flies off left, vote B recorded |
| V3 | Start swipe but release before threshold | Card springs back to center |
| V4 | After voting: check card state | PixelBar bars appear with vote percentages |
| V5 | After voting: check Supabase `votes` table | Row present with correct poll_id, user_id, option |
| V6 | After voting: check Supabase `poll_history` | Row present with action='voted' |
| V7 | Attempt to vote twice on same poll | Not possible — voted polls are marked, swipe disabled |
| V8 | Vote on a poll → kill app → reopen | Poll still marked as voted in VOTED filter |

### 2.5 Voting — list mode

| Step | Action | Expected result |
|---|---|---|
| V9 | Switch to list mode, find an unvoted deathmatch poll with status='accepted' | Tapping navigates to DeathmatchBattle screen |
| V10 | Regular unvoted poll in list mode | Displays stats (isVoted=false shows stats as-is) |

### 2.6 Poll badges

| Step | Action | Expected result |
|---|---|---|
| B1 | Poll with `is_deathmatch=true` in feed | "⚔ DEATHMATCH" label shown on card |
| B2 | Poll with `is_confession=true` | "🔒 CONFESSION" label shown |
| B3 | Poll expiring in < 2h | 🔥 flame icon next to category |
| B4 | Expired poll | "EXPIRED" shown instead of time remaining |

---

## Phase 3 — Poll Creation

**Goal**: Validate the creation form, category selection, timer, and deathmatch flow.

### 3.1 Normal poll

| Step | Action | Expected result |
|---|---|---|
| N1 | Navigate to CREATE tab | Empty form shown |
| N2 | Submit without filling any fields | Validation errors on question, option A, option B |
| N3 | Enter question < 5 chars | "QUESTION TOO SHORT" error |
| N4 | Enter same text for option A and B (case-insensitive) | "OPTIONS MUST BE DIFFERENT" error |
| N5 | Fill all fields correctly, submit | "UNDER REVIEW" success state shown |
| N6 | Tap "CREATE ANOTHER" | Form resets to blank |
| N7 | Check Supabase `polls` table | New row with validation_status='pending', is_deathmatch=false |
| N8 | New poll visible in HomeScreen (ALL filter) | Appears at top of feed |

### 3.2 Timer settings

| Step | Action | Expected result |
|---|---|---|
| T1 | Create poll with timer OFF | Poll in Supabase has timer_enabled=false |
| T2 | Create poll with timer ON, select "1H" | expires_at ≈ now + 60 min |
| T3 | Create poll with timer ON, select "7D" | expires_at ≈ now + 7 days |
| T4 | Create deathmatch (toggle ON) | Timer automatically forced to ON |

### 3.3 Deathmatch challenge creation

Requires `@tester_a` and `@tester_b` to mutually follow each other first (see Phase 5).

| Step | Action | Expected result |
|---|---|---|
| D1 | Toggle DEATHMATCH ON | Timer locks to ON, opponent picker appears |
| D2 | Search for `@tester_b` by username | `@tester_b` appears in list |
| D3 | Select `@tester_b` as opponent | Shows selected opponent card below picker |
| D4 | Tap selected opponent to deselect | Picker returns to search state |
| D5 | Re-select `@tester_b`, fill all fields, submit | "CHALLENGE SENT TO @tester_b" shown |
| D6 | Check Supabase `polls` | New row: is_deathmatch=true, deathmatch_status='pending', option_b_owner_id=tester_b.id |
| D7 | Check `notifications` table | Row for tester_b with type='deathmatch_created' |
| D8 | Open `@tester_b` Inbox | ChallengeCard visible in CHALLENGES section |

---

## Phase 4 — Profile

**Goal**: Validate profile stats, edit mode, tab content, and logout.

### 4.1 Profile display

| Step | Action | Expected result |
|---|---|---|
| PR1 | Navigate to PROFILE tab | Avatar, name, @username, SINCE year shown |
| PR2 | Check POLLS stat box | Count matches number of created polls |
| PR3 | Check REP stat box | Matches `reputation` in Supabase |
| PR4 | Tap POLLS tab | List of user's created polls |
| PR5 | Tap VOTED tab | List of polls user has voted on |
| PR6 | Tap STATS tab | 30-day activity grid populated with vote days |
| PR7 | Tap FOLLOWING tab | List of users this user follows |
| PR8 | Tap FOLLOWERS tab | List of users following this user |

### 4.2 Edit mode

| Step | Action | Expected result |
|---|---|---|
| E1 | Tap EDIT button | Name and bio inputs appear, pre-filled |
| E2 | Clear name, submit | "NAME TOO SHORT" error |
| E3 | Enter bio > 120 chars | Char counter turns red, cannot exceed limit |
| E4 | Enter valid name + bio, tap SAVE | Profile updated, new values shown |
| E5 | Check Supabase `users` | name and bio columns updated |
| E6 | Tap CANCEL during edit | Changes discarded, original values shown |

### 4.3 Public profile (from HomeScreen author press)

| Step | Action | Expected result |
|---|---|---|
| PP1 | Tap `@authorUsername` on a poll card | PublicProfileScreen opens for that author |
| PP2 | FOLLOW button shown (if not following) | Tap → button changes to FOLLOWING |
| PP3 | Tap FOLLOWING button | Unfollows, button reverts to FOLLOW |
| PP4 | Check tester_b's `followers` stat | Incremented after follow, decremented after unfollow |

### 4.4 Logout

| Step | Action | Expected result |
|---|---|---|
| LO1 | Tap LOGOUT on Profile tab | Signed out, AuthScreen shown |
| LO2 | Reopen app | Still on AuthScreen (session cleared) |

---

## Phase 5 — Follow System

**Automated coverage**: `useFriends.test.ts` (31 tests)
**Goal**: Validate follow/unfollow, counter accuracy, and mutual follow detection.

**Setup**: Log in as `@tester_a` on device A, `@tester_b` on device B.

| Step | Action | Expected result |
|---|---|---|
| FL1 | `@tester_a` opens `@tester_b`'s public profile | FOLLOW button shown |
| FL2 | `@tester_a` taps FOLLOW | Button → FOLLOWING; tester_a.following +1, tester_b.followers +1 |
| FL3 | `@tester_b` opens `@tester_a`'s public profile | FOLLOW button shown (not mutual yet) |
| FL4 | `@tester_b` taps FOLLOW | Button → FOLLOWING; now mutual |
| FL5 | Both users: FOLLOWING tab in Profile | Each sees the other in their list |
| FL6 | Both users: FOLLOWERS tab | Each sees the other as a follower |
| FL7 | `@tester_a` CreateScreen, toggle deathmatch ON | `@tester_b` appears in opponent picker (mutual) |
| FL8 | `@tester_a` taps FOLLOWING on tester_b profile | Unfollows; tester_a.following -1, tester_b.followers -1 |
| FL9 | `@tester_a` CreateScreen, toggle deathmatch ON | `@tester_b` no longer in picker (not mutual) |
| FL10 | Re-follow `@tester_b` from both accounts | Mutual follow restored for deathmatch testing |

---

## Phase 6 — Notifications (Inbox)

**Automated coverage**: `useNotifications.test.ts` (16 tests)
**Goal**: Validate notification delivery, unread badge, and challenge actions.

| Step | Action | Expected result |
|---|---|---|
| NF1 | `@tester_a` sends deathmatch challenge to `@tester_b` (from Phase 3.3) | Bell badge appears on `@tester_b`'s Inbox tab |
| NF2 | `@tester_b` taps Inbox tab | ChallengeCard shown at top of screen |
| NF3 | `@tester_b` taps REJECT | Card disappears; tester_a receives rejection notification |
| NF4 | `@tester_a` taps Inbox | "YOUR DEATHMATCH CHALLENGE WAS DECLINED." notification shown |
| NF5 | `@tester_a` sends a new challenge to `@tester_b` | ChallengeCard appears again in tester_b's Inbox |
| NF6 | `@tester_b` taps ACCEPT | Card disappears, app navigates to DeathmatchBattle screen |
| NF7 | `@tester_a` taps Inbox | "YOUR DEATHMATCH CHALLENGE WAS ACCEPTED!" notification shown |
| NF8 | Tapping that notification | Navigates to DeathmatchBattle screen for the same poll |
| NF9 | Open Inbox → unread count shows | Badge resets to 0 after ~800ms (markAllRead fires) |
| NF10 | Scroll to bottom of notification list | "LOAD MORE" button loads older notifications |

---

## Phase 7 — Deathmatch Battle Screen

**Automated coverage**: `supabase-api-deathmatch.test.ts` — `getDeathmatchDetails` + `completeDeathmatch` (9 tests)
**Goal**: Validate the live battle UI, real-time vote sync, and endgame logic.

**Setup**: An accepted deathmatch poll exists (from Phase 6, step NF6).
Two devices open: `@tester_a` on one, `@tester_b` on the other.

### 7.1 Battle screen display

| Step | Action | Expected result |
|---|---|---|
| BT1 | `@tester_a` opens DeathmatchBattle | Header shows "⚔ DEATHMATCH" + countdown timer |
| BT2 | Both player panels visible | @tester_a on left (OPTION A), @tester_b on right (OPTION B) |
| BT3 | Timer counts down in real-time | MM:SS format, turns red when < 60s |
| BT4 | No vote yet | "CAST YOUR VOTE" section with VOTE A / VOTE B buttons |
| BT5 | PixelBar shows 50% / 50% with 0 total votes | Equal bars, "0 VOTES" |

### 7.2 Voting + real-time sync

| Step | Action | Expected result |
|---|---|---|
| BT6 | `@tester_a` taps VOTE A | Buttons disappear, "YOU VOTED A" shown |
| BT7 | `@tester_b`'s screen (no action taken) | Vote bars update without refresh: A jumps above 50% |
| BT8 | `@tester_b` taps VOTE B | "YOU VOTED B" shown; bars update on both devices |
| BT9 | Third account votes A | Both devices see bars shift; total vote count increments |
| BT10 | `@tester_a` attempts to vote again | Buttons remain disabled — double-vote prevented |
| BT11 | Kill app → reopen battle screen | "YOU VOTED A" still shown (vote persists) |

### 7.3 Endgame — timer expiry

For this section, create a fresh deathmatch poll with a **30-minute** timer and manually
set `expires_at` to 30 seconds from now in Supabase to accelerate testing:

```sql
UPDATE polls
SET expires_at = NOW() + INTERVAL '30 seconds'
WHERE id = '<your-poll-id>';
```

| Step | Action | Expected result |
|---|---|---|
| BT12 | Both devices watching battle screen | Timer counts to 00:00 |
| BT13 | Timer hits 00:00 | Timer shows "ENDED", winner banner appears |
| BT14 | Side with more votes wins | "WINNER: @username" displayed |
| BT15 | Equal votes | "DRAW" displayed |
| BT16 | Check Supabase `polls` | deathmatch_status = 'completed' |
| BT17 | Check Supabase `users` | Winner's reputation +10 |
| BT18 | Check winner's Inbox | "YOU WON THE DEATHMATCH! +10 REPUTATION" notification |
| BT19 | Check loser's Inbox | "YOU LOST THE DEATHMATCH. BETTER LUCK NEXT TIME." |
| BT20 | Repeat endgame on already-completed poll | No duplicate rep bump (idempotency guard) |

---

## Phase 8 — Admin Panel

**Goal**: Validate the admin-only dashboard, moderation queue, and audit logging.

**Setup**: Log in as `@admin_user`.

### 8.1 Access control

| Step | Action | Expected result |
|---|---|---|
| AC1 | Log in as admin | ADMIN tab visible in bottom nav |
| AC2 | Log in as regular user | ADMIN tab not shown |

### 8.2 Stats tab

| Step | Action | Expected result |
|---|---|---|
| ST1 | Open STATS tab | Total users, polls, votes, active users, pending polls shown |
| ST2 | Check daily activity chart | Last 7 days of votes + poll creation visible |
| ST3 | Numbers match Supabase | Verify against `SELECT COUNT(*) FROM users/polls/votes` |

### 8.3 Moderation queue

| Step | Action | Expected result |
|---|---|---|
| MQ1 | Open QUEUE tab | All pending polls shown (validation_status='pending') |
| MQ2 | Tap APPROVE on a poll | Poll removed from queue, validation_status='approved' in Supabase |
| MQ3 | Tap REJECT on a poll | Enter reason → poll removed, validation_status='rejected' |
| MQ4 | Check AUDIT tab | Both actions logged with admin username + timestamp |

### 8.4 User management

| Step | Action | Expected result |
|---|---|---|
| UM1 | Open USERS tab | All users listed with status badges |
| UM2 | Suspend `@tester_b` with reason | Status badge changes to SUSPENDED |
| UM3 | Check `@tester_b` can still log in | They can (suspended ≠ banned) |
| UM4 | Reinstate `@tester_b` (set to active) | Badge changes back to ACTIVE |
| UM5 | Ban `@tester_b` | Status = BANNED |
| UM6 | `@tester_b` attempts to log in | Immediately signed out |
| UM7 | Restore `@tester_b` to active | Login works again |
| UM8 | Promote `@tester_b` to admin | ADMIN tab appears in their session |
| UM9 | Demote back to user | ADMIN tab disappears |

### 8.5 Poll management

| Step | Action | Expected result |
|---|---|---|
| PM1 | Open POLLS tab | All polls listed with author + vote count |
| PM2 | Delete a test poll | Removed from list, deleted from Supabase `polls` table |
| PM3 | Check AUDIT tab | Deletion logged |

---

## Phase 9 — Cross-Feature Integration

These scenarios test interactions between multiple systems.

### 9.1 Full deathmatch lifecycle (end-to-end)

1. `@tester_a` and `@tester_b` follow each other.
2. `@tester_a` creates a deathmatch challenge for `@tester_b` (30-min timer).
3. `@tester_b` sees ChallengeCard in Inbox → accepts.
4. Both navigate to DeathmatchBattle screen.
5. Multiple accounts (including a third) vote on the poll.
6. Observe real-time bar updates on both devices.
7. Fast-forward expiry via Supabase (set expires_at to now + 30s).
8. Both devices show winner banner.
9. Winner's reputation is incremented.
10. Both receive result notifications.

**Pass criteria**: All 10 steps complete without errors, Supabase state matches expected values.

### 9.2 Vote → profile → history

1. `@tester_a` votes on 5 polls.
2. Navigate to Profile → VOTED tab.
3. All 5 polls appear.
4. Navigate to Profile → STATS tab.
5. Today's date shows a dot/block on the activity grid.

### 9.3 Pagination stress test

1. Ensure 25+ polls exist in the database.
2. Open HomeScreen → scroll carousel to the end.
3. At poll 20, next batch auto-loads.
4. Continue to poll 25+.
5. No duplicate polls, no gaps.
6. Open AdminScreen → USERS tab → 20+ users.
7. Scroll — "LOAD MORE" loads next batch.

### 9.4 Error recovery

| Step | Action | Expected result |
|---|---|---|
| ER1 | Disable network → attempt to vote | Error shown, optimistic update rolls back |
| ER2 | Re-enable network → vote again | Vote succeeds, bar updates |
| ER3 | Disable network → open battle screen | "BATTLE NOT FOUND" or error box shown |
| ER4 | Disable network → open Inbox | Error box shown with RETRY button |

---

## Phase 10 — Regression (run after any code change)

Always run the full automated suite plus spot-check these manual cases:

```bash
npx jest --no-coverage
# expected: 286 passing, 0 failing
```

Manual spot-checks:

- [ ] Login still works
- [ ] Home feed loads
- [ ] A swipe vote lands correctly
- [ ] Inbox shows pending challenges
- [ ] DeathmatchBattle opens and shows both players

---

## Sign-off Checklist

Before tagging the v1 release:

- [ ] All 286 automated tests pass on `move_to_v1` branch
- [ ] Phase 1 (Auth) — all steps pass
- [ ] Phase 2 (Feed) — swipe vote confirmed on real device
- [ ] Phase 3 (Create) — normal + deathmatch creation work
- [ ] Phase 4 (Profile) — edit, logout, public profile work
- [ ] Phase 5 (Follow) — follow, unfollow, mutual detection work
- [ ] Phase 6 (Notifications) — challenge accept/reject + navigation work
- [ ] Phase 7 (Deathmatch battle) — real-time sync + endgame confirmed
- [ ] Phase 8 (Admin) — approve/reject/ban/audit work
- [ ] Phase 9 (Integration) — full deathmatch lifecycle end-to-end passes
- [ ] DB migration for `'completed'` status applied to production Supabase
- [ ] Realtime enabled for `polls` table in Supabase dashboard
- [ ] No TypeScript errors (`npx tsc --noEmit`)

---

## Known Limitations (not blocking v1)

| Item | Detail |
|---|---|
| Win rate not updated | `win_rate` column not recalculated on deathmatch completion — only `reputation` is updated |
| Single device endgame | `completeDeathmatch` can fire from any device watching the battle screen at expiry — multiple devices may call it simultaneously. Idempotency guard prevents double rep bumps, but race is not server-enforced |
| Confession poll anonymity | `is_confession` flag exists, but author is still shown in the current UI |
| Poll streaks | Database table exists, no UI |
| Push notifications | In-app notifications only; no platform push (APNs / FCM) |
| Offline mode | App requires network — no local cache or offline queue |

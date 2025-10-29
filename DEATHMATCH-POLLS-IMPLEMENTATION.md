# 🥊 Deathmatch Polls - Implementation Plan

## 📋 Feature Overview

Enable users to create **two-player deathmatch polls** where:
- Each option (A or B) can be "owned" by a specific user
- Both users receive notifications when their poll receives votes
- Support for both **Individual Polls** (current behavior) and **Deathmatch Polls** (new feature)

---

## 🎯 Core Requirements

### 1. Poll Types
- **Individual Poll** (existing): Created by one user, no ownership of options
- **Deathmatch Poll** (new): Two users face off, each defending their option

### 2. Option Ownership
- Option A can be assigned to User A
- Option B can be assigned to User B
- Either option can be unassigned (no owner)

### 3. Notifications
- When a deathmatch poll is created, both users get notified
- Both users get notified whenever someone votes on their poll
- Individual polls continue with existing notification behavior

---

## 🗄️ Database Schema Changes

### Polls Table - New Columns

```sql
-- Add to polls table
ALTER TABLE polls ADD COLUMN IF NOT EXISTS option_a_owner_id UUID REFERENCES users(id);
ALTER TABLE polls ADD COLUMN IF NOT EXISTS option_b_owner_id UUID REFERENCES users(id);
ALTER TABLE polls ADD COLUMN IF NOT EXISTS is_deathmatch BOOLEAN DEFAULT FALSE;
```

**Schema:**
- `option_a_owner_id`: UUID of user who owns/defends Option A (nullable)
- `option_b_owner_id`: UUID of user who owns/defends Option B (nullable)
- `is_deathmatch`: Boolean flag indicating if this is a deathmatch poll

**Rules:**
- If both `option_a_owner_id` and `option_b_owner_id` are set → Deathmatch Poll (`is_deathmatch = true`)
- If both are NULL → Individual Poll
- **Validation:** Both MUST be set for deathmatch (enforced in UI and API)

---

## 📝 Type Definitions

### Update Poll Interface

```typescript
export interface Poll {
  // ... existing fields ...
  
  // Deathmatch Features
  isDeathmatch: boolean
  optionAOwnerId?: string
  optionAOwner?: User  // Populated when fetching poll
  optionBOwnerId?: string
  optionBOwner?: User  // Populated when fetching poll
}
```

### Update CreatePollFormData

```typescript
export interface CreatePollFormData {
  // ... existing fields ...
  
  // Deathmatch Options
  isDeathmatch: boolean
  optionAUserId?: string  // User to assign to Option A
  optionBUserId?: string  // User to assign to Option B
}
```

---

## 🎨 UI Components

### 1. Poll Type Selector (Create Page)

Add a section above the form to choose poll type:

```
┌─────────────────────────────────┐
│  POLL TYPE                       │
│  [ ] Individual Poll            │
│  [✓] Deathmatch Poll             │
└─────────────────────────────────┘
```

### 2. User Assignment Section (Create Page)

**Only visible when `isDeathmatch = true`:**

```
┌─────────────────────────────────┐
│  ASSIGN USERS                   │
│                                 │
│  OPTION A                       │
│  [@________________] [Search]   │
│  Current: @username (Remove)   │
│                                 │
│  OPTION B                       │
│  [@________________] [Search]   │
│  Current: @username (Remove)   │
└─────────────────────────────────┘
```

**Components:**
- User search input with @ symbol
- Dropdown with search results
- Selected user chip with remove button
- Empty state when no user assigned

### 3. Poll Card Display (Home Page)

**For Individual Polls:**
- Display as normal (no changes)

**For Deathmatch Polls:**
```
┌─────────────────────────────────┐
│  Poll Title                     │
│  🥊 DEATHMATCH                  │
│                                 │
│  [Option A]  vs  [Option B]     │
│  @user1      vs  @user2         │
│                                 │
│  [Vote A]        [Vote B]       │
└─────────────────────────────────┘
```

**Changes:**
- Add "🥊 DEATHMATCH" badge
- Show user avatars/usernames next to each option
- Highlight which option each user is defending

---

## 🔧 API Changes

### 1. User Search Endpoint

```typescript
// Already added: SupabasePollzAPI.searchUsers(query: string, limit: number)
```

### 2. Create Poll - Update

**File:** `src/database/supabase-api.ts`

Update `createPoll` method to:
1. Accept `optionAUserId` and `optionBUserId`
2. Set `is_deathmatch = true` if either user is assigned
3. Set `option_a_owner_id` and `option_b_owner_id`
4. Create notifications for both users if deathmatch

```typescript
static async createPoll(pollData: CreatePollFormData, userId: string): Promise<Poll> {
  const isDeathmatch = !!(pollData.optionAUserId || pollData.optionBUserId)
  
  // ... create poll with new fields ...
  
  // Create notifications for deathmatch users
  if (isDeathmatch) {
    // Notify option A owner
    if (pollData.optionAUserId) {
      await this.createNotification({
        pollId: newPoll.id,
        userId: pollData.optionAUserId,
        type: 'poll_created',
        message: `You've been challenged to a deathmatch poll!`
      })
    }
    // Notify option B owner
    if (pollData.optionBUserId) {
      await this.createNotification({
        pollId: newPoll.id,
        userId: pollData.optionBUserId,
        type: 'poll_created',
        message: `You've been challenged to a deathmatch poll!`
      })
    }
  }
}
```

### 3. Vote Notification - Update

**File:** `src/database/supabase-api.ts`

Update `voteOnPoll` method to:
1. Check if poll is deathmatch
2. Get updated vote counts after vote
3. Check for notification triggers:
   - **100-vote threshold:** If total votes is multiple of 100, notify both users
   - **Surpass threshold:** If one option now leads and didn't before, notify both users
4. Track thresholds to prevent duplicate notifications

**Notification Triggers:**
- Every 100 votes: Notify both owners
- Option A surpasses B: Notify both owners
- Option B surpasses A: Notify both owners

```typescript
static async voteOnPoll(pollId: string, userId: string, option: 'A' | 'B'): Promise<void> {
  // ... existing vote logic ...
  
  // Notify option owner in deathmatch polls
  const poll = await this.getPollById(pollId)
  if (poll?.isDeathmatch) {
    const notifyUserId = option === 'A' ? poll.optionAOwnerId : poll.optionBOwnerId
    if (notifyUserId) {
      await this.createNotification({
        pollId: poll.id,
        userId: notifyUserId,
        type: 'poll_trending',
        message: `Someone voted on your deathmatch poll!`
      })
    }
  }
}
```

---

## 🖥️ UI Implementation Details

### Component 1: UserSearchInput

**Location:** `src/components/UserSearchInput.tsx`

**Props:**
```typescript
interface UserSearchInputProps {
  label: string
  value?: string  // Selected user ID
  onChange: (userId: string | undefined) => void
  placeholder?: string
}
```

**Features:**
- @ symbol prefix in input
- Debounced search (300ms delay)
- Dropdown with search results (max 5)
- User avatar + name + username in dropdown
- Selected user chip with remove button
- Search via name or username

**UI Design:**
```
[@__________]  ← Input
├─ @user1 (John Doe)    ← Dropdown
├─ @user2 (Jane Smith)
└─ @user3 (Bob Wilson)

Selected: [@user1 ✕]  ← Chip
```

### Component 2: DeathmatchSelector

**Location:** `src/components/DeathmatchSelector.tsx`

**Props:**
```typescript
interface DeathmatchSelectorProps {
  isDeathmatch: boolean
  onToggle: (isDeathmatch: boolean) => void
}
```

**UI Design:**
- Toggle switch or radio buttons
- Visual indicator when deathmatch is active
- Brief explanation text

### Component 3: PollCard Enhancements

**File:** `src/components/SwipePollCard.tsx`

**Changes:**
- Check `poll.isDeathmatch`
- If true, display deathmatch badge (🥊 DEATHMATCH)
- Show user avatars next to options
- Style differently to indicate competition
- Highlight which option each user is defending
- Show vote counts next to each user's option

---

## 📱 Create Page Updates

### Form State

Add to `CreatePage` state:
```typescript
const [isDeathmatch, setIsDeathmatch] = useState(false)
const [optionAUser, setOptionAUser] = useState<User | null>(null)
const [optionBUser, setOptionBUser] = useState<User | null>(null)
```

### Form Submission

Update `handleSubmit` to include:
```typescript
const pollData: CreatePollFormData = {
  // ... existing fields ...
  isDeathmatch,
  optionAUserId: optionAUser?.id,
  optionBUserId: optionBUser?.id
}
```

### UI Layout

```
┌─────────────────────────────────┐
│  POLL QUESTION                  │
│  [Input...]                     │
├─────────────────────────────────┤
│  OPTION A                       │
│  [Input...]                     │
│                                 │
│  [ ] Deathmatch Poll            │
│  [✓] Assign User to Option A    │
│  [@________] [Search]          │
│  Selected: @user1 [Remove]     │
├─────────────────────────────────┤
│  VS                             │
├─────────────────────────────────┤
│  OPTION B                       │
│  [Input...]                     │
│                                 │
│  [✓] Assign User to Option B   │
│  [@________] [Search]          │
│  Selected: @user2 [Remove]     │
└─────────────────────────────────┘
```

---

## 🔔 Notification System Updates

### New Notification Types

Add to `PollNotification` type:
```typescript
type: 'poll_expired' | 'poll_created' | 'poll_trending' | 'deathmatch_created' | 'deathmatch_vote'
```

### Notification Messages

- `deathmatch_created`: "You've been challenged to a deathmatch: [Poll Title]"
- `deathmatch_100_votes`: "Your deathmatch poll reached [X] votes!"
- `deathmatch_surpassed`: "Your deathmatch poll: Option [A/B] is now leading!"

### Notification Triggers

1. **Poll Creation:**
   - If `optionAUserId` set → notify that user
   - If `optionBOwnerId` set → notify that user

2. **Vote Cast:**
   - If deathmatch poll → notify corresponding option owner
   - Prevent self-notification (don't notify if user votes on their own option)

---

## 📊 Database Migration SQL

```sql
-- Add deathmatch columns to polls table
ALTER TABLE polls 
ADD COLUMN IF NOT EXISTS option_a_owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS option_b_owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_deathmatch BOOLEAN DEFAULT FALSE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_polls_option_a_owner ON polls(option_a_owner_id);
CREATE INDEX IF NOT EXISTS idx_polls_option_b_owner ON polls(option_b_owner_id);
CREATE INDEX IF NOT EXISTS idx_polls_is_deathmatch ON polls(is_deathmatch);

-- Update existing polls
UPDATE polls SET is_deathmatch = FALSE WHERE is_deathmatch IS NULL;
```

---

## 🧪 Testing Checklist

### Functional Tests
- [ ] Can create individual poll (existing behavior)
- [ ] Can create deathmatch poll with one user assigned
- [ ] Can create deathmatch poll with both users assigned
- [ ] Can search for users in assignment field
- [ ] Can remove assigned user before submitting
- [ ] Assigned users receive notification on poll creation
- [ ] Assigned users receive notification on each vote
- [ ] Users don't receive notification for their own votes
- [ ] Poll cards display deathmatch badge correctly
- [ ] Poll cards show user avatars next to options

### Edge Cases
- [ ] What if assigned user doesn't exist?
- [ ] What if assigned user is the poll creator?
- [ ] What if both options assigned to same user? (Allow or prevent?)
- [ ] What if user is assigned but deletes account?
- [ ] Performance: Search with many users

---

## 🚀 Implementation Order

### Phase 1: Database & Types (Foundation)
1. ✅ Update Poll and CreatePollFormData types
2. Add database migration SQL
3. Update Supabase API transformation methods
4. Add `searchUsers` and `getAllUsers` methods

### Phase 2: Core Functionality
5. Update `createPoll` to handle deathmatch fields
6. Update `voteOnPoll` to send notifications
7. Add notification types and handlers

### Phase 3: UI Components
8. Create `UserSearchInput` component
9. Create `DeathmatchSelector` component
10. Update `CreatePage` with new form fields
11. Update `SwipePollCard` to display deathmatch info

### Phase 4: Polish
12. Add animations/transitions
13. Update styling for deathmatch polls
14. Test all edge cases
15. Optimize search performance

---

## 📝 Notes & Considerations

### User Experience
- Make it clear what happens when you assign users
- Show preview of deathmatch poll before submitting
- Allow unassigning users before submission

### Performance
- Debounce user search (300ms)
- Limit search results (max 5-10 users)
- Cache recent searches if needed

### Security
- Verify user exists before assigning
- Check permissions (can user assign other users?)
- Handle deleted users gracefully

### Future Enhancements
- Leaderboard for deathmatch wins
- Statistics: "Won X deathmatches"
- Challenge system: Send direct challenge
- Rematch feature: Quick rematch button after poll ends

---

## ✅ Decisions Made

1. **Self-Assignment:** ✅ Yes, users can assign themselves to an option (even better!)

2. **Same User Both Options:** ❌ No, prevent same user on both options (validation required)

3. **Required Assignment:** ✅ **BOTH options MUST have assigned users for deathmatch polls** (no defamation!)

4. **Notification Frequency:** 
   - Notify every **100 votes** on the poll
   - Notify when **one option surpasses the other** (threshold crossing)
   - Track vote thresholds to prevent duplicate notifications

5. **Assignment After Creation:** ❌ No, assignment only at creation time

---

## 📋 Summary

This feature adds:
- ✅ Dual-ownership for poll options
- ✅ User search and assignment UI
- ✅ Deathmatch poll type
- ✅ Enhanced notifications
- ✅ Visual indicators in poll cards

Ready to implement! Let me know if you want any adjustments to the plan.

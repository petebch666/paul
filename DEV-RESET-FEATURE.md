# Development Reset Feature

## Overview
A temporary development feature that resets all polls and user statistics to their initial state. This button is clearly marked as "DEV RESET" and will be removed before production deployment.

## Location
The reset button is accessible from **any screen** as a fixed-position button in the top-right corner:
- **Desktop**: Top-right corner (20px from top and right)
- **Mobile**: Top-right corner (10px from top and right)
- **Z-index**: 9999 (always visible on top)
- **Style**: Red button with black border, "DEV RESET" label

## What Gets Reset

### 1. Polls Reset to "Last" Category
- ✅ All polls set to 7 days expiration (appear in "Last" category)
- ✅ Nothing in "Expired" category
- ✅ Vote counts reset to 0 (votes, votesOptionA, votesOptionB)
- ✅ isExpired flag set to false
- ✅ createdAt set to current date
- ✅ timeLeft set to "7 days left"
- ✅ isVoted reset to false

### 2. Poll Statistics Reset
- ✅ Debate history reset (wins, losses, total debates = 0)
- ✅ Evidence cleared for both options
- ✅ Comments cleared
- ✅ All vote records cleared

### 3. Profile Statistics Reset
- ✅ Win rate reset to 0%
- ✅ Reputation reset to 0
- ✅ Badges cleared (except admin badges)
- ✅ **Poll count preserved** (as requested)

### 4. History & Notifications
- ✅ Poll history cleared
- ✅ Notifications cleared

## Usage

1. Click the **"DEV RESET"** button in the top-right corner
2. Confirm the reset in the dialog
3. All polls and statistics will be reset
4. Page automatically reloads to show fresh data

## Implementation Files

### Modified Files:
1. **`src/database/simple-db.ts`**
   - Added `resetPollsForDevelopment()` method

2. **`src/database/api.ts`**
   - Added `PollzAPI.resetPollsForDevelopment()` method

3. **`src/components/Navigation.tsx`**
   - Added dev reset button with confirmation dialog
   - Added onReset optional prop
   - Handles reset and page reload

4. **`src/components/Navigation.css`**
   - Added `.dev-reset-button` styles
   - Responsive positioning for mobile/desktop
   - Animation for loading state

## Safety Features

- ⚠️ Confirmation dialog before reset
- 🔄 Loading state during reset (spinning icon)
- ✅ Success message after reset
- ❌ Error handling with user feedback
- 🔁 Automatic page reload to refresh all data

## Removal Before Production

To remove this feature before production:
1. Remove the dev-reset-button from `Navigation.tsx`
2. Remove `.dev-reset-button` styles from `Navigation.css`
3. (Optional) Remove `resetPollsForDevelopment()` methods from database files

The feature is clearly marked and isolated, making it easy to remove when development is complete.


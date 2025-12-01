# Plan: Generate 100 Test Polls for Pollz App

## 📋 Overview

This document outlines the plan to generate 100 diverse test polls for the Pollz application's Supabase database to enable comprehensive testing.

---

## 🔍 Database Structure Analysis

### Supabase Configuration
- **Location**: `src/database/supabase.ts`
- **Environment Variables Required**:
  - `VITE_SUPABASE_URL` - Your Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- **Status Check**: The app checks if Supabase is configured on startup

### Database Schema

#### **Polls Table** (Main table for poll data)
Key columns:
- `id` (UUID) - Primary key
- `title` (TEXT) - Poll question/title
- `description` (TEXT) - Poll description
- `category` (TEXT) - Poll category (Food, Technology, etc.)
- `author_id` (UUID) - References users table
- `author_name` (TEXT) - Author's display name
- `author_username` (TEXT) - Author's username (added in deathmatch migration)
- `option_a` (TEXT) - First option text
- `option_b` (TEXT) - Second option text
- `context` (TEXT) - Additional context/background
- `votes` (INTEGER) - Total vote count
- `votes_option_a` (INTEGER) - Votes for option A
- `votes_option_b` (INTEGER) - Votes for option B
- `expires_at` (TIMESTAMP) - Poll expiration date
- `created_at` (TIMESTAMP) - Creation timestamp
- `trending_score` (DECIMAL) - Calculated trending score
- `poll_type` (TEXT) - Type of poll (default: 'question')
- `timer_enabled` (BOOLEAN) - Whether timer is enabled
- `notification_enabled` (BOOLEAN) - Whether notifications are enabled
- `is_deathmatch` (BOOLEAN) - Whether it's a deathmatch poll
- `is_shadow_deathmatch` (BOOLEAN) - Whether usernames are hidden
- `option_a_owner_id` (UUID) - User defending option A (deathmatch)
- `option_b_owner_id` (UUID) - User defending option B (deathmatch)
- `deathmatch_status` (TEXT) - Status: 'pending', 'accepted', 'rejected'

#### **Users Table** (Required for poll authors)
- `id` (UUID) - Primary key
- `name` (TEXT) - Display name
- `username` (TEXT) - Unique username
- `email` (TEXT) - Unique email
- `role` (TEXT) - 'user' or 'admin'

#### **Votes Table** (Auto-populated when users vote)
- Automatically updated via database triggers
- No manual insertion needed for test data

---

## 📝 Implementation Plan

### Step 1: Database Access ✅
- **Method**: Use `SupabasePollzAPI` class from `src/database/supabase-api.ts`
- **Authentication**: Uses Supabase client configured in `src/database/supabase.ts`
- **User Fetching**: `SupabasePollzAPI.getAllUsers()` to get existing users

### Step 2: Poll Generation Strategy ✅
- **Template-Based**: Created 100 diverse poll templates across 8 categories:
  - Food (15 polls)
  - Technology (15 polls)
  - Lifestyle (15 polls)
  - Work (15 polls)
  - Entertainment (15 polls)
  - Sports (10 polls)
  - Travel (10 polls)
  - Education (5 polls)

- **Variety Features**:
  - Random user assignment as authors
  - Varied expiration times (1 hour to 7 days)
  - Diverse categories
  - Realistic poll titles and options

### Step 3: Data Insertion ✅
- **API Method**: `SupabasePollzAPI.createPoll()`
- **Required Fields**:
  - `title`, `description`, `category`
  - `authorId`, `author`, `authorUsername`
  - `optionA`, `optionB` (via arguments object)
  - `expiresAt`
  - `context` (optional but recommended)

- **Optional Fields**:
  - `isDeathmatch` (default: false)
  - `isShadowDeathmatch` (default: false)
  - `timerEnabled` (default: true)
  - `notificationEnabled` (default: false)

### Step 4: Error Handling ✅
- Try-catch blocks for each poll creation
- Progress tracking (logs every 10 polls)
- Error collection and reporting
- Summary statistics at completion

---

## 🚀 Usage Instructions

### Option 1: Browser Console (Recommended)

1. **Ensure Supabase is configured**:
   - Check that `.env` file has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - Verify the app connects to Supabase (check browser console)

2. **Open browser console** (F12 or right-click → Inspect → Console)

3. **Run the generator**:
   ```javascript
   await generate100TestPolls()
   ```

4. **Monitor progress**:
   - Watch console for progress updates
   - Check for any errors
   - Review summary statistics

### Option 2: Admin Dashboard Integration

The script automatically makes itself available in the browser console. You can also integrate it into the Admin Dashboard by:

1. Import the function in `AdminDashboard.tsx`
2. Add a button to trigger poll generation
3. Display progress and results

### Option 3: Standalone Script (Future Enhancement)

Could be added to `package.json`:
```json
{
  "scripts": {
    "generate-polls": "tsx src/utils/generate-100-test-polls.ts"
  }
}
```

---

## 📊 Expected Results

### Success Criteria
- ✅ 100 polls created successfully
- ✅ Polls distributed across all 8 categories
- ✅ All polls have valid authors (from existing users)
- ✅ Polls have varied expiration times
- ✅ No duplicate poll IDs
- ✅ All required fields populated

### Output Summary
The function returns:
```typescript
{
  success: boolean,
  created: number,
  errors: string[],
  details: {
    pollsCreated: number,
    categories: Record<string, number>,
    usersUsed: string[]
  }
}
```

### Example Output
```
🚀 Starting generation of 100 test polls...
📋 Step 1: Fetching users from database...
✅ Found 3 users in database
📋 Step 2: Preparing poll templates...
📋 Step 3: Creating 100 polls...
  ✅ Created 10/100 polls...
  ✅ Created 20/100 polls...
  ...
  ✅ Created 100/100 polls...

📊 Generation Summary:
  ✅ Successfully created: 100 polls
  ❌ Errors: 0 polls
  📁 Categories:
     - Food: 15 polls
     - Technology: 15 polls
     - Lifestyle: 15 polls
     - Work: 15 polls
     - Entertainment: 15 polls
     - Sports: 10 polls
     - Travel: 10 polls
     - Education: 5 polls
  👥 Users used: 3 users

🎉 Poll generation completed successfully!
```

---

## ⚠️ Important Notes

### Prerequisites
1. **Users Must Exist**: The script requires at least one user in the database. If no users exist, it will fail with a clear error message.

2. **Supabase Connection**: Ensure your Supabase credentials are properly configured in `.env` file.

3. **RLS Policies**: The script uses the Supabase client which respects Row Level Security (RLS) policies. Ensure your RLS policies allow:
   - Reading from `users` table
   - Inserting into `polls` table

### Rate Limiting
- The script includes a 50ms delay between poll creations to avoid rate limiting
- If you encounter rate limits, increase the delay in the script

### Data Quality
- All polls are created with realistic, diverse content
- Polls are distributed evenly across categories
- Expiration times vary to test different poll states (active, expiring soon, etc.)

### Cleanup
If you need to remove test polls:
```sql
-- Delete all polls (use with caution!)
DELETE FROM polls WHERE author_id IN (
  SELECT id FROM users WHERE role = 'user'
);
```

---

## 🔧 Troubleshooting

### Error: "No users found in database"
**Solution**: Create at least one user first. You can:
- Sign up through the app
- Use the admin user (if exists)
- Create a test user via SQL or the app

### Error: "Supabase not configured"
**Solution**: 
1. Create a `.env` file in the project root
2. Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-project-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Restart the dev server

### Error: "Failed to create poll: RLS policy violation"
**Solution**: Check your Supabase RLS policies. Ensure authenticated users can insert polls:
```sql
CREATE POLICY "Authenticated users can create polls" ON polls
  FOR INSERT WITH CHECK (true);
```

### Partial Success (Some polls created, some failed)
**Solution**: 
- Check the error messages in the console
- Review the `errors` array in the return value
- Common issues: duplicate titles, invalid user IDs, missing required fields

---

## 📁 Files Created/Modified

### New Files
- `src/utils/generate-100-test-polls.ts` - Main generation script

### Related Files (Reference)
- `src/database/supabase-api.ts` - API methods used
- `src/database/supabase.ts` - Supabase client configuration
- `SUPABASE-SCHEMA.sql` - Database schema reference
- `DEATHMATCH-DB-MIGRATION.sql` - Additional columns reference

---

## ✅ Next Steps

1. **Test the Script**:
   - Run `generate100TestPolls()` in browser console
   - Verify polls appear in the app
   - Check database directly in Supabase dashboard

2. **Verify Data**:
   - Check poll distribution across categories
   - Verify all polls have valid authors
   - Test voting functionality on generated polls

3. **Optional Enhancements**:
   - Add some deathmatch polls to the mix
   - Generate votes for some polls to test trending
   - Create polls with different expiration states

---

## 📞 Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify Supabase connection and credentials
3. Ensure users exist in the database
4. Review RLS policies in Supabase dashboard

---

**Last Updated**: December 2024  
**Script Version**: 1.0.0  
**Status**: ✅ Ready for Use



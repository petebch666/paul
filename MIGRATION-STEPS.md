# 🚀 Complete Supabase Migration Guide

## ✅ What's Been Done For You

I've set up everything you need for the migration:

1. ✅ **Installed Supabase client** (`@supabase/supabase-js`)
2. ✅ **Created SQL schema** (`SUPABASE-SCHEMA.sql`)
3. ✅ **Created Supabase client config** (`src/database/supabase.ts`)
4. ✅ **Created migration script** (`src/utils/migrate-to-supabase.ts`)
5. ✅ **Created Migration Page** (http://localhost:5174/migrate)
6. ✅ **Created setup instructions** (`SUPABASE-SETUP-INSTRUCTIONS.md`)

---

## 🎯 Your Next Steps (15 minutes)

### Step 1: Create .env File (2 min)

Create a file called `.env` in your project root:

```bash
# Windows PowerShell:
New-Item .env -ItemType File

# Or just create it in VS Code
```

Add this content:
```env
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 2: Create Supabase Account & Project (5 min)

1. **Go to**: https://supabase.com
2. **Click**: "Start your project" or "Sign in"
3. **Sign up** with GitHub (fastest) or email
4. **Create new organization** (if first time)
5. **Click**: "New project"
6. **Fill in**:
   - Name: `pollz-db` (or whatever you want)
   - Database Password: Create a strong password (**SAVE THIS**)
   - Region: Choose closest to you
7. **Click**: "Create new project"
8. ⏳ **Wait ~2 minutes** for provisioning

### Step 3: Get Your Credentials (1 min)

Once your project is ready:

1. In Supabase dashboard, click the **Settings** icon (⚙️) at bottom left
2. Click **API** in sidebar
3. Find **"Project URL"** → Copy it
4. Find **"anon public"** key → Click "Copy" button
5. **Paste both** into your `.env` file

Your `.env` should look like:
```env
VITE_SUPABASE_URL=https://abc123xyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
```

### Step 4: Run SQL Schema (3 min)

1. In Supabase dashboard, click **SQL Editor** (</> icon) in sidebar
2. Click **"New query"** button
3. **Open** the file `SUPABASE-SCHEMA.sql` from your project
4. **Copy all content** (Ctrl+A, Ctrl+C)
5. **Paste** into the SQL Editor
6. **Click "Run"** (or press Ctrl+Enter)
7. ✅ Wait for "Success. No rows returned" message

This creates all your tables, indexes, and security policies!

### Step 5: Restart Dev Server (1 min)

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 6: Run Migration (2 min)

1. **Go to**: http://localhost:5174/migrate
2. **Check** that it shows "✅ Supabase is configured and ready"
3. **Verify** your local data counts (users, polls, votes)
4. **Click**: "START MIGRATION" button
5. **Confirm** the dialog
6. ⏳ **Wait** for migration to complete (usually < 30 seconds)
7. ✅ **Check** the results

---

## 📊 Verify Migration

After migration completes:

1. **Go to Supabase dashboard** → **Table Editor**
2. **Check tables**:
   - Click `users` → Should see your users
   - Click `polls` → Should see your polls
   - Click `votes` → Should see your votes

---

## 🔄 Next Steps (Optional - For Production)

The migration is complete! Your data is now in Supabase, but your app is still using localStorage.

To make your app use Supabase instead:

1. Update `src/database/api.ts` to use Supabase
2. Update `src/hooks/useAppState.ts` to call Supabase API
3. Replace localStorage calls with Supabase queries

**OR** keep using localStorage for now and switch later when you're ready!

---

## 🎉 What You Get With Supabase

- ✅ **Real-time updates** - See poll votes live!
- ✅ **Multi-device sync** - Data syncs across devices
- ✅ **Persistent storage** - Never lose data again
- ✅ **Scalable** - Handle millions of polls
- ✅ **Secure** - Built-in authentication & RLS
- ✅ **Free tier** - 500MB database, 2GB bandwidth
- ✅ **Backups** - Daily backups (on Pro plan)

---

## 🆘 Troubleshooting

### "Supabase is not configured"
- Make sure your `.env` file exists in project root
- Check that variables start with `VITE_`
- Restart dev server after creating `.env`

### "Transform error" or compilation errors
- The errors from before were fixed
- Make sure you restarted the dev server

### Migration fails
- Check Supabase dashboard → Logs for errors
- Make sure you ran the SQL schema
- Verify your credentials in `.env`

### Can't access http://localhost:5174/migrate
- Make sure dev server is running
- Try going directly to the URL
- Check console for errors (F12)

---

## 📝 Quick Checklist

- [ ] Created `.env` file
- [ ] Created Supabase account
- [ ] Created Supabase project
- [ ] Got credentials from Settings → API
- [ ] Updated `.env` with real credentials
- [ ] Ran SQL schema in SQL Editor
- [ ] Restarted dev server
- [ ] Went to http://localhost:5174/migrate
- [ ] Clicked "START MIGRATION"
- [ ] Verified data in Supabase dashboard

---

## 🎯 Current Status

**Your app is ready to migrate!**

Go to: **http://localhost:5174/migrate**

Files created:
- `SUPABASE-SCHEMA.sql` - Database schema
- `src/database/supabase.ts` - Supabase client
- `src/utils/migrate-to-supabase.ts` - Migration script
- `src/pages/MigrationPage.tsx` - Migration UI
- `SUPABASE-SETUP-INSTRUCTIONS.md` - Detailed instructions
- `DATABASE-MIGRATION-GUIDE.md` - Technical guide

Need help? Check the console logs (F12) or Supabase docs: https://supabase.com/docs


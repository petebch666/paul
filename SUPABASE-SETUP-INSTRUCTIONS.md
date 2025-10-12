# 🚀 Supabase Setup Instructions

## ✅ Step 1: Install Package (DONE)
The Supabase client has been installed!

## 📝 Step 2: Create .env File

Create a file called `.env` in your project root with:

```env
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🌐 Step 3: Get Your Supabase Credentials

1. **Go to Supabase**: https://supabase.com
2. **Create Account** (free - no credit card needed)
3. **Create New Project**:
   - Click "New Project"
   - Choose organization (or create one)
   - Give it a name (e.g., "pollz-db")
   - Create a strong database password
   - Choose a region close to you
   - Click "Create new project"
   - ⏳ Wait ~2 minutes for setup

4. **Get Your API Credentials**:
   - In your project dashboard, click "Settings" (gear icon)
   - Click "API" in the sidebar
   - Find "Project URL" → copy it
   - Find "anon public" key → copy it
   - Paste both into your `.env` file

## 🗄️ Step 4: Create Database Tables

Once your project is ready:

1. In Supabase dashboard, click "SQL Editor" in the sidebar
2. Click "New Query"
3. Copy and paste the entire SQL from `SUPABASE-SCHEMA.sql` (I'll create this file next)
4. Click "Run" (or press Ctrl+Enter)
5. Wait for "Success" message

## 🔄 Step 5: Migrate Your Data

After setting up tables, you'll run the migration script to move data from localStorage to Supabase.

I'll create the migration script next!

## ⚡ Quick Summary

```bash
# 1. Create .env file (you'll do this manually)
# 2. Sign up at https://supabase.com
# 3. Create project
# 4. Get credentials from Settings → API
# 5. Update .env file
# 6. Run SQL schema in Supabase SQL Editor
# 7. Run migration script
# 8. Restart dev server: npm run dev
```

---

**Status**: ✅ Supabase package installed
**Next**: I'm creating the SQL schema file and migration scripts now...


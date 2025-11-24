# Database Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Organization**: Select or create one
   - **Name**: `family-legacy-platform` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
4. Click "Create new project"
5. Wait 2-3 minutes for project to initialize

## Step 2: Get API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 3: Get Database Connection String

1. Go to **Settings** → **Database**
2. Under "Connection string", select **URI** tab
3. Copy the connection string (it looks like: `postgresql://postgres.[ref]:[password]@...`)
4. Replace `[YOUR-PASSWORD]` with the database password you created in Step 1
5. This goes in `DATABASE_URL`

**Note:** If you see a "Custom Prefix" option (e.g., in Vercel integration), **leave it empty** so it creates `DATABASE_URL` directly. See `DATABASE_PREFIX.md` for details.

## Step 4: Create Storage Buckets

1. Go to **Storage** in the left sidebar
2. Click "New bucket"
3. Create bucket: `profiles`
   - Make it **Public**
   - Click "Create bucket"
4. Create bucket: `media`
   - Make it **Public**
   - Click "Create bucket"

## Step 5: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and fill in your values:
   ```bash
   # Open in your editor
   nano .env.local
   # or
   code .env.local
   ```

3. Replace all `your_*` placeholders with actual values from Supabase

### Important: Public vs Private Variables

- **Public variables** (with `NEXT_PUBLIC_` prefix) are exposed to the browser
  - `NEXT_PUBLIC_SUPABASE_URL` ✅ Safe to expose
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅ Safe to expose (has RLS protection)
  - `NEXT_PUBLIC_APP_URL` ✅ Safe to expose

- **Private variables** (no prefix) are server-only
  - `SUPABASE_SERVICE_ROLE_KEY` ❌ NEVER expose (full admin access!)
  - `DATABASE_URL` ❌ NEVER expose (direct database access!)

See `ENV_VARIABLES.md` for detailed explanation.

## Step 6: Generate Prisma Client

```bash
npm run db:generate
```

## Step 7: Push Database Schema

```bash
npm run db:push
```

This will create all tables in your Supabase database.

## Step 8: Verify Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see tables:
   - `users`
   - `profiles`
   - `family_members`
   - `family_connection_requests`
   - `timeline_entries`
   - `feed_posts`
   - `feed_comments`
   - `feed_reactions`
   - `media_items`
   - `chat_conversations`
   - `chat_messages`
   - `notifications`
   - `story_prompts`

## Step 9: (Optional) Seed Story Prompts

Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO story_prompts (question, category, active) VALUES
('Tell us about your first job', 'Career', true),
('What''s a value your parents passed down to you?', 'Values', true),
('Describe a memorable family vacation', 'Family', true),
('What was your biggest challenge and how did you overcome it?', 'Life', true),
('Share a story about your grandparents', 'Family', true),
('What achievement are you most proud of?', 'Achievement', true);
```

## Troubleshooting

### "Prisma schema validation error"
- Make sure you ran `npm run db:generate` first
- Check that your `DATABASE_URL` is correct

### "Connection refused"
- Verify your `DATABASE_URL` has the correct password
- Check that your Supabase project is active (not paused)

### "Bucket not found"
- Make sure you created both `profiles` and `media` buckets
- Verify they are set to **Public**

## Next Steps

Once database is set up:
1. Start dev server: `npm run dev`
2. Visit: http://localhost:3004
3. Create your first account!


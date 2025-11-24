# Family Legacy Platform - Setup Guide

## ✅ What's Been Built

The complete MVP has been implemented with all features:

### Core Features
- ✅ User authentication (Email, Google, Facebook OAuth)
- ✅ Onboarding flow
- ✅ Profile creation and editing with photo upload
- ✅ Family tree builder with React Flow visualization
- ✅ Family connection request system
- ✅ Legacy timeline with multimedia support
- ✅ Private family feed with comments and reactions
- ✅ Media gallery with upload functionality
- ✅ Chat/messenger between family members
- ✅ Story prompts system (placeholder questions)
- ✅ Search functionality
- ✅ Notifications system
- ✅ Role-based access control (Viewer, Contributor, Legacy Keeper)
- ✅ Elegant UI with luxury animations

### Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Supabase (Auth, Database, Storage)
- Prisma ORM
- Tailwind CSS
- React Flow (Family Tree)
- Custom fonts (Family Sans, Family Mix)

## 🚀 Next Steps

### 1. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings > API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (keep secret!)
3. Go to **Project Settings > Database** and copy the connection string
4. Create storage buckets:
   - Go to **Storage** in Supabase dashboard
   - Create bucket: `profiles` (public)
   - Create bucket: `media` (public)

### 2. Configure Environment Variables

Create `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_supabase_postgres_connection_string
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 4. Configure OAuth Providers (Optional)

In Supabase Dashboard:
- Go to **Authentication > Providers**
- Enable Google OAuth
- Enable Facebook OAuth
- Add redirect URLs: `http://localhost:3000/auth/callback`

### 5. Seed Story Prompts (Optional)

You can add story prompts via Prisma Studio:

```bash
npm run db:studio
```

Or create them via SQL in Supabase SQL Editor:

```sql
INSERT INTO story_prompts (question, category, active) VALUES
('Tell us about your first job', 'Career', true),
('What''s a value your parents passed down to you?', 'Values', true),
('Describe a memorable family vacation', 'Family', true),
('What was your biggest challenge and how did you overcome it?', 'Life', true);
```

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
/family
  /app
    /(auth)          # Login, signup, onboarding
    /(dashboard)     # Main app pages
    /api             # API routes
  /components
    /ui              # Reusable UI components
    /dashboard       # Dashboard-specific components
  /lib
    /supabase        # Supabase clients
    /prisma          # Prisma client
    /auth            # Auth utilities
  /prisma
    schema.prisma    # Database schema
  /public
    /fonts           # Custom fonts
```

## 🎨 Design Features

- Clean white background
- Elegant luxury animations (fade-ins, smooth transitions)
- Custom fonts (Family Sans, Family Mix)
- Responsive design
- Hover effects and micro-interactions

## 🔐 Security Notes

- All API routes are protected with `requireAuth()`
- Role-based access control implemented
- Supabase handles authentication securely
- Storage buckets should be configured with proper permissions

## 📝 Notes

- The search by email feature is simplified - in production, you'd want to link User.email to Profile or use Supabase admin API
- Chat uses polling (3-second intervals) - consider upgrading to Supabase Realtime for better performance
- Notifications use polling (10-second intervals) - consider Supabase Realtime
- Story prompts are placeholder questions - no AI integration yet

## 🚢 Deployment

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The app is ready for Vercel deployment with Next.js 16.


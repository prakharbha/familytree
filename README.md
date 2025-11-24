# Family Legacy Platform

A modern platform for preserving and celebrating family legacies.

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get:
   - Project URL
   - Anon/public key
   - Service role key (keep this secret!)
3. Go to Project Settings > Database to get the connection string
4. Create storage buckets:
   - `media` - for photos, videos, audio
   - `profiles` - for profile photos

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Supabase (Auth, Database, Storage)
- Prisma ORM
- Tailwind CSS
- React Flow (Family Tree)


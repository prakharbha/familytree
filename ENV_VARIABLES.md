# Environment Variables Guide

## Public Variables (NEXT_PUBLIC_*)

These are exposed to the browser and safe to use in client-side code.

### Required Public Variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3004
```

**Why Public?**
- `NEXT_PUBLIC_SUPABASE_URL` - Needed by Supabase client in browser
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Safe to expose (anon key has limited permissions)
- `NEXT_PUBLIC_APP_URL` - Used for OAuth redirects

## Private Variables (No Prefix)

These are server-only and NEVER exposed to the browser.

### Required Private Variables:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_supabase_postgres_connection_string
```

**Why Private?**
- `SUPABASE_SERVICE_ROLE_KEY` - Full admin access! Keep secret!
- `DATABASE_URL` - Direct database access! Keep secret!

## Vercel Deployment

### Public Environment Variables (in Vercel Dashboard):

Add these in **Settings → Environment Variables** and mark as **"Expose to Browser"**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (use your production URL, e.g., `https://your-app.vercel.app`)

### Private Environment Variables (in Vercel Dashboard):

Add these in **Settings → Environment Variables** and keep as **"Server-side only"**:

- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

## Local Development (.env.local)

For local development, create `.env.local`:

```bash
# Public (exposed to browser)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3004

# Private (server-only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## Security Notes

✅ **Safe to expose:**
- `NEXT_PUBLIC_SUPABASE_URL` - Just the project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Has Row Level Security (RLS) protection

❌ **NEVER expose:**
- `SUPABASE_SERVICE_ROLE_KEY` - Bypasses all security!
- `DATABASE_URL` - Direct database access!

## How to Use in Code

### Client-side (components, pages with 'use client'):
```typescript
// ✅ Can use NEXT_PUBLIC_* variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ❌ Cannot access private variables
// const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // undefined!
```

### Server-side (API routes, server components):
```typescript
// ✅ Can use all variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const dbUrl = process.env.DATABASE_URL
```

## Quick Reference

| Variable | Prefix | Where Used | Safe to Expose? |
|----------|--------|------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Public | Client & Server | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Public | Client & Server | ✅ Yes |
| `NEXT_PUBLIC_APP_URL` | ✅ Public | Client & Server | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ Private | Server only | ❌ No |
| `DATABASE_URL` | ❌ Private | Server only | ❌ No |


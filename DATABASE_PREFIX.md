# Database Environment Variable Prefix Guide

## What is the Custom Prefix?

When setting up Supabase (or Vercel), you may see an option for a **"Custom Prefix"** for database environment variables. This is used to organize or namespace your database connection variables.

## For This Project

### Recommended: **Leave it empty or use default**

Our Prisma schema expects the database connection string to be named:
```bash
DATABASE_URL=postgresql://...
```

### If You Must Use a Prefix

If you set a custom prefix like `FAMILY_`, the variable would become:
```bash
FAMILY_DATABASE_URL=postgresql://...
```

**But then you need to update Prisma configuration:**

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("FAMILY_DATABASE_URL")  // Changed from DATABASE_URL
}
```

2. Or create an alias in `.env.local`:
```bash
# Supabase creates this with prefix
FAMILY_DATABASE_URL=postgresql://...

# Prisma expects this name
DATABASE_URL=${FAMILY_DATABASE_URL}
```

## Best Practice: No Prefix

**Recommendation: Leave the prefix empty** so Supabase creates:
- `DATABASE_URL` (matches what Prisma expects)

This avoids any configuration changes.

## Vercel Integration

If connecting Supabase to Vercel:

1. **Supabase Dashboard** → **Settings** → **Integrations** → **Vercel**
2. When prompted for "Custom Prefix", leave it **empty** or blank
3. This will create `DATABASE_URL` automatically

## Manual Setup (No Auto-Integration)

If setting up manually:

1. Copy the connection string from Supabase
2. Add to `.env.local` as:
   ```bash
   DATABASE_URL=postgresql://postgres.[ref]:[password]@...
   ```
3. No prefix needed!

## Summary

| Setting | Variable Name | Action Needed |
|---------|---------------|---------------|
| **No prefix (recommended)** | `DATABASE_URL` | ✅ Works out of the box |
| Custom prefix (e.g., `FAMILY_`) | `FAMILY_DATABASE_URL` | ⚠️ Need to update Prisma or create alias |

**Recommendation: Use no prefix for simplicity!**


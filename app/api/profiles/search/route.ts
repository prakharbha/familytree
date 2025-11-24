import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma/client'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    const name = searchParams.get('name')

    if (!email && !name) {
      return NextResponse.json({ error: 'Email or name required' }, { status: 400 })
    }

    if (email) {
      // Search for user by email in User table (assuming email is stored)
      // Note: In production, you'd want to use Supabase admin API or a different approach
      // For now, we'll search profiles that might have email in tags or other fields
      // This is a simplified version - in production, link User.email to Profile
      const profile = await prisma.profile.findFirst({
        where: {
          OR: [
            { tags: { has: email } },
            // Add other search criteria as needed
          ],
        },
      })

      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }

      return NextResponse.json(profile)
    }

    // Search by name
    const profiles = await prisma.profile.findMany({
      where: {
        name: {
          contains: name || '',
          mode: 'insensitive',
        },
      },
      take: 10,
    })

    return NextResponse.json(profiles)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to search profiles' },
      { status: 500 }
    )
  }
}


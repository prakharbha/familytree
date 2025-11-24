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
      // Search for user by email - find User by email, then get their Profile
      const user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true },
      })

      if (!user || !user.profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }

      return NextResponse.json(user.profile)
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


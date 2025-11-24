import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const timelineEntries = await prisma.timelineEntry.findMany({
      where: { profileId: profile.id },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(timelineEntries)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch timeline' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const entry = await prisma.timelineEntry.create({
      data: {
        profileId: profile.id,
        title: body.title,
        description: body.description,
        date: new Date(body.date),
        type: body.type,
        mediaUrls: body.mediaUrls || [],
      },
    })

    return NextResponse.json(entry)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create timeline entry' },
      { status: 500 }
    )
  }
}


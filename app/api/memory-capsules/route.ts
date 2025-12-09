import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma/client'
import { createNotification } from '@/lib/notifications'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const memoryCapsules = await prisma.memoryCapsule.findMany({
      where: { profileId: profile.id },
      orderBy: { date: 'desc' },
      include: { mediaItems: true },
    })

    return NextResponse.json(memoryCapsules)
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

    // Map old 'type' to 'personaTags' if possible, or just default
    // Map 'mediaUrls' to 'mediaItems'

    const entry = await prisma.memoryCapsule.create({
      data: {
        profileId: profile.id,
        title: body.title,
        description: body.description,
        date: new Date(body.date),
        personaTags: body.personaTags || [],
        visibility: body.visibility || 'FAMILY',
        mediaItems: {
          create: (body.mediaUrls || []).map((url: string) => ({
            url,
            type: 'PHOTO', // Defaulting to PHOTO for now
            profileId: profile.id
          }))
        }
      },
      include: { mediaItems: true }
    })

    // Notify if visible to family
    if (['FAMILY', 'PUBLIC'].includes(body.visibility || 'FAMILY')) {
      await createNotification(
        'MEMORY_CAPSULE',
        'New Memory Capsule',
        `${profile.name} added a memory: "${body.title}"`,
        `/feed`, // Capsules appear in feed
        profile.id
      )
    }

    return NextResponse.json(entry)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create memory capsule' },
      { status: 500 }
    )
  }
}


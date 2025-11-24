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

    const mediaItems = await prisma.mediaItem.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(mediaItems)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch media' },
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

    const mediaItem = await prisma.mediaItem.create({
      data: {
        profileId: profile.id,
        url: body.url,
        type: body.type,
        title: body.title,
        description: body.description,
        tags: body.tags || [],
      },
    })

    return NextResponse.json(mediaItem)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create media item' },
      { status: 500 }
    )
  }
}


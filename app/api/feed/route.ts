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

    // Get family members
    const familyMembers = await prisma.familyMember.findMany({
      where: { profileId: profile.id },
      select: { relatedProfileId: true },
    })

    const familyProfileIds = [profile.id, ...familyMembers.map((m: any) => m.relatedProfileId)]

    // Get feed posts from family members
    const posts = await prisma.feedPost.findMany({
      where: {
        profileId: { in: familyProfileIds },
      },
      include: {
        profile: true,
        comments: {
          orderBy: { createdAt: 'asc' },
        },
        reactions: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(posts)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch feed' },
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

    const post = await prisma.feedPost.create({
      data: {
        profileId: profile.id,
        content: body.content,
        mediaUrls: body.mediaUrls || [],
        tags: body.tags || [],
      },
      include: { profile: true },
    })

    return NextResponse.json(post)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    )
  }
}


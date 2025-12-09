import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma/client'
import { createNotification } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // FEED STRATEGY:
    // We want to show content from:
    // 1. Memory Capsules (visibility: FAMILY or PUBLIC)
    // 2. Legacy Wall Items (visibility: FAMILY or PUBLIC)
    // 3. Feed Posts (dedicated status updates)
    // 
    // And from:
    // 1. The user themselves
    // 2. Family members (linked via FamilyMember)

    // Step 1: Get list of profile IDs to fetch content from (Me + Family)
    // We want bidirectional visibility: People I added (Outgoing) AND People who added me (Incoming)
    // Step 1: Get list of profile IDs
    console.log(`[FEED] Fetching for profile: ${profile.id} (${profile.name})`)

    const [outgoing, incoming] = await Promise.all([
      prisma.familyMember.findMany({
        where: { profileId: profile.id },
        select: { relatedProfileId: true }
      }),
      prisma.familyMember.findMany({
        where: { relatedProfileId: profile.id },
        select: { profileId: true }
      })
    ])

    const friendIds = new Set([
      ...outgoing.map(m => m.relatedProfileId),
      ...incoming.map(m => m.profileId)
    ])
    const allIds = [profile.id, ...Array.from(friendIds)]

    console.log(`[FEED] Friend count: ${friendIds.size}. IDs: ${JSON.stringify(Array.from(friendIds))}`)
    console.log(`[FEED] Total Scope IDs: ${allIds.length}`)

    // Step 2: Fetch content types
    const [capsules, wallItems, posts] = await Promise.all([
      prisma.memoryCapsule.findMany({
        where: {
          profileId: { in: allIds },
          visibility: { in: ['FAMILY', 'PUBLIC'] }
        },
        include: {
          profile: true,
          mediaItems: true,
          reactions: true,
          comments: { include: { profile: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      prisma.legacyWallItem.findMany({
        where: {
          profileId: { in: allIds },
          visibility: { in: ['FAMILY', 'PUBLIC'] }
        },
        include: {
          profile: true,
          mediaItems: true,
          reactions: true,
          comments: { include: { profile: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      prisma.feedPost.findMany({
        where: { profileId: { in: allIds } },
        include: {
          profile: true,
          reactions: true,
          comments: { include: { profile: true }, orderBy: { createdAt: 'asc' } }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
    ])

    // Step 3: Merge and Sort
    const feed = [
      ...capsules.map(i => ({ ...i, itemType: 'CAPSULE' })),
      ...wallItems.map(i => ({ ...i, itemType: 'WALL_ITEM' })),
      ...posts.map(i => ({ ...i, itemType: 'POST' }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50) // Limit total items for now

    return NextResponse.json(feed)
  } catch (error: any) {
    console.error('[FEED_ERROR]', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch feed',
        stack: error.stack,
        details: JSON.stringify(error)
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      include: {
        profile: true, // Include author details
        comments: true,
        reactions: true,
      }
    })

    // Notify family
    await createNotification(
      'FAMILY_UPDATE',
      'New Family Update',
      `${profile.name} posted an update: "${body.content.substring(0, 50)}${body.content.length > 50 ? '...' : ''}"`,
      '/feed',
      profile.id
    )

    return NextResponse.json(post)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    )
  }
}

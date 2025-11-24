import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await request.json()
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if reaction exists
    const existing = await prisma.feedReaction.findUnique({
      where: {
        postId_profileId: {
          postId: id,
          profileId: profile.id,
        },
      },
    })

    if (existing) {
      // Update existing reaction
      const reaction = await prisma.feedReaction.update({
        where: { id: existing.id },
        data: { type: body.type },
      })
      return NextResponse.json(reaction)
    }

    // Create new reaction
    const reaction = await prisma.feedReaction.create({
      data: {
        postId: id,
        profileId: profile.id,
        type: body.type || 'like',
      },
    })

    return NextResponse.json(reaction)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create reaction' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    await prisma.feedReaction.deleteMany({
      where: {
        postId: id,
        profileId: profile.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete reaction' },
      { status: 500 }
    )
  }
}


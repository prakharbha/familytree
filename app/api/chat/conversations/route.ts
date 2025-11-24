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

    const conversations = await prisma.chatConversation.findMany({
      where: {
        OR: [
          { user1Id: profile.id },
          { user2Id: profile.id },
        ],
      },
      include: {
        user1: true,
        user2: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(conversations)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch conversations' },
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

    // Ensure user1Id is always smaller than user2Id for consistency
    const user1Id = profile.id < body.user2Id ? profile.id : body.user2Id
    const user2Id = profile.id < body.user2Id ? body.user2Id : profile.id

    // Find or create conversation
    let conversation = await prisma.chatConversation.findUnique({
      where: {
        user1Id_user2Id: {
          user1Id,
          user2Id,
        },
      },
      include: {
        user1: true,
        user2: true,
      },
    })

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          user1Id,
          user2Id,
        },
        include: {
          user1: true,
          user2: true,
        },
      })
    }

    return NextResponse.json(conversation)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create conversation' },
      { status: 500 }
    )
  }
}


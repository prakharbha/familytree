import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id } = await params

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId: id },
      include: { sender: true },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(messages)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

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

    const message = await prisma.chatMessage.create({
      data: {
        conversationId: id,
        senderId: profile.id,
        content: body.content,
      },
      include: { sender: true },
    })

    // Update conversation updatedAt
    await prisma.chatConversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json(message)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    )
  }
}


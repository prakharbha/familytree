import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma/client'
import { RelationshipType, ConnectionRequestStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const sentRequests = await prisma.familyConnectionRequest.findMany({
      where: { senderId: profile.id },
      include: { receiver: true },
    })

    const receivedRequests = await prisma.familyConnectionRequest.findMany({
      where: { receiverId: profile.id },
      include: { sender: true },
    })

    return NextResponse.json({
      sent: sentRequests,
      received: receivedRequests,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch connection requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json() as { receiverId?: string; email?: string; relationshipType: RelationshipType; message?: string }
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    let receiverId = body.receiverId

    // If email is provided instead of receiverId, find the user by email
    if (!receiverId && body.email) {
      const receiverUser = await prisma.user.findUnique({
        where: { email: body.email },
        include: { profile: true },
      })

      if (!receiverUser || !receiverUser.profile) {
        // User doesn't exist - return error suggesting they need to sign up first
        return NextResponse.json({ 
          error: 'User not found with that email. They need to sign up first before you can add them.',
          needsSignup: true,
          email: body.email 
        }, { status: 404 })
      }

      receiverId = receiverUser.profile.id
    }

    if (!receiverId) {
      return NextResponse.json({ error: 'receiverId or email is required' }, { status: 400 })
    }

    // Check if connection already exists
    const existingConnection = await prisma.familyMember.findFirst({
      where: {
        profileId: profile.id,
        relatedProfileId: receiverId,
        relationshipType: body.relationshipType,
      },
    })

    if (existingConnection) {
      return NextResponse.json({ error: 'Family connection already exists' }, { status: 400 })
    }

    // Check if there's already a pending request
    const existingRequest = await prisma.familyConnectionRequest.findFirst({
      where: {
        senderId: profile.id,
        receiverId,
        relationshipType: body.relationshipType,
        status: 'PENDING',
      },
    })

    if (existingRequest) {
      return NextResponse.json({ error: 'Connection request already sent' }, { status: 400 })
    }

    const connectionRequest = await prisma.familyConnectionRequest.create({
      data: {
        senderId: profile.id,
        receiverId,
        relationshipType: body.relationshipType,
        message: body.message,
      },
    })

    return NextResponse.json(connectionRequest)
  } catch (error: any) {
    console.error('Connection request error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create connection request' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json() as { requestId: string; status: ConnectionRequestStatus }
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const connectionRequest = await prisma.familyConnectionRequest.findUnique({
      where: { id: body.requestId },
    })

    if (!connectionRequest || connectionRequest.receiverId !== profile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (body.status === 'APPROVED') {
      // Create family member relationship
      await prisma.familyMember.create({
        data: {
          profileId: connectionRequest.senderId,
          relatedProfileId: connectionRequest.receiverId,
          relationshipType: connectionRequest.relationshipType,
          role: 'VIEWER',
        },
      })

      // Create reverse relationship
      const reverseType = getReverseRelationshipType(connectionRequest.relationshipType)
      if (reverseType) {
        await prisma.familyMember.create({
          data: {
            profileId: connectionRequest.receiverId,
            relatedProfileId: connectionRequest.senderId,
            relationshipType: reverseType,
            role: 'VIEWER',
          },
        })
      }
    }

    const updated = await prisma.familyConnectionRequest.update({
      where: { id: body.requestId },
      data: { status: body.status },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update connection request' },
      { status: 500 }
    )
  }
}

function getReverseRelationshipType(type: string): RelationshipType | null {
  const reverseMap: Record<string, RelationshipType> = {
    PARENT: 'CHILD',
    CHILD: 'PARENT',
    GRANDPARENT: 'GRANDCHILD',
    GRANDCHILD: 'GRANDPARENT',
    AUNT_UNCLE: 'NIECE_NEPHEW',
    NIECE_NEPHEW: 'AUNT_UNCLE',
  }
  return reverseMap[type] || null
}


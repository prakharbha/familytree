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

    const familyMembers = await prisma.familyMember.findMany({
      where: { profileId: profile.id },
      include: { relatedProfile: true },
    })

    return NextResponse.json(familyMembers)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch family tree' },
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

    // Create family connection
    const familyMember = await prisma.familyMember.create({
      data: {
        profileId: profile.id,
        relatedProfileId: body.relatedProfileId,
        relationshipType: body.relationshipType,
        role: body.role || 'VIEWER',
      },
    })

    return NextResponse.json(familyMember)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create family connection' },
      { status: 500 }
    )
  }
}


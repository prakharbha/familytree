import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma/client'
import { canManage } from '@/lib/auth/roles'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await request.json()

    const familyMember = await prisma.familyMember.findUnique({
      where: { id },
      include: { profile: true },
    })

    if (!familyMember) {
      return NextResponse.json({ error: 'Family member not found' }, { status: 404 })
    }

    // Check if user can manage this relationship
    const canManageRelation = await canManage(user, familyMember.profileId)
    if (!canManageRelation) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updated = await prisma.familyMember.update({
      where: { id },
      data: { role: body.role },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update role' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma/client'

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

        const { entityId, entityType, type } = body; // entityType: 'POST', 'CAPSULE', 'WALL', 'TRADITION'
        // type: 'heart', etc.

        // Construct unique filter based on type
        // This is generic handling
        let whereClause: any = { profileId: profile.id }
        let createData: any = { profileId: profile.id, type }

        if (entityType === 'POST') {
            whereClause.postId = entityId
            createData.postId = entityId
        } else if (entityType === 'CAPSULE') {
            whereClause.memoryCapsuleId = entityId
            createData.memoryCapsuleId = entityId
        } else if (entityType === 'WALL') {
            whereClause.legacyWallItemId = entityId
            createData.legacyWallItemId = entityId
        } else if (entityType === 'TRADITION') {
            whereClause.traditionId = entityId
            createData.traditionId = entityId
        } else {
            return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 })
        }

        // Check if reaction exists
        const existing = await prisma.feedReaction.findFirst({
            where: whereClause
        })

        if (existing) {
            if (existing.type === type) {
                // Toggle off
                await prisma.feedReaction.delete({ where: { id: existing.id } })
                return NextResponse.json({ status: 'removed' })
            } else {
                // Update
                const updated = await prisma.feedReaction.update({
                    where: { id: existing.id },
                    data: { type }
                })
                return NextResponse.json(updated)
            }
        } else {
            // Create
            const reaction = await prisma.feedReaction.create({
                data: createData
            })
            return NextResponse.json(reaction)
        }

    } catch (error: any) {
        console.error("Reaction Error:", error)
        return NextResponse.json(
            { error: error.message || 'Failed to reaction' },
            { status: 500 }
        )
    }
}

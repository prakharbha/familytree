import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma/client'
import { createTargetedNotification } from '@/lib/notifications'

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

        const { entityId, entityType, type } = body;

        // Construct unique filter based on type
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

            // Notify Owner
            const notificationTitle = `${profile!.name} liked your post`
            const notificationMessage = `reacted with ${type}`
            const link = '/feed'

            let ownerId = null;
            if (entityType === 'POST') {
                const p = await prisma.feedPost.findUnique({ where: { id: entityId }, select: { profileId: true } })
                ownerId = p?.profileId
            } else if (entityType === 'CAPSULE') {
                const m = await prisma.memoryCapsule.findUnique({ where: { id: entityId }, select: { profileId: true } })
                ownerId = m?.profileId
            } else if (entityType === 'WALL') {
                const w = await prisma.legacyWallItem.findUnique({ where: { id: entityId }, select: { profileId: true } })
                ownerId = w?.profileId
            } else if (entityType === 'TRADITION') {
                const t = await prisma.tradition.findUnique({ where: { id: entityId }, select: { profileId: true } })
                ownerId = t?.profileId
            }

            if (ownerId && ownerId !== profile!.id) {
                try {
                    await createTargetedNotification(ownerId, 'REACTION', notificationTitle, notificationMessage, link)
                } catch (notifyError) {
                    console.error('Notification failed (non-blocking):', notifyError)
                }
            }

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

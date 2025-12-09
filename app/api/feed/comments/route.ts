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

        const { entityId, entityType, content } = body;
        if (!entityId || !content || !entityType) return NextResponse.json({ error: 'Missing data' }, { status: 400 })

        let createData: any = {
            profileId: profile.id,
            content
        }

        if (entityType === 'POST') {
            createData.postId = entityId
        } else if (entityType === 'CAPSULE') {
            createData.memoryCapsuleId = entityId
        } else if (entityType === 'WALL') {
            createData.legacyWallItemId = entityId
        } else if (entityType === 'TRADITION') {
            createData.traditionId = entityId
        } else {
            return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 })
        }

        const comment = await prisma.feedComment.create({
            data: createData,
            include: { profile: true }
        })

        // Notify Entity Owner
        const notificationTitle = `New Comment from ${profile!.name}`
        const notificationMessage = `commented: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`
        const link = '/feed' // Simplification for now, ideal would be to anchor to item

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

        if (ownerId && ownerId !== profile.id) {
            const { createTargetedNotification } = await import('@/lib/notifications')
            await createTargetedNotification(ownerId, 'COMMENT', notificationTitle, notificationMessage, link)
        }

        return NextResponse.json(comment)

    } catch (error: any) {
        console.error("Comment Error:", error)
        return NextResponse.json(
            { error: error.message || 'Failed to add comment' },
            { status: 500 }
        )
    }
}

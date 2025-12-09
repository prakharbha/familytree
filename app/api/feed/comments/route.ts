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

        return NextResponse.json(comment)

    } catch (error: any) {
        console.error("Comment Error:", error)
        return NextResponse.json(
            { error: error.message || 'Failed to add comment' },
            { status: 500 }
        )
    }
}

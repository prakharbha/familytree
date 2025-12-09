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

        const wallItems = await prisma.legacyWallItem.findMany({
            where: { profileId: profile.id },
            orderBy: { createdAt: 'desc' },
            include: { mediaItems: true },
        })

        return NextResponse.json(wallItems)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch legacy wall items' },
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

        const wallItem = await prisma.legacyWallItem.create({
            data: {
                profileId: profile.id,
                title: body.title,
                category: body.category,
                description: body.description,
                lesson: body.lesson,
                visibility: body.visibility || 'FAMILY',
            },
            include: { mediaItems: true }
        })

        return NextResponse.json(wallItem)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to create legacy wall item' },
            { status: 500 }
        )
    }
}

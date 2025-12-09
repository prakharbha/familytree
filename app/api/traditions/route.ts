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

        const traditions = await prisma.tradition.findMany({
            where: { profileId: profile.id },
            orderBy: { createdAt: 'desc' },
            include: { mediaItems: true },
        })

        return NextResponse.json(traditions)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch traditions' },
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

        const tradition = await prisma.tradition.create({
            data: {
                profileId: profile.id,
                name: body.name,
                origin: body.origin,
                description: body.description,
            },
            include: { mediaItems: true }
        })

        return NextResponse.json(tradition)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to create tradition' },
            { status: 500 }
        )
    }
}

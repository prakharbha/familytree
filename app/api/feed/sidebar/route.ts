import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const profile = await prisma.profile.findUnique({
            where: { userId: user.id },
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        // Reuse logic to find "My Network"
        // Fetch scope similar to Feed
        const [outgoing, incoming] = await Promise.all([
            prisma.familyMember.findMany({
                where: { profileId: profile.id },
                select: { relatedProfileId: true }
            }),
            prisma.familyMember.findMany({
                where: { relatedProfileId: profile.id },
                select: { profileId: true }
            })
        ])

        const friendIds = new Set([
            ...outgoing.map(m => m.relatedProfileId),
            ...incoming.map(m => m.profileId)
        ])
        const allIds = [profile.id, ...Array.from(friendIds)]

        // Fetch Top 5 of each category
        const [memories, traditions, wallItems] = await Promise.all([
            prisma.memoryCapsule.findMany({
                where: {
                    profileId: { in: allIds },
                    visibility: { in: ['FAMILY', 'PUBLIC'] }
                },
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, title: true, createdAt: true, profile: { select: { name: true } } }
            }),
            prisma.tradition.findMany({
                where: { profileId: { in: allIds } }, // Traditions are usually public/family
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, name: true, createdAt: true, profile: { select: { name: true } } }
            }),
            prisma.legacyWallItem.findMany({
                where: {
                    profileId: { in: allIds },
                    visibility: { in: ['FAMILY', 'PUBLIC'] }
                },
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, title: true, createdAt: true, profile: { select: { name: true } } }
            })
        ])

        return NextResponse.json({
            memories,
            traditions,
            wallItems
        })

    } catch (error: any) {
        console.error('[SIDEBAR_ERROR]', error)
        return NextResponse.json({ error: 'Failed to fetch sidebar' }, { status: 500 })
    }
}

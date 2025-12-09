import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma/client'

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth()
        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q')

        if (!query || query.length < 2) {
            return NextResponse.json([])
        }

        const profile = await prisma.profile.findUnique({
            where: { userId: user.id },
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        // SEARCH STRATEGY:
        // Simple "contains" search on text fields.
        // 1. Capsules (Title, Story)
        // 2. Wall Items (Title, Description)
        // 3. Profiles (Name)
        // 4. Traditions (Name, Description)

        // We restrict results to those visible to the user (Family/Public, or Own Private)
        // For MVP, simplifying visibility to "My content" OR "Publicly shared within family"
        // Since we don't have complex sharing logic yet, we'll search across user's own + family connections.

        // Get Family IDs
        const familyMembers = await prisma.familyMember.findMany({
            where: { profileId: profile.id },
            select: { relatedProfileId: true }
        })
        const accessibleIds = [profile.id, ...familyMembers.map(m => m.relatedProfileId)]

        const [capsules, wallItems, people, traditions] = await Promise.all([
            prisma.memoryCapsule.findMany({
                where: {
                    profileId: { in: accessibleIds },
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } }

                    ]
                },
                include: { profile: true },
                take: 5
            }),
            prisma.legacyWallItem.findMany({
                where: {
                    profileId: { in: accessibleIds },
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } }
                    ]
                },
                include: { profile: true },
                take: 5
            }),
            prisma.profile.findMany({
                where: {
                    name: { contains: query, mode: 'insensitive' },
                    // Don't show users not in family/connection? 
                    // For now, Global search might help find people to invite. 
                    // Let's restrict to family for privacy unless we want "Find to Invite"
                    // Requirement: "Search by name, tag, place". Assuming content search primarily.
                    // Let's allow searching ALL profiles to facilitate invitations? No, privacy first.
                    // Only search self and family.
                    id: { in: accessibleIds }
                },
                take: 5
            }),
            prisma.tradition.findMany({
                where: {
                    profileId: { in: accessibleIds },
                    name: { contains: query, mode: 'insensitive' }
                },
                include: { profile: true },
                take: 5
            })
        ])

        const results = [
            ...capsules.map(i => ({ type: 'MEMORY', id: i.id, title: i.title, subtitle: i.description?.substring(0, 50), url: `/memory-capsule/${i.id}` })),
            ...wallItems.map(i => ({ type: 'WALL', id: i.id, title: i.title, subtitle: i.description?.substring(0, 50), url: `/legacy-wall` })), // Wall items don't have detail pages yet?
            ...people.map(i => ({ type: 'PERSON', id: i.id, title: i.name, subtitle: 'Family Member', url: `/profile/${i.id}` })),
            ...traditions.map(i => ({ type: 'TRADITION', id: i.id, title: i.name, subtitle: i.origin, url: `/traditions` }))
        ]

        return NextResponse.json(results)

    } catch (error: any) {
        console.error('Search error:', error)
        return NextResponse.json(
            { error: error.message || 'Search failed' },
            { status: 500 }
        )
    }
}

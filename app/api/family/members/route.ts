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

        if (request.nextUrl.searchParams.get('direct') === 'true') {
            const directMembers = await prisma.familyMember.findMany({
                where: { profileId: profile.id },
                include: {
                    profile: true,
                    relatedProfile: true
                }
            })
            return NextResponse.json(directMembers)
        }

        // BFS to find Connected Component
        const visited = new Set<string>();
        const queue = [profile.id];
        visited.add(profile.id);

        const allEdges: any[] = [];

        // Safety limit to prevent infinite loops in a very large graph (though unlikely for MVP)
        let iterations = 0;
        const MAX_ITERATIONS = 50;

        while (queue.length > 0 && iterations < MAX_ITERATIONS) {
            const currentId = queue.shift();
            iterations++;

            // Fetch all edges connected to this node (Outgoing AND Incoming)
            // We fetch them in one go if possible, or 2 queries.
            // Optimisation: Fetch for the whole batch in queue? 
            // For MVP, simplistic BFS is fine. batching next queue is better.
            // Let's loop differently: 
            // 1. `frontier` = [profile.id]
            // 2. Query all edges where profileId IN frontier OR relatedProfileId IN frontier
        }

        // Revised Batch Approach
        let frontier = new Set<string>([profile.id]);
        const globalVisited = new Set<string>([profile.id]);
        const collectedEdges = new Map<string, any>(); // Key by ID to dedupe

        for (let i = 0; i < 5; i++) { // Depth 5 limit
            if (frontier.size === 0) break;

            const frontierArray = Array.from(frontier);

            // Find all edges connected to frontier
            const edges = await prisma.familyMember.findMany({
                where: {
                    OR: [
                        { profileId: { in: frontierArray } },
                        { relatedProfileId: { in: frontierArray } }
                    ]
                },
                include: {
                    profile: true,
                    relatedProfile: {
                        include: { user: { select: { email: true } } }
                    }
                }
            });

            const nextFrontier = new Set<string>();

            for (const edge of edges) {
                if (!collectedEdges.has(edge.id)) {
                    collectedEdges.set(edge.id, edge);

                    // Add nodes to next frontier if not visited
                    if (!globalVisited.has(edge.profileId)) {
                        globalVisited.add(edge.profileId);
                        nextFrontier.add(edge.profileId);
                    }
                    if (!globalVisited.has(edge.relatedProfileId)) {
                        globalVisited.add(edge.relatedProfileId);
                        nextFrontier.add(edge.relatedProfileId);
                    }
                }
            }

            frontier = nextFrontier;
        }

        return NextResponse.json(Array.from(collectedEdges.values()))
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch family members' },
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

        // For MVP, we might often be adding "shadow" profiles if the person isn't on the platform yet.
        // However, the schema expects `relatedProfileId`.
        // If the user inputs an email, we verify if a user exists. 
        // If not, we might need to create a placeholder profile or just a stub.
        // Requirement says: "Add person, Set relationship... Invite via email"

        // STRATEGY: 
        // 1. Check if user with email exists.
        // 2. If yes, link to them.
        // 3. If no, create a "Shadow" User/Profile? 
        //    The schema `User` has strict requirements (email unique). 
        //    Maybe we create a Profile WITHOUT a User? 
        //    Looking at schema: `Profile.userId` is a relation to `User` and is `@unique`. 
        //    So every Profile MUST have a User. 
        //    This is tricky for offline family members.
        //    MVP Short-circuit: We will assume we only link existing users OR we create a "placeholder" user with a fake email like `invited+UUID@placeholder.com`?
        //    Let's go with creating a placeholder User + Profile for the invitee if they don't exist.

        let relatedProfileId = body.relatedProfileId

        if (!relatedProfileId && body.email) {
            // Try to find user by email
            let relatedUser = await prisma.user.findUnique({
                where: { email: body.email },
                include: { profile: true }
            })

            if (!relatedUser) {
                // Create placeholder user
                // NOTE: In a real app, this would trigger an invitation email.
                const placeholderEmail = body.email || `placeholder+${Date.now()}@family.app`
                relatedUser = await prisma.user.create({
                    data: {
                        email: placeholderEmail,
                        profile: {
                            create: {
                                name: body.name || 'Unknown',
                                photo: null,
                            }
                        }
                    },
                    include: { profile: true }
                })
            } else {
                // Ensure they have a profile
                if (!relatedUser.profile) {
                    // Should ideally not happen if our flows are tight, but safety first
                    const newProfile = await prisma.profile.create({
                        data: { userId: relatedUser.id, name: body.name || 'Family Member' }
                    })
                    // Re-fetch to allow including in response if needed
                }
            }

            // Get the profile ID
            if (!relatedUser) return NextResponse.json({ error: 'Failed to resolve user' }, { status: 500 }) // Should not happen

            // We need to fetch the profile ID differently if we just created it nested or not
            // Easiest is to query profile by userId
            const relatedProfile = await prisma.profile.findUnique({ where: { userId: relatedUser.id } })
            if (relatedProfile) {
                relatedProfileId = relatedProfile.id
            }
        } else if (!relatedProfileId && body.name) {
            // Manual entry without email (e.g. "Grandpa")
            // Create a placeholder user/profile
            const placeholderEmail = `manual+${Date.now()}-${Math.floor(Math.random() * 1000)}@family.local`
            const relatedUser = await prisma.user.create({
                data: {
                    email: placeholderEmail,
                    profile: {
                        create: {
                            name: body.name,
                        }
                    }
                },
                include: { profile: true }
            })
            if (relatedUser.profile) relatedProfileId = relatedUser.profile.id
        }

        if (!relatedProfileId) {
            return NextResponse.json({ error: 'Could not determine family member profile' }, { status: 400 })
        }

        const familyMember = await prisma.familyMember.create({
            data: {
                profileId: profile.id,
                relatedProfileId: relatedProfileId,
                relationshipType: body.relationshipType,
                role: 'VIEWER' // Default
            }
        })

        return NextResponse.json(familyMember)
    } catch (error: any) {
        console.error('POST /api/family/members error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to add family member' },
            { status: 500 }
        )
    }
}

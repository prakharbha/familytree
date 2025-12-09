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

        const vaultItems = await prisma.legacyVaultItem.findMany({
            where: {
                OR: [
                    { profileId: profile.id }, // My items
                    { designatedViewerId: profile.id } // Items shared with me
                ]
            },
            include: {
                profile: { select: { name: true, photo: true } } // Include sender info
            },
            orderBy: { createdAt: 'desc' },
        })

        // Post-process to redact locked content for non-owners
        const processedItems = vaultItems.map(item => {
            const isOwner = item.profileId === profile.id;
            const isLockedTime = item.unlockAt && new Date(item.unlockAt) > new Date();

            if (!isOwner && isLockedTime) {
                return {
                    ...item,
                    description: "This content is locked until " + new Date(item.unlockAt!).toLocaleString(),
                    fileUrl: null, // REDACTED
                    type: 'LOCKED_CAPSULE', // Mask type or keep it? Maybe keep type so they know "It's a Letter"
                    isTimeLocked: true
                }
            }
            return {
                ...item,
                isTimeLocked: false
            }
        })

        return NextResponse.json(processedItems)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch vault items' },
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

        // Calculate unlock date
        let unlockAt = null;

        if (body.unlockAt) {
            unlockAt = new Date(body.unlockAt);
        } else if (body.unlockDelayMinutes) {
            unlockAt = new Date(Date.now() + body.unlockDelayMinutes * 60 * 1000);
        }

        const vaultItem = await prisma.legacyVaultItem.create({
            data: {
                profileId: profile.id,
                title: body.title,
                type: body.type, // letter, key, instruction, document
                description: body.description,
                accessRules: body.accessRules,
                isLocked: true,
                unlockAt: unlockAt,
                designatedViewerId: body.designatedViewerId || null
            },
        })

        return NextResponse.json(vaultItem)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to create vault item' },
            { status: 500 }
        )
    }
}

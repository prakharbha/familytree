import { prisma } from '@/lib/prisma/client'

export async function createNotification(
    type: 'MEMORY_CAPSULE' | 'WALL_ITEM' | 'FAMILY_UPDATE' | 'CONNECTION_REQUEST' | 'CHAT_MESSAGE',
    title: string,
    message: string,
    link: string | null,
    excludeProfileId?: string
) {
    try {
        // For MVP, we notify ALL profiles except the sender (excludeProfileId).
        // In real app, we'd filter by family connection.
        const profiles = await prisma.profile.findMany({
            where: {
                id: { not: excludeProfileId }
            },
            select: { id: true }
        })

        if (profiles.length === 0) return

        await prisma.notification.createMany({
            data: profiles.map(p => ({
                profileId: p.id,
                type,
                title,
                message,
                link
            }))
        })

        console.log(`Created ${profiles.length} notifications for ${type}`)
    } catch (error) {
        console.error('Failed to create notifications', error)
    }
}

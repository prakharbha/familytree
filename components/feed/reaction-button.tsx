'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReactionButtonProps {
    entityId: string
    entityType: 'POST' | 'CAPSULE' | 'WALL' | 'TRADITION'
    initialReactions: any[]
    currentUserId: string // To check if I already reacted
}

export function ReactionButton({ entityId, entityType, initialReactions, currentUserId }: ReactionButtonProps) {
    // Simple "Heart" for MVP
    const myReaction = initialReactions.find(r => r.profileId === currentUserId)
    const [reacted, setReacted] = useState(!!myReaction)
    const [count, setCount] = useState(initialReactions.length)
    const [loading, setLoading] = useState(false)

    const handleToggle = async () => {
        if (loading) return
        setLoading(true)

        // Optimistic update
        const newReacted = !reacted
        setReacted(newReacted)
        setCount(c => newReacted ? c + 1 : c - 1)

        try {
            const response = await fetch('/api/feed/reactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entityId, entityType, type: 'heart' })
            })

            if (!response.ok) {
                // Revert if failed
                setReacted(!newReacted)
                setCount(c => !newReacted ? c + 1 : c - 1)
            }
        } catch (error) {
            console.error(error)
            setReacted(!newReacted)
            setCount(c => !newReacted ? c + 1 : c - 1)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className={cn("text-slate-500 hover:text-rose-600 space-x-1", reacted && "text-rose-600")}
        >
            <Heart className={cn("w-4 h-4", reacted && "fill-current")} />
            <span>{count > 0 ? count : ''}</span>
        </Button>
    )
}

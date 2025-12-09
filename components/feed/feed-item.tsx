'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar' // Need Avatar component
import { Badge } from '@/components/ui/badge'
import { ReactionButton } from './reaction-button'
import { CommentSection } from './comment-section'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Clock, Award, MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface FeedItemProps {
    item: any
    currentUserId: string
}

export function FeedItem({ item, currentUserId }: FeedItemProps) {
    // Map itemType to EntityType expected by components
    const getEntityType = (type: string) => {
        if (type === 'CAPSULE') return 'CAPSULE'
        if (type === 'WALL_ITEM') return 'WALL'
        return 'POST'
    }

    const entityType = getEntityType(item.itemType)

    const renderBadge = () => {
        if (item.itemType === 'CAPSULE') return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Clock className="w-3 h-3 mr-1" /> Memory</Badge>
        if (item.itemType === 'WALL_ITEM') return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Award className="w-3 h-3 mr-1" /> Wall</Badge>
        return <Badge variant="outline" className="bg-slate-50 text-slate-700">Update</Badge>
    }

    // Handle differences in schema between Capsule, WallItem, FeedPost
    const content = item.content || item.description || item.story || ''
    const title = item.title

    // Add Share handler
    const handleShare = () => {
        const url = `${window.location.origin}/profile?id=${item.profileId}`
        if (navigator.share) {
            navigator.share({
                title: item.title || 'Family Update',
                text: content,
                url: window.location.href // This should ideally link to specific item if possible
            }).catch(console.error)
        } else {
            navigator.clipboard.writeText(content)
            alert('Content copied to clipboard!')
        }
    }

    return (
        <Card className="mb-6">
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden">
                    {/* Fallback avatar */}
                    {item.profile?.photo ? (
                        <img src={item.profile.photo} className="h-full w-full object-cover" alt={item.profile.name} />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-slate-300 text-slate-500 text-xs font-bold">
                            {item.profile?.name?.[0] || '?'}
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold hover:underline">
                            <a href={`/profile?id=${item.profile?.id}`}>
                                {item.profile?.name || 'Unknown'}
                            </a>
                        </h3>
                        <span className="text-xs text-slate-400">{formatDate(item.createdAt)}</span>
                    </div>
                    <div className="mt-1">
                        {renderBadge()}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pb-2">
                {title && <h4 className="text-lg font-serif font-medium mb-2">{title}</h4>}
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{content}</p>

                {/* Media rendering reuse */}
                {item.mediaItems && item.mediaItems.length > 0 && (
                    <div className="mt-4 rounded-lg overflow-hidden bg-slate-100 aspect-video flex items-center justify-center text-slate-400">
                        [Media: {item.mediaItems.length} items]
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col items-start pt-2 border-t mt-2 bg-slate-50/50">
                {/* Actions */}
                <div className="flex items-center w-full space-x-4">
                    <ReactionButton
                        entityId={item.id}
                        entityType={entityType as any}
                        initialReactions={item.reactions || []}
                        currentUserId={currentUserId}
                    />

                    <CommentSection
                        entityId={item.id}
                        entityType={entityType as any}
                        initialComments={item.comments || []}
                    />

                    <Button variant="ghost" size="sm" onClick={handleShare} className="text-slate-500 ml-auto">
                        <Send className="w-4 h-4 mr-1" />
                        Share
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}

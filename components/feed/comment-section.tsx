'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, MessageSquare } from 'lucide-react'

interface CommentSectionProps {
    entityId: string
    entityType: 'POST' | 'CAPSULE' | 'WALL' | 'TRADITION'
    initialComments: any[]
}

export function CommentSection({ entityId, entityType, initialComments }: CommentSectionProps) {
    const [comments, setComments] = useState(initialComments || [])
    const [commentText, setCommentText] = useState('')
    const [showComments, setShowComments] = useState(false)
    const [sendingComment, setSendingComment] = useState(false)

    const handleSendComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!commentText.trim()) return
        setSendingComment(true)

        try {
            const response = await fetch('/api/feed/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entityId, entityType, content: commentText })
            })
            if (response.ok) {
                const newComment = await response.json()
                setComments([...comments, newComment])
                setCommentText('')
            }
        } catch (err) {
            console.error(err)
        } finally {
            setSendingComment(false)
        }
    }

    return (
        <div className="flex flex-col w-full">
            <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} className="text-slate-500 w-fit">
                <MessageSquare className="w-4 h-4 mr-1" />
                {comments.length > 0 ? comments.length : 'Comment'}
            </Button>

            {showComments && (
                <div className="w-full mt-4 space-y-4">
                    {comments.map((comment: any) => (
                        <div key={comment.id} className="flex space-x-2 text-sm">
                            <span className="font-semibold text-slate-900">{comment.profile?.name || 'User'}:</span>
                            <span className="text-slate-700">{comment.content}</span>
                        </div>
                    ))}

                    <form onSubmit={handleSendComment} className="flex gap-2">
                        <Input
                            placeholder="Write a comment..."
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            className="h-8 text-sm"
                        />
                        <Button size="sm" type="submit" disabled={sendingComment}>
                            <Send className="w-3 h-3" />
                        </Button>
                    </form>
                </div>
            )}
        </div>
    )
}

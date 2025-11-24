'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadFeed()
  }, [])

  const loadFeed = async () => {
    try {
      const response = await fetch('/api/feed')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Failed to load feed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mediaUrls }),
      })

      if (response.ok) {
        await loadFeed()
        setContent('')
        setMediaUrls([])
        setShowForm(false)
      }
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const uploadedUrls: string[] = []
    for (const file of Array.from(files)) {
      const { data, error } = await supabase.storage
        .from('media')
        .upload(`${Date.now()}-${file.name}`, file)

      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(data.path)
        uploadedUrls.push(publicUrl)
      }
    }

    setMediaUrls([...mediaUrls, ...uploadedUrls])
  }

  const handleComment = async (postId: string, content: string) => {
    try {
      await fetch(`/api/feed/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      await loadFeed()
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const handleReaction = async (postId: string) => {
    try {
      await fetch(`/api/feed/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'like' }),
      })
      await loadFeed()
    } catch (error) {
      console.error('Failed to add reaction:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">Loading feed...</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-mix font-semibold">Family Feed</h1>
          <p className="text-gray-600">Share updates with your family</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Post'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 animate-fade-in-up">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <div>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="text-sm"
                />
                {mediaUrls.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {mediaUrls.map((url, idx) => (
                      <img key={idx} src={url} alt="Media" className="w-20 h-20 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full">Post</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No posts yet. Be the first to share!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {post.profile.photo && (
                    <img
                      src={post.profile.photo}
                      alt={post.profile.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{post.profile.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="mb-4">{post.content}</p>
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {post.mediaUrls.map((url: string, idx: number) => (
                      <img
                        key={idx}
                        src={url}
                        alt="Post media"
                        className="w-full h-48 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
                <div className="flex items-center space-x-4 border-t pt-4">
                  <button
                    onClick={() => handleReaction(post.id)}
                    className="text-sm text-gray-600 hover:text-black"
                  >
                    Like ({post.reactions?.length || 0})
                  </button>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-600">
                    {post.comments?.length || 0} comments
                  </span>
                </div>
                {post.comments && post.comments.length > 0 && (
                  <div className="mt-4 space-y-2 border-t pt-4">
                    {post.comments.map((comment: any) => (
                      <div key={comment.id} className="text-sm">
                        <span className="font-semibold">{comment.profile.name}</span>
                        <span className="ml-2">{comment.content}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2"
                    onKeyPress={(e: any) => {
                      if (e.key === 'Enter' && e.target.value) {
                        handleComment(post.id, e.target.value)
                        e.target.value = ''
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}


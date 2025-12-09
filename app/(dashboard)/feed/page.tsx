'use client'

import { useEffect, useState } from 'react'
import { FeedItem } from '@/components/feed/feed-item'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Edit, Clock, BookHeart, Award } from 'lucide-react'
import { FeedSidebar } from '@/components/feed/feed-sidebar'
import { QuickCreateWidget } from '@/components/feed/quick-create-widget'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

export default function FeedPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [userProfile, setUserProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  const fetchFeed = async () => {
    try {
      const response = await fetch('/api/feed', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error: any) {
      console.error('Failed to fetch feed', error)
      setError(error.message || 'Failed to load feed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Fetch current user ID for checking reactions
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/profiles')
        if (res.ok) {
          const myProfile = await res.json()
          setCurrentUserId(myProfile.id)
          setUserProfile(myProfile)
        }
      } catch (e) { } finally {
        setProfileLoading(false)
      }
    }
    fetchMe()
    fetchFeed()
  }, [])

  return (
    <div className="min-h-screen bg-stone-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {profileLoading ? (
              <>
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </>
            ) : (
              <>
                <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                  {userProfile?.photo ? (
                    <AvatarImage src={userProfile.photo} alt={userProfile.name} className="object-cover" />
                  ) : (
                    <AvatarFallback className="text-lg bg-emerald-100 text-emerald-800">
                      {userProfile?.name?.[0] || 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h1 className="text-3xl font-serif text-gray-900">
                    Welcome, {userProfile?.name?.split(' ')[0] || 'Family'}
                  </h1>
                  <p className="text-slate-500">Here is what's happening in your family network.</p>
                </div>
              </>
            )}
          </div>

          <Link href="/profile">
            <Button variant="outline" className="hidden sm:flex">
              <Edit className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Create Post Widget */}
            {/* Create Post Widget with Quick Actions */}
            <QuickCreateWidget onPostSuccess={fetchFeed} />

            {/* Feed List */}
            <div className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
                  Error loading feed: {error}
                </div>
              )}
              {loading ? (
                <div className="text-center py-10 text-gray-400">Loading updates...</div>
              ) : items.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No updates yet. Be the first to post!
                </div>
              ) : (
                items.map(item => (
                  <FeedItem key={`${item.itemType}-${item.id}`} item={item} currentUserId={currentUserId} />
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-6">
              <FeedSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

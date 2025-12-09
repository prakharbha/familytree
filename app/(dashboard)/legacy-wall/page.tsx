'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WallItemCard } from '@/components/dashboard/wall-item-card'
import { Skeleton } from '@/components/ui/skeleton'

interface WallItem {
    id: string
    title: string
    category: string
    description?: string
    lesson?: string
    createdAt: string
    mediaItems: any[]
}

export default function LegacyWallPage() {
    const [items, setItems] = useState<WallItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch('/api/legacy-wall')
                if (response.ok) {
                    const data = await response.json()
                    setItems(data)
                }
            } catch (error) {
                console.error('Failed to fetch legacy wall items', error)
            } finally {
                setLoading(false)
            }
        }

        fetchItems()
    }, [])

    return (
        <div className="min-h-screen bg-stone-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-serif text-gray-900">Legacy Wall</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Celebrate achievements, milestones, and life lessons.
                        </p>
                    </div>
                    <Link href="/legacy-wall/new">
                        <Button className="bg-stone-900 text-white hover:bg-stone-800">
                            <Plus className="w-4 h-4 mr-2" />
                            Add to Wall
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-[200px] w-full rounded-xl" />
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No items on your wall</h3>
                        <p className="mt-1 text-sm text-gray-500">Start building your legacy by adding your first milestone.</p>
                        <div className="mt-6">
                            <Link href="/legacy-wall/new">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add First Item
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <WallItemCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

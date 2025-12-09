'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, BookHeart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TraditionCard } from '@/components/traditions/tradition-card'
import { Skeleton } from '@/components/ui/skeleton'

export default function TraditionsPage() {
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch('/api/traditions')
                if (response.ok) {
                    const data = await response.json()
                    setItems(data)
                }
            } catch (error) {
                console.error('Failed to fetch traditions', error)
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
                        <h1 className="text-3xl font-serif text-gray-900">Traditions & Rituals</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Preserve your family's unique customs, recipes, and celebrations.
                        </p>
                    </div>
                    <Link href="/traditions/new">
                        <Button className="bg-amber-900 text-white hover:bg-amber-800">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Tradition
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-[150px] w-full rounded-xl" />
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg border border-dashed border-amber-200">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
                            <BookHeart className="h-6 w-6 text-amber-600" />
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No traditions recorded</h3>
                        <p className="mt-1 text-sm text-gray-500">Capture the customs that make your family unique.</p>
                        <div className="mt-6">
                            <Link href="/traditions/new">
                                <Button className="bg-amber-900 hover:bg-amber-800">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add First Tradition
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <TraditionCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

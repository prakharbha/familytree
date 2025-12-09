'use client'

import { useEffect, useState } from 'react'
import { IdentityWheel } from '@/components/tapestry/identity-wheel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function TapestryPage() {
    const [stats, setStats] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // For MVP, we likely calculate this on client from a full feed fetch or a specialized stats endpoint.
        // Let's create a specialized endpoint logic here or mock it if we don't have the endpoint yet.
        // Actually, getting 'Feed' gives us almost everything.
        // Let's assume we fetch feed and Aggregate.

        // Better: Fetch Feed and aggregate locally for MVP speed.
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/feed') // Reusing feed to get content
                if (response.ok) {
                    const items = await response.json()

                    // Aggregate by Persona
                    // Items usually have `personaTags` (Capsules) or `category` (WallItem).
                    // We need to normalize.
                    const counts: Record<string, number> = {
                        PERSONAL: 0,
                        PROFESSIONAL: 0,
                        SOCIAL: 0,
                        GENERATIONAL: 0,
                        SPIRITUAL: 0,
                        CULTURAL: 0
                    }

                    items.forEach((item: any) => {
                        // Handle Capsules multiple tags
                        if (item.personaTags && Array.isArray(item.personaTags)) {
                            item.personaTags.forEach((tag: string) => {
                                if (counts[tag] !== undefined) counts[tag]++
                            })
                        }
                        // Handle Wall Item single category
                        if (item.category && counts[item.category] !== undefined) {
                            counts[item.category]++
                        }
                        // Handle Posts? Maybe they don't have persona yet. Ignored.
                    })

                    // Format for Recharts
                    const chartData = Object.keys(counts).map(key => ({
                        subject: key.charAt(0) + key.slice(1).toLowerCase(), // Capitalize
                        val: counts[key],
                        fullMark: Math.max(...Object.values(counts)) + 5 // Dynamic max
                    }))

                    setStats(chartData)
                }
            } catch (error) {
                console.error('Failed to load tapestry', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    return (
        <div className="min-h-screen bg-stone-50/30 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-serif text-gray-900 mb-8">Life Tapestry</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 h-[500px]">
                        {loading ? (
                            <div className="flex h-full items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                            </div>
                        ) : (
                            <IdentityWheel data={stats} />
                        )}
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">What is this?</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-gray-600">
                                The Tapestry visualizes the balance of your life's memories across the 6 core identity dimensions.
                            </CardContent>
                        </Card>

                        <Card className="bg-emerald-50 border-emerald-100">
                            <CardHeader>
                                <CardTitle className="text-lg text-emerald-800">Observation</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-emerald-700">
                                {/* Simple Insight */}
                                {stats.length > 0 && (
                                    <p>
                                        You seem to have a strong focus on <strong>{stats.reduce((a, b) => a.val > b.val ? a : b).subject}</strong> memories.
                                        Consider adding more to <strong>{stats.reduce((a, b) => a.val < b.val ? a : b).subject}</strong>?
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

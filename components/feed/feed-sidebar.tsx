'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, BookHeart, Award, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export function FeedSidebar() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/feed/sidebar')
                if (res.ok) {
                    setData(await res.json())
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return <div className="space-y-4 animate-pulse">
        <div className="h-40 bg-slate-200 rounded-lg"></div>
        <div className="h-40 bg-slate-200 rounded-lg"></div>
    </div>

    if (!data) return null

    return (
        <div className="space-y-6">
            {/* Recent Memories */}
            <Card className="border-blue-100 shadow-sm">
                <CardHeader className="pb-2 bg-blue-50/50 rounded-t-lg">
                    <CardTitle className="text-lg flex items-center text-blue-800">
                        <Clock className="w-4 h-4 mr-2" /> Recent Memories
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                    {data.memories.length === 0 ? <p className="text-sm text-slate-500 italic">No recent memories.</p> :
                        data.memories.map((item: any) => (
                            <Link href={`/profile?id=${item.profileId}&tab=memories`} key={item.id} className="block group">
                                <div className="text-sm font-medium text-slate-800 group-hover:text-blue-600 truncate">{item.title}</div>
                                <div className="text-xs text-slate-500 flex justify-between">
                                    <span>{item.profile.name}</span>
                                    <span>{formatDate(item.createdAt)}</span>
                                </div>
                            </Link>
                        ))
                    }
                </CardContent>
            </Card>

            {/* Recent Traditions */}
            <Card className="border-rose-100 shadow-sm">
                <CardHeader className="pb-2 bg-rose-50/50 rounded-t-lg">
                    <CardTitle className="text-lg flex items-center text-rose-800">
                        <BookHeart className="w-4 h-4 mr-2" /> Traditions
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                    {data.traditions.length === 0 ? <p className="text-sm text-slate-500 italic">No recent traditions.</p> :
                        data.traditions.map((item: any) => (
                            <Link href={`/dashboard/traditions`} key={item.id} className="block group">
                                <div className="text-sm font-medium text-slate-800 group-hover:text-rose-600 truncate">{item.name}</div>
                                <div className="text-xs text-slate-500 flex justify-between">
                                    <span>{item.profile.name}</span>
                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                            </Link>
                        ))
                    }
                </CardContent>
            </Card>

            {/* Legacy Wall */}
            <Card className="border-amber-100 shadow-sm">
                <CardHeader className="pb-2 bg-amber-50/50 rounded-t-lg">
                    <CardTitle className="text-lg flex items-center text-amber-800">
                        <Award className="w-4 h-4 mr-2" /> Legacy Wall
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                    {data.wallItems.length === 0 ? <p className="text-sm text-slate-500 italic">No recent items.</p> :
                        data.wallItems.map((item: any) => (
                            <Link href={`/profile?id=${item.profileId}&tab=wall`} key={item.id} className="block group">
                                <div className="text-sm font-medium text-slate-800 group-hover:text-amber-600 truncate">{item.title}</div>
                                <div className="text-xs text-slate-500 flex justify-between">
                                    <span>{item.profile.name}</span>
                                    <span>{formatDate(item.createdAt)}</span>
                                </div>
                            </Link>
                        ))
                    }
                </CardContent>
            </Card>
        </div>
    )
}

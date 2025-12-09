'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, Filter } from 'lucide-react'

const PERSONA_COLORS: Record<string, string> = {
  PERSONAL: 'bg-rose-100 text-rose-800',
  PROFESSIONAL: 'bg-slate-100 text-slate-800',
  SOCIAL: 'bg-amber-100 text-amber-800',
  GENERATIONAL: 'bg-emerald-100 text-emerald-800',
  SPIRITUAL: 'bg-violet-100 text-violet-800',
  CULTURAL: 'bg-orange-100 text-orange-800',
}

export default function TimelinePage() {
  const [memoryCapsules, setMemoryCapsules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMemoryCapsules()
  }, [])

  const fetchMemoryCapsules = async () => {
    try {
      const response = await fetch('/api/memory-capsules')
      if (response.ok) {
        const data = await response.json()
        setMemoryCapsules(data)
      }
    } catch (error) {
      console.error('Failed to load timeline:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">Loading timeline...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-mix font-semibold">Your Memory Capsules</h1>
          <p className="text-gray-600">A collection of your life's moments</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Link href="/memory-capsule/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Capsule
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pb-8">
        {memoryCapsules.length === 0 ? (
          <div className="ml-8">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No memories yet. Start building your timeline!</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          memoryCapsules.map((capsule) => (
            <div key={capsule.id} className="relative ml-8">
              <div className="absolute -left-[41px] bg-white border-2 border-gray-200 rounded-full w-5 h-5 mt-1.5"></div>
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{capsule.title}</CardTitle>
                      <CardDescription>
                        {new Date(capsule.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </CardDescription>
                    </div>
                    {capsule.personaTags && capsule.personaTags.length > 0 && (
                      <div className="flex gap-1">
                        {capsule.personaTags.map((tag: string) => (
                          <span key={tag} className={`text-xs px-2 py-1 rounded-full ${PERSONA_COLORS[tag] || 'bg-gray-100'}`}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {capsule.description && (
                    <p className="mb-4 text-gray-700">{capsule.description}</p>
                  )}
                  {capsule.mediaItems && capsule.mediaItems.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {capsule.mediaItems.map((item: any) => (
                        <img
                          key={item.id}
                          src={item.url}
                          alt={item.title || 'Memory media'}
                          className="w-full h-48 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, SearchX } from 'lucide-react'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return
      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data)
        }
      } catch (error) {
        console.error('Search failed', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query])

  if (!query) {
    return <div className="p-8 text-center text-gray-500">Please enter a search term.</div>
  }

  return (
    <div className="min-h-screen bg-stone-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-serif text-gray-900 mb-6">
          Search results for &ldquo;{query}&rdquo;
        </h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed">
            <SearchX className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No matches found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((item) => (
              <Link href={item.url} key={`${item.type}-${item.id}`}>
                <Card className="hover:bg-slate-50 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-slate-900">{item.title}</h3>
                      {item.subtitle && <p className="text-sm text-slate-500 line-clamp-1">{item.subtitle}</p>}
                    </div>
                    <Badge variant="secondary" className="text-[10px] tracking-wider">
                      {item.type}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

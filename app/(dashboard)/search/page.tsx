'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/profiles/search?name=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(Array.isArray(data) ? data : [data])
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-mix font-semibold mb-2">Search Family Members</h1>
        <p className="text-gray-600">Find family members by name, location, or tags</p>
      </div>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex space-x-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name..."
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        {results.length === 0 && query && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No results found</p>
            </CardContent>
          </Card>
        )}

        {results.map((profile) => (
          <Card key={profile.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                {profile.photo && (
                  <img
                    src={profile.photo}
                    alt={profile.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{profile.name}</h3>
                  {profile.location && (
                    <p className="text-sm text-gray-600">📍 {profile.location}</p>
                  )}
                  {profile.profession && (
                    <p className="text-sm text-gray-600">💼 {profile.profession}</p>
                  )}
                  {profile.tags && profile.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


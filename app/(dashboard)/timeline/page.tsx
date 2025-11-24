'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function TimelinePage() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: '',
    mediaUrls: [] as string[],
  })
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadTimeline()
  }, [])

  const loadTimeline = async () => {
    try {
      const response = await fetch('/api/timeline')
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } catch (error) {
      console.error('Failed to load timeline:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      const response = await fetch('/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await loadTimeline()
        setShowForm(false)
        setFormData({
          title: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          type: '',
          mediaUrls: [],
        })
      } else {
        alert('Failed to create timeline entry')
      }
    } catch (error) {
      console.error('Failed to create entry:', error)
      alert('Failed to create timeline entry')
    } finally {
      setUploading(false)
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

      if (error) {
        console.error('Upload error:', error)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(data.path)

      uploadedUrls.push(publicUrl)
    }

    setFormData({ ...formData, mediaUrls: [...formData.mediaUrls, ...uploadedUrls] })
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
          <h1 className="text-3xl font-mix font-semibold">Legacy Timeline</h1>
          <p className="text-gray-600">Your life's journey in chronological order</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Entry'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 animate-fade-in-up">
          <CardHeader>
            <CardTitle>New Timeline Entry</CardTitle>
            <CardDescription>Add a significant moment to your legacy</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type (Optional)</label>
                <Input
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="e.g., Career, Family, Achievement"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Media</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*"
                  onChange={handleMediaUpload}
                  className="text-sm"
                />
                {formData.mediaUrls.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.mediaUrls.map((url, idx) => (
                      <img key={idx} src={url} alt="Media" className="w-20 h-20 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>
              <Button type="submit" disabled={uploading} className="w-full">
                {uploading ? 'Creating...' : 'Create Entry'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {entries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No timeline entries yet. Start building your legacy!</p>
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{entry.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  {entry.type && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {entry.type}
                    </span>
                  )}
                </div>
                {entry.description && (
                  <p className="text-gray-700 mb-4">{entry.description}</p>
                )}
                {entry.mediaUrls && entry.mediaUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {entry.mediaUrls.map((url: string, idx: number) => (
                      <img
                        key={idx}
                        src={url}
                        alt="Timeline media"
                        className="w-full h-32 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}


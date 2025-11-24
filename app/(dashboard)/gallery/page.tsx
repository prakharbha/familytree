'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function GalleryPage() {
  const [mediaItems, setMediaItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadGallery()
  }, [])

  const loadGallery = async () => {
    try {
      const response = await fetch('/api/media')
      if (response.ok) {
        const data = await response.json()
        setMediaItems(data)
      }
    } catch (error) {
      console.error('Failed to load gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      const fileType = file.type.startsWith('image/') ? 'photo' :
                       file.type.startsWith('video/') ? 'video' :
                       file.type.startsWith('audio/') ? 'audio' : 'document'

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

      await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: publicUrl,
          type: fileType,
          title: file.name,
        }),
      })
    }

    await loadGallery()
    setShowUpload(false)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">Loading gallery...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-mix font-semibold">Media Gallery</h1>
          <p className="text-gray-600">Your family memories and media</p>
        </div>
        <Button onClick={() => setShowUpload(!showUpload)}>
          {showUpload ? 'Cancel' : 'Upload Media'}
        </Button>
      </div>

      {showUpload && (
        <Card className="mb-8 animate-fade-in-up">
          <CardHeader>
            <CardTitle>Upload Media</CardTitle>
            <CardDescription>Add photos, videos, or documents to your gallery</CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              onChange={handleUpload}
              className="text-sm"
            />
          </CardContent>
        </Card>
      )}

      {mediaItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No media items yet. Start uploading your memories!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setSelectedMedia(item.url)}
            >
              {item.type === 'photo' ? (
                <img
                  src={item.url}
                  alt={item.title || 'Media'}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : item.type === 'video' ? (
                <video
                  src={item.url}
                  className="w-full h-full object-cover rounded-lg"
                  controls
                />
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">{item.title || 'Document'}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedMedia(null)}
        >
          <img src={selectedMedia} alt="Selected" className="max-w-4xl max-h-[90vh] object-contain" />
        </div>
      )}
    </div>
  )
}


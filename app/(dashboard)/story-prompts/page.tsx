'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function StoryPromptsPage() {
  const [prompts, setPrompts] = useState<any[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null)
  const [story, setStory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPrompts()
  }, [])

  const loadPrompts = async () => {
    try {
      const response = await fetch('/api/story-prompts')
      if (response.ok) {
        const data = await response.json()
        setPrompts(data)
      }
    } catch (error) {
      console.error('Failed to load prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitStory = async () => {
    if (!selectedPrompt || !story.trim()) return

    // Create timeline entry from story
    try {
      const response = await fetch('/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedPrompt.question,
          description: story,
          date: new Date().toISOString().split('T')[0],
          type: 'Story',
        }),
      })

      if (response.ok) {
        alert('Story added to your timeline!')
        setStory('')
        setSelectedPrompt(null)
      }
    } catch (error) {
      console.error('Failed to submit story:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">Loading prompts...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-mix font-semibold">Story Prompts</h1>
        <p className="text-gray-600">Answer questions to build your legacy story</p>
      </div>

      {!selectedPrompt ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prompts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No prompts available yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Prompts will appear here once they're added to the system.
                </p>
              </CardContent>
            </Card>
          ) : (
            prompts.map((prompt) => (
              <Card
                key={prompt.id}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 animate-fade-in-up"
                onClick={() => setSelectedPrompt(prompt)}
              >
                <CardContent className="pt-6">
                  <p className="text-lg font-semibold mb-2">{prompt.question}</p>
                  {prompt.category && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {prompt.category}
                    </span>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle>{selectedPrompt.question}</CardTitle>
            <CardDescription>Share your story</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              className="flex min-h-[200px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              placeholder="Tell your story..."
              value={story}
              onChange={(e) => setStory(e.target.value)}
            />
            <div className="flex space-x-4">
              <Button onClick={handleSubmitStory} disabled={!story.trim()}>
                Add to Timeline
              </Button>
              <Button variant="outline" onClick={() => {
                setSelectedPrompt(null)
                setStory('')
              }}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

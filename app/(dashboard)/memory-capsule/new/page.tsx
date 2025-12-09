'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

const PERSONA_TYPES = [
    'PERSONAL',
    'PROFESSIONAL',
    'SOCIAL',
    'GENERATIONAL',
    'SPIRITUAL',
    'CULTURAL',
]

const VISIBILITY_OPTIONS = [
    { value: 'PRIVATE', label: 'Private (Only Me)' },
    { value: 'FAMILY', label: 'Family (Connections)' },
    { value: 'PUBLIC', label: 'Public' },
]

const PERSONA_COLORS: Record<string, string> = {
    PERSONAL: 'bg-rose-100 border-rose-200 text-rose-800 hover:bg-rose-200',
    PROFESSIONAL: 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200',
    SOCIAL: 'bg-amber-100 border-amber-200 text-amber-800 hover:bg-amber-200',
    GENERATIONAL: 'bg-emerald-100 border-emerald-200 text-emerald-800 hover:bg-emerald-200',
    SPIRITUAL: 'bg-violet-100 border-violet-200 text-violet-800 hover:bg-violet-200',
    CULTURAL: 'bg-orange-100 border-orange-200 text-orange-800 hover:bg-orange-200',
}

export default function NewMemoryCapsulePage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        personaTags: [] as string[],
        visibility: 'FAMILY',
        mediaUrls: [] as string[],
    })

    const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const uploadedUrls: string[] = []
        for (const file of Array.from(files)) {
            const { data, error } = await supabase.storage
                .from('media')
                .upload(`${Date.now()}-${file.name}`, file)

            if (!error && data) {
                const { data: { publicUrl } } = supabase.storage
                    .from('media')
                    .getPublicUrl(data.path)
                uploadedUrls.push(publicUrl)
            }
        }

        setFormData(prev => ({ ...prev, mediaUrls: [...prev.mediaUrls, ...uploadedUrls] }))
    }

    const togglePersona = (type: string) => {
        setFormData(prev => {
            const tags = prev.personaTags.includes(type)
                ? prev.personaTags.filter(t => t !== type)
                : [...prev.personaTags, type]
            return { ...prev, personaTags: tags }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/memory-capsules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                router.push('/memory-capsule')
            } else {
                alert('Failed to create memory capsule')
            }
        } catch (error) {
            console.error('Error creating capsule:', error)
            alert('Error creating capsule')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Create Memory Capsule</CardTitle>
                    <CardDescription>Preserve a moment for your legacy</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Family Vacation 2023"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Story / Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Tell the story behind this memory..."
                                className="min-h-[150px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Personas (Select relevant aspects)</Label>
                            <div className="flex flex-wrap gap-2">
                                {PERSONA_TYPES.map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => togglePersona(type)}
                                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${formData.personaTags.includes(type)
                                            ? 'ring-2 ring-offset-1 ring-black ' + PERSONA_COLORS[type]
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {type.charAt(0) + type.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="visibility">Visibility</Label>
                            <select
                                id="visibility"
                                value={formData.visibility}
                                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {VISIBILITY_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Media</Label>
                            <Input
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                onChange={handleMediaUpload}
                            />
                            {formData.mediaUrls.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {formData.mediaUrls.map((url, idx) => (
                                        <img key={idx} src={url} alt="Preview" className="w-full h-24 object-cover rounded" />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Capsule'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

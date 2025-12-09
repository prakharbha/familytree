'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

export default function NewWallItemPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            title: formData.get('title'),
            category: formData.get('category'),
            description: formData.get('description'),
            lesson: formData.get('lesson'),
            visibility: formData.get('visibility'),
        }

        try {
            const response = await fetch('/api/legacy-wall', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                router.push('/legacy-wall')
                router.refresh()
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to create item')
            }
        } catch (error) {
            console.error(error)
            alert('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-stone-50/30 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-serif">Add to Legacy Wall</CardTitle>
                        <CardDescription>
                            Share a significant achievement, milestone, or life lesson.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" name="title" placeholder="e.g., University Graduation" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select name="category" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERSONAL">Personal</SelectItem>
                                        <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                                        <SelectItem value="SOCIAL">Social</SelectItem>
                                        <SelectItem value="GENERATIONAL">Generational</SelectItem>
                                        <SelectItem value="SPIRITUAL">Spiritual</SelectItem>
                                        <SelectItem value="CULTURAL">Cultural</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Tell the story of this achievement..."
                                    className="min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lesson">Life Lesson (Optional)</Label>
                                <Textarea
                                    id="lesson"
                                    name="lesson"
                                    placeholder="What did you learn from this experience?"
                                    className="min-h-[80px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="visibility">Visibility</Label>
                                <Select name="visibility" defaultValue="FAMILY">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select who can see this" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PRIVATE">Private (Only Me)</SelectItem>
                                        <SelectItem value="FAMILY">Family</SelectItem>
                                        <SelectItem value="PUBLIC">Public</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-end space-x-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Add to Wall
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

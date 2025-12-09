'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function NewTraditionPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name'),
            origin: formData.get('origin'),
            description: formData.get('description'),
        }

        try {
            const response = await fetch('/api/traditions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                router.push('/traditions')
                router.refresh()
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to create tradition')
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
                <Card className="border-amber-100">
                    <CardHeader className="bg-amber-50/50">
                        <CardTitle className="text-2xl font-serif text-amber-900">Add Tradition</CardTitle>
                        <CardDescription className="text-amber-700/80">
                            Record a ritual, custom, or recipe to preserve it.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name of Tradition</Label>
                                <Input id="name" name="name" placeholder="e.g., Mom's Diwali Rangoli" required className="border-amber-200 focus-visible:ring-amber-500" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="origin">Origin / Culture (Optional)</Label>
                                <Input id="origin" name="origin" placeholder="e.g., Indian, Grandmother's Village" className="border-amber-200 focus-visible:ring-amber-500" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Story & Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="How is it celebrated? What are the steps? Why is it important?"
                                    className="min-h-[150px] border-amber-200 focus-visible:ring-amber-500"
                                />
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
                                <Button type="submit" disabled={loading} className="bg-amber-900 hover:bg-amber-800">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Tradition
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LIFE_PROMPTS, CATEGORIES } from '@/lib/data/prompts'
import { PenTool } from 'lucide-react'

export default function PromptsPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    const filtered = selectedCategory
        ? LIFE_PROMPTS.filter(p => p.category === selectedCategory)
        : LIFE_PROMPTS

    return (
        <div className="min-h-screen bg-stone-50/30 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-serif text-gray-900 mb-2">Inspiration Library</h1>
                <p className="text-gray-500 mb-8">Stuck on what to write? Choose a prompt to get started.</p>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <Button
                        variant={selectedCategory === null ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(null)}
                        size="sm"
                    >
                        All
                    </Button>
                    {CATEGORIES.map(cat => (
                        <Button
                            key={cat}
                            variant={selectedCategory === cat ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory(cat)}
                            size="sm"
                        >
                            {cat}
                        </Button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.map(prompt => (
                        <Card key={prompt.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge variant="secondary">{prompt.category}</Badge>
                                    <Link href={`/memory-capsule/new?title=${encodeURIComponent(prompt.text)}`}>
                                        <Button size="sm" variant="ghost" className="h-8">
                                            <PenTool className="w-4 h-4 mr-2" /> Write
                                        </Button>
                                    </Link>
                                </div>
                                <p className="text-lg font-medium text-gray-800 font-serif">
                                    &ldquo;{prompt.text}&rdquo;
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}

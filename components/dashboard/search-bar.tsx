'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search as SearchIcon } from 'lucide-react'

export function SearchBar() {
    const router = useRouter()
    const [query, setQuery] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`)
        }
    }

    return (
        <form onSubmit={handleSearch} className="relative w-full max-w-xs md:max-w-sm ml-4">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
                type="search"
                placeholder="Search family..."
                className="pl-9 h-9 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-slate-300 w-full"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </form>
    )
}

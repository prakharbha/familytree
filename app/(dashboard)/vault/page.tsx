'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VaultItemCard } from '@/components/dashboard/vault-item-card'
import { Skeleton } from '@/components/ui/skeleton'

interface VaultItem {
    id: string
    title: string
    type: string
    description?: string
    createdAt: string
    isLocked: boolean
}

export default function VaultPage() {
    const [items, setItems] = useState<VaultItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch('/api/vault')
                if (response.ok) {
                    const data = await response.json()
                    setItems(data)
                }
            } catch (error) {
                console.error('Failed to fetch vault items', error)
            } finally {
                setLoading(false)
            }
        }

        fetchItems()
    }, [])

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="bg-slate-900 text-white pb-12 pt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-3 mb-2">
                        <ShieldCheck className="h-6 w-6 text-emerald-400" />
                        <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">Secure Storage</span>
                    </div>
                    <h1 className="text-3xl font-serif">Legacy Vault</h1>
                    <p className="mt-2 text-slate-400 max-w-2xl">
                        A private space for your most important documents, letters, and instructions.
                        Only you have access to these items.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-slate-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-medium text-slate-900">Your Secure Items</h2>
                        <Link href="/vault/new">
                            <Button className="bg-slate-900 hover:bg-slate-800">
                                <Plus className="w-4 h-4 mr-2" />
                                Add to Vault
                            </Button>
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-[140px] w-full rounded-xl" />
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-slate-200 mb-4">
                            <ShieldCheck className="h-6 w-6 text-slate-500" />
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">Vault is empty</h3>
                        <p className="mt-1 text-sm text-gray-500">Secure your digital legacy by adding your first item.</p>
                        <div className="mt-6">
                            <Link href="/vault/new">
                                <Button variant="outline">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Secure Item
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <VaultItemCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

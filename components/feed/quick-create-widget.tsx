'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Clock, BookHeart, Award, Lock, Image as ImageIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickCreateProps {
    onPostSuccess: () => void
}

type CreateMode = 'post' | 'memory' | 'tradition' | 'legacy' | 'vault'

export function QuickCreateWidget({ onPostSuccess }: QuickCreateProps) {
    const [mode, setMode] = useState<CreateMode>('post')
    const [loading, setLoading] = useState(false)

    // Generic form state
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('') // Used for bio/desc/post content
    const [date, setDate] = useState('')
    const [file, setFile] = useState<string>('') // URL after upload
    const [uploading, setUploading] = useState(false)
    const [extraField, setExtraField] = useState('') // Origin/Category/etc

    const resetForm = () => {
        setTitle('')
        setContent('')
        setDate('')
        setFile('')
        setExtraField('')
        setMode('post')
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (response.ok) {
                const data = await response.json()
                setFile(data.url)
            } else {
                alert('Upload failed')
            }
        } catch (err) {
            console.error(err)
            alert('Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async () => {
        if (!content && mode === 'post') return
        if ((!title || !content) && mode !== 'post') return // Basic validation

        setLoading(true)
        try {
            let endpoint = '/api/feed'
            let body: any = {}

            switch (mode) {
                case 'post':
                    endpoint = '/api/feed'
                    body = { content }
                    break
                case 'memory':
                    endpoint = '/api/memory-capsules'
                    body = { title, description: content, date, mediaUrl: file, type: 'IMAGE' }
                    // Note: Full memory capsule often needs date. If generic feed post logic is simpler we might just use feed for all? 
                    // But user wants separate entities. Assuming these endpoints exist.
                    break
                case 'tradition':
                    endpoint = '/api/traditions'
                    body = { name: title, description: content, origin: extraField }
                    break
                case 'legacy':
                    endpoint = '/api/legacy-wall'
                    body = { title, description: content, category: extraField || 'General' }
                    break
                case 'vault':
                    endpoint = '/api/vault'
                    body = { title, description: content, fileUrl: file, unlockDate: date }
                    break
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (response.ok) {
                resetForm()
                onPostSuccess()
            } else {
                alert('Failed to create item')
            }
        } catch (error) {
            console.error(error)
            alert('Error creating item')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className={cn(
            "transition-colors duration-300",
            mode === 'memory' && "bg-amber-50/30 border-amber-200",
            mode === 'tradition' && "bg-rose-50/30 border-rose-200",
            mode === 'legacy' && "bg-emerald-50/30 border-emerald-200",
            mode === 'vault' && "bg-slate-50/30 border-slate-200"
        )}>
            <CardContent className="pt-4 space-y-4">

                {/* Header/Mode Indicator */}
                {mode !== 'post' && (
                    <div className="flex items-center justify-between">
                        <h3 className={cn(
                            "text-sm font-semibold uppercase tracking-wider",
                            mode === 'memory' && "text-amber-700",
                            mode === 'tradition' && "text-rose-700",
                            mode === 'legacy' && "text-emerald-700",
                            mode === 'vault' && "text-slate-700"
                        )}>
                            New {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => setMode('post')} className="h-6 w-6 p-0 rounded-full">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Dynamic Inputs */}
                <div className="space-y-3">
                    {mode !== 'post' && (
                        <Input
                            placeholder={mode === 'tradition' ? "Tradition Name" : "Title"}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="font-medium"
                        />
                    )}

                    <Textarea
                        placeholder={
                            mode === 'post' ? "Share a general update with the family..." :
                                mode === 'memory' ? "Describe this memory..." :
                                    mode === 'tradition' ? "Describe the tradition..." :
                                        mode === 'legacy' ? "What achievement or lesson would you like to share?" :
                                            "Description for the vault item..."
                        }
                        className="resize-none border-stone-200 bg-white/50 focus:bg-white transition-colors"
                        rows={mode === 'post' ? 2 : 3}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                    />

                    {/* Extra Fields based on Mode */}
                    {mode === 'memory' && (
                        <div className="flex gap-2">
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-1/2" />
                            <div className="relative w-1/2">
                                <Input type="file" onChange={handleFileUpload} className="pl-8" />
                                <ImageIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            </div>
                        </div>
                    )}

                    {mode === 'tradition' && (
                        <Input
                            placeholder="Origin (Optional)"
                            value={extraField}
                            onChange={e => setExtraField(e.target.value)}
                        />
                    )}

                    {mode === 'legacy' && (
                        <Input
                            placeholder="Category (e.g., Career, Values - Optional)"
                            value={extraField}
                            onChange={e => setExtraField(e.target.value)}
                        />
                    )}

                    {mode === 'vault' && (
                        <div className="flex gap-2">
                            <div className="relative w-1/2">
                                <Label className="text-xs mb-1 block">Unlock Date</Label>
                                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                            </div>
                            <div className="relative w-1/2">
                                <Label className="text-xs mb-1 block">Protected File</Label>
                                <Input type="file" onChange={handleFileUpload} className="pl-8" />
                                <Lock className="absolute left-2.5 bottom-2.5 h-4 w-4 text-gray-500" />
                            </div>
                        </div>
                    )}

                    {uploading && <div className="text-xs text-blue-600 animate-pulse">Uploading file...</div>}
                    {file && <div className="text-xs text-green-600 flex items-center">✓ File attached</div>}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-1">
                        <Button
                            variant={mode === 'memory' ? 'secondary' : 'ghost'}
                            size="icon"
                            onClick={() => setMode('memory')}
                            className={mode === 'memory' ? "bg-amber-100 text-amber-900" : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"}
                            title="Create Memory"
                        >
                            <Clock className="h-5 w-5" />
                        </Button>

                        <Button
                            variant={mode === 'tradition' ? 'secondary' : 'ghost'}
                            size="icon"
                            onClick={() => setMode('tradition')}
                            className={mode === 'tradition' ? "bg-rose-100 text-rose-900" : "text-rose-600 hover:text-rose-700 hover:bg-rose-50"}
                            title="Add Tradition"
                        >
                            <BookHeart className="h-5 w-5" />
                        </Button>

                        <Button
                            variant={mode === 'legacy' ? 'secondary' : 'ghost'}
                            size="icon"
                            onClick={() => setMode('legacy')}
                            className={mode === 'legacy' ? "bg-emerald-100 text-emerald-900" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"}
                            title="Add to Legacy Wall"
                        >
                            <Award className="h-5 w-5" />
                        </Button>

                        <div className="h-4 w-px bg-stone-300 mx-1" />

                        <Button
                            variant={mode === 'vault' ? 'secondary' : 'ghost'}
                            size="icon"
                            onClick={() => setMode('vault')}
                            className={mode === 'vault' ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:text-slate-700 hover:bg-slate-50"}
                            title="Add to Vault"
                        >
                            <Lock className="h-5 w-5" />
                        </Button>
                    </div>

                    <Button onClick={handleSubmit} disabled={loading || uploading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {mode === 'post' ? 'Post Update' : `Create ${mode.charAt(0).toUpperCase() + mode.slice(1)}`}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

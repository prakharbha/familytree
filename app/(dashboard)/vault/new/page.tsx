'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react'

export default function NewVaultItemPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [familyMembers, setFamilyMembers] = useState<any[]>([])

    // Fetch family members for the dropdown
    // Fetch family members and process for unique dropdown options
    useState(() => {
        Promise.all([
            fetch('/api/family/members'),
            fetch('/api/profile').then(res => res.json().catch(() => null)) // Get my profile to filter self
        ]).then(async ([membersRes, myProfile]) => {
            const edges = await membersRes.json();

            if (Array.isArray(edges)) {
                const uniquePeople = new Map<string, any>();
                const myId = myProfile?.id;

                edges.forEach((edge: any) => {
                    // Helper to add person if not me
                    const addPerson = (p: any, relType?: string) => {
                        if (p.id !== myId && !uniquePeople.has(p.id)) {
                            // If direct relation exists, use it. Otherwise 'Extended Family'
                            // This is a naive heuristic: The first time we see them, we set the type.
                            // Better: Prioritize DIRECT edges (where profileId === myId) to set the type.
                            uniquePeople.set(p.id, {
                                relatedProfileId: p.id, // standardizing for Select value
                                relatedProfile: p,
                                relationshipType: 'Extended Family'
                            });
                        }
                    }

                    // Process Source
                    addPerson(edge.profile);
                    // Process Target
                    addPerson(edge.relatedProfile);
                });

                // Second Pass: Mark direct relationships correctly
                edges.forEach((edge: any) => {
                    if (edge.profileId === myId && uniquePeople.has(edge.relatedProfileId)) {
                        const p = uniquePeople.get(edge.relatedProfileId);
                        p.relationshipType = edge.relationshipType; // Update to specific type
                    }
                    // Incoming edge treated as direct? (They added me)
                    if (edge.relatedProfileId === myId && uniquePeople.has(edge.profileId)) {
                        const p = uniquePeople.get(edge.profileId);
                        p.relationshipType = edge.relationshipType + ' (Incoming)'; // Optional context
                    }
                });

                setFamilyMembers(Array.from(uniquePeople.values()));
            }
        }).catch(err => console.error(err));
    })

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            title: formData.get('title'),
            type: formData.get('type'),
            description: formData.get('description'),
            accessRules: formData.get('accessRules'),
            unlockAt: formData.get('unlockAt') ? new Date(formData.get('unlockAt') as string).toISOString() : null,
            designatedViewerId: formData.get('designatedViewerId') === 'none' ? null : formData.get('designatedViewerId'),
        }

        try {
            const response = await fetch('/api/vault', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                router.push('/vault')
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
        <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6 flex items-center justify-center space-x-2 text-emerald-600">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Secure Environment</span>
                </div>

                <Card className="border-slate-200 shadow-md">
                    <CardHeader className="bg-slate-50 border-b border-slate-100">
                        <CardTitle className="text-2xl font-serif text-slate-900">Add to Legacy Vault</CardTitle>
                        <CardDescription className="text-slate-500">
                            Store a private item. Only you can see this unless you grant specific access.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="type">Item Type</Label>
                                <Select name="type" required defaultValue="DOCUMENT">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LETTER">Letter to Loved One</SelectItem>
                                        <SelectItem value="KEY">Digital Key / Password</SelectItem>
                                        <SelectItem value="INSTRUCTION">Instruction / Final Wish</SelectItem>
                                        <SelectItem value="DOCUMENT">Important Document</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" name="title" placeholder="e.g., Letter for my Daughter" required className="border-slate-300" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Content / Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="The content of your letter, or description of the item..."
                                    className="min-h-[150px] border-slate-300"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="designatedViewerId">Assign Heir (Optional)</Label>
                                    <Select name="designatedViewerId">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select family member" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Only Me (Private)</SelectItem>
                                            {familyMembers.map((m: any) => (
                                                <SelectItem key={m.relatedProfileId} value={m.relatedProfileId}>
                                                    {m.relatedProfile?.name} ({m.relationshipType})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unlockAt">Unlock Time (Optional)</Label>
                                    <Input
                                        type="datetime-local"
                                        name="unlockAt"
                                        id="unlockAt"
                                        className="border-slate-300"
                                        min={new Date().toISOString().slice(0, 16)}
                                    />
                                    <p className="text-xs text-slate-500">Leave blank to unlock immediately.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="accessRules">Additional Notes (Optional)</Label>
                                <Textarea
                                    id="accessRules"
                                    name="accessRules"
                                    placeholder="Any specific instructions..."
                                    className="min-h-[80px] border-slate-300"
                                />
                            </div>

                            <div className="flex justify-end space-x-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={loading}
                                    className="border-slate-300 hover:bg-slate-50"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading} className="bg-slate-900 hover:bg-slate-800">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Secure Item
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

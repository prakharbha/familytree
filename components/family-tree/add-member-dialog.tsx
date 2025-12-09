'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Plus, UserPlus } from 'lucide-react'

interface AddMemberDialogProps {
    onMemberAdded: () => void
    prefillName?: string | null
    prefillId?: string | null
}

export function AddMemberDialog({ onMemberAdded, prefillName, prefillId }: AddMemberDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Auto-open if prefill data is present
    useEffect(() => {
        if (prefillName || prefillId) {
            setOpen(true)
        }
    }, [prefillName, prefillId])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            relationshipType: formData.get('relationshipType'),
            relatedProfileId: formData.get('relatedProfileId') || null,
        }

        try {
            const response = await fetch('/api/family/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                setOpen(false)
                onMemberAdded()
            } else {
                alert('Failed to add member')
            }
        } catch (error) {
            console.error(error)
            alert('Error adding member')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Family Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Family Member</DialogTitle>
                    <DialogDescription>
                        Add a relative to your tree. If you provide an email, they can be invited later.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <input type="hidden" name="relatedProfileId" value={prefillId || ''} />
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Jane Doe"
                                className="col-span-3"
                                required
                                defaultValue={prefillName || ''}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="jane@example.com (Optional)"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="relationship" className="text-right">
                                Relation
                            </Label>
                            <div className="col-span-3">
                                <Select name="relationshipType" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select relationship" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PARENT">Parent</SelectItem>
                                        <SelectItem value="CHILD">Child</SelectItem>
                                        <SelectItem value="SIBLING">Sibling</SelectItem>
                                        <SelectItem value="SPOUSE">Spouse</SelectItem>
                                        <SelectItem value="GRANDPARENT">Grandparent</SelectItem>
                                        <SelectItem value="GRANDCHILD">Grandchild</SelectItem>
                                        <SelectItem value="AUNT_UNCLE">Aunt/Uncle</SelectItem>
                                        <SelectItem value="NIECE_NEPHEW">Niece/Nephew</SelectItem>
                                        <SelectItem value="COUSIN">Cousin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Member'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

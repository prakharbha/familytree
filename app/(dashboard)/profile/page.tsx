'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Award, BookHeart, Clock, UserPlus, User } from "lucide-react"
import { ReactionButton } from "@/components/feed/reaction-button"
import { CommentSection } from "@/components/feed/comment-section"

const PERSONA_TYPES = [
  'PERSONAL',
  'PROFESSIONAL',
  'SOCIAL',
  'GENERATIONAL',
  'SPIRITUAL',
  'CULTURAL',
]

const PERSONA_COLORS: Record<string, string> = {
  PERSONAL: 'bg-rose-100 border-rose-200 text-rose-800',
  PROFESSIONAL: 'bg-slate-100 border-slate-200 text-slate-800',
  SOCIAL: 'bg-amber-100 border-amber-200 text-amber-800',
  GENERATIONAL: 'bg-emerald-100 border-emerald-200 text-emerald-800',
  SPIRITUAL: 'bg-violet-100 border-violet-200 text-violet-800',
  CULTURAL: 'bg-orange-100 border-orange-200 text-orange-800',
}

import { useSearchParams } from 'next/navigation'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    bio: '',
    location: '',
    profession: '',
    photo: '',
  })
  const [personas, setPersonas] = useState<any[]>([])
  const supabase = createClient()
  const searchParams = useSearchParams()
  const viewProfileId = searchParams.get('id')

  const [currentUserId, setCurrentUserId] = useState<string>('')

  useEffect(() => {
    fetchProfile()
    fetchCurrentUser()
  }, [viewProfileId])

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // We need our *Profile* ID not User ID for reactions usually?
      // Schema uses profileId for reactions.
      // So we need to fetch our own profile ID.
      // Let's assume we can get it from an API or just use UserID if 1:1?
      // The API uses `requireAuth` -> `prisma.profile.findUnique({userId: user.id})`.
      // So `entityId` is fine, but `currentUserId` passed to button must be *ProfileID*.
      // I should call /api/profiles (no ID) to get MY profile id?
      try {
        const res = await fetch('/api/profiles')
        if (res.ok) {
          const myProfile = await res.json()
          setCurrentUserId(myProfile.id)
        }
      } catch (e) { }
    }
  }

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const url = viewProfileId
        ? `/api/profiles?id=${viewProfileId}`
        : '/api/profiles'

      const response = await fetch(url)

      if (response.ok) {
        const data = await response.json()
        setProfile(data)

        // Determine if read-only
        // Ideally we compare with current user ID, but for MVP:
        // If viewProfileId is present, we treat as read-only unless we knew it was us.
        // The API returns the profile. We can check if `viewProfileId` was passed.
        // Optimization: In a real app we'd compare `data.userId === currentSessionUser.id`
        // For now, if ID is in URL, we assume viewing mode.
        setIsReadOnly(!!viewProfileId)

        setFormData({
          name: data.name || '',
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
          bio: data.bio || '',
          location: data.location || '',
          profession: data.profession || '',
          photo: data.photo || '',
        })

        const initialPersonas = PERSONA_TYPES.map(type => {
          const existing = data.personas?.find((p: any) => p.type === type)
          return existing || { type, description: '', highlights: [] }
        })
        setPersonas(initialPersonas)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (isReadOnly) return
    setSaving(true)
    try {
      const profileResponse = await fetch('/api/profiles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          personas
        }),
      })

      if (profileResponse.ok) {
        const updated = await profileResponse.json()
        setProfile(updated)
        alert('Profile updated successfully!')
      } else {
        alert('Failed to update profile')
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const uploadData = new FormData()
      uploadData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setFormData({ ...formData, photo: data.url })
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('Failed to upload photo')
    }
  }

  const handlePersonaChange = (index: number, field: string, value: any) => {
    if (isReadOnly) return
    const updatedPersonas = [...personas]
    updatedPersonas[index] = { ...updatedPersonas[index], [field]: value }
    setPersonas(updatedPersonas)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  // Helper check for "Limited View" (Unregistered/Placeholder)
  const isLimitedView = profile?.isPlaceholder && isReadOnly

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Connection Banner */}
      {isReadOnly && profile?.connectionToViewer && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-4 mb-6 flex items-center justify-between">
          <span className="font-medium">
            {formData.name} {profile.connectionToViewer}
          </span>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-mix font-semibold">
          {isReadOnly ? `${formData.name || 'Profile'}` : 'Edit Profile'}
        </h1>
        <div className="flex gap-2">
          {!isReadOnly ? (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          ) : profile?.isPlaceholder ? (
            <a
              href={`mailto:?subject=Join me on Family Legacy Platform&body=Hi, I've noticed you on our family tree but you haven't joined yet. Check out your profile here: ${typeof window !== 'undefined' ? window.location.href : ''}`}
              className="inline-flex items-center justify-center rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 text-white hover:bg-emerald-700 h-10 px-6 py-2 shadow-sm animate-pulse"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Invite to Connect
            </a>
          ) : null}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        {/* Only show Tabs Navigation if NOT limited view */}
        {!isLimitedView ? (
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="memories">Memories</TabsTrigger>
            <TabsTrigger value="wall">Legacy Wall</TabsTrigger>
            <TabsTrigger value="traditions">Traditions</TabsTrigger>
          </TabsList>
        ) : (
          <div className="mb-8 border-b pb-2">
            <h2 className="text-lg font-semibold text-gray-700">Basic Details</h2>
          </div>
        )}

        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Basic Info - ALWAYS VISIBLE */}
            <div className={`lg:col-span-1 space-y-6 ${isLimitedView ? 'lg:col-span-3' : ''}`}>
              <Card>
                <CardHeader>
                  <CardTitle>Basic Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    {formData.photo ? (
                      <img src={formData.photo} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                        {isLimitedView ? <User className="w-16 h-16 opacity-50" /> : "No Photo"}
                      </div>
                    )}
                    {!isReadOnly && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="text-sm w-full"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={isReadOnly}
                      className={isReadOnly ? "bg-slate-50 border-none" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      disabled={isReadOnly}
                      className={isReadOnly ? "bg-slate-50 border-none" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      disabled={isReadOnly}
                      className={isReadOnly ? "bg-slate-50 border-none" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profession">Profession</Label>
                    <Input
                      id="profession"
                      value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      disabled={isReadOnly}
                      className={isReadOnly ? "bg-slate-50 border-none" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder={!isReadOnly ? "Short bio..." : ""}
                      disabled={isReadOnly}
                      className={isReadOnly ? "bg-slate-50 border-none resize-none" : "resize-none"}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Personas - HIDE IF LIMITED VIEW */}
            {!isLimitedView && (
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-semibold mb-4">{isReadOnly ? 'Personas' : 'Your 6 Personas'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {personas.map((persona, index) => (
                    <Card key={persona.type} className={`border-2 ${PERSONA_COLORS[persona.type] || 'bg-white'}`}>
                      <CardHeader>
                        <CardTitle className="capitalize">{persona.type.toLowerCase()} Persona</CardTitle>
                        <CardDescription className="text-gray-600">
                          {isReadOnly ? `Life as a ${persona.type.toLowerCase()}` : "Define who you are in this aspect of life."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            className={isReadOnly ? "bg-white/50 border-none resize-none" : "bg-white/50"}
                            value={persona.description || ''}
                            onChange={(e) => handlePersonaChange(index, 'description', e.target.value)}
                            placeholder={!isReadOnly ? `Describe your ${persona.type.toLowerCase()} side...` : "No description provided."}
                            disabled={isReadOnly}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Other Tabs - HIDE IF LIMITED VIEW */}
        {!isLimitedView && (
          <>
            <TabsContent value="memories">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Memory Capsules</h2>
                {profile?.memoryCapsules?.length ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {profile.memoryCapsules.map((capsule: any) => (
                      <Card key={capsule.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{capsule.title}</CardTitle>
                            <Badge variant="outline"><Clock className="w-3 h-3 mr-1" /> {new Date(capsule.date).getFullYear()}</Badge>
                          </div>
                          <CardDescription>{new Date(capsule.createdAt).toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 line-clamp-3">{capsule.description}</p>
                        </CardContent>
                        <div className="px-6 pb-4 flex items-center space-x-4 border-t pt-2">
                          <ReactionButton
                            entityId={capsule.id}
                            entityType="CAPSULE"
                            initialReactions={capsule.reactions || []}
                            currentUserId={currentUserId}
                          />
                          <CommentSection
                            entityId={capsule.id}
                            entityType="CAPSULE"
                            initialComments={capsule.comments || []}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No public memories yet.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="wall">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Legacy Wall</h2>
                {profile?.legacyWallItems?.length ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {profile.legacyWallItems.map((item: any) => (
                      <Card key={item.id} className="bg-amber-50 border-amber-200">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg text-amber-900">{item.title}</CardTitle>
                            <Award className="w-5 h-5 text-amber-600" />
                          </div>
                          <Badge className="bg-amber-200 text-amber-800 hover:bg-amber-300">{item.category}</Badge>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-amber-900">{item.description}</p>
                          {item.lesson && (
                            <div className="mt-4 p-3 bg-white/50 rounded-lg text-sm italic text-amber-800 border border-amber-100">
                              "{item.lesson}"
                            </div>
                          )}
                        </CardContent>
                        <div className="px-6 pb-4 flex items-center space-x-4 border-t pt-2">
                          <ReactionButton
                            entityId={item.id}
                            entityType="WALL"
                            initialReactions={item.reactions || []}
                            currentUserId={currentUserId}
                          />
                          <CommentSection
                            entityId={item.id}
                            entityType="WALL"
                            initialComments={item.comments || []}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No legacy items yet.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="traditions">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Traditions</h2>
                {profile?.traditions?.length ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {profile.traditions.map((tradition: any) => (
                      <Card key={tradition.id} className="border-rose-100 bg-rose-50/30">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg text-rose-900">{tradition.name}</CardTitle>
                            <BookHeart className="w-5 h-5 text-rose-500" />
                          </div>
                          {tradition.origin && <CardDescription>Origin: {tradition.origin}</CardDescription>}
                        </CardHeader>
                        <CardContent onClick={() => { }}> {/* div wrapper to avoid invalid nesting? CardContent is usually div */}
                          <p className="text-sm text-gray-700">{tradition.description}</p>
                        </CardContent>
                        <div className="px-6 pb-4 flex items-center space-x-4 border-t pt-2">
                          <ReactionButton
                            entityId={tradition.id}
                            entityType="TRADITION"
                            initialReactions={tradition.reactions || []}
                            currentUserId={currentUserId}
                          />
                          <CommentSection
                            entityId={tradition.id}
                            entityType="TRADITION"
                            initialComments={tradition.comments || []}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No traditions listed.</p>
                )}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}

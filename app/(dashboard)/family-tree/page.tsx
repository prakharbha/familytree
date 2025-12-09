'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddMemberDialog } from '@/components/family-tree/add-member-dialog'
import TreeVisualizer from '@/components/family-tree/tree-visualizer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { List, GitGraph, User, UserPlus } from 'lucide-react'

import { useSearchParams } from 'next/navigation'

export default function FamilyTreePage() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>('')

  const searchParams = useSearchParams()
  const addId = searchParams.get('add')
  const addName = searchParams.get('name')

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const profile = await res.json()
        setCurrentUserId(profile.userId) // Visualizer needs userId
      }
    } catch (e) { console.error(e) }
  }

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/family/members')
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      }
    } catch (error) {
      console.error('Failed to fetch members', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
    fetchMembers()
  }, [])

  return (
    <div className="min-h-screen bg-stone-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-serif text-gray-900">Family Tree</h1>
          <AddMemberDialog
            onMemberAdded={fetchMembers}
            prefillId={addId}
            prefillName={addName}
          />
        </div>

        <Tabs defaultValue="list" className="w-full">
          <div className="flex justify-start mb-6">
            <TabsList>
              <TabsTrigger value="list" className="flex items-center">
                <List className="w-4 h-4 mr-2" /> List View
              </TabsTrigger>
              <TabsTrigger value="tree" className="flex items-center">
                <GitGraph className="w-4 h-4 mr-2" /> Visual Tree
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="list">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.length === 0 && !loading && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No family members added yet. Start by adding your parents or siblings!
                </div>
              )}
              {members.map((member) => (
                <Card key={member.id} className="hover:shadow-md transition-shadow group relative">
                  <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Invite Option */}
                    <a
                      href={`mailto:?subject=Join me on Family Legacy Platform&body=Hi, I've added you to our family tree. Join here: ${typeof window !== 'undefined' ? window.location.origin : ''}`}
                      className="p-2 bg-white rounded-full shadow-sm border hover:bg-slate-50 text-slate-500 hover:text-blue-600 block"
                      title="Invite to connect"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <UserPlus className="w-4 h-4" />
                    </a>
                  </div>
                  <a href={`/profile?id=${member.relatedProfileId}`} className="block">
                    <CardHeader className="flex flex-row items-center gap-4 py-4">
                      <div className="h-10 w-10 bg-stone-200 rounded-full flex items-center justify-center overflow-hidden">
                        {member.relatedProfile?.photo ? (
                          <img src={member.relatedProfile.photo} alt={member.relatedProfile.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="text-stone-500" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {member.relatedProfile?.name || 'Unknown'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">{member.relationshipType.toLowerCase()}</p>
                      </div>
                    </CardHeader>
                  </a>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tree">
            <div className="bg-white rounded-xl shadow-sm h-[600px] border">
              <TreeVisualizer members={members} currentUserId={currentUserId} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

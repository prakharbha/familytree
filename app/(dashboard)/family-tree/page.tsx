'use client'

import { useState, useEffect, useCallback } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const nodeTypes = {
  custom: ({ data }: any) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-300 min-w-[120px]">
      <div className="font-semibold text-sm">{data.label}</div>
    </div>
  ),
}

export default function FamilyTreePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchEmail, setSearchEmail] = useState('')
  const [relationshipType, setRelationshipType] = useState('PARENT')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadFamilyTree()
  }, [])

  const loadFamilyTree = async () => {
    try {
      const response = await fetch('/api/family-tree')
      if (response.ok) {
        const familyMembers = await response.json()
        // Convert to React Flow nodes and edges
        const flowNodes: Node[] = []
        const flowEdges: Edge[] = []

        // Add current user node
        const profileResponse = await fetch('/api/profiles')
        if (profileResponse.ok) {
          const profile = await profileResponse.json()
          flowNodes.push({
            id: profile.id,
            type: 'custom',
            position: { x: 400, y: 300 },
            data: { label: profile.name },
          })
        }

        // Add family member nodes
        familyMembers.forEach((member: any, index: number) => {
          flowNodes.push({
            id: member.relatedProfile.id,
            type: 'custom',
            position: { x: 200 + index * 200, y: 100 + index * 150 },
            data: { label: member.relatedProfile.name },
          })

          flowEdges.push({
            id: `e${member.profileId}-${member.relatedProfileId}`,
            source: member.profileId,
            target: member.relatedProfileId,
            label: member.relationshipType,
          })
        })

        setNodes(flowNodes)
        setEdges(flowEdges)
      }
    } catch (error) {
      console.error('Failed to load family tree:', error)
    }
  }

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const handleSendRequest = async () => {
    // First, find profile by email
    try {
      const response = await fetch(`/api/profiles/search?email=${searchEmail}`)
      if (!response.ok) {
        alert('User not found')
        return
      }

      const targetProfile = await response.json()

      const requestResponse = await fetch('/api/family-tree/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: targetProfile.id,
          relationshipType,
          message,
        }),
      })

      if (requestResponse.ok) {
        alert('Connection request sent!')
        setShowAddForm(false)
        setSearchEmail('')
        setMessage('')
      } else {
        alert('Failed to send request')
      }
    } catch (error) {
      console.error('Failed to send request:', error)
      alert('Failed to send request')
    }
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-mix font-semibold">Family Tree</h1>
            <p className="text-gray-600">Visualize your family connections</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : 'Add Family Member'}
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-4 animate-fade-in-up">
            <CardHeader>
              <CardTitle>Send Connection Request</CardTitle>
              <CardDescription>Invite a family member to connect</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="family@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Relationship</label>
                <select
                  value={relationshipType}
                  onChange={(e) => setRelationshipType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="PARENT">Parent</option>
                  <option value="CHILD">Child</option>
                  <option value="SIBLING">Sibling</option>
                  <option value="SPOUSE">Spouse</option>
                  <option value="GRANDPARENT">Grandparent</option>
                  <option value="GRANDCHILD">Grandchild</option>
                  <option value="AUNT_UNCLE">Aunt/Uncle</option>
                  <option value="NIECE_NEPHEW">Niece/Nephew</option>
                  <option value="COUSIN">Cousin</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Message (Optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="Add a personal message..."
                />
              </div>
              <Button onClick={handleSendRequest} className="w-full">
                Send Request
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <Background />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  )
}


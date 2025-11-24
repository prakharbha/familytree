'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  EdgeTypes,
  MarkerType,
  BaseEdge,
  EdgeProps,
  getBezierPath,
  getSmoothStepPath,
  ReactFlowProvider,
  useReactFlow,
  Handle,
  Position,
  Viewport,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// Custom Edge Components for different relationship types
const SpouseEdge = ({ id, sourceX, sourceY, targetX, targetY, markerEnd, style }: EdgeProps) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })
  
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ ...style, stroke: '#ec4899', strokeWidth: 3, strokeDasharray: '8,4' }}
      />
    </>
  )
}

const ParentChildEdge = ({ id, sourceX, sourceY, targetX, targetY, markerEnd, style, label, labelStyle, labelBgStyle, labelBgPadding, labelBgBorderRadius }: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })
  
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ ...style, stroke: '#3b82f6', strokeWidth: 2.5 }}
      />
      {label && (
        <g>
          <rect
            x={labelX - (labelBgPadding?.[0] || 4)}
            y={labelY - 10}
            width={(label as string).length * 7 + (labelBgPadding?.[0] || 4) * 2}
            height={20}
            fill={labelBgStyle?.fill || 'white'}
            fillOpacity={labelBgStyle?.fillOpacity || 0.95}
            stroke={labelBgStyle?.stroke || '#3b82f6'}
            strokeWidth={labelBgStyle?.strokeWidth || 1}
            rx={labelBgBorderRadius || 4}
            ry={labelBgBorderRadius || 4}
          />
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={labelStyle?.fill || '#3b82f6'}
            fontSize={labelStyle?.fontSize || 12}
            fontWeight={labelStyle?.fontWeight || 600}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {label}
          </text>
        </g>
      )}
    </>
  )
}

const SiblingEdge = ({ id, sourceX, sourceY, targetX, targetY, markerEnd, style, label, labelStyle, labelBgStyle, labelBgPadding, labelBgBorderRadius }: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 0,
  })
  
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ ...style, stroke: '#10b981', strokeWidth: 2 }}
      />
      {label && (
        <g>
          <rect
            x={labelX - (labelBgPadding?.[0] || 4)}
            y={labelY - 10}
            width={(label as string).length * 7 + (labelBgPadding?.[0] || 4) * 2}
            height={20}
            fill={labelBgStyle?.fill || 'white'}
            fillOpacity={labelBgStyle?.fillOpacity || 0.95}
            stroke={labelBgStyle?.stroke || '#10b981'}
            strokeWidth={labelBgStyle?.strokeWidth || 1}
            rx={labelBgBorderRadius || 4}
            ry={labelBgBorderRadius || 4}
          />
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={labelStyle?.fill || '#10b981'}
            fontSize={labelStyle?.fontSize || 12}
            fontWeight={labelStyle?.fontWeight || 600}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {label}
          </text>
        </g>
      )}
    </>
  )
}

const DefaultEdge = ({ id, sourceX, sourceY, targetX, targetY, markerEnd, style, label, labelStyle, labelBgStyle, labelBgPadding, labelBgBorderRadius }: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })
  
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ ...style, stroke: '#6b7280', strokeWidth: 2 }}
      />
      {label && (
        <g>
          <rect
            x={labelX - (labelBgPadding?.[0] || 4)}
            y={labelY - 10}
            width={(label as string).length * 7 + (labelBgPadding?.[0] || 4) * 2}
            height={20}
            fill={labelBgStyle?.fill || 'white'}
            fillOpacity={labelBgStyle?.fillOpacity || 0.95}
            stroke={labelBgStyle?.stroke || '#6b7280'}
            strokeWidth={labelBgStyle?.strokeWidth || 1}
            rx={labelBgBorderRadius || 4}
            ry={labelBgBorderRadius || 4}
          />
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={labelStyle?.fill || '#6b7280'}
            fontSize={labelStyle?.fontSize || 12}
            fontWeight={labelStyle?.fontWeight || 600}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {label}
          </text>
        </g>
      )}
    </>
  )
}

// Text Annotation Node Type
const TextAnnotationNode = ({ data, selected, id }: any) => {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(data.text || '')

  const handleDoubleClick = () => {
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (data.onTextChange) {
      data.onTextChange(id, text)
    }
  }

  return (
    <div
      className={`px-3 py-2 bg-white border-2 rounded-lg shadow-md min-w-[100px] relative ${
        selected ? 'border-blue-500' : 'border-gray-300'
      }`}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleBlur()
            }
          }}
          autoFocus
          className="w-full outline-none text-sm"
        />
      ) : (
        <div className="text-sm text-gray-700 font-medium">{text || 'Double click to edit'}</div>
      )}
    </div>
  )
}

const nodeTypes = {
  custom: ({ data, selected }: any) => {
    const isPlaceholder = data.isPlaceholder || data.email?.includes('@family.local') || data.email?.startsWith('placeholder-')
    
    return (
      <div className={`px-4 py-3 shadow-lg rounded-lg bg-white border-2 min-w-[140px] hover:border-gray-400 transition-colors relative ${
        selected ? 'border-blue-500' : 'border-gray-200'
      } ${isPlaceholder ? 'opacity-90' : ''}`}>
        {/* Connection handles - visible dots on all sides */}
        <Handle 
          type="target" 
          position={Position.Top} 
          id="top-target"
          className="!w-4 !h-4 !bg-blue-500 !border-2 !border-white !rounded-full hover:!bg-blue-600 hover:!scale-125 transition-all" 
          style={{ top: -8 }}
        />
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="bottom-source"
          className="!w-4 !h-4 !bg-green-500 !border-2 !border-white !rounded-full hover:!bg-green-600 hover:!scale-125 transition-all" 
          style={{ bottom: -8 }}
        />
        <Handle 
          type="target" 
          position={Position.Left} 
          id="left-target"
          className="!w-4 !h-4 !bg-purple-500 !border-2 !border-white !rounded-full hover:!bg-purple-600 hover:!scale-125 transition-all" 
          style={{ left: -8 }}
        />
        <Handle 
          type="source" 
          position={Position.Right} 
          id="right-source"
          className="!w-4 !h-4 !bg-orange-500 !border-2 !border-white !rounded-full hover:!bg-orange-600 hover:!scale-125 transition-all" 
          style={{ right: -8 }}
        />
        {data.photo && (
          <img 
            src={data.photo} 
            alt={data.label}
            className="w-10 h-10 rounded-full mx-auto mb-2 object-cover"
          />
        )}
        <div className="font-semibold text-sm text-center">{data.label}</div>
        {isPlaceholder && data.hasRealEmail && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (data.email && data.onInvite) {
                  data.onInvite(data.email)
                }
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium w-full"
            >
              📧 Invite to Join
            </button>
          </div>
        )}
        {isPlaceholder && !data.hasRealEmail && (
          <div className="mt-1">
            <span className="text-xs text-gray-500 italic">Unregistered</span>
          </div>
        )}
      </div>
    )
  },
  textAnnotation: TextAnnotationNode,
}

const edgeTypes: EdgeTypes = {
  spouse: SpouseEdge,
  parentChild: ParentChildEdge,
  sibling: SiblingEdge,
  default: DefaultEdge,
}

// Memoize nodeTypes and edgeTypes to prevent React Flow warnings
const memoizedNodeTypes = nodeTypes
const memoizedEdgeTypes = edgeTypes

function FamilyTreeContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchEmail, setSearchEmail] = useState('')
  const [relationshipType, setRelationshipType] = useState('PARENT')
  const [message, setMessage] = useState('')
  const [isAddingText, setIsAddingText] = useState(false)
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 0.8 })
  const { screenToFlowPosition, setViewport: setReactFlowViewport, getViewport } = useReactFlow()
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleInvite = useCallback((email: string) => {
    if (email && !email.includes('@family.local') && !email.startsWith('placeholder-')) {
      // Send invitation email
      window.location.href = `mailto:${email}?subject=Join our Family Tree&body=You've been added to our family tree! Please sign up to join: ${window.location.origin}/signup`
    }
  }, [])

  const saveState = useCallback(async () => {
    try {
      // Get current viewport from ReactFlow instance
      const currentViewport = getViewport()
      const state = {
        nodes: nodes.map(node => ({
          id: node.id,
          position: node.position,
          type: node.type,
          data: node.data, // Include data for text annotations
        })),
        viewport: currentViewport,
      }

      const response = await fetch('/api/family-tree/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      })
      
      if (!response.ok) {
        console.error('Failed to save state:', await response.text())
      }
    } catch (error) {
      console.error('Failed to save state:', error)
    }
  }, [nodes, getViewport])

  const loadSavedState = useCallback(async () => {
    try {
      const response = await fetch('/api/family-tree/state')
      if (response.ok) {
        const savedState = await response.json()
        if (savedState) {
          // Restore viewport first
          if (savedState.viewport) {
            setViewport(savedState.viewport)
            // Use setTimeout to ensure ReactFlow is ready
            setTimeout(() => {
              setReactFlowViewport(savedState.viewport, { duration: 0 })
            }, 100)
          }
          
          // Restore node positions and data
          if (savedState.nodes && savedState.nodes.length > 0) {
            setTimeout(() => {
              setNodes((currentNodes) => {
                // Merge saved positions with current nodes
                return currentNodes.map((node) => {
                  const savedNode = savedState.nodes.find((n: any) => n.id === node.id)
                  if (savedNode) {
                    return {
                      ...node,
                      position: savedNode.position || node.position,
                      data: savedNode.data || node.data, // Preserve text annotation data
                    }
                  }
                  return node
                })
              })
            }, 300)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load saved state:', error)
    }
  }, [setNodes, setReactFlowViewport])

  // Auto-save state every 1 second when nodes or viewport changes
  useEffect(() => {
    if (nodes.length > 0) {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      // Set new timeout to save after 1 second of inactivity
      saveTimeoutRef.current = setTimeout(() => {
        saveState()
      }, 1000)
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [nodes, edges, viewport, saveState])

  const onMove = useCallback((_event: any, newViewport: Viewport) => {
    setViewport(newViewport)
  }, [])

  const onMoveStart = useCallback(() => {
    // Clear save timeout when user starts moving
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  const onMoveEnd = useCallback(() => {
    // Save after user stops moving (1 second delay)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveState()
    }, 1000)
  }, [saveState])

  const loadFamilyTree = useCallback(async () => {
    try {
      // Get current user profile first
      const profileResponse = await fetch('/api/profiles')
      if (!profileResponse.ok) {
        console.error('Failed to load profile')
        return
      }
      const currentProfile = await profileResponse.json()

      // Get family members
      const response = await fetch('/api/family-tree')
      if (!response.ok) {
        console.error('Failed to load family tree')
        return
      }
      
      const familyMembers = await response.json()
      
      // Convert to React Flow nodes and edges
      const flowNodes: Node[] = []
      const flowEdges: Edge[] = []

      // Add current user node (center) - always show this
      flowNodes.push({
        id: String(currentProfile.id),
        type: 'custom',
        position: { x: 400, y: 300 },
        data: { 
          label: currentProfile.name || 'You', 
          photo: currentProfile.photo 
        },
      })

      console.log('Current user node added:', {
        id: currentProfile.id,
        name: currentProfile.name,
        totalNodes: flowNodes.length
      })

      // Add family member nodes in a tree layout
      if (familyMembers && familyMembers.length > 0) {
        console.log('Adding family members:', familyMembers.length)
        const nodePositions: { [key: string]: { x: number; y: number } } = {}
        nodePositions[String(currentProfile.id)] = { x: 400, y: 300 }

        // Calculate positions in a tree structure
        familyMembers.forEach((member: any, index: number) => {
          const relatedId = String(member.relatedProfile.id)
          const profileId = String(member.profileId)
          
          // Avoid duplicate nodes
          if (!nodePositions[relatedId]) {
            // Arrange in a circle around the center
            const angle = (index * 2 * Math.PI) / familyMembers.length
            const radius = 250
            const x = 400 + radius * Math.cos(angle)
            const y = 300 + radius * Math.sin(angle)
            
            nodePositions[relatedId] = { x, y }
            
            // Check if this is a placeholder profile
            const userEmail = (member.relatedProfile as any).user?.email || ''
            const isPlaceholder = userEmail.includes('@family.local') || userEmail.startsWith('placeholder-')
            const hasRealEmail = userEmail && !isPlaceholder
            
            flowNodes.push({
              id: relatedId,
              type: 'custom',
              position: { x, y },
              data: { 
                label: member.relatedProfile.name,
                photo: member.relatedProfile.photo,
                email: userEmail,
                isPlaceholder,
                hasRealEmail,
                onInvite: handleInvite,
              },
            })
          }

          // Create edge with appropriate type based on relationship
          let edgeType = 'default'
          let edgeColor = '#6b7280'
          
          if (member.relationshipType === 'SPOUSE') {
            edgeType = 'spouse'
            edgeColor = '#ec4899'
          } else if (member.relationshipType === 'PARENT' || member.relationshipType === 'CHILD' || 
                     member.relationshipType === 'GRANDPARENT' || member.relationshipType === 'GRANDCHILD') {
            edgeType = 'parentChild'
            edgeColor = '#3b82f6'
          } else if (member.relationshipType === 'SIBLING') {
            edgeType = 'sibling'
            edgeColor = '#10b981'
          }

          // Ensure we have valid source and target (use profileId from member, not currentProfile)
          const sourceId = String(member.profileId)
          const targetId = String(member.relatedProfileId)
          
          // Check if both nodes exist before creating edge
          const sourceExists = flowNodes.some(n => String(n.id) === sourceId)
          const targetExists = flowNodes.some(n => String(n.id) === targetId)
          
          if (sourceExists && targetExists) {
            const relationshipLabel = member.relationshipType
              .replace(/_/g, ' ')
              .toLowerCase()
              .replace(/\b\w/g, (l: string) => l.toUpperCase())
            
            flowEdges.push({
              id: `e${sourceId}-${targetId}`,
              source: sourceId,
              target: targetId,
              type: edgeType,
              label: relationshipLabel,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: edgeColor,
                width: 20,
                height: 20,
              },
              animated: false,
              style: { 
                stroke: edgeColor, 
                strokeWidth: 2.5,
              },
              labelStyle: { 
                fill: edgeColor, 
                fontWeight: 600, 
                fontSize: 12,
                background: 'white',
                padding: '2px 6px',
              },
              labelBgStyle: { 
                fill: 'white', 
                fillOpacity: 0.95,
                stroke: edgeColor,
                strokeWidth: 1,
              },
              labelBgPadding: [4, 8],
              labelBgBorderRadius: 4,
            })
          } else {
            console.warn(`Edge skipped: source or target node missing`, { 
              sourceId, 
              targetId, 
              sourceExists, 
              targetExists,
              availableNodes: flowNodes.map(n => n.id)
            })
          }
        })
      }

      console.log('Family tree loaded:', {
        nodes: flowNodes.length,
        edges: flowEdges.length,
        nodeIds: flowNodes.map(n => n.id),
        nodeLabels: flowNodes.map(n => n.data.label),
        edgeSources: flowEdges.map(e => e.source),
        edgeTargets: flowEdges.map(e => e.target),
        currentProfile: currentProfile.name,
        familyMembersCount: familyMembers?.length || 0,
      })

      // Always set nodes - should have at least current user node
      if (flowNodes.length > 0) {
        setNodes(flowNodes)
        setEdges(flowEdges)
      } else {
        console.error('No nodes created! This should not happen.')
      }
    } catch (error) {
      console.error('Failed to load family tree:', error)
    }
  }, [handleInvite, setNodes, setEdges])

  useEffect(() => {
    loadFamilyTree()
    // Load saved state after a short delay to ensure ReactFlow is initialized
    setTimeout(() => {
      loadSavedState()
    }, 300)
  }, [loadFamilyTree, loadSavedState])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (isAddingText) {
        const reactFlowBounds = (event.currentTarget as HTMLElement).getBoundingClientRect()
        const x = event.clientX - reactFlowBounds.left
        const y = event.clientY - reactFlowBounds.top
        
        // Convert screen coordinates to flow coordinates
        const position = screenToFlowPosition({ x, y })

        const textId = `text-${Date.now()}`
        const newNode: Node = {
          id: textId,
          type: 'textAnnotation',
          position,
          data: {
            text: 'New annotation',
            onTextChange: (nodeId: string, newText: string) => {
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === nodeId ? { ...node, data: { ...node.data, text: newText } } : node
                )
              )
            },
          },
        }

        setNodes((nds) => [...nds, newNode])
        setIsAddingText(false)
      }
    },
    [isAddingText, setNodes, screenToFlowPosition]
  )

  const handleAddFamilyMember = async () => {
    try {
      if (!searchEmail && !message) {
        alert('Please enter an email address or name')
        return
      }

      // Determine name - use message field if provided, otherwise use email prefix
      const memberName = message || searchEmail?.split('@')[0] || 'Family Member'

      // Add family member - will create placeholder if user doesn't exist
      const addResponse = await fetch('/api/family-tree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: searchEmail || undefined,
          name: memberName,
          relationshipType,
          message: message && message !== memberName ? message : undefined,
          role: 'CONTRIBUTOR',
        }),
      })

      if (addResponse.ok) {
        const result = await addResponse.json()
        const userEmail = result.relatedProfile?.user?.email || ''
        const isPlaceholder = userEmail.includes('@family.local') || userEmail.startsWith('placeholder-')
        
        if (isPlaceholder && searchEmail && !searchEmail.includes('@family.local')) {
          alert(`Family member "${memberName}" added! They will appear in your tree. Click on their node to invite them to join.`)
        } else {
          alert('Family member added successfully!')
        }
        
        setShowAddForm(false)
        setSearchEmail('')
        setMessage('')
        setRelationshipType('PARENT')
        // Reload the family tree
        loadFamilyTree()
      } else {
        const errorData = await addResponse.json()
        alert(errorData.error || 'Failed to add family member')
      }
    } catch (error) {
      console.error('Failed to add family member:', error)
      alert('Failed to add family member')
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
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                setIsAddingText(!isAddingText)
                setShowAddForm(false)
              }}
            >
              {isAddingText ? 'Cancel' : 'Add Text Annotation'}
            </Button>
            <Button onClick={() => {
              setShowAddForm(!showAddForm)
              setIsAddingText(false)
            }}>
              {showAddForm ? 'Cancel' : 'Add Family Member'}
            </Button>
          </div>
        </div>

        {/* Connection Type Legend */}
        <div className="mb-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-pink-500 border-dashed border-2 border-pink-500"></div>
            <span className="text-gray-700">Spouse</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-500"></div>
            <span className="text-gray-700">Parent/Child</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-green-500"></div>
            <span className="text-gray-700">Sibling</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-gray-500"></div>
            <span className="text-gray-700">Other</span>
          </div>
        </div>

        {isAddingText && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              Click anywhere on the canvas to add a text annotation. Double-click the annotation to edit it.
            </p>
          </div>
        )}

        {showAddForm && (
          <Card className="mb-4 animate-fade-in-up">
            <CardHeader>
              <CardTitle>Add Family Member</CardTitle>
              <CardDescription>Add a family member to your tree. If they're not registered, you can invite them later.</CardDescription>
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
                <label className="text-sm font-medium">Name {!searchEmail && '(Required)'}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder={searchEmail ? "Add a personal message or name..." : "Enter the family member's name (required if no email)"}
                />
              </div>
              <Button onClick={handleAddFamilyMember} className="w-full">
                Add Family Member
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex-1 relative">
        {nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="max-w-md">
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600 mb-4">Loading family tree...</p>
                <p className="text-sm text-gray-500">If this persists, check the browser console for errors.</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={memoizedNodeTypes}
            edgeTypes={memoizedEdgeTypes}
            fitView={false}
            defaultViewport={viewport}
            onMove={onMove}
            onMoveStart={onMoveStart}
            onMoveEnd={onMoveEnd}
            connectionLineStyle={{ stroke: '#666', strokeWidth: 2 }}
            defaultEdgeOptions={{
              style: { strokeWidth: 2.5 },
              animated: false,
            }}
            deleteKeyCode={['Backspace', 'Delete']}
            onPaneClick={handlePaneClick}
            style={{ cursor: isAddingText ? 'crosshair' : 'default' }}
            proOptions={{ hideAttribution: true }}
          >
            <Controls />
            <Background 
              variant="dots" 
              gap={20} 
              size={1.5}
              color="#d1d5db"
              style={{ backgroundColor: '#fafafa' }}
            />
            <MiniMap 
              nodeColor="#3b82f6"
              maskColor="rgba(0, 0, 0, 0.1)"
            />
          </ReactFlow>
        )}
      </div>
    </div>
  )
}

export default function FamilyTreePage() {
  return (
    <ReactFlowProvider>
      <FamilyTreeContent />
    </ReactFlowProvider>
  )
}


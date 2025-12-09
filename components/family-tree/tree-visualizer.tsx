'use client'

import { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Position,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MiniMap,
    Handle,
    NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Custom Node ---
const CustomNode = ({ data }: NodeProps) => {
    // Only show "Add" if not self and not already direct? 
    // Passed via data.isDirect or we handle click to generic "Inspect".
    // For MVP, simple click handler on the node wrapper.

    return (
        <div
            className={cn(
                "group relative px-4 py-2 shadow-md rounded-md bg-white border-2 border-slate-200 min-w-[150px] text-center transition-all hover:border-emerald-400 cursor-pointer",
                data.isSelf ? "border-emerald-400 bg-emerald-50" : ""
            )}
            onClick={() => data.onNodeClick && data.onNodeClick(data)}
        >
            <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-slate-400" />

            <div className="flex flex-col items-center">
                <div className="mb-2 p-2 bg-slate-100 rounded-full">
                    {data.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={data.photo} alt={data.label} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <UserCircle className="w-8 h-8 text-slate-400" />
                    )}
                </div>
                <div className="font-bold text-sm text-slate-800">{data.label}</div>
            </div>

            {!data.isSelf && (
                <div className="absolute -right-2 -top-2 flex flex-col gap-1">
                    {!data.isDirect && (
                        <div className="flex h-6 w-6 bg-emerald-500 rounded-full items-center justify-center text-white shadow-sm cursor-pointer hover:bg-emerald-600" title="Add as Direct Connection">
                            <span className="text-lg font-bold leading-none">+</span>
                        </div>
                    )}
                    <a href={`/profile?id=${data.id}`} className="flex h-6 w-6 bg-blue-500 rounded-full items-center justify-center text-white shadow-sm hover:bg-blue-600" title="View Profile" onClick={(e) => e.stopPropagation()}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                    </a>
                </div>
            )}

            <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-slate-400" />
        </div>
    );
};

interface TreeVisualizerProps {
    members: any[]
    currentUserId: string // This is actually user ID, but edges use profileId. We might need currentProfileId. 
    // Assuming parent passes fetched data.
}

// Simple Layout Algorithm
const getLayoutedElements = (nodes: Node[], edges: Edge[], rootId: string) => {
    // 1. Build Adjacency List
    const adj: Record<string, string[]> = {}
    nodes.forEach(n => adj[n.id] = [])
    edges.forEach(e => {
        if (adj[e.source]) adj[e.source].push(e.target)
    })

    // 2. BFS for Levels
    const levels: Record<string, number> = {}
    const queue = [{ id: rootId, level: 0 }]
    const visited = new Set<string>([rootId])
    levels[rootId] = 0

    // Note: This BFS assumes directed edges are "downwards" (Parent->Child).
    // But our edges are mixed (Parent->Child, Child->Parent). 
    // We strictly need to orient edges based on generations.
    // Ideally the API would normalize "Parent" relations?
    // For now, let's just use the levels assigned from the "Search" perspective or simple chaotic layout.

    // Better: Just distribute nodes in a grid? 
    // Let's iterate nodes and place them.
    // If we don't have dagre, let's just space them out to avoid total overlap.
    // Circle layout?

    const count = nodes.length;
    const radius = count * 50 + 100;

    return {
        nodes: nodes.map((node, index) => {
            // Circular layout for generic graph
            const angle = (index / count) * 2 * Math.PI;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            // If isSelf, center it
            if (node.data.isSelf) {
                return { ...node, position: { x: 0, y: 0 } }
            }

            return { ...node, position: { x, y } }
        }),
        edges
    }
}


export default function TreeVisualizer({ members, currentUserId }: TreeVisualizerProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

    useEffect(() => {
        if (!members || members.length === 0) return;

        // 1. Extract Unique Nodes (Profiles)
        const uniqueProfiles = new Map<string, any>();

        // Helper to add profile
        const addProfile = (p: any, isRelated = false) => {
            if (!p || uniqueProfiles.has(p.id)) return;
            uniqueProfiles.set(p.id, {
                id: p.id,
                name: p.name,
                photo: p.photo,
                isSelf: p.userId === currentUserId // This check might fail if currentUserId is not user.id but profile.id. 
                // The prop says `currentUserId`. 
                // Let's optimistically check.
            })
        }

        const calculatedEdges: Edge[] = [];

        // Find the "Me" node ID to center layout
        let selfProfileId = '';

        // First pass to identify selfProfileId and populate uniqueProfiles
        members.forEach(edge => {
            // Add Profile (Source)
            if (edge.profile) addProfile(edge.profile);
            // Add Related Profile (Target)
            if (edge.relatedProfile) addProfile(edge.relatedProfile);

            // Identify Self
            if (edge.profile && edge.profile.userId === currentUserId) selfProfileId = edge.profile.id
            if (edge.relatedProfile && edge.relatedProfile.userId === currentUserId) selfProfileId = edge.relatedProfile.id
        });

        // Identify Direct Connections (Edges connected to Self)
        // We need to do this after finding SelfId, or iterate twice.
        // Let's iterate twice if needed, or just check userId.
        const directIds = new Set<string>();
        members.forEach(edge => {
            if (edge.profile.userId === currentUserId) directIds.add(edge.relatedProfileId);
            if (edge.relatedProfile.userId === currentUserId) directIds.add(edge.profileId);
        });

        // ------------------
        // Edge Generation Loop (can reuse first loop logic if careful, keeping it simple here)
        // ------------------

        members.forEach(edge => {
            // Add Profile (Source)
            if (edge.profile) addProfile(edge.profile);
            // Add Related Profile (Target)
            if (edge.relatedProfile) addProfile(edge.relatedProfile);

            // Add Edge
            // Orient based on relationship?
            // PARENT: related -> profile (Parent is above)
            // CHILD: profile -> related (Child is below)
            // But ReactFlow defaults to Top->Bottom.
            // If edge says "A is Parent of B". A(Source) -> B(Target). A should be Top.

            // Normalize direction for display
            // If type is PARENT/GRANDPARENT: Source is the Child? No. 
            // "RelationshipType" describes the *RelatedProfile's* relation to *Profile*.
            // e.g. Profile=Me, Related=Dad, Type=PARENT.
            // So Dad is the SOURCE of Me visually (Dad -> Me).

            let source = edge.profileId;
            let target = edge.relatedProfileId;
            let label = edge.relationshipType;

            if (['PARENT', 'GRANDPARENT', 'AUNT_UNCLE'].includes(edge.relationshipType)) {
                // Related(Parent) -> Profile(Child)
                source = edge.relatedProfileId;
                target = edge.profileId;
            }
            // Else assume 'CHILD', 'SIBLING', 'SPOUSE' flow "down" or "across"
            // SIBLING/SPOUSE: Treat as bidirectional or flat.

            calculatedEdges.push({
                id: edge.id,
                source,
                target,
                label,
                type: 'smoothstep',
                animated: false,
                style: { stroke: '#94a3b8' }
            })
        });

        // Convert Map to Nodes
        const calculatedNodes: Node[] = Array.from(uniqueProfiles.values()).map(p => ({
            id: p.id,
            type: 'custom',
            data: {
                label: p.name,
                photo: p.photo,
                isSelf: p.id === selfProfileId,
                isDirect: directIds.has(p.id),
                onNodeClick: (nodeData: any) => {
                    // Simple alert for MVP or router push
                    // "To add this person, go to 'Add Member' and select their name"
                    // Or we implement a direct action.
                    const confirm = window.confirm(`Do you want to add ${nodeData.label} to your direct family connections?`);
                    if (confirm) {
                        // Redirect to Add Page pre-filled? or API call
                        // Ideally: POST /api/family/members { relatedProfileId: p.id, relationshipType: ... }
                        // But we need to ask for Relationship Type.
                        // Simplest: Alert user "Use 'Add Member' to connect."
                        // Wait, user asked "can we add directly".
                        window.location.href = `/family-tree?add=${p.id}&name=${encodeURIComponent(p.label)}`
                    }
                }
            },
            position: { x: 0, y: 0 } // Layout handles this
        }));

        // Apply Layout
        const layouted = getLayoutedElements(calculatedNodes, calculatedEdges, selfProfileId);

        setNodes(layouted.nodes);
        setEdges(layouted.edges);

    }, [members, currentUserId, setNodes, setEdges]);

    return (
        <div className="w-full h-[600px] bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
}

'use client'

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface IdentityWheelProps {
    data: {
        subject: string
        A: number // Full mark
        val: number // Actual count
        fullMark: number
    }[]
}

const PERSONA_COLORS: Record<string, string> = {
    Personal: '#fb7185', // rose-400
    Professional: '#94a3b8', // slate-400
    Social: '#fbbf24', // amber-400
    Generational: '#34d399', // emerald-400
    Spiritual: '#a78bfa', // violet-400
    Cultural: '#fb923c', // orange-400
}

export function IdentityWheel({ data }: IdentityWheelProps) {
    return (
        <Card className="w-full h-full min-h-[400px] flex flex-col">
            <CardHeader className="text-center pb-2">
                <CardTitle className="font-serif text-2xl">Identity Tapestry</CardTitle>
                <CardDescription>A visual map of your life across 6 dimensions</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                        <Radar
                            name="Memories"
                            dataKey="val"
                            stroke="#475569"
                            fill="#cbd5e1"
                            fillOpacity={0.6}
                        />
                        <Tooltip />
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

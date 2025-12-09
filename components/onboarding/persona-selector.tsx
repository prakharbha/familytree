'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Check, ChevronRight, User, Briefcase, Users, Heart, Sparkles, Globe } from 'lucide-react'

export type PersonaType = 'PERSONAL' | 'PROFESSIONAL' | 'SOCIAL' | 'GENERATIONAL' | 'SPIRITUAL' | 'CULTURAL'

export interface PersonaData {
    type: PersonaType
    description: string
}

interface PersonaSelectorProps {
    onComplete: (personas: PersonaData[]) => void
    loading?: boolean
}

const PERSONAS: { type: PersonaType; label: string; icon: any; prompt: string }[] = [
    {
        type: 'PERSONAL',
        label: 'Personal',
        icon: User,
        prompt: 'What defines you individually? (Hobbies, passions, quirks)'
    },
    {
        type: 'PROFESSIONAL',
        label: 'Professional',
        icon: Briefcase,
        prompt: 'What drives your career or vocation?'
    },
    {
        type: 'SOCIAL',
        label: 'Social',
        icon: Users,
        prompt: 'How do you connect with friends and community?'
    },
    {
        type: 'GENERATIONAL',
        label: 'Generational',
        icon: Heart,
        prompt: 'What is your role in your family line?'
    },
    {
        type: 'SPIRITUAL',
        label: 'Spiritual',
        icon: Sparkles,
        prompt: 'What are your core beliefs or philosophy?'
    },
    {
        type: 'CULTURAL',
        label: 'Cultural',
        icon: Globe,
        prompt: 'What traditions or heritage do you carry?'
    },
]

export function PersonaSelector({ onComplete, loading }: PersonaSelectorProps) {
    const [activePersonaIndex, setActivePersonaIndex] = useState(0)
    const [personaData, setPersonaData] = useState<Record<PersonaType, string>>({
        PERSONAL: '',
        PROFESSIONAL: '',
        SOCIAL: '',
        GENERATIONAL: '',
        SPIRITUAL: '',
        CULTURAL: '',
    })

    const currentPersona = PERSONAS[activePersonaIndex]
    const isLast = activePersonaIndex === PERSONAS.length - 1

    const handleNext = () => {
        if (isLast) {
            const result: PersonaData[] = Object.entries(personaData).map(([type, description]) => ({
                type: type as PersonaType,
                description,
            })).filter(p => p.description.trim() !== '') // Only include filled personas? Or all? 
            // Requirement says "Six personas", so maybe we should keep them all even if empty, or encourage filling them.
            // For MVP onboarding, let's submit all.

            onComplete(Object.entries(personaData).map(([type, description]) => ({
                type: type as PersonaType,
                description,
            })))
        } else {
            setActivePersonaIndex(prev => prev + 1)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6 overflow-x-auto pb-2">
                {PERSONAS.map((p, i) => {
                    const Icon = p.icon
                    const isActive = i === activePersonaIndex
                    const isCompleted = !!personaData[p.type]

                    return (
                        <button
                            key={p.type}
                            onClick={() => setActivePersonaIndex(i)}
                            className={`flex flex-col items-center space-y-1 min-w-[60px] transition-colors ${isActive ? 'text-black' : isCompleted ? 'text-gray-600' : 'text-gray-300'
                                }`}
                        >
                            <div className={`p-2 rounded-full ${isActive ? 'bg-black text-white' : isCompleted ? 'bg-gray-100' : 'bg-gray-50'
                                }`}>
                                <Icon size={20} />
                            </div>
                            <span className="text-[10px] font-medium uppercase tracking-wider">{p.label}</span>
                        </button>
                    )
                })}
            </div>

            <Card className="border-2 border-gray-100 shadow-sm">
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-black text-white rounded-lg">
                                <currentPersona.icon size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{currentPersona.label} Persona</h3>
                                <p className="text-sm text-gray-500">{currentPersona.prompt}</p>
                            </div>
                        </div>

                        <Textarea
                            value={personaData[currentPersona.type]}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPersonaData(prev => ({ ...prev, [currentPersona.type]: e.target.value }))}
                            placeholder={`Describe your ${currentPersona.label.toLowerCase()} self...`}
                            className="min-h-[120px] resize-none text-base"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center">
                <Button
                    variant="ghost"
                    onClick={() => setActivePersonaIndex(prev => Math.max(0, prev - 1))}
                    disabled={activePersonaIndex === 0}
                >
                    Previous
                </Button>
                <Button onClick={handleNext} disabled={loading}>
                    {isLast ? (loading ? 'Finishing...' : 'Complete Setup') : 'Next Persona'}
                    {!isLast && <ChevronRight className="ml-2 h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}

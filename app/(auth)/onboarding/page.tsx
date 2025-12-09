'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PersonaSelector, PersonaData } from '@/components/onboarding/persona-selector'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handlePersonaComplete = async (personas: PersonaData[]) => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Create profile with personas
    const response = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        dateOfBirth: dateOfBirth || null,
        personas,
      }),
    })

    if (response.ok) {
      router.push('/dashboard')
    } else {
      console.error('Failed to create profile')
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4 animate-fade-in">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl text-center">Who are you?</CardTitle>
            <CardDescription className="text-center">
              Let's start by getting to know you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="dateOfBirth" className="text-sm font-medium">
                  Date of Birth (Optional)
                </label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 animate-fade-in py-8">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl text-center">Define Your Identity</CardTitle>
          <CardDescription className="text-center">
            You are more than just one thing. Let's explore your different sides.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PersonaSelector onComplete={handlePersonaComplete} loading={loading} />
        </CardContent>
      </Card>
    </div>
  )
}


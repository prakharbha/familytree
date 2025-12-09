import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  })

  if (!profile) {
    redirect('/onboarding')
  }

  const familyMembers = await prisma.familyMember.findMany({
    where: { profileId: profile.id },
    include: { relatedProfile: true },
  })

  const recentMemoryCapsules = await prisma.memoryCapsule.findMany({
    where: { profileId: profile.id },
    orderBy: { date: 'desc' },
    take: 5,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-mix font-semibold mb-2">Welcome back, {profile.name}</h1>
        <p className="text-gray-600">Continue building your family legacy</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle>Family Members</CardTitle>
            <CardDescription>Connected family members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{familyMembers.length}</div>
            <Link href="/family-tree">
              <Button variant="outline" size="sm">View Tree</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle>Memory Capsules</CardTitle>
            <CardDescription>Your legacy timeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{recentMemoryCapsules.length}</div>
            <Link href="/memory-capsule">
              <Button variant="outline" size="sm">View Memories</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/profile">
              <Button variant="outline" size="sm" className="w-full">Edit Profile</Button>
            </Link>
            <Link href="/memory-capsule">
              <Button variant="outline" size="sm" className="w-full">Add Memory Capsule</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {recentMemoryCapsules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Memory Capsules</CardTitle>
            <CardDescription>Your latest legacy moments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMemoryCapsules.map((entry: any) => (
                <div key={entry.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <h3 className="font-semibold mb-1">{entry.title}</h3>
                  {entry.description && (
                    <p className="text-sm text-gray-600 mb-2">{entry.description}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


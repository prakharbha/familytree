import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const familyMembers = await prisma.familyMember.findMany({
      where: { profileId: profile.id },
      include: { 
        relatedProfile: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(familyMembers)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch family tree' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // If relatedProfileId is provided, use it directly (registered user)
    if (body.relatedProfileId) {
      // Check if connection already exists
      const existing = await prisma.familyMember.findFirst({
        where: {
          profileId: profile.id,
          relatedProfileId: body.relatedProfileId,
          relationshipType: body.relationshipType,
        },
      })

      if (existing) {
        return NextResponse.json({ error: 'Family connection already exists' }, { status: 400 })
      }

      // Create family connection
      const familyMember = await prisma.familyMember.create({
        data: {
          profileId: profile.id,
          relatedProfileId: body.relatedProfileId,
          relationshipType: body.relationshipType,
          role: body.role || 'VIEWER',
        },
        include: { relatedProfile: true },
      })

      return NextResponse.json(familyMember)
    }

    // If email/name is provided but user doesn't exist, create a placeholder profile
    if (body.email || body.name) {
      // First, try to find existing user by email
      let relatedProfile = null
      const searchEmail = body.email || `placeholder-${Date.now()}@family.local`
      
      if (body.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: body.email },
          include: { profile: true },
        })
        
        if (existingUser?.profile) {
          // User exists with profile, use it
          relatedProfile = existingUser.profile
        } else if (existingUser && !existingUser.profile) {
          // User exists but no profile - create profile for existing user
          const newProfile = await prisma.profile.create({
            data: {
              userId: existingUser.id,
              name: body.name || body.email?.split('@')[0] || 'Family Member',
              location: body.location,
              profession: body.profession,
              highlights: body.message || `Added as ${body.relationshipType?.toLowerCase() || 'family member'}`,
              tags: body.email && !body.email.includes('@family.local') ? [`email:${body.email}`] : [],
            },
          })
          relatedProfile = newProfile
        }
      }

      // If user doesn't exist, create a placeholder profile
      if (!relatedProfile) {
        const placeholderName = body.name || body.email?.split('@')[0] || 'Family Member'
        
        // Try to find or create user, then ensure profile exists
        let user = await prisma.user.findUnique({
          where: { email: searchEmail },
          include: { profile: true },
        })
        
        if (!user) {
          // User doesn't exist, create new user with profile
          user = await prisma.user.create({
            data: {
              email: searchEmail,
              profile: {
                create: {
                  name: placeholderName,
                  location: body.location,
                  profession: body.profession,
                  highlights: body.message || `Added as ${body.relationshipType?.toLowerCase() || 'family member'}`,
                  tags: body.email && !body.email.includes('@family.local') ? [`email:${body.email}`] : [],
                },
              },
            },
            include: { profile: true },
          })
          relatedProfile = user.profile!
        } else if (user.profile) {
          // User exists with profile
          relatedProfile = user.profile
        } else {
          // User exists but no profile - create profile
          relatedProfile = await prisma.profile.create({
            data: {
              userId: user.id,
              name: placeholderName,
              location: body.location,
              profession: body.profession,
              highlights: body.message || `Added as ${body.relationshipType?.toLowerCase() || 'family member'}`,
              tags: body.email && !body.email.includes('@family.local') ? [`email:${body.email}`] : [],
            },
          })
        }
      }

      // Check if connection already exists
      const existing = await prisma.familyMember.findFirst({
        where: {
          profileId: profile.id,
          relatedProfileId: relatedProfile.id,
          relationshipType: body.relationshipType,
        },
      })

      if (existing) {
        return NextResponse.json({ error: 'Family connection already exists' }, { status: 400 })
      }

      // Create family connection
      const familyMember = await prisma.familyMember.create({
        data: {
          profileId: profile.id,
          relatedProfileId: relatedProfile.id,
          relationshipType: body.relationshipType,
          role: body.role || 'VIEWER',
        },
        include: { 
          relatedProfile: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      })

      return NextResponse.json(familyMember)
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error: any) {
    console.error('Family tree POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create family connection' },
      { status: 500 }
    )
  }
}


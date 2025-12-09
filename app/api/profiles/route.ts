import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getCurrentUser } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma/client'
import { Visibility } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        name: body.name,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        personas: {
          create: body.personas.map((p: any) => ({
            type: p.type,
            description: p.description,
          })),
        },
      },
      include: {
        personas: true,
      },
    })

    return NextResponse.json(profile)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create profile' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('id')

    // Always get current user to check connection
    let currentUserProfileId = null;
    try {
      // Use getCurrentUser to avoid redirect if not auth (though usually we are auth)
      const user = await getCurrentUser()
      if (user) {
        const myProfile = await prisma.profile.findUnique({ where: { userId: user.id } })
        currentUserProfileId = myProfile?.id
      }
    } catch (e) {
      // Ignore auth error
    }

    let profile;

    const includeOptions = {
      user: { select: { email: true } }, // Fetch email to check if placeholder
      personas: true,
      traditions: {
        include: { reactions: true, comments: { include: { profile: true } } }
      },
      legacyWallItems: {
        include: { reactions: true, comments: { include: { profile: true } } }
      },
      memoryCapsules: {
        where: { visibility: { in: [Visibility.FAMILY, Visibility.PUBLIC] } },
        include: { reactions: true, comments: { include: { profile: true } } }
      },
    }

    if (profileId) {
      // Fetch specific profile
      profile = await prisma.profile.findUnique({
        where: { id: profileId },
        include: includeOptions,
      })
    } else {
      // Fetch current user's profile
      const user = await requireAuth()
      profile = await prisma.profile.findUnique({
        where: { userId: user.id },
        include: includeOptions
      })
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Calculate generic props
    // manual+ or placeholder+ emails indicate this user was created via the "Add Member" flow without a real account
    // We also check for our internal placeholder domains
    const email = profile.user?.email || ''
    const isPlaceholder =
      email.startsWith('manual+') ||
      email.startsWith('placeholder+') ||
      email.endsWith('@family.local') ||
      email.endsWith('@family.app')

    console.log(`[PROFILE_DEBUG] ID=${profile.id} Name=${profile.name} Email=${email} isPlaceholder=${isPlaceholder}`)

    let connectionToViewer = null;
    if (currentUserProfileId && currentUserProfileId !== profile.id) {
      // Check if there is a direct link (Me -> Them)
      const directLink = await prisma.familyMember.findFirst({
        where: {
          profileId: currentUserProfileId,
          relatedProfileId: profile.id
        }
      })

      if (directLink) {
        connectionToViewer = `is your ${directLink.relationshipType}`
      } else {
        // Check reverse link (Them -> Me)
        const reverseLink = await prisma.familyMember.findFirst({
          where: {
            profileId: profile.id,
            relatedProfileId: currentUserProfileId
          }
        })
        if (reverseLink) {
          connectionToViewer = `is connected (They added you as ${reverseLink.relationshipType})`
        } else {
          connectionToViewer = 'No direct connection'
        }
      }
    }

    return NextResponse.json({ ...profile, connectionToViewer, isPlaceholder })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    console.log('PATCH /api/profiles body:', JSON.stringify(body, null, 2))

    // Update profile fields
    const profile = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        name: body.name,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        bio: body.bio,
        location: body.location,
        profession: body.profession,
        photo: body.photo,
      },
    })

    // Update personas if provided
    if (body.personas && Array.isArray(body.personas)) {
      for (const p of body.personas) {
        console.log(`Upserting persona: ${p.type} for profile ${profile.id}`)
        try {
          await prisma.persona.upsert({
            where: {
              profileId_type: {
                profileId: profile.id,
                type: p.type,
              },
            },
            update: {
              description: p.description,
              highlights: p.highlights || [],
            },
            create: {
              profileId: profile.id,
              type: p.type,
              description: p.description,
              highlights: p.highlights || [],
            },
          })
          console.log(`Successfully upserted persona: ${p.type}`)
        } catch (err) {
          console.error(`Error upserting persona ${p.type}:`, err)
        }
      }
    }

    // Fetch updated profile with personas
    const updatedProfile = await prisma.profile.findUnique({
      where: { id: profile.id },
      include: { personas: true },
    })

    return NextResponse.json(updatedProfile)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    )
  }
}


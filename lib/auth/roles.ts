import { prisma } from '@/lib/prisma/client'
import { User } from '@supabase/supabase-js'

export enum UserRole {
  VIEWER = 'VIEWER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  LEGACY_KEEPER = 'LEGACY_KEEPER',
}

export async function getUserRole(
  user: User,
  targetProfileId: string
): Promise<UserRole> {
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  })

  if (!profile) {
    return UserRole.VIEWER
  }

  // Check if user is the profile owner
  if (profile.id === targetProfileId) {
    return UserRole.LEGACY_KEEPER
  }

  // Check family relationship
  const relationship = await prisma.familyMember.findFirst({
    where: {
      profileId: targetProfileId,
      relatedProfileId: profile.id,
    },
  })

  return relationship?.role as UserRole || UserRole.VIEWER
}

export async function canEdit(
  user: User,
  targetProfileId: string
): Promise<boolean> {
  const role = await getUserRole(user, targetProfileId)
  return role === UserRole.CONTRIBUTOR || role === UserRole.LEGACY_KEEPER
}

export async function canManage(
  user: User,
  targetProfileId: string
): Promise<boolean> {
  const role = await getUserRole(user, targetProfileId)
  return role === UserRole.LEGACY_KEEPER
}


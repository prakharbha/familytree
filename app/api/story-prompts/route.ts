import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma/client'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const prompts = await prisma.storyPrompt.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(prompts)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch story prompts' },
      { status: 500 }
    )
  }
}


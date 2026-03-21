export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { generateBio } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const { bullets, category, city }: {
      bullets: string[]
      category: string
      city: string
    } = await req.json()

    if (!bullets?.length || !category) {
      return NextResponse.json({ error: 'bullets and category required' }, { status: 400 })
    }

    const bio = await generateBio(bullets, category, city ?? 'India')
    return NextResponse.json({ bio })
  } catch (error) {
    console.error('Bio generation error:', error)
    return NextResponse.json({ error: 'Bio generation failed' }, { status: 500 })
  }
}

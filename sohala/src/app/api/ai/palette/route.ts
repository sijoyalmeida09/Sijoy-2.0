import { NextRequest, NextResponse } from 'next/server'
import { assemblePalette } from '@/lib/anthropic'

export async function POST(req: NextRequest) {
  try {
    const { event_type, city, budget_inr }: {
      event_type: string
      city: string
      budget_inr: number
    } = await req.json()

    if (!event_type || !budget_inr) {
      return NextResponse.json({ error: 'event_type and budget_inr required' }, { status: 400 })
    }

    const palette = await assemblePalette(event_type, city ?? 'India', budget_inr)
    return NextResponse.json(palette)
  } catch (error) {
    console.error('Palette assembly error:', error)
    return NextResponse.json({ error: 'Palette assembly failed' }, { status: 500 })
  }
}

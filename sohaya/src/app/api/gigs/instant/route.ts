import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const instantGigSchema = z.object({
  event_type: z.string(),
  category_ids: z.array(z.string()),
  location_lat: z.number(),
  location_lng: z.number(),
  location_text: z.string(),
  start_time: z.string(),
  duration_hours: z.number().positive(),
  budget_inr: z.number().positive(),
})

// Commission on instant gigs: 8%
const INSTANT_GIG_COMMISSION = 0.08

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    const body = await req.json()
    const data = instantGigSchema.parse(body)

    const providerPayout = Math.floor(data.budget_inr * (1 - INSTANT_GIG_COMMISSION))

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 5) // 5 minute window

    const { data: gig, error } = await supabase
      .from('instant_gigs')
      .insert({
        event_type: data.event_type,
        category_ids: data.category_ids,
        location_lat: data.location_lat,
        location_lng: data.location_lng,
        location_text: data.location_text,
        start_time: data.start_time,
        duration_hours: data.duration_hours,
        budget_inr: data.budget_inr,
        provider_payout_inr: providerPayout,
        status: 'broadcast',
        client_id: client.id,
        broadcast_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (error || !gig) throw error

    // Broadcast to live providers (fire-and-forget — never fails the request)
    supabase.channel('gig_feed_events').send({
      type: 'broadcast',
      event: 'instant_gig',
      payload: { ...gig, budget_inr: undefined },
    }).catch(() => { /* realtime is best-effort */ })

    return NextResponse.json({ gig_id: gig.id }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Instant gig error:', error)
    return NextResponse.json({ error: 'Failed to create instant gig' }, { status: 500 })
  }
}

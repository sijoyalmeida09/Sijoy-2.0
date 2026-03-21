import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 })

    // Get the gig and lock it (optimistic update with check)
    const { data: gig } = await supabase
      .from('instant_gigs')
      .select('*')
      .eq('id', params.id)
      .eq('status', 'broadcast')
      .gte('expires_at', new Date().toISOString())
      .single()

    if (!gig) {
      return NextResponse.json({ error: 'Gig no longer available' }, { status: 409 })
    }

    // Atomic update — only first provider wins
    const { data: updated, error } = await supabase
      .from('instant_gigs')
      .update({
        status: 'accepted',
        accepted_by_id: provider.id,
      })
      .eq('id', params.id)
      .eq('status', 'broadcast') // Race condition protection
      .select()
      .single()

    if (error || !updated) {
      return NextResponse.json({ error: 'Gig already taken' }, { status: 409 })
    }

    // Create booking
    const { data: booking } = await supabase
      .from('bookings')
      .insert({
        provider_id: provider.id,
        client_id: gig.client_id,
        event_type: gig.event_type,
        event_date: gig.start_time.split('T')[0],
        event_time: gig.start_time.split('T')[1]?.slice(0, 5),
        duration_hours: gig.duration_hours,
        location: gig.location_text,
        total_amount_inr: gig.budget_inr,
        provider_payout_inr: gig.provider_payout_inr,
        platform_commission_inr: gig.budget_inr - gig.provider_payout_inr,
        status: 'confirmed',
      })
      .select()
      .single()

    // Broadcast acceptance to all channels
    await supabase.channel('gig_feed_events').send({
      type: 'broadcast',
      event: 'gig_accepted',
      payload: { gig_id: params.id, provider_id: provider.id },
    })

    return NextResponse.json({ success: true, booking_id: booking?.id })
  } catch (error) {
    console.error('Gig accept error:', error)
    return NextResponse.json({ error: 'Failed to accept gig' }, { status: 500 })
  }
}

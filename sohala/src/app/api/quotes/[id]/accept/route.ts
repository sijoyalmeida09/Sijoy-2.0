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

    // Get client record
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    // Get quote with lead details
    const { data: quote } = await supabase
      .from('quotes')
      .select('*, lead:leads(*)')
      .eq('id', params.id)
      .eq('status', 'pending')
      .single()

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found or already accepted' }, { status: 404 })
    }

    // Check if quote is still valid
    if (new Date(quote.valid_until) < new Date()) {
      await supabase.from('quotes').update({ status: 'expired' }).eq('id', params.id)
      return NextResponse.json({ error: 'Quote has expired' }, { status: 400 })
    }

    // Calculate payouts
    const platformCommission = quote.client_display_amount_inr - quote.quoted_amount_inr

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        lead_id: quote.lead_id,
        quote_id: quote.id,
        provider_id: quote.provider_id,
        client_id: client.id,
        event_type: quote.event_type,
        event_date: quote.lead.event_date,
        event_time: quote.lead.event_time,
        duration_hours: quote.lead.duration_hours,
        location: quote.lead.location_text,
        total_amount_inr: quote.client_display_amount_inr,
        provider_payout_inr: quote.quoted_amount_inr,
        platform_commission_inr: platformCommission,
        status: 'pending',
      })
      .select()
      .single()

    if (bookingError || !booking) throw bookingError

    // Update quote status
    await supabase.from('quotes').update({ status: 'accepted' }).eq('id', params.id)

    // Update lead status
    await supabase.from('leads').update({ status: 'booked' }).eq('id', quote.lead_id)

    return NextResponse.json({ booking_id: booking.id, amount: booking.total_amount_inr })
  } catch (error) {
    console.error('Quote accept error:', error)
    return NextResponse.json({ error: 'Failed to accept quote' }, { status: 500 })
  }
}

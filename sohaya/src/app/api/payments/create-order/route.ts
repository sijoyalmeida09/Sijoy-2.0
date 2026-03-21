import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { amount_inr, provider_id, event_type, event_date, location_text } = await req.json()

    if (!amount_inr || !provider_id) {
      return NextResponse.json({ error: 'amount_inr and provider_id required' }, { status: 400 })
    }

    // Get client record (client_id != user.id — it's a separate table)
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!client) {
      // Auto-create client record if missing
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({ profile_id: user.id })
        .select('id')
        .single()
      if (clientError || !newClient) {
        return NextResponse.json({ error: 'Failed to resolve client' }, { status: 500 })
      }
      Object.assign(client ?? {}, newClient)
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        provider_id,
        client_id: (client as { id: string }).id,
        event_type: event_type ?? 'booking',
        event_date: event_date ?? new Date().toISOString().split('T')[0],
        location: location_text ?? 'TBD',
        total_amount_inr: amount_inr,
        provider_payout_inr: Math.floor(amount_inr * 0.85),
        platform_commission_inr: Math.ceil(amount_inr * 0.15),
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      booking_id: booking.id,
      amount_inr,
      upi_id: process.env.NEXT_PUBLIC_UPI_ID,
      upi_name: process.env.NEXT_PUBLIC_UPI_NAME,
    })
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}

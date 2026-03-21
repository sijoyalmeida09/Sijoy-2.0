import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Only admins can trigger payouts
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { booking_id } = await req.json()
    const adminSupabase = createAdminClient()

    const { data: booking } = await adminSupabase
      .from('bookings')
      .select('*, provider:providers(*)')
      .eq('id', booking_id)
      .eq('status', 'completed')
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found or not completed' }, { status: 404 })
    }

    // In production: trigger actual Razorpay X payout
    // For now, mark payout as processed
    await adminSupabase
      .from('bookings')
      .update({
        notes: `Payout of ₹${booking.provider_payout_inr} processed at ${new Date().toISOString()}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking_id)

    return NextResponse.json({
      success: true,
      amount_inr: booking.provider_payout_inr,
      provider: booking.provider?.display_name,
    })
  } catch (error) {
    console.error('Payout error:', error)
    return NextResponse.json({ error: 'Payout failed' }, { status: 500 })
  }
}
